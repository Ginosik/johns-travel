import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/wordDashboard.css";

const postSenseModules = import.meta.glob(
  "../../docs/conversation-word-data/*/conversation-word-senses.json",
  { eager: true }
);

const postStudyData = Object.entries(postSenseModules)
  .map(([path, module]) => {
    const postId = path.match(/conversation-word-data\/([^/]+)\//)?.[1];
    return {
      id: postId,
      label: postId?.replace("day-", "Day ") ?? "Unknown post",
      senses: module.default ?? module
    };
  })
  .filter((post) => post.id)
  .sort((first, second) => first.id.localeCompare(second.id, undefined, { numeric: true }));

const countFilters = [
  { value: "1", label: "All counts" },
  { value: "2", label: "2+ uses" },
  { value: "3", label: "3+ uses" },
  { value: "5", label: "5+ uses" }
];

const sortOptions = [
  { value: "count", label: "Most used" },
  { value: "word", label: "Word A-Z" },
  { value: "lemma", label: "Lemma A-Z" },
  { value: "senses", label: "Most senses" }
];

function normalizeSearchText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function mergeCounts(posts) {
  const merged = {};

  posts.forEach((post) => {
    Object.entries(post.senses.counts).forEach(([word, wordData]) => {
      merged[word] ??= {
        totalCount: 0,
        senses: {}
      };
      merged[word].totalCount += wordData.totalCount;

      Object.entries(wordData.senses).forEach(([senseKey, sense]) => {
        merged[word].senses[senseKey] ??= {
          count: 0,
          lemma: sense.lemma,
          partOfSpeech: sense.partOfSpeech,
          meaningPt: sense.meaningPt,
          notePt: sense.notePt,
          grammarPt: sense.grammarPt,
          languageTag: sense.languageTag,
          languageName: sense.languageName,
          ipa: sense.ipa,
          audioPrompt: sense.audioPrompt,
          audioPromptNote: sense.audioPromptNote,
          examples: [],
          postIds: []
        };

        const targetSense = merged[word].senses[senseKey];
        targetSense.count += sense.count;
        if (!targetSense.postIds.includes(post.id)) targetSense.postIds.push(post.id);

        (sense.examples ?? []).forEach((example) => {
          if (targetSense.examples.length < 3 && !targetSense.examples.includes(example)) {
            targetSense.examples.push(example);
          }
        });
      });
    });
  });

  return merged;
}

function createTotals(counts) {
  return {
    occurrences: Object.values(counts).reduce((total, item) => total + item.totalCount, 0),
    uniqueSurfaceWords: Object.keys(counts).length,
    uniqueSenses: Object.values(counts).reduce((total, item) => total + Object.keys(item.senses).length, 0)
  };
}

function flattenCounts(counts) {
  return Object.entries(counts).flatMap(([word, wordData]) => (
    Object.entries(wordData.senses).map(([senseKey, sense]) => {
      const examples = sense.examples ?? [];

      return {
        word,
        totalCount: wordData.totalCount,
        senseKey,
        senseCount: sense.count,
        senseTotal: Object.keys(wordData.senses).length,
        lemma: sense.lemma ?? word,
        partOfSpeech: sense.partOfSpeech ?? "unknown",
        meaningPt: sense.meaningPt ?? "",
        notePt: sense.notePt ?? "",
        grammarPt: sense.grammarPt ?? "",
        languageTag: sense.languageTag ?? "",
        languageName: sense.languageName ?? "",
        ipa: sense.ipa ?? "",
        audioPrompt: sense.audioPrompt ?? "",
        audioPromptNote: sense.audioPromptNote ?? "",
        examples,
        postIds: sense.postIds ?? [],
        searchText: normalizeSearchText([
          word,
          senseKey,
          sense.lemma,
          sense.partOfSpeech,
          sense.meaningPt,
          sense.notePt,
          sense.grammarPt,
          sense.languageTag,
          sense.languageName,
          sense.ipa,
          sense.audioPrompt,
          sense.audioPromptNote,
          ...(sense.postIds ?? []),
          ...examples
        ].join(" "))
      };
    })
  ));
}

function sortRows(rows, sortBy) {
  return [...rows].sort((first, second) => {
    if (sortBy === "word") return first.word.localeCompare(second.word);
    if (sortBy === "lemma") return first.lemma.localeCompare(second.lemma);
    if (sortBy === "senses") return second.senseTotal - first.senseTotal || first.word.localeCompare(second.word);
    return second.totalCount - first.totalCount || first.word.localeCompare(second.word);
  });
}

function WordRow({ row }) {
  return (
    <tr>
      <td>
        <strong className="word-dashboard-word">{row.word}</strong>
        <span className="word-dashboard-sense">{row.senseKey}</span>
      </td>
      <td>{row.lemma}</td>
      <td><span className="word-dashboard-pos">{row.partOfSpeech}</span></td>
      <td>{row.meaningPt || <span className="word-dashboard-empty">Not mapped</span>}</td>
      <td>
        {row.languageTag ? (
          <span className="word-dashboard-language">{row.languageName} <strong>{row.languageTag}</strong></span>
        ) : (
          <span className="word-dashboard-muted">English</span>
        )}
      </td>
      <td className="word-dashboard-count-cell">{row.senseCount}</td>
      <td className="word-dashboard-example-cell">
        {row.examples[0] ?? "No example yet"}
        {row.audioPrompt && (
          <span className="word-dashboard-audio-prompt">
            ElevenLabs input: <code>{row.audioPrompt}</code>
            {row.ipa && <small>IPA: {row.ipa}</small>}
            {row.audioPromptNote && <small>{row.audioPromptNote}</small>}
          </span>
        )}
        {(row.notePt || row.grammarPt) && (
          <span className="word-dashboard-note">{row.notePt || row.grammarPt}</span>
        )}
      </td>
    </tr>
  );
}

function WordCard({ row }) {
  return (
    <article className="word-dashboard-card">
      <div className="word-dashboard-card-head">
        <div>
          <h2>{row.word}</h2>
          <span>{row.senseKey}</span>
        </div>
        <strong>{row.senseCount}</strong>
      </div>
      <dl>
        <div><dt>Lemma</dt><dd>{row.lemma}</dd></div>
        <div><dt>Part of speech</dt><dd>{row.partOfSpeech}</dd></div>
        <div><dt>Meaning PT</dt><dd>{row.meaningPt || "Not mapped"}</dd></div>
        <div><dt>Language</dt><dd>{row.languageTag ? `${row.languageName} ${row.languageTag}` : "English"}</dd></div>
      </dl>
      <p>{row.examples[0] ?? "No example yet"}</p>
      {row.audioPrompt && (
        <div className="word-dashboard-card-audio">
          <strong>ElevenLabs input</strong>
          <code>{row.audioPrompt}</code>
          {row.ipa && <small>IPA: {row.ipa}</small>}
          {row.audioPromptNote && <small>{row.audioPromptNote}</small>}
        </div>
      )}
      {(row.notePt || row.grammarPt) && <small>{row.notePt || row.grammarPt}</small>}
    </article>
  );
}

function DevWordsPage() {
  const [query, setQuery] = useState("");
  const [selectedPostIds, setSelectedPostIds] = useState(() => postStudyData.map((post) => post.id));
  const [partOfSpeech, setPartOfSpeech] = useState("all");
  const [minCount, setMinCount] = useState("1");
  const [sortBy, setSortBy] = useState("count");
  const [showMissingOnly, setShowMissingOnly] = useState(false);
  const selectedPosts = useMemo(() => (
    postStudyData.filter((post) => selectedPostIds.includes(post.id))
  ), [selectedPostIds]);
  const counts = useMemo(() => mergeCounts(selectedPosts), [selectedPosts]);
  const totals = useMemo(() => createTotals(counts), [counts]);
  const allRows = useMemo(() => flattenCounts(counts), [counts]);
  const partOfSpeechOptions = useMemo(() => (
    [...new Set(allRows.map((row) => row.partOfSpeech))].sort((first, second) => first.localeCompare(second))
  ), [allRows]);
  const normalizedQuery = normalizeSearchText(query);

  const filteredRows = useMemo(() => {
    const minimumCount = Number(minCount);
    const rows = allRows.filter((row) => {
      const matchesQuery = !normalizedQuery || row.searchText.includes(normalizedQuery);
      const matchesPartOfSpeech = partOfSpeech === "all" || row.partOfSpeech === partOfSpeech;
      const matchesCount = row.senseCount >= minimumCount;
      const matchesMissing = !showMissingOnly || !row.meaningPt;
      return matchesQuery && matchesPartOfSpeech && matchesCount && matchesMissing;
    });

    return sortRows(rows, sortBy);
  }, [allRows, minCount, normalizedQuery, partOfSpeech, showMissingOnly, sortBy]);

  const shownOccurrences = filteredRows.reduce((total, row) => total + row.senseCount, 0);
  const allPostsSelected = selectedPostIds.length === postStudyData.length;

  function togglePost(postId) {
    setSelectedPostIds((current) => (
      current.includes(postId)
        ? current.filter((id) => id !== postId)
        : [...current, postId]
    ));
  }

  function toggleAllPosts() {
    setSelectedPostIds(allPostsSelected ? [] : postStudyData.map((post) => post.id));
  }

  return (
    <main className="word-dashboard-page">
      <div className="word-dashboard-actions">
        <Link className="back-link" to="/">Back to feed</Link>
        <div>
          <span className="word-dashboard-badge">Developer workspace</span>
          <strong>Mapped words dashboard</strong>
        </div>
      </div>

      <section className="word-dashboard-header">
        <div>
          <p>Dialog vocabulary map</p>
          <h1>Conversation word senses</h1>
        </div>
        <div className="word-dashboard-stats" aria-label="Vocabulary totals">
          <span><strong>{totals.occurrences}</strong> occurrences</span>
          <span><strong>{totals.uniqueSurfaceWords}</strong> words</span>
          <span><strong>{totals.uniqueSenses}</strong> senses</span>
        </div>
      </section>

      <section className="word-dashboard-controls" aria-label="Search and filters">
        <fieldset className="word-dashboard-post-picker">
          <legend>Study posts</legend>
          <button
            className={allPostsSelected ? "is-active" : ""}
            type="button"
            aria-pressed={allPostsSelected}
            onClick={toggleAllPosts}
          >
            All
          </button>
          {postStudyData.map((post) => (
            <button
              className={selectedPostIds.includes(post.id) ? "is-active" : ""}
              type="button"
              aria-pressed={selectedPostIds.includes(post.id)}
              onClick={() => togglePost(post.id)}
              key={post.id}
            >
              {post.label}
            </button>
          ))}
        </fieldset>

        <label className="word-dashboard-search">
          <span>Search words</span>
          <input
            type="search"
            value={query}
            placeholder="Try: right, ponte, auxiliary, cafe..."
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>

        <label>
          <span>Part of speech</span>
          <select value={partOfSpeech} onChange={(event) => setPartOfSpeech(event.target.value)}>
            <option value="all">All parts</option>
            {partOfSpeechOptions.map((option) => <option value={option} key={option}>{option}</option>)}
          </select>
        </label>

        <label>
          <span>Count</span>
          <select value={minCount} onChange={(event) => setMinCount(event.target.value)}>
            {countFilters.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
          </select>
        </label>

        <label>
          <span>Sort</span>
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            {sortOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
          </select>
        </label>

        <label className="word-dashboard-check">
          <input
            type="checkbox"
            checked={showMissingOnly}
            onChange={(event) => setShowMissingOnly(event.target.checked)}
          />
          <span>Missing PT only</span>
        </label>
      </section>

      <section className="word-dashboard-results" aria-live="polite">
        <div className="word-dashboard-result-summary">
          <strong>{filteredRows.length}</strong> sense rows
          <span>{shownOccurrences} matched occurrences</span>
          <span>{selectedPosts.length} selected posts</span>
        </div>

        <div className="word-dashboard-table-wrap">
          <table className="word-dashboard-table">
            <thead>
              <tr>
                <th>Word</th>
                <th>Lemma</th>
                <th>Part</th>
                <th>Meaning PT</th>
                <th>Language</th>
                <th>Uses</th>
                <th>Example</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => <WordRow row={row} key={`${row.word}-${row.senseKey}`} />)}
            </tbody>
          </table>
        </div>

        <div className="word-dashboard-cards">
          {filteredRows.map((row) => <WordCard row={row} key={`${row.word}-${row.senseKey}`} />)}
        </div>

        {filteredRows.length === 0 && (
          <div className="word-dashboard-empty-state">
            <h2>No words found</h2>
            <p>Try a broader search or clear one of the filters.</p>
          </div>
        )}
      </section>
    </main>
  );
}

export default DevWordsPage;
