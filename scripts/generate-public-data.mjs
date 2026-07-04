import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import os from "node:os";

import { buildPublishedRecordsPayload, normalizeImageFile, parseCsvRecords } from "../csv-data.js";

const execFileAsync = promisify(execFile);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const inputPath = path.join(rootDir, "data", "records.csv");
const outputPath = path.join(rootDir, "data", "public-records.json");
const publicImagesDir = path.join(rootDir, "public-images");
const thumbnailsDir = path.join(rootDir, "public-thumbs");
const thumbnailScriptPath = path.join(rootDir, "scripts", "build-thumbnail.py");

async function findPythonWithPillow() {
  const candidates = [
    process.env.COLLECTIONS_PYTHON,
    process.env.PYTHON,
    "python3",
    path.join(
      os.homedir(),
      ".cache",
      "codex-runtimes",
      "codex-primary-runtime",
      "dependencies",
      "python",
      "bin",
      "python3"
    )
  ].filter(Boolean);

  for (const candidate of candidates) {
    try {
      await execFileAsync(candidate, ["-c", "from PIL import Image"]);
      return candidate;
    } catch {
      continue;
    }
  }

  throw new Error("Could not find a Python interpreter with Pillow installed for thumbnail generation.");
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function generateThumbnail(imageFile, pythonPath) {
  const normalized = normalizeImageFile(imageFile);
  if (!normalized) {
    return false;
  }

  const sourcePath = path.join(publicImagesDir, normalized);
  if (!(await fileExists(sourcePath))) {
    return false;
  }

  const outputRelativePath = normalized.replace(/\.[^./]+$/, ".jpg");
  const outputPathForImage = path.join(thumbnailsDir, outputRelativePath);
  await fs.mkdir(path.dirname(outputPathForImage), { recursive: true });
  await execFileAsync(pythonPath, [thumbnailScriptPath, sourcePath, outputPathForImage]);
  return true;
}

async function pruneStaleThumbnails(validImageFiles) {
  const validThumbnailRelativePaths = new Set(
    [...validImageFiles]
      .map((imageFile) => normalizeImageFile(imageFile))
      .map((imageFile) => imageFile.replace(/\.[^./]+$/, ".jpg"))
      .filter(Boolean)
  );

  async function walk(currentDir) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        await walk(fullPath);

        const remaining = await fs.readdir(fullPath);
        if (!remaining.length) {
          await fs.rmdir(fullPath);
        }
        continue;
      }

      const relativePath = path.relative(thumbnailsDir, fullPath);
      if (!validThumbnailRelativePaths.has(relativePath)) {
        await fs.unlink(fullPath);
      }
    }
  }

  if (!(await fileExists(thumbnailsDir))) {
    return;
  }

  await walk(thumbnailsDir);
}

async function main() {
  const csvText = await fs.readFile(inputPath, "utf8");
  const records = parseCsvRecords(csvText);
  const uniqueImageFiles = [...new Set(records.map((record) => normalizeImageFile(record.image_file)).filter(Boolean))];
  let generatedThumbnails = 0;
  const pythonPath = await findPythonWithPillow();

  await pruneStaleThumbnails(uniqueImageFiles);

  for (const imageFile of uniqueImageFiles) {
    if (await generateThumbnail(imageFile, pythonPath)) {
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
