import hashlib
import html
import json
import os
import random
import shutil
import sqlite3
import sys
import time
import zipfile
from pathlib import Path

FIELD_SEPARATOR = "\x1f"
MODEL_ID = 1700000000001
DECK_CONFIG_ID = 1


def now_seconds():
    return int(time.time())


def stable_int(value, minimum=1000000000000):
    digest = hashlib.sha1(value.encode("utf-8")).hexdigest()
    return minimum + int(digest[:12], 16)


def note_guid(deck_id, word):
    digest = hashlib.sha1(f"{deck_id}:{word}".encode("utf-8")).hexdigest()
    alphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-"
    value = int(digest[:16], 16)
    chars = []
    while value:
        value, index = divmod(value, len(alphabet))
        chars.append(alphabet[index])
    return "".join(chars) or "0"


def checksum(value):
    return int(hashlib.sha1(value.encode("utf-8")).hexdigest()[:8], 16)


def clean(value):
    return html.escape(str(value or ""), quote=False)


def field_values(card):
    return [
        clean(card["word"]),
        clean(card["translation"]),
        clean(card["example"]),
        clean(card["exampleTranslation"]),
        clean(card["source"]),
    ]


def deck_json(deck_id, title):
    return {
        str(deck_id): {
            "id": deck_id,
            "mod": now_seconds(),
            "name": title,
            "usn": -1,
            "lrnToday": [0, 0],
            "revToday": [0, 0],
            "newToday": [0, 0],
            "timeToday": [0, 0],
            "collapsed": False,
            "browserCollapsed": False,
            "desc": "Conversante story vocabulary deck",
            "dyn": 0,
            "conf": DECK_CONFIG_ID,
            "extendNew": 0,
            "extendRev": 0,
        }
    }


def model_json():
    return {
        str(MODEL_ID): {
            "id": MODEL_ID,
            "name": "Conversante Vocabulary",
            "type": 0,
            "mod": now_seconds(),
            "usn": -1,
            "sortf": 0,
            "did": None,
            "tmpls": [
                {
                    "name": "Card 1",
                    "ord": 0,
                    "qfmt": "<section class='card-front'><h1>{{Word}}</h1><p class='example'>{{Example}}</p></section>",
                    "afmt": "{{FrontSide}}<hr><section class='card-back'><h2>{{Translation}}</h2><p>{{Example Translation}}</p><p class='source'>{{Source}}</p></section>",
                    "did": None,
                    "bqfmt": "",
                    "bafmt": "",
                }
            ],
            "flds": [
                {"name": "Word", "ord": 0, "sticky": False, "rtl": False, "font": "Arial", "size": 20},
                {"name": "Translation", "ord": 1, "sticky": False, "rtl": False, "font": "Arial", "size": 20},
                {"name": "Example", "ord": 2, "sticky": False, "rtl": False, "font": "Arial", "size": 20},
                {"name": "Example Translation", "ord": 3, "sticky": False, "rtl": False, "font": "Arial", "size": 20},
                {"name": "Source", "ord": 4, "sticky": False, "rtl": False, "font": "Arial", "size": 20},
            ],
            "css": ".card{font-family:Arial,sans-serif;font-size:20px;text-align:left;color:#10223d;background:#fbfcff}.card-front h1{font-size:34px;margin:0 0 16px;color:#032a62}.example{line-height:1.45}.card-back h2{font-size:28px;color:#0a8f8d}.source{margin-top:20px;color:#667085;font-size:15px}",
            "latexPre": "\\documentclass[12pt]{article}",
            "latexPost": "\\end{document}",
            "req": [[0, "all", [0]]],
        }
    }


def deck_config_json():
    return {
        str(DECK_CONFIG_ID): {
            "id": DECK_CONFIG_ID,
            "mod": 0,
            "name": "Default",
            "usn": -1,
            "maxTaken": 60,
            "autoplay": True,
            "timer": 0,
            "replayq": True,
            "new": {"bury": True, "delays": [1, 10], "initialFactor": 2500, "ints": [1, 4, 7], "order": 1, "perDay": 20},
            "rev": {"bury": True, "ease4": 1.3, "fuzz": 0.05, "ivlFct": 1, "maxIvl": 36500, "minSpace": 1, "perDay": 200},
            "lapse": {"delays": [10], "leechAction": 0, "leechFails": 8, "minInt": 1, "mult": 0},
        }
    }


