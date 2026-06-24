import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { spawn, spawnSync } from "node:child_process";
import path from "node:path";
import { getConversationExportManifest } from "./export-manifest.mjs";

const host = "127.0.0.1";
const port = "4173";
const baseUrl = `http://${host}:${port}`;
const formats = [
  { name: "youtube-16x9-audio", width: 1920, height: 1080 },
  { name: "vertical-9x16-audio", width: 1080, height: 1920 },
  { name: "square-1x1-audio", width: 1080, height: 1080 }
];
const formatAliases = new Map([
  ["youtube", "youtube-16x9-audio"],
  ["16x9", "youtube-16x9-audio"],
  ["landscape", "youtube-16x9-audio"],
  ["vertical", "vertical-9x16-audio"],
  ["9x16", "vertical-9x16-audio"],
  ["shorts", "vertical-9x16-audio"],
  ["reels", "vertical-9x16-audio"],
  ["square", "square-1x1-audio"],
  ["1x1", "square-1x1-audio"]
]);
const captionModes = new Set(["translation", "source", "both", "none"]);
const paceModes = new Set(["auto", "youtube", "shorts", "square", "slow"]);

function readOption(name) {
  const prefix = `--${name}=`;
  const inline = process.argv.find((argument) => argument.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);

  const index = process.argv.indexOf(`--${name}`);
  if (index !== -1) return process.argv[index + 1];

  return null;
}

function startViteIfNeeded() {
  return spawn(
    process.execPath,
    ["node_modules/vite/bin/vite.js", "--host", host, "--port", port],
    { stdio: "ignore" }
  );
}

function stopProcess(processHandle) {
  if (!processHandle || processHandle.exitCode !== null) return;

  if (process.platform === "win32") {
    spawnSync("taskkill", ["/pid", String(processHandle.pid), "/T", "/F"], { stdio: "ignore" });
  } else {
    processHandle.kill("SIGTERM");
  }
}

async function waitForApp() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
    } catch {
      // Keep waiting while Vite starts.
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error(`Timed out waiting for ${baseUrl}.`);
}

