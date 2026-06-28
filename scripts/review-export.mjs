import { chromium } from "@playwright/test";
import { createServer } from "node:http";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

function readOption(name) {
  const prefix = `--${name}=`;
  const inline = process.argv.find((argument) => argument.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);

  const index = process.argv.indexOf(`--${name}`);
  if (index !== -1) return process.argv[index + 1];

  return null;
}

function createStaticServer(videoPath) {
  const server = createServer(async (request, response) => {
    if (request.url !== "/video.webm") {
      response.writeHead(404);
      response.end();
      return;
    }

    const bytes = await readFile(videoPath);
    const range = request.headers.range;

    if (range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(range);
      const start = match?.[1] ? Number(match[1]) : 0;
      const end = match?.[2] ? Number(match[2]) : bytes.length - 1;
      const chunk = bytes.subarray(start, end + 1);
      response.writeHead(206, {
        "Accept-Ranges": "bytes",
        "Content-Length": chunk.length,
        "Content-Range": `bytes ${start}-${end}/${bytes.length}`,
        "Content-Type": "video/webm"
      });
      response.end(chunk);
      return;
    }

    response.writeHead(200, {
      "Accept-Ranges": "bytes",
      "Content-Length": bytes.length,
      "Content-Type": "video/webm"
    });
    response.end(bytes);
  });

  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      resolve({ port: address.port, server });
    });
  });
}

function parseDataUrl(dataUrl) {
  return Buffer.from(dataUrl.split(",")[1], "base64");
}

const videoPath = path.resolve(readOption("video") ?? readOption("input") ?? "videos/day-1-audio/youtube-16x9-audio.webm");
const outputDir = path.resolve(readOption("output") ?? path.join(path.dirname(videoPath), "review"));
const videoStats = await stat(videoPath);
await mkdir(outputDir, { recursive: true });

const videoBytes = await readFile(videoPath);
const videoText = videoBytes.toString("latin1");
const { port, server } = await createStaticServer(videoPath);
const browser = await chromium.launch();
const page = await browser.newPage();

try {
  const result = await page.evaluate(async (src) => {
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.preload = "metadata";
    video.src = src;

    await new Promise((resolve, reject) => {
      video.onloadedmetadata = resolve;
      video.onerror = () => reject(new Error("Could not load video metadata."));
    });

    const duration = video.duration;
    const captureTimes = [
      { name: "first", time: Math.min(1.2, duration / 4) },
      { name: "middle", time: duration / 2 },
      { name: "final", time: Math.max(0, duration - 1.2) }
    ];

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    const thumbnails = [];

    for (const capture of captureTimes) {
      video.currentTime = capture.time;
      await new Promise((resolve, reject) => {
        video.onseeked = resolve;
        video.onerror = () => reject(new Error(`Could not seek to ${capture.time}.`));
      });

      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      thumbnails.push({
        dataUrl: canvas.toDataURL("image/png"),
        name: capture.name,
        time: Number(capture.time.toFixed(2))
      });
    }

    return {
      duration: Number(duration.toFixed(2)),
      height: video.videoHeight,
      thumbnails,
      width: video.videoWidth
    };
  }, `http://127.0.0.1:${port}/video.webm`);

  const thumbnails = [];
  for (const thumbnail of result.thumbnails) {
    const fileName = `${thumbnail.name}-${String(thumbnail.time).replace(".", "-")}s.png`;
    const filePath = path.join(outputDir, fileName);
    await writeFile(filePath, parseDataUrl(thumbnail.dataUrl));
    thumbnails.push({ name: thumbnail.name, path: filePath, time: thumbnail.time });
  }

  const review = {
    bytes: videoStats.size,
    duration: result.duration,
    hasOpusAudio: videoText.includes("OpusHead"),
    hasVp9Video: videoText.includes("V_VP9"),
    height: result.height,
    thumbnails,
    video: videoPath,
    width: result.width
  };

  await writeFile(path.join(outputDir, "review.json"), `${JSON.stringify(review, null, 2)}\n`);
  console.log(JSON.stringify(review, null, 2));
} catch (error) {
  const fallbackReview = {
    bytes: videoStats.size,
    decodeError: error.message,
    hasOpusAudio: videoText.includes("OpusHead"),
    hasVp9Video: videoText.includes("V_VP9"),
    thumbnails: [],
    video: videoPath
  };

  await writeFile(path.join(outputDir, "review.json"), `${JSON.stringify(fallbackReview, null, 2)}\n`);
  console.log(JSON.stringify(fallbackReview, null, 2));
} finally {
  await browser.close();
  server.close();
}
