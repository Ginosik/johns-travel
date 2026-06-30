import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const args = process.argv.slice(2);
const postArgIndex = args.indexOf("--post");
const requestedPost = postArgIndex >= 0 ? args[postArgIndex + 1] : "day-1";

const socialDir = path.join(projectRoot, "public", "social", requestedPost);
const manifestPath = path.join(socialDir, "carousel.json");
const slidesDir = path.join(socialDir, "slides");
const previewPath = path.join(socialDir, "preview.html");

if (!fs.existsSync(manifestPath)) {
  throw new Error(`Missing carousel manifest at ${path.relative(projectRoot, manifestPath)}. Run npm run social:generate -- --post ${requestedPost} first.`);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const visualAssetPath = path.join(socialDir, "art", "cover.png");
const visualAssetUrl = fs.existsSync(visualAssetPath)
  ? `data:image/png;base64,${fs.readFileSync(visualAssetPath).toString("base64")}`
  : "";
fs.mkdirSync(slidesDir, { recursive: true });

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderBody(slide) {
  if (Array.isArray(slide.body)) {
    return `<ul class="vocabulary-list">${slide.body.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>`;
  }

  if (slide.type === "dialogue" || slide.type === "language-point") {
    return `<p class="dialogue-line">${escapeHtml(slide.body)}</p>`;
  }

  return `<p>${escapeHtml(slide.body)}</p>`;
}

function slideClass(slide) {
  return ["slide", `slide-${slide.type}`, slide.number === 1 && manifest.visualAssetPath ? "has-art" : ""].filter(Boolean).join(" ");
}

function renderSlide(slide) {
  const eyebrow = slide.number === 1 ? manifest.title : `${manifest.title} / ${String(slide.number).padStart(2, "0")}`;
  const note = slide.note ? `<p class="note">${escapeHtml(slide.note)}</p>` : "";
  const cta = slide.cta ? `<p class="cta-url">${escapeHtml(slide.cta)}</p>` : "";
  const art = slide.number === 1 && manifest.visualAssetPath && visualAssetUrl ? `<img class="slide-art" src="${visualAssetUrl}" alt="${escapeHtml(manifest.visualAssetAlt ?? "Ilustra??o do post")}" />` : "";
  return `
    <article class="${slideClass(slide)}" data-slide="${slide.number}">
      ${art}
      <div class="slide-frame">
        <header class="slide-header">
          <div>
            <p class="brand">Conversante</p>
            <p class="eyebrow">${escapeHtml(eyebrow)}</p>
          </div>
          <span class="counter">${slide.number}/${manifest.slides.length}</span>
        </header>

        <main class="slide-main">
          <div class="marker">${slide.type === "cta" ? "Praticar" : slide.type === "vocabulary" ? "Palavras" : "História"}</div>
          <h1>${escapeHtml(slide.headline)}</h1>
          <div class="body-copy">${renderBody(slide)}</div>
          ${note}
          ${cta}
        </main>

        <footer class="slide-footer">
          <span>${escapeHtml(manifest.promise)}</span>
          <strong>@conversante42</strong>
        </footer>
      </div>
    </article>
  `;
}

function buildHtml(singleSlide = null) {
  const slides = singleSlide ? [singleSlide] : manifest.slides;
  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(manifest.title)} Instagram Carousel</title>
  <style>
    :root {
      --ink: #041F49;
      --muted: #61728F;
      --paper: #FAF7F2;
      --panel: #FFFFFF;
      --blue: #041F49;
      --turquoise: #0AC9C6;
      --mint: #DDF9F7;
      --coral: #F4654C;
      --red: #C94F43;
      --sand: #EFE7DA;
      --line: #E5DED2;
      --soft-shadow: rgba(4, 31, 73, 0.14);
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      background: var(--blue);
      color: var(--ink);
      font-family: Arial, Helvetica, sans-serif;
    }

    .preview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 24px;
      padding: 24px;
    }

    .preview-grid .slide {
      width: min(100%, 432px);
      height: auto;
      aspect-ratio: 4 / 5;
      transform-origin: top left;
    }

    .slide {
      width: 1080px;
      height: 1350px;
      background: var(--paper);
      overflow: hidden;
      position: relative;
    }

    .slide::before {
      content: "";
      position: absolute;
      inset: 0;
      background:
        linear-gradient(90deg, rgba(10, 201, 198, 0.12) 0 1px, transparent 1px 100%),
        linear-gradient(0deg, rgba(244, 101, 76, 0.08) 0 1px, transparent 1px 100%);
      background-size: 72px 72px;
      pointer-events: none;
    }

    .slide-art {
      position: absolute;
      top: 178px;
      left: 76px;
      z-index: 1;
      width: calc(100% - 152px);
      height: 420px;
      object-fit: cover;
      border: 6px solid rgba(255, 255, 255, 0.96);
      box-shadow: 18px 18px 0 rgba(10, 201, 198, 0.48);
      filter: saturate(1.04) contrast(0.98);
    }

    .slide.has-art::after {
      content: "";
      position: absolute;
      inset: 0;
      z-index: 1;
      background: linear-gradient(180deg, rgba(250, 247, 242, 0.1) 0%, rgba(250, 247, 242, 0.08) 42%, rgba(250, 247, 242, 0.96) 62%, rgba(250, 247, 242, 1) 100%);
      pointer-events: none;
    }

    .slide-frame {
      position: relative;
      z-index: 2;
      width: 100%;
      height: 100%;
      padding: 74px 76px 66px;
      display: grid;
      grid-template-rows: auto 1fr auto;
      border: 24px solid var(--panel);
    }

    .slide.has-art .slide-frame {
      border-color: rgba(255, 255, 255, 0.92);
    }

    .slide.has-art .slide-main {
      align-self: end;
      padding-top: 444px;
    }

    .slide.has-art .marker {
      margin-bottom: 24px;
    }

    .slide.has-art h1 {
      font-size: 72px;
      line-height: 0.98;
    }

    .slide.has-art .body-copy {
      margin-top: 30px;
      max-width: 780px;
      font-size: 34px;
      line-height: 1.18;
    }

    .slide-header,
    .slide-footer {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 36px;
    }

    .brand,
    .eyebrow,
    .marker,
    .counter,
    .slide-footer {
      letter-spacing: 0;
      text-transform: uppercase;
    }

    .brand {
      margin: 0 0 12px;
      font-size: 32px;
      font-weight: 850;
      color: var(--turquoise);
    }

    .eyebrow {
      margin: 0;
      color: var(--muted);
      font-size: 22px;
      font-weight: 720;
    }

    .counter {
      display: inline-grid;
      place-items: center;
      width: 92px;
      height: 92px;
      border: 3px solid var(--blue);
      border-radius: 999px;
      color: var(--blue);
      background: var(--mint);
      font-size: 24px;
      font-weight: 850;
    }

    .slide-main {
      align-self: center;
      max-width: 850px;
    }

    .marker {
      display: inline-flex;
      align-items: center;
      min-height: 54px;
      padding: 0 22px;
      background: var(--mint);
      border: 2px solid var(--turquoise);
      color: var(--blue);
      font-size: 22px;
      font-weight: 850;
      margin-bottom: 42px;
    }

    h1 {
      margin: 0;
      max-width: 850px;
      font-size: 86px;
      line-height: 0.96;
      font-weight: 900;
      color: var(--ink);
    }

    .body-copy {
      margin-top: 52px;
      color: var(--ink);
      font-size: 43px;
      line-height: 1.16;
      font-weight: 620;
    }

    .body-copy p {
      margin: 0;
    }

    .dialogue-line {
      padding: 44px 48px;
      background: var(--panel);
      border: 4px solid var(--blue);
      box-shadow: 18px 18px 0 var(--turquoise);
      font-size: 52px;
      line-height: 1.12;
      font-weight: 850;
    }

    .note {
      margin: 50px 0 0;
      max-width: 760px;
      color: var(--muted);
      font-size: 31px;
      line-height: 1.25;
      font-weight: 760;
    }

    .vocabulary-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: grid;
      gap: 22px;
    }

    .vocabulary-list li {
      padding: 22px 28px;
      background: var(--panel);
      border-left: 16px solid var(--turquoise);
      box-shadow: 0 1px 2px var(--soft-shadow);
      font-size: 42px;
      line-height: 1.05;
      font-weight: 790;
    }

    .cta-url {
      display: inline-flex;
      margin: 56px 0 0;
      min-height: 74px;
      align-items: center;
      padding: 0 30px;
      color: var(--panel);
      background: var(--blue);
      font-size: 34px;
      font-weight: 850;
    }

    .slide-footer {
      padding-top: 34px;
      border-top: 3px solid var(--line);
      color: var(--muted);
      font-size: 20px;
      line-height: 1.25;
      font-weight: 780;
    }

    .slide-footer span {
      max-width: 620px;
    }

    .slide-footer strong {
      color: var(--turquoise);
      white-space: nowrap;
    }

    .slide-hook .slide-frame { border-color: var(--mint); }
    .slide-dialogue .marker { background: #FFF1ED; border-color: var(--coral); color: var(--red); }
    .slide-language-point .marker { background: var(--sand); border-color: var(--blue); color: var(--blue); }
    .slide-vocabulary .slide-frame { border-color: var(--sand); }
    .slide-cta .slide-frame { border-color: var(--mint); }
    .slide-cta h1 { color: var(--blue); }
  </style>
</head>
<body class="${singleSlide ? "single-export" : "preview-grid"}">
  ${slides.map(renderSlide).join("\n")}
</body>
</html>`;
}

fs.writeFileSync(previewPath, buildHtml(), "utf8");

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });

for (const slide of manifest.slides) {
  await page.setContent(buildHtml(slide), { waitUntil: "networkidle" });
  if (slide.number === 1 && manifest.visualAssetPath) {
    await page.waitForFunction(() => {
      const image = document.querySelector(".slide-art");
      return image && image.complete && image.naturalWidth > 0;
    });
  }
  const slideElement = page.locator(".slide").first();
  const outputPath = path.join(slidesDir, `slide-${String(slide.number).padStart(2, "0")}.png`);
  await slideElement.screenshot({ path: outputPath });
}

await browser.close();

process.stdout.write(`Rendered ${manifest.slides.length} carousel slides to ${path.relative(projectRoot, slidesDir)}\n`);
process.stdout.write(`Preview: ${pathToFileURL(previewPath).href}\n`);