def create_schema(cursor):
    cursor.executescript(
        """
        CREATE TABLE col (
            id integer primary key, crt integer not null, mod integer not null, scm integer not null,
            ver integer not null, dty integer not null, usn integer not null, ls integer not null,
            conf text not null, models text not null, decks text not null, dconf text not null, tags text not null
        );
        CREATE TABLE notes (
            id integer primary key, guid text not null, mid integer not null, mod integer not null,
            usn integer not null, tags text not null, flds text not null, sfld integer not null,
            csum integer not null, flags integer not null, data text not null
        );
        CREATE TABLE cards (
            id integer primary key, nid integer not null, did integer not null, ord integer not null,
            mod integer not null, usn integer not null, type integer not null, queue integer not null,
            due integer not null, ivl integer not null, factor integer not null, reps integer not null,
            lapses integer not null, left integer not null, odue integer not null, odid integer not null,
            flags integer not null, data text not null
        );
        CREATE TABLE revlog (
            id integer primary key, cid integer not null, usn integer not null, ease integer not null,
            ivl integer not null, lastIvl integer not null, factor integer not null, time integer not null, type integer not null
        );
        CREATE TABLE graves (usn integer not null, oid integer not null, type integer not null);
        CREATE INDEX ix_notes_usn on notes (usn);
        CREATE INDEX ix_cards_usn on cards (usn);
        CREATE INDEX ix_cards_nid on cards (nid);
        CREATE INDEX ix_cards_sched on cards (did, queue, due);
        """
    )


def create_package(deck, output_dir):
    deck_id = stable_int(deck["id"])
    build_dir = Path(output_dir) / ".build"
    build_dir.mkdir(parents=True, exist_ok=True)
    db_path = build_dir / "collection.anki2"
    package_path = Path(output_dir) / deck["filename"]

    if db_path.exists():
        db_path.unlink()
    if package_path.exists():
        package_path.unlink()

    connection = sqlite3.connect(db_path)
    cursor = connection.cursor()
    create_schema(cursor)

    cursor.execute(
        "INSERT INTO col VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        (
            1,
            now_seconds(),
            now_seconds(),
            now_seconds(),
            11,
            0,
            -1,
            0,
            json.dumps({"nextPos": 1, "estTimes": True, "activeDecks": [deck_id], "sortType": "noteFld"}),
            json.dumps(model_json()),
            json.dumps(deck_json(deck_id, deck["title"])),
            json.dumps(deck_config_json()),
            json.dumps({}),
        ),
    )

    for index, card in enumerate(deck["cards"], start=1):
        note_id = stable_int(f"note:{deck['id']}:{card['word']}")
        card_id = stable_int(f"card:{deck['id']}:{card['word']}")
        fields = FIELD_SEPARATOR.join(field_values(card))
        sort_field = clean(card["word"])
        cursor.execute(
            "INSERT INTO notes VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (note_id, note_guid(deck["id"], card["word"]), MODEL_ID, now_seconds(), -1, " conversante ", fields, sort_field, checksum(sort_field), 0, ""),
        )
        cursor.execute(
            "INSERT INTO cards VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (card_id, note_id, deck_id, 0, now_seconds(), -1, 0, 0, index, 0, 0, 0, 0, 0, 0, 0, 0, ""),
        )

    connection.commit()
    connection.close()

    with zipfile.ZipFile(package_path, "w", zipfile.ZIP_DEFLATED) as package:
        package.write(db_path, "collection.anki2")
        package.writestr("media", "{}")

    return package_path


def main():
    payload_path = Path(sys.argv[1])
    payload = json.loads(payload_path.read_text(encoding="utf-8"))
    output_dir = Path(payload["outputDir"])
    output_dir.mkdir(parents=True, exist_ok=True)

    manifest = []
    for deck in payload["decks"]:
        package_path = create_package(deck, output_dir)
        manifest.append({
            "id": deck["id"],
            "day": deck["day"],
            "title": deck["title"],
            "filename": deck["filename"],
            "cardCount": len(deck["cards"]),
        })
        print(f"Wrote {package_path} ({len(deck['cards'])} cards)")

    (output_dir / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    shutil.rmtree(output_dir / ".build", ignore_errors=True)


if __name__ == "__main__":
    main()