async function recordFormat(manifest, format, outputDir) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: format.width, height: format.height } });
  await page.goto(baseUrl, { waitUntil: "networkidle" });

  const bytes = await page.evaluate(async ({ baseUrl, format, manifest }) => {
    const canvas = document.createElement("canvas");
    canvas.width = format.width;
    canvas.height = format.height;
    document.body.style.margin = "0";
    document.body.append(canvas);

    const ctx = canvas.getContext("2d");
    const audioContext = new AudioContext({ sampleRate: 48000 });
    const audioDestination = audioContext.createMediaStreamDestination();
    const pacePresets = {
      youtube: { messageGapMs: 560, titleCardMs: 1900, introAfterTitleMs: 750, outroMs: 2800, longPauseMs: 520 },
      shorts: { messageGapMs: 360, titleCardMs: 1200, introAfterTitleMs: 420, outroMs: 1600, longPauseMs: 260 },
      square: { messageGapMs: 460, titleCardMs: 1500, introAfterTitleMs: 560, outroMs: 2100, longPauseMs: 380 },
      slow: { messageGapMs: 760, titleCardMs: 2300, introAfterTitleMs: 1000, outroMs: 3300, longPauseMs: 760 }
    };
    const autoPace = format.name.includes("vertical")
      ? "shorts"
      : format.name.includes("square")
        ? "square"
        : "youtube";
    const pace = pacePresets[manifest.paceMode === "auto" ? autoPace : manifest.paceMode] ?? pacePresets.youtube;
    const messageGapMs = pace.messageGapMs;
    const titleCardMs = pace.titleCardMs;
    const introMs = titleCardMs + pace.introAfterTitleMs;
    const outroMs = pace.outroMs;
    const scheduleLeadMs = 300;

    async function loadImage(src) {
      const image = new Image();
      image.src = src;
      await image.decode();
      return image;
    }

    const images = {
      background: await loadImage(manifest.theme.backgroundImage),
      John: await loadImage(manifest.theme.johnAvatar),
      Nicky: await loadImage(manifest.theme.nickyAvatar)
    };

    async function decodeAudio(message) {
      const response = await fetch(`${baseUrl}${message.audioPath}`);
      if (!response.ok) throw new Error(`Could not load ${message.audioPath}`);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = await audioContext.decodeAudioData(arrayBuffer);
      return { ...message, buffer, durationMs: Math.ceil(buffer.duration * 1000) };
    }

    const sourceMessages = manifest.previewMessageCount
      ? manifest.messages.slice(0, manifest.previewMessageCount)
      : manifest.messages;
    const messages = await Promise.all(sourceMessages.map(decodeAudio));
    function getPauseAfterMs(message) {
      const textLength = Math.max(message.text.length, message.translation?.length ?? 0);
      if (/[.!?][”"]?$/.test(message.text) && textLength > 90) return pace.longPauseMs;
      if (textLength > 130) return Math.round(pace.longPauseMs * 1.4);
      return 0;
    }

    let cursorMs = introMs;
    const timeline = messages.map((message) => {
      const startMs = cursorMs;
      const pauseAfterMs = getPauseAfterMs(message);
      cursorMs += message.durationMs + messageGapMs + pauseAfterMs;
      return { ...message, pauseAfterMs, startMs };
    });
    const totalMs = cursorMs + outroMs;

    function wrapText(text, maxWidth, font) {
      ctx.font = font;
      const words = text.split(" ");
      const lines = [];
      let line = "";

      function splitLongWord(word) {
        if (ctx.measureText(word).width <= maxWidth) return [word];
        const pieces = [];
        let piece = "";

        for (const char of Array.from(word)) {
          const nextPiece = `${piece}${char}`;
          if (ctx.measureText(nextPiece).width <= maxWidth || !piece) {
            piece = nextPiece;
          } else {
            pieces.push(piece);
            piece = char;
          }
        }

        if (piece) pieces.push(piece);
        return pieces;
      }

      for (const word of words) {
        const wordPieces = splitLongWord(word);
        for (const wordPiece of wordPieces) {
          const testLine = line ? `${line} ${wordPiece}` : wordPiece;
          if (ctx.measureText(testLine).width <= maxWidth || !line) {
            line = testLine;
          } else {
            lines.push(line);
            line = wordPiece;
          }
        }
      }

      if (line) lines.push(line);
      return lines;
    }

    function roundRect(x, y, width, height, radius) {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.arcTo(x + width, y, x + width, y + height, radius);
      ctx.arcTo(x + width, y + height, x, y + height, radius);
      ctx.arcTo(x, y + height, x, y, radius);
      ctx.arcTo(x, y, x + width, y, radius);
      ctx.closePath();
    }

    function drawCoverImage(image, x, y, width, height) {
      const imageRatio = image.width / image.height;
      const targetRatio = width / height;
      const sourceWidth = imageRatio > targetRatio ? image.height * targetRatio : image.width;
      const sourceHeight = imageRatio > targetRatio ? image.height : image.width / targetRatio;
      const sourceX = (image.width - sourceWidth) / 2;
      const sourceY = (image.height - sourceHeight) / 2;
      ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
    }

    function drawBackground() {
      drawCoverImage(images.background, 0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(246, 242, 234, .88)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const grainSize = Math.max(18, Math.round(canvas.width * 0.015));
      ctx.save();
      ctx.globalAlpha = 0.09;
      ctx.fillStyle = "#17212f";
      for (let y = 0; y < canvas.height; y += grainSize) {
        for (let x = 0; x < canvas.width; x += grainSize) {
          if ((x / grainSize + y / grainSize) % 3 === 0) ctx.fillRect(x, y, 1.5, 1.5);
        }
      }
      ctx.restore();
    }

    function drawBrand(padding, titleSize, subtitleSize) {
      ctx.fillStyle = "#17212f";
      ctx.font = `800 ${titleSize}px Arial, sans-serif`;
      ctx.fillText(manifest.title, padding, padding + titleSize);

      ctx.fillStyle = "#1877f2";
      ctx.font = `700 ${subtitleSize}px Arial, sans-serif`;
      ctx.fillText(manifest.location, padding, padding + titleSize + subtitleSize * 1.5);
    }

    function drawTitleCard(elapsedMs) {
      const progress = Math.min(1, elapsedMs / 900);
      const eased = 1 - Math.pow(1 - progress, 3);
      const padding = Math.max(54, Math.round(canvas.width * 0.06));
      const titleSize = Math.max(58, Math.round(canvas.width * 0.06));
      const subtitleSize = Math.max(26, Math.round(canvas.width * 0.023));

      ctx.save();
      ctx.globalAlpha = eased;
      ctx.translate(0, (1 - eased) * 20);
      ctx.fillStyle = "#17212f";
      ctx.font = `900 ${titleSize}px Arial, sans-serif`;
      ctx.fillText(manifest.title, padding, canvas.height * 0.38);

      ctx.fillStyle = "#1877f2";
      ctx.font = `800 ${subtitleSize}px Arial, sans-serif`;
      ctx.fillText(manifest.subtitle, padding, canvas.height * 0.38 + titleSize * 0.85);

      ctx.fillStyle = "#667085";
      ctx.font = `600 ${Math.round(subtitleSize * 0.82)}px Arial, sans-serif`;
      ctx.fillText(manifest.location, padding, canvas.height * 0.38 + titleSize * 1.34);
      ctx.restore();
    }

    function drawEndCard(elapsedMs, totalMs) {
      const progress = Math.min(1, Math.max(0, (elapsedMs - (totalMs - outroMs + 500)) / 900));
      if (progress <= 0) return;

      const eased = 1 - Math.pow(1 - progress, 3);
      const titleSize = Math.max(42, Math.round(canvas.width * 0.044));
      const subtitleSize = Math.max(24, Math.round(canvas.width * 0.022));
      ctx.save();
      ctx.globalAlpha = eased;
      ctx.fillStyle = "rgba(246, 242, 234, .88)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#17212f";
      ctx.font = `900 ${titleSize}px Arial, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(manifest.closingTitle, canvas.width / 2, canvas.height * 0.48);
      ctx.fillStyle = "#1877f2";
      ctx.font = `800 ${subtitleSize}px Arial, sans-serif`;
      ctx.fillText(manifest.closingSubtitle, canvas.width / 2, canvas.height * 0.48 + titleSize * 0.9);
      ctx.textAlign = "left";
      ctx.restore();
    }

    function drawAvatar(image, centerX, centerY, radius, borderColor) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      drawCoverImage(image, centerX - radius, centerY - radius, radius * 2, radius * 2);
      ctx.restore();

      ctx.lineWidth = Math.max(4, radius * 0.12);
      ctx.strokeStyle = borderColor;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();
    }

    function getCaptionRows(message) {
      if (!message || manifest.captionMode === "none") return [];
      if (manifest.captionMode === "source") return [{ kind: "source", label: manifest.translationPanel?.heading ?? "Source", text: message.text }];
      if (manifest.translationPanel) {
        const rows = [];
        if (manifest.captionMode === "both") {
          rows.push({ kind: "source", label: manifest.translationPanel.heading, text: message.text });
        }
        if (message.transliteration) {
          rows.push({
            kind: "transliteration",
            label: manifest.translationPanel.transliterationLabel,
            text: message.transliteration
          });
        }
        if (message.meaningNote) {
          rows.push({
            kind: "meaning",
            label: manifest.translationPanel.meaningLabel,
            text: message.meaningNote
          });
        }
        return rows;
      }
      if (manifest.captionMode === "both") {
        return [
          { kind: "source", label: "English", text: message.text },
          { kind: "translation", label: "Portuguese", text: message.translation }
        ].filter((row) => row.text);
      }
      return message.translation ? [{ kind: "translation", label: "Portuguese", text: message.translation }] : [];
    }

    function getCaptionHeight(activeMessage, captionWidth) {
      const rows = getCaptionRows(activeMessage);
      if (rows.length === 0) return 0;

      const captionFontSize = Math.max(24, Math.round(canvas.width * 0.019));
      const labelFontSize = Math.max(13, Math.round(canvas.width * 0.01));
      const chipSize = Math.max(34, Math.round(canvas.width * 0.026));
      const rowGap = Math.max(10, Math.round(canvas.height * 0.008));
      const innerWidth = captionWidth - 60 - chipSize - 16;
      let textHeight = 0;

      rows.forEach((row) => {
        const lines = wrapText(row.text, innerWidth, `700 ${captionFontSize}px Arial, sans-serif`);
        textHeight += labelFontSize + 8 + lines.length * Math.round(captionFontSize * 1.26) + rowGap;
      });

      return Math.max(112, textHeight + 48);
    }

    function getCaptionBand(activeMessage, padding) {
      const width = canvas.width - padding * 2;
      const height = getCaptionHeight(activeMessage, width);
      if (!height) return null;

      return {
        height,
        width,
        x: padding,
        y: canvas.height - padding - height
      };
    }

    function drawCaption(activeMessage, padding, elapsedMs, captionBand) {
      const rows = getCaptionRows(activeMessage);
      if (rows.length === 0 || !captionBand) return;

      const { height, width, x, y } = captionBand;
      const chipSize = Math.max(34, Math.round(canvas.width * 0.026));
      const captionFontSize = Math.max(24, Math.round(canvas.width * 0.019));
      const labelFontSize = Math.max(13, Math.round(canvas.width * 0.01));
      const lineHeight = Math.round(captionFontSize * 1.26);
      const innerX = x + 30 + chipSize + 16;
      const innerWidth = width - 60 - chipSize - 16;
      const revealProgress = Math.min(1, Math.max(0, (elapsedMs - activeMessage.startMs) / 360));
      const eased = 1 - Math.pow(1 - revealProgress, 3);

      ctx.save();
      ctx.globalAlpha = eased;
      ctx.translate(0, (1 - eased) * 12);
      ctx.shadowColor = "rgba(17, 24, 39, .16)";
      ctx.shadowBlur = 30;
      ctx.shadowOffsetY = 16;
      roundRect(x, y, width, height, 26);
      ctx.fillStyle = "rgba(255, 255, 255, .92)";
      ctx.fill();
      ctx.shadowColor = "transparent";
      ctx.strokeStyle = "rgba(24, 119, 242, .22)";
      ctx.lineWidth = 2;
      ctx.stroke();

      drawAvatar(
        images[activeMessage.speaker],
        x + 30 + chipSize / 2,
        y + 30 + chipSize / 2,
        chipSize / 2,
        activeMessage.side === "right" ? "#1877f2" : "#2e9d62"
      );

      ctx.textBaseline = "top";
      ctx.fillStyle = "#667085";
      ctx.font = `800 ${labelFontSize}px Arial, sans-serif`;
      ctx.fillText(activeMessage.speaker.toLocaleUpperCase(), innerX, y + 22);

      let cursorY = y + 42;
      rows.forEach((row, rowIndex) => {
        const lines = wrapText(row.text, innerWidth, `700 ${captionFontSize}px Arial, sans-serif`);
        ctx.fillStyle = row.kind === "meaning" ? "#2e9d62" : "#1877f2";
        ctx.font = `800 ${labelFontSize}px Arial, sans-serif`;
        ctx.fillText(row.label.toLocaleUpperCase(), innerX, cursorY);
        cursorY += labelFontSize + 8;

        ctx.fillStyle = row.kind === "meaning" ? "#344054" : "#17212f";
        ctx.font = `${row.kind === "source" ? 800 : 700} ${captionFontSize}px Arial, sans-serif`;
        lines.forEach((line) => {
          ctx.fillText(line, innerX, cursorY);
          cursorY += lineHeight;
        });
        cursorY += 12;
      });
      ctx.restore();
    }

    function getMessageLayout(message, bubbleWidth) {
      const isRight = message.side === "right";
      const speakerFontSize = Math.max(18, Math.round(canvas.width * 0.014));
      const textFontSize = Math.max(30, Math.round(canvas.width * 0.023));
      const lineHeight = Math.round(textFontSize * 1.32);
      const innerWidth = bubbleWidth - 68;
      const speakerFont = `700 ${speakerFontSize}px Arial, sans-serif`;
      const textFont = `500 ${textFontSize}px Arial, sans-serif`;
      const lines = wrapText(message.text, innerWidth, textFont);
      const labelGap = Math.max(8, Math.round(textFontSize * 0.22));
      const verticalPadding = Math.max(24, Math.round(textFontSize * 0.58));
      const textBlockHeight = speakerFontSize + labelGap + lines.length * lineHeight;
      const height = textBlockHeight + verticalPadding * 2;

      return {
        height,
        innerWidth,
        labelGap,
        lineHeight,
        lines,
        speakerFont,
        speakerFontSize,
        textBlockHeight,
        textFont,
        textFontSize,
        verticalPadding,
        isRight
      };
    }

    function drawMessage(message, y, bubbleWidth, padding, elapsedMs, isActive) {
      const layout = getMessageLayout(message, bubbleWidth);
      const isRight = layout.isRight;
      const avatarRadius = Math.max(24, Math.round(canvas.width * 0.026));
      const avatarGap = Math.max(14, Math.round(canvas.width * 0.012));
      const x = isRight
        ? canvas.width - bubbleWidth - padding - avatarRadius * 2 - avatarGap
        : padding + avatarRadius * 2 + avatarGap;
      const innerX = x + 34;
      const height = layout.height;
      const revealProgress = Math.min(1, Math.max(0, (elapsedMs - message.startMs) / 420));
      const eased = 1 - Math.pow(1 - revealProgress, 3);
      const avatarX = isRight ? x + bubbleWidth + avatarGap + avatarRadius : x - avatarGap - avatarRadius;
      const avatarY = y + Math.min(height / 2, avatarRadius + 24);
      const contentTop = y + (height - layout.textBlockHeight) / 2;

      ctx.save();
      ctx.globalAlpha = eased;
      ctx.translate(0, (1 - eased) * 24);
      if (isActive) {
        ctx.save();
        ctx.globalAlpha = 0.12;
        roundRect(x - 10, y - 10, bubbleWidth + 20, height + 20, 34);
        ctx.fillStyle = isRight ? "#1877f2" : "#2e9d62";
        ctx.fill();
        ctx.restore();
      }
      drawAvatar(images[message.speaker], avatarX, avatarY, avatarRadius, isRight ? "#1877f2" : "#ffffff");
      roundRect(x, y, bubbleWidth, height, 28);
      ctx.fillStyle = isRight ? "#1877f2" : "#ffffff";
      ctx.shadowColor = "rgba(17, 24, 39, .16)";
      ctx.shadowBlur = 28;
      ctx.shadowOffsetY = 14;
      ctx.fill();
      ctx.shadowColor = "transparent";

      ctx.textBaseline = "top";
      ctx.fillStyle = isRight ? "rgba(255,255,255,.78)" : "#667085";
      ctx.font = layout.speakerFont;
      ctx.fillText(message.speaker, innerX, contentTop);

      ctx.fillStyle = isRight ? "#ffffff" : "#17212f";
      ctx.font = layout.textFont;
      layout.lines.forEach((line, lineIndex) => {
        ctx.fillText(line, innerX, contentTop + layout.speakerFontSize + layout.labelGap + lineIndex * layout.lineHeight);
      });
      ctx.restore();

      return height;
    }

    function draw(elapsedMs) {
      const padding = Math.max(42, Math.round(canvas.width * 0.055));
      const titleSize = Math.max(34, Math.round(canvas.width * 0.034));
      const subtitleSize = Math.max(19, Math.round(canvas.width * 0.015));
      const bottomPadding = Math.max(54, Math.round(canvas.height * 0.06));
      const gap = Math.max(20, Math.round(canvas.height * 0.02));
      const bubbleWidth = Math.min(canvas.width - padding * 2 - Math.round(canvas.width * 0.075), Math.round(canvas.width * 0.68));
      const visible = timeline.filter((message) => message.startMs - 420 <= elapsedMs);
      const activeMessage = [...visible].reverse().find((message) => elapsedMs < message.startMs + message.durationMs + messageGapMs);
      const captionBand = getCaptionBand(activeMessage, padding);
      const captionGap = captionBand ? Math.max(26, Math.round(canvas.height * 0.025)) : 0;

      drawBackground();
      if (elapsedMs < titleCardMs) {
        drawTitleCard(elapsedMs);
        return;
      }
      drawBrand(padding, titleSize, subtitleSize);

      const measured = visible.map((message) => {
        const layout = getMessageLayout(message, bubbleWidth);
        const layoutProgress = Math.min(1, Math.max(0, (elapsedMs - message.startMs + 420) / 420));
        const easedLayout = 1 - Math.pow(1 - layoutProgress, 3);
        return {
          ...message,
          height: layout.height,
          layoutHeight: layout.height * easedLayout,
          layoutProgress: easedLayout
        };
      });

      const headerBottom = padding + titleSize + subtitleSize * 2.1;
      const transcriptBottom = captionBand ? captionBand.y - captionGap : canvas.height - bottomPadding;
      const maxStackHeight = Math.max(0, transcriptBottom - headerBottom);
      const usedHeight = measured.reduce((total, message, index) => (
        total + message.layoutHeight + (index > 0 ? gap * message.layoutProgress : 0)
      ), 0);

      ctx.save();
      ctx.beginPath();
      ctx.rect(0, headerBottom - 12, canvas.width, maxStackHeight + 24);
      ctx.clip();

      let y = Math.min(transcriptBottom - usedHeight, headerBottom);
      measured.forEach((message, index) => {
        if (index > 0) y += gap * message.layoutProgress;
        const drawY = y + message.layoutHeight - message.height;
        drawMessage(message, drawY, bubbleWidth, padding, elapsedMs, message === activeMessage);
        y += message.layoutHeight;
      });
      ctx.restore();
      drawCaption(activeMessage, padding, elapsedMs, captionBand);
      drawEndCard(elapsedMs, totalMs);
    }

    const mimeType = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm"
    ].find((type) => MediaRecorder.isTypeSupported(type));
    if (!mimeType) throw new Error("MediaRecorder WebM output is not supported in this browser.");

    const canvasStream = canvas.captureStream(30);
    const outputStream = new MediaStream([
      ...canvasStream.getVideoTracks(),
      ...audioDestination.stream.getAudioTracks()
    ]);
    const recorder = new MediaRecorder(outputStream, {
      mimeType,
      audioBitsPerSecond: 192000,
      videoBitsPerSecond: 8_000_000
    });
    const chunks = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    };

    await audioContext.resume();
    const recordingEnded = new Promise((resolve) => {
      recorder.onstop = resolve;
    });
    const startAt = audioContext.currentTime + scheduleLeadMs / 1000;

    timeline.forEach((message) => {
      const source = audioContext.createBufferSource();
      source.buffer = message.buffer;
      source.connect(audioDestination);
      source.start(startAt + message.startMs / 1000);
    });

    recorder.start(250);
    let animationFrame = null;
    const render = () => {
      const elapsedMs = Math.max(0, (audioContext.currentTime - startAt) * 1000);
      draw(elapsedMs);
      if (elapsedMs < totalMs) animationFrame = requestAnimationFrame(render);
    };
    render();

    await new Promise((resolve) => setTimeout(resolve, totalMs + scheduleLeadMs + 600));
    if (animationFrame !== null) cancelAnimationFrame(animationFrame);
    recorder.stop();
    await recordingEnded;
    await audioContext.close();

    const blob = new Blob(chunks, { type: mimeType });
    return {
      bytes: Array.from(new Uint8Array(await blob.arrayBuffer())),
      metadata: {
        audio: true,
        captionMode: manifest.captionMode,
        codec: mimeType,
        durationMs: Math.round(totalMs),
        format: format.name,
        height: format.height,
        messageCount: sourceMessages.length,
        paceMode: manifest.paceMode,
        post: manifest.outputSlug,
        width: format.width
      }
    };
  }, { baseUrl, format, manifest });

  await browser.close();

  const outputPath = path.join(outputDir, `${format.name}.webm`);
  await writeFile(outputPath, Buffer.from(bytes.bytes));
  await writeFile(
    path.join(outputDir, `${format.name}.json`),
    `${JSON.stringify({ ...bytes.metadata, renderedAt: new Date().toISOString() }, null, 2)}\n`
  );
  return outputPath;
}

const requestedPost = readOption("post") ?? "day-1";
const manifest = await getConversationExportManifest(requestedPost);
const outputSlug = readOption("output") ?? manifest.outputSlug;
const outputDir = path.resolve("videos", outputSlug);
const requestedFormat = readOption("format") ?? "all";
const previewMessageCount = Number(readOption("preview-messages") ?? 0);
const captionMode = readOption("captions") ?? "translation";
if (!captionModes.has(captionMode)) {
  throw new Error(`Unknown caption mode "${captionMode}". Use translation, source, both, or none.`);
}
manifest.captionMode = captionMode;
const paceMode = readOption("pace") ?? "auto";
if (!paceModes.has(paceMode)) {
  throw new Error(`Unknown pace "${paceMode}". Use auto, youtube, shorts, square, or slow.`);
}
manifest.paceMode = paceMode;
if (previewMessageCount > 0) {
  manifest.previewMessageCount = previewMessageCount;
}
const selectedFormats = requestedFormat === "all"
  ? formats
  : formats.filter((format) => format.name === (formatAliases.get(requestedFormat.toLocaleLowerCase()) ?? requestedFormat));

if (selectedFormats.length === 0) {
  throw new Error(`Unknown format "${requestedFormat}". Use youtube, vertical, square, or all.`);
}

await mkdir(outputDir, { recursive: true });

let vite = null;

try {
  try {
    const response = await fetch(baseUrl);
    if (!response.ok) vite = startViteIfNeeded();
  } catch {
    vite = startViteIfNeeded();
  }

  await waitForApp();

  const outputs = [];
  for (const format of selectedFormats) {
    console.log(`Recording ${requestedPost} with audio as ${format.name}...`);
    outputs.push(await recordFormat(manifest, format, outputDir));
  }

  console.log("\nConversation videos with audio exported:");
  outputs.forEach((filePath) => console.log(`- ${filePath}`));
} finally {
  stopProcess(vite);
}

process.exit(0);
