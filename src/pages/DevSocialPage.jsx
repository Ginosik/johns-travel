import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/socialPreview.css";

const socialPosts = [
  {
    id: "day-1",
    label: "Dia 1",
    title: "John's Travel - Day 1",
    manifestPath: "/social/day-1/carousel.json",
    previewPath: "/social/day-1/preview.html",
    slidesPath: "/social/day-1/slides",
    staticPath: "/day/1/static",
    packagePath: "/social/day-1/day-1-instagram-package.zip"
  },
  {
    id: "day-2",
    label: "Dia 2",
    title: "John's Travel - Day 2",
    manifestPath: "/social/day-2/carousel.json",
    previewPath: "/social/day-2/preview.html",
    slidesPath: "/social/day-2/slides",
    staticPath: "/day/2/static",
    packagePath: "/social/day-2/day-2-instagram-package.zip"
  },
  {
    id: "day-3",
    label: "Dia 3",
    title: "John's Travel - Day 3",
    manifestPath: "/social/day-3/carousel.json",
    previewPath: "/social/day-3/preview.html",
    slidesPath: "/social/day-3/slides",
    staticPath: "/day/3/static",
    packagePath: "/social/day-3/day-3-instagram-package.zip"
  },
  {
    id: "day-4",
    label: "Dia 4",
    title: "John's Travel - Day 4",
    manifestPath: "/social/day-4/carousel.json",
    previewPath: "/social/day-4/preview.html",
    slidesPath: "/social/day-4/slides",
    staticPath: "/day/4/static",
    packagePath: "/social/day-4/day-4-instagram-package.zip"
  }
];

const pageRoadmap = [
  {
    title: "Area de revisao",
    status: "feito",
    items: [
      { label: "Carregar o manifesto do carrossel gerado", done: true },
      { label: "Exibir todos os slides PNG renderizados", done: true },
      { label: "Mostrar legenda e texto alternativo", done: true }
    ]
  },
  {
    title: "Comportamento simulado",
    status: "feito",
    items: [
      { label: "Viewport de carrossel com um slide por vez", done: true },
      { label: "Controles de anterior e proximo", done: true },
      { label: "Navegacao por teclado e toque", done: true },
      { label: "Area de legenda parecida com Instagram", done: true }
    ]
  },
  {
    title: "Decisoes de revisao",
    status: "feito",
    items: [
      { label: "Aprovacao por slide", done: true },
      { label: "Persistir o estado da revisao localmente", done: true },
      { label: "Checagens de texto e exportacao", done: true },
      { label: "Avisos de arquivos ausentes", done: true }
    ]
  },
  {
    title: "Pacote de exportacao",
    status: "feito",
    items: [
      { label: "Mostrar arquivos para upload manual", done: true },
      { label: "Botoes para copiar legenda e texto alternativo", done: true },
      { label: "Links de download dos PNGs", done: true },
      { label: "Download do pacote em um clique", done: true }
    ]
  },
  {
    title: "Variantes de conta",
    status: "feito",
    items: [
      { label: "Seletor de conta", done: true },
      { label: "Perfil e CTA especificos por conta", done: true },
      { label: "Comparacao visual lado a lado", done: true }
    ]
  },
  {
    title: "Conteudo dos dias",
    status: "em andamento",
    items: [
      { label: "Usar falas reais da conversa na legenda", done: true },
      { label: "Destacar vocabulario especifico de cada dia", done: true },
      { label: "Revisar tom antes da publicacao", done: false }
    ]
  }
];

function getAccountEntries(manifest) {
  return Object.entries(manifest?.accounts ?? {}).map(([id, account]) => ({ id, ...account }));
}

function getAccountHandle(account) {
  return account?.handle?.startsWith("@") ? account.handle.slice(1) : account?.handle ?? "conversante42";
}
function getSlideImagePath(post, slideNumber) {
  return `${post.slidesPath}/slide-${String(slideNumber).padStart(2, "0")}.png`;
}

function createReviewState(manifest) {
  const slideApprovals = Object.fromEntries((manifest?.slides ?? []).map((slide) => [slide.number, false]));

  return {
    slides: slideApprovals,
    caption: false,
    altText: false,
    exportLinks: false
  };
}

