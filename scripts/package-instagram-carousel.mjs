import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const args = process.argv.slice(2);
const postArgIndex = args.indexOf("--post");
const requestedPost = postArgIndex >= 0 ? args[postArgIndex + 1] : "day-1";
const socialDir = path.join(projectRoot, "public", "social", requestedPost);
const outputPath = path.join(socialDir, `${requestedPost}-instagram-package.zip`);

const files = [
  { diskPath: path.join(socialDir, "carousel.json"), zipPath: "carousel.json" },
  { diskPath: path.join(socialDir, "caption.txt"), zipPath: "caption.txt" },
  { diskPath: path.join(socialDir, "alt-text.txt"), zipPath: "alt-text.txt" },
  { diskPath: path.join(socialDir, "README.md"), zipPath: "README.md" },
  { diskPath: path.join(socialDir, "preview.html"), zipPath: "preview.html" }
];

const artDir = path.join(socialDir, "art");
if (fs.existsSync(artDir)) {
  for (const filename of fs.readdirSync(artDir).filter((name) => name.endsWith(".png") || name.endsWith(".jpg") || name.endsWith(".webp")).sort()) {
    files.push({ diskPath: path.join(artDir, filename), zipPath: `art/${filename}` });
  }
}

const slidesDir = path.join(socialDir, "slides");
if (fs.existsSync(slidesDir)) {
  for (const filename of fs.readdirSync(slidesDir).filter((name) => name.endsWith(".png")).sort()) {
    files.push({ diskPath: path.join(slidesDir, filename), zipPath: `slides/${filename}` });
  }
}

for (const file of files) {
  if (!fs.existsSync(file.diskPath)) {
    throw new Error(`Missing export package file: ${path.relative(projectRoot, file.diskPath)}`);
  }
}

const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n += 1) {
  let c = n;
  for (let k = 0; k < 8; k += 1) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c >>> 0;
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function dosDateTime(date = new Date()) {
  const year = Math.max(date.getFullYear(), 1980);
  const dosTime = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const dosDate = ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { dosTime, dosDate };
}

function uint16(value) {
  const buffer = Buffer.alloc(2);
  buffer.writeUInt16LE(value & 0xffff);
  return buffer;
}

function uint32(value) {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32LE(value >>> 0);
  return buffer;
}

function createZip(entries) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  const { dosTime, dosDate } = dosDateTime();

  for (const entry of entries) {
    const data = fs.readFileSync(entry.diskPath);
    const name = Buffer.from(entry.zipPath.replaceAll("\\", "/"), "utf8");
    const crc = crc32(data);

    const localHeader = Buffer.concat([
      uint32(0x04034b50),
      uint16(20),
      uint16(0x0800),
      uint16(0),
      uint16(dosTime),
      uint16(dosDate),
      uint32(crc),
      uint32(data.length),
      uint32(data.length),
      uint16(name.length),
      uint16(0),
      name
    ]);

    localParts.push(localHeader, data);

    const centralHeader = Buffer.concat([
      uint32(0x02014b50),
      uint16(20),
      uint16(20),
      uint16(0x0800),
      uint16(0),
      uint16(dosTime),
      uint16(dosDate),
      uint32(crc),
      uint32(data.length),
      uint32(data.length),
      uint16(name.length),
      uint16(0),
      uint16(0),
      uint16(0),
      uint16(0),
      uint32(0),
      uint32(offset),
      name
    ]);

    centralParts.push(centralHeader);
    offset += localHeader.length + data.length;
  }

  const centralDirectory = Buffer.concat(centralParts);
  const localData = Buffer.concat(localParts);
  const endRecord = Buffer.concat([
    uint32(0x06054b50),
    uint16(0),
    uint16(0),
    uint16(entries.length),
    uint16(entries.length),
    uint32(centralDirectory.length),
    uint32(localData.length),
    uint16(0)
  ]);

  return Buffer.concat([localData, centralDirectory, endRecord]);
}

fs.mkdirSync(socialDir, { recursive: true });
fs.writeFileSync(outputPath, createZip(files));
process.stdout.write(`Created ${path.relative(projectRoot, outputPath)} with ${files.length} files\n`);