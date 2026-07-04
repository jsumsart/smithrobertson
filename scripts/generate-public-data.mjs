import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

import { buildPublishedRecordsPayload, normalizeImageFile, parseCsvRecords } from "../csv-data.js";

const execFileAsync = promisify(execFile);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const inputPath = path.join(rootDir, "data", "records.csv");
const outputPath = path.join(rootDir, "data", "public-records.json");
const publicImagesDir = path.join(rootDir, "public-images");
const thumbnailsDir = path.join(publicImagesDir, "thumbs");
const thumbnailMaxSize = 900;

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function generateThumbnail(imageFile) {
  const normalized = normalizeImageFile(imageFile);
  if (!normalized) {
    return false;
  }

  const sourcePath = path.join(publicImagesDir, normalized);
  if (!(await fileExists(sourcePath))) {
    return false;
  }

  const outputPathForImage = path.join(thumbnailsDir, normalized);
  await fs.mkdir(path.dirname(outputPathForImage), { recursive: true });
  await execFileAsync("sips", [
    "--resampleHeightWidthMax",
    String(thumbnailMaxSize),
    sourcePath,
    "--out",
    outputPathForImage
  ]);
  return true;
}

async function main() {
  const csvText = await fs.readFile(inputPath, "utf8");
  const records = parseCsvRecords(csvText);
  const uniqueImageFiles = [...new Set(records.map((record) => normalizeImageFile(record.image_file)).filter(Boolean))];
  let generatedThumbnails = 0;

  for (const imageFile of uniqueImageFiles) {
    if (await generateThumbnail(imageFile)) {
      generatedThumbnails += 1;
    }
  }

  const payload = buildPublishedRecordsPayload(records);

  await fs.writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(
    `Generated ${path.relative(rootDir, outputPath)} with ${payload.total_public_records} public records and ${generatedThumbnails} thumbnails.`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