function createAssetState(manifest) {
  return {
    caption: Boolean(manifest?.caption?.trim()),
    altText: Boolean(manifest?.altText?.trim()),
    destination: Boolean(manifest?.destinationPath),
    generatedHtml: true,
    visualAsset: manifest?.visualAssetPath ? "pending" : "missing",
    slides: Object.fromEntries((manifest?.slides ?? []).map((slide) => [slide.number, "pending"]))
  };
}

function mergeReviewState(manifest, storedState) {
  const baseState = createReviewState(manifest);

  if (!storedState) return baseState;

  return {
    ...baseState,
    ...storedState,
    slides: {
      ...baseState.slides,
      ...(storedState.slides ?? {})
    }
  };
}

function getAssetSummary(manifest, assetState) {
  const slides = manifest?.slides ?? [];
  const slideStatuses = slides.map((slide) => assetState?.slides?.[slide.number] ?? "pending");
  const readySlides = slideStatuses.filter((status) => status === "ready").length;
  const missingSlides = slideStatuses.filter((status) => status === "missing").length;
  const pendingSlides = slideStatuses.filter((status) => status === "pending").length;
  const requiredCopyReady = Boolean(assetState?.caption && assetState?.altText && assetState?.destination);
  const visualStatus = assetState?.visualAsset ?? "missing";
  const visualReady = !manifest?.visualAssetPath || visualStatus === "ready";
  const allReady = requiredCopyReady && visualReady && missingSlides === 0 && pendingSlides === 0 && readySlides === slides.length;

  return { allReady, readySlides, missingSlides, pendingSlides, totalSlides: slides.length, requiredCopyReady, visualStatus };
}

function SocialSlidePreview({ post, slide, onSlideAssetLoad }) {
  return (
    <article className="social-preview-card">
      <div className="social-preview-image-wrap">
        <img
          alt={`Instagram carousel slide ${slide.number}: ${slide.headline}`}
          src={getSlideImagePath(post, slide.number)}
          onLoad={() => onSlideAssetLoad?.(slide.number, "ready")}
          onError={() => onSlideAssetLoad?.(slide.number, "missing")}
        />
      </div>
      <div className="social-preview-card-copy">
        <span>{slide.type}</span>
        <h2>{slide.headline}</h2>
        {Array.isArray(slide.body) ? (
          <ul>
            {slide.body.map((line) => <li key={line}>{line}</li>)}
          </ul>
        ) : (
          <p>{slide.body}</p>
        )}
        {slide.note && <small>{slide.note}</small>}
      </div>
    </article>
  );
}

function RoadmapChecklist() {
  return (
    <section className="social-preview-roadmap" aria-label="Social preview page roadmap">
      <div className="social-preview-section-heading">
        <span>Roteiro da pagina</span>
        <h2>Fluxo de revisao</h2>
      </div>
      <div className="social-preview-roadmap-grid">
        {pageRoadmap.map((group) => (
          <article className="social-preview-roadmap-card" key={group.title}>
            <div>
              <h3>{group.title}</h3>
              <span>{group.status}</span>
            </div>
            <ul>
              {group.items.map((item) => (
                <li className={item.done ? "is-done" : ""} key={item.label}>
                  <input type="checkbox" checked={item.done} readOnly aria-label={item.label} />
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

function AccountVariantPanel({ accounts, selectedAccountId, onSelectAccount }) {
  return (
    <section className="social-preview-account" aria-label="Account variant controls">
      <div className="social-preview-section-heading">
        <span>Variantes de conta</span>
        <h2>Contexto de publicacao</h2>
      </div>
      <div className="social-preview-account-layout">
        {accounts.map((account) => (
          <button
            className={account.id === selectedAccountId ? "is-active" : ""}
            type="button"
            aria-pressed={account.id === selectedAccountId}
            onClick={() => onSelectAccount(account.id)}
            key={account.id}
          >
            <strong>{account.handle}</strong>
            <span>{account.role}</span>
            <small>{account.cta}</small>
          </button>
        ))}
      </div>
    </section>
  );
}

function AccountComparisonPanel({ accounts, post, selectedAccountId, onSelectAccount }) {
  return (
    <section className="social-preview-account-compare" aria-label="Account variant comparison">
      <div className="social-preview-section-heading">
        <span>Comparacao de variantes</span>
        <h2>Mesmo post, lentes diferentes</h2>
      </div>
      <div className="social-preview-account-compare-grid">
        {accounts.map((account) => (
          <button
            className={account.id === selectedAccountId ? "is-active" : ""}
            type="button"
            aria-pressed={account.id === selectedAccountId}
            onClick={() => onSelectAccount(account.id)}
            key={account.id}
          >
            <img src={getSlideImagePath(post, 1)} alt={`${account.handle} preview using slide 1`} />
            <strong>{account.handle}</strong>
            <span>{account.role}</span>
            <p>{account.cta}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
function VisualAssetPanel({ manifest, onVisualAssetLoad }) {
  if (!manifest.visualAssetPath) return null;

  return (
    <section className="social-preview-visual" aria-label="Asset visual gerado">
      <div className="social-preview-section-heading">
        <span>Asset visual</span>
        <h2>Imagem de apoio do post</h2>
      </div>
      <div className="social-preview-visual-layout">
        <img
          src={manifest.visualAssetPath}
          alt={manifest.visualAssetAlt ?? `Asset visual para ${manifest.title}`}
          onLoad={() => onVisualAssetLoad?.("ready")}
          onError={() => onVisualAssetLoad?.("missing")}
        />
        <article>
          <h3>{manifest.subtitle}</h3>
          <p>{manifest.visualAssetAlt ?? "Imagem gerada para dar contexto visual ao primeiro slide."}</p>
          <div>
            <a href={manifest.visualAssetPath}>Abrir imagem</a>
            <a href={manifest.visualAssetPath} download="cover.png">Baixar imagem</a>
          </div>
        </article>
      </div>
    </section>
  );
}
function SimulatedPost({ manifest, post, account, selectedSlideIndex, onSelectSlide }) {
  const [touchStartX, setTouchStartX] = useState(null);
  const slides = manifest.slides ?? [];
  const currentSlide = slides[selectedSlideIndex] ?? slides[0];
  const hasPrevious = selectedSlideIndex > 0;
  const hasNext = selectedSlideIndex < slides.length - 1;
  const accountHandle = getAccountHandle(account);
  const captionParts = manifest.caption.split("\n").filter(Boolean);
  const captionLead = captionParts[0] ?? "";
  const captionRest = captionParts.slice(1, -1).join(" ");
  const hashtags = captionParts.at(-1) ?? "";

  function goPrevious() {
    if (hasPrevious) onSelectSlide(selectedSlideIndex - 1);
  }

  function goNext() {
    if (hasNext) onSelectSlide(selectedSlideIndex + 1);
  }

  function handleKeyDown(event) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goPrevious();
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      goNext();
    }
  }

  function handleTouchEnd(event) {
    if (touchStartX == null) return;

    const touchEndX = event.changedTouches[0]?.clientX;
    const distance = touchStartX - touchEndX;

    if (Math.abs(distance) > 45) {
      if (distance > 0) goNext();
      else goPrevious();
    }

    setTouchStartX(null);
  }

  if (!currentSlide) return null;

  return (
    <section className="social-preview-simulator" aria-label="Simulated Instagram carousel post">
      <div className="social-preview-section-heading">
        <span>Comportamento simulado</span>
        <h2>Fluxo do carrossel</h2>
      </div>

      <div className="social-preview-simulator-layout">
        <div className="social-preview-phone-shell" tabIndex="0" onKeyDown={handleKeyDown}>
          <div className="social-preview-post-topbar">
            <div className="social-preview-avatar">C</div>
            <div>
              <strong>{accountHandle}</strong>
              <span>{account?.role ?? manifest.title}</span>
            </div>
            <span>{currentSlide.number}/{slides.length}</span>
          </div>

          <div
            className="social-preview-stage"
            onTouchStart={(event) => setTouchStartX(event.touches[0]?.clientX ?? null)}
            onTouchEnd={handleTouchEnd}
          >
            <button type="button" onClick={goPrevious} disabled={!hasPrevious} aria-label="Slide anterior">
              {"<"}
            </button>
            <img
              alt={`Selected Instagram carousel slide ${currentSlide.number}: ${currentSlide.headline}`}
              src={getSlideImagePath(post, currentSlide.number)}
            />
            <button type="button" onClick={goNext} disabled={!hasNext} aria-label="Proximo slide">
              {">"}
            </button>
          </div>

          <div className="social-preview-post-actions" aria-label="Simulated Instagram actions">
            <span>Curtir</span>
            <span>Comentar</span>
            <span>Compartilhar</span>
            <strong>{currentSlide.number}/{slides.length}</strong>
          </div>

          <div className="social-preview-dots" aria-label="Carousel slide picker">
            {slides.map((slide, index) => (
              <button
                className={index === selectedSlideIndex ? "is-active" : ""}
                type="button"
                aria-label={`Mostrar slide ${slide.number}`}
                aria-pressed={index === selectedSlideIndex}
                onClick={() => onSelectSlide(index)}
                key={slide.number}
              />
            ))}
          </div>

          <div className="social-preview-post-caption">
            <p><strong>{accountHandle}</strong> {captionLead}</p>
            {captionRest && <p>{captionRest}</p>}
            {account?.cta && <p>{account.cta}</p>}
            {hashtags && <small>{hashtags}</small>}
          </div>
        </div>

        <aside className="social-preview-current-slide">
          <span>{currentSlide.type}</span>
          <h3>{currentSlide.headline}</h3>
          {Array.isArray(currentSlide.body) ? (
            <ul>{currentSlide.body.map((line) => <li key={line}>{line}</li>)}</ul>
          ) : (
            <p>{currentSlide.body}</p>
          )}
          {currentSlide.note && <small>{currentSlide.note}</small>}
        </aside>
      </div>
    </section>
  );
}

function ReviewDecisionPanel({ manifest, reviewState, assetSummary, onToggle, onReset }) {
  const slides = manifest.slides ?? [];
  const approvedSlideCount = slides.filter((slide) => reviewState.slides?.[slide.number]).length;
  const totalChecks = slides.length + 3;
  const completedChecks = approvedSlideCount
    + Number(Boolean(reviewState.caption))
    + Number(Boolean(reviewState.altText))
    + Number(Boolean(reviewState.exportLinks));
  const isReady = completedChecks === totalChecks && assetSummary.allReady;

  return (
    <section className="social-preview-review" aria-label="Decisoes de revisao">
      <div className="social-preview-section-heading">
        <span>Decisoes de revisao</span>
        <h2>Checklist de aprovacao</h2>
      </div>

      <div className="social-preview-review-layout">
        <div className="social-preview-review-progress">
          <strong>{completedChecks}/{totalChecks}</strong>
          <span>{isReady ? "Pronto para exportacao manual" : "Revisao em andamento"}</span>
          {!assetSummary.allReady && <small>Os arquivos ainda precisam de atencao antes da exportacao.</small>}
          <button type="button" onClick={onReset}>Reiniciar revisao</button>
        </div>

        <fieldset className="social-preview-review-checks">
          <legend>Slides</legend>
          {slides.map((slide) => (
            <label key={slide.number}>
              <input
                type="checkbox"
                checked={Boolean(reviewState.slides?.[slide.number])}
                onChange={() => onToggle("slides", slide.number)}
              />
              <span>Slide {slide.number}: {slide.headline}</span>
            </label>
          ))}
        </fieldset>

        <fieldset className="social-preview-review-checks">
          <legend>Texto e exportacao</legend>
          <label>
            <input type="checkbox" checked={Boolean(reviewState.caption)} onChange={() => onToggle("caption")} />
            <span>Legenda aprovada</span>
          </label>
          <label>
            <input type="checkbox" checked={Boolean(reviewState.altText)} onChange={() => onToggle("altText")} />
            <span>Texto alternativo aprovado</span>
          </label>
          <label>
            <input type="checkbox" checked={Boolean(reviewState.exportLinks)} onChange={() => onToggle("exportLinks")} />
            <span>Links da licao estatica e dos PNGs verificados</span>
          </label>
        </fieldset>
      </div>
    </section>
  );
}

function AssetStatusPanel({ manifest, assetState }) {
  const summary = getAssetSummary(manifest, assetState);
  const statusText = summary.allReady
    ? "Todos os arquivos obrigatorios estao prontos."
    : `${summary.readySlides}/${summary.totalSlides} slides prontos, ${summary.pendingSlides} pendentes, ${summary.missingSlides} ausentes.`;

  return (
    <section className="social-preview-assets" aria-label="Generated asset status">
      <div className="social-preview-section-heading">
        <span>Checagem de arquivos</span>
        <h2>Status dos arquivos gerados</h2>
      </div>
      <div className="social-preview-asset-layout">
        <div className={summary.allReady ? "social-preview-asset-callout is-ready" : "social-preview-asset-callout"}>
          <strong>{summary.allReady ? "Pronto" : "Verificar arquivos"}</strong>
          <p>{statusText}</p>
        </div>
        <ul className="social-preview-asset-list">
          <li className={assetState.caption ? "is-ready" : "is-missing"}>Texto da legenda</li>
          <li className={assetState.altText ? "is-ready" : "is-missing"}>Texto alternativo</li>
          <li className={assetState.destination ? "is-ready" : "is-missing"}>Link de destino</li>
          {manifest.visualAssetPath && (
            <li className={`is-${assetState.visualAsset ?? "pending"}`}>Asset visual</li>
          )}
          {(manifest.slides ?? []).map((slide) => (
            <li className={`is-${assetState.slides?.[slide.number] ?? "pending"}`} key={slide.number}>
              Slide {slide.number} PNG
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function ExportPackagePanel({ manifest, post, account, copiedTarget, onCopy }) {
  const slideFiles = (manifest.slides ?? []).map((slide) => ({
    label: `slide-${String(slide.number).padStart(2, "0")}.png`,
    href: getSlideImagePath(post, slide.number)
  }));
  const packageItems = [
    { label: "Manifesto do carrossel", href: post.manifestPath },
    { label: "Preview HTML gerado", href: post.previewPath },
    { label: "Licao estatica", href: post.staticPath },
    { label: "Pacote ZIP em um clique", href: post.packagePath },
    ...slideFiles
  ];

  return (
    <section className="social-preview-export" aria-label="Pacote de exportacao manual">
      <div className="social-preview-section-heading">
        <span>Pacote de exportacao</span>
        <h2>Kit de publicacao manual</h2>
      </div>

      <div className="social-preview-export-layout">
        <article>
          <h3>Textos</h3>
          <button type="button" onClick={() => onCopy("caption", manifest.caption)}>
            {copiedTarget === "caption" ? "Legenda copiada" : "Copiar legenda"}
          </button>
          <button type="button" onClick={() => onCopy("altText", manifest.altText)}>
            {copiedTarget === "altText" ? "Texto alternativo copiado" : "Copiar texto alternativo"}
          </button>
          <button type="button" onClick={() => onCopy("destination", manifest.destinationPath)}>
            {copiedTarget === "destination" ? "Link copiado" : "Copiar link de destino"}
          </button>
          <button type="button" onClick={() => onCopy("accountCta", account?.cta ?? "")}>
            {copiedTarget === "accountCta" ? "CTA copiado" : "Copiar CTA da conta"}
          </button>
        </article>

        <article>
          <h3>Arquivos e links</h3>
          <ul>
            {packageItems.map((item) => (
              <li key={item.href}>
                <span>{item.label}</span>
                <a href={item.href} download={item.href.endsWith(".png") || item.href.endsWith(".zip") ? item.label : undefined}>{item.href.endsWith(".zip") ? "Baixar" : "Abrir"}</a>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}

function DevSocialPage() {
  const [selectedPostId, setSelectedPostId] = useState(socialPosts[0].id);
  const [selectedSlideIndex, setSelectedSlideIndex] = useState(0);
  const [selectedAccountId, setSelectedAccountId] = useState("conversante");
  const [manifest, setManifest] = useState(null);
  const [reviewState, setReviewState] = useState(null);
  const [assetState, setAssetState] = useState(null);
  const [copiedTarget, setCopiedTarget] = useState(null);
  const [loadState, setLoadState] = useState("loading");
  const selectedPost = useMemo(
    () => socialPosts.find((post) => post.id === selectedPostId) ?? socialPosts[0],
    [selectedPostId]
  );
  const reviewStorageKey = `social-preview-review:${selectedPost.id}`;
  const accountEntries = useMemo(() => getAccountEntries(manifest), [manifest]);
  const selectedAccount = accountEntries.find((account) => account.id === selectedAccountId) ?? accountEntries[0];
  const assetSummary = useMemo(() => getAssetSummary(manifest, assetState), [assetState, manifest]);

  useEffect(() => {
    let isCurrent = true;
    setLoadState("loading");
    setManifest(null);
    setReviewState(null);
    setAssetState(null);
    setCopiedTarget(null);
    setSelectedSlideIndex(0);

    fetch(selectedPost.manifestPath)
      .then((response) => {
        if (!response.ok) throw new Error(`Missing social manifest: ${selectedPost.manifestPath}`);
        return response.json();
      })
      .then((data) => {
        if (!isCurrent) return;
        const storedState = JSON.parse(window.localStorage.getItem(reviewStorageKey) ?? "null");
        setManifest(data);
        setAssetState(createAssetState(data));
        setSelectedAccountId(Object.keys(data.accounts ?? {})[0] ?? "conversante");
        setReviewState(mergeReviewState(data, storedState));
        setLoadState("ready");
      })
      .catch(() => {
        if (!isCurrent) return;
        setLoadState("missing");
      });

    return () => {
      isCurrent = false;
    };
  }, [reviewStorageKey, selectedPost]);

  useEffect(() => {
    if (!manifest) return;

    function handleGlobalKeyDown(event) {
      const tagName = event.target?.tagName?.toLowerCase();
      if (["input", "textarea", "select"].includes(tagName)) return;

      if (event.key === "ArrowLeft") {
        setSelectedSlideIndex((current) => Math.max(0, current - 1));
      }

      if (event.key === "ArrowRight") {
        setSelectedSlideIndex((current) => Math.min((manifest.slides?.length ?? 1) - 1, current + 1));
      }
    }

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [manifest]);

  function setSlideAssetStatus(slideNumber, status) {
    setAssetState((current) => {
      if (!current || current.slides?.[slideNumber] === status) return current;
      return {
        ...current,
        slides: {
          ...current.slides,
          [slideNumber]: status
        }
      };
    });
  }

  function setVisualAssetStatus(status) {
    setAssetState((current) => {
      if (!current || current.visualAsset === status) return current;
      return {
        ...current,
        visualAsset: status
      };
    });
  }

  function updateReviewState(updater) {
    setReviewState((current) => {
      const nextState = updater(current ?? createReviewState(manifest));
      window.localStorage.setItem(reviewStorageKey, JSON.stringify(nextState));
      return nextState;
    });
  }

  function toggleReview(key, slideNumber = null) {
    updateReviewState((current) => {
      if (key === "slides") {
        return {
          ...current,
          slides: {
            ...current.slides,
            [slideNumber]: !current.slides?.[slideNumber]
          }
        };
      }

      return {
        ...current,
        [key]: !current[key]
      };
    });
  }

  function resetReview() {
    const nextState = createReviewState(manifest);
    window.localStorage.setItem(reviewStorageKey, JSON.stringify(nextState));
    setReviewState(nextState);
  }

  async function copyExportText(target, value) {
    await navigator.clipboard.writeText(value);
    setCopiedTarget(target);
    window.setTimeout(() => setCopiedTarget(null), 1600);
  }

  const slideCount = manifest?.slides?.length ?? 0;

  return (
    <main className="social-preview-page">
      <div className="social-preview-actions">
        <Link className="back-link" to="/">Voltar para o feed</Link>
        <div>
          <span className="social-preview-badge">Area de desenvolvimento</span>
          <strong>Previews de posts sociais</strong>
        </div>
      </div>

      <section className="social-preview-header">
        <div>
          <p>Laboratorio de carrossel do Instagram</p>
          <h1>Previews de posts</h1>
        </div>
        <div className="social-preview-stats" aria-label="Social preview totals">
          <span><strong>{socialPosts.length}</strong> posts</span>
          <span><strong>{slideCount}</strong> slides</span>
          <span><strong>1080x1350</strong> exportacao</span>
        </div>
      </section>

      <RoadmapChecklist />

      <section className="social-preview-controls" aria-label="Social post controls">
        <fieldset>
          <legend>Posts gerados</legend>
          {socialPosts.map((post) => (
            <button
              className={selectedPost.id === post.id ? "is-active" : ""}
              type="button"
              aria-pressed={selectedPost.id === post.id}
              onClick={() => setSelectedPostId(post.id)}
              key={post.id}
            >
              {post.label}
            </button>
          ))}
        </fieldset>
        <div className="social-preview-links">
          <Link to={selectedPost.staticPath}>Licao estatica</Link>
          <a href={selectedPost.previewPath}>HTML gerado</a>
          <a href={`${selectedPost.slidesPath}/slide-01.png`}>Primeiro PNG</a>
        </div>
      </section>

      {loadState === "loading" && (
        <section className="social-preview-empty" aria-live="polite">
          <h2>Carregando preview</h2>
          <p>Lendo o manifesto do carrossel gerado.</p>
        </section>
      )}

      {loadState === "missing" && (
        <section className="social-preview-empty" aria-live="polite">
          <h2>Ainda nao ha preview gerado</h2>
          <p>Rode <code>npm run social:generate -- --post {selectedPost.id}</code> e <code>npm run social:render -- --post {selectedPost.id}</code>.</p>
        </section>
      )}

      {manifest && reviewState && assetState && (
        <>
          <section className="social-preview-summary">
            <div>
              <span>{manifest.status}</span>
              <h2>{manifest.title}</h2>
              <p>{manifest.promise}</p>
            </div>
            <dl>
              <div><dt>Destino</dt><dd>{manifest.destinationPath}</dd></div>
              <div><dt>Publico</dt><dd>{manifest.audience}</dd></div>
              <div><dt>Hook</dt><dd>{manifest.hook}</dd></div>
            </dl>
          </section>

          <AccountVariantPanel
            accounts={accountEntries}
            selectedAccountId={selectedAccount?.id}
            onSelectAccount={setSelectedAccountId}
          />

          <AccountComparisonPanel
            accounts={accountEntries}
            post={selectedPost}
            selectedAccountId={selectedAccount?.id}
            onSelectAccount={setSelectedAccountId}
          />

          <VisualAssetPanel
            manifest={manifest}
            onVisualAssetLoad={setVisualAssetStatus}
          />

          <SimulatedPost
            manifest={manifest}
            post={selectedPost}
            account={selectedAccount}
            selectedSlideIndex={selectedSlideIndex}
            onSelectSlide={setSelectedSlideIndex}
          />

          <AssetStatusPanel manifest={manifest} assetState={assetState} />

          <ReviewDecisionPanel
            manifest={manifest}
            reviewState={reviewState}
            assetSummary={assetSummary}
            onToggle={toggleReview}
            onReset={resetReview}
          />

          <ExportPackagePanel
            manifest={manifest}
            post={selectedPost}
            account={selectedAccount}
            copiedTarget={copiedTarget}
            onCopy={copyExportText}
          />

          <section className="social-preview-grid" aria-label={`${manifest.title} rendered carousel slides`}>
            {manifest.slides.map((slide) => (
              <SocialSlidePreview
                post={selectedPost}
                slide={slide}
                onSlideAssetLoad={setSlideAssetStatus}
                key={slide.number}
              />
            ))}
          </section>

          <section className="social-preview-copy-grid" aria-label="Texto do post">
            <article>
              <h2>Legenda</h2>
              <pre>{manifest.caption}</pre>
            </article>
            <article>
              <h2>Texto alternativo</h2>
              <pre>{manifest.altText}</pre>
            </article>
          </section>
        </>
      )}
    </main>
  );
}

export default DevSocialPage;