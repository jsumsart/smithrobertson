import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { escapeCsv, parseCsv } from "../csv-data.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const csvPath = path.join(rootDir, "data", "records.csv");
const recordsDir = path.join(rootDir, "public-images", "records");
const tempDir = path.join(rootDir, "public-images", "records-sequential-temp");

function buildSequentialName(index, extension) {
  return `coll${String(index).padStart(3, "0")}${extension.toLowerCase()}`;
}

async function main() {
  const csvText = await fs.readFile(csvPath, "utf8");
  const rows = parseCsv(csvText);
  const headers = rows[0];
  const imageFileIndex = headers.indexOf("image_file");

  if (imageFileIndex === -1) {
    throw new Error("CSV is missing image_file column.");
  }

  await fs.rm(tempDir, { recursive: true, force: true });
  await fs.mkdir(tempDir, { recursive: true });

  let counter = 1;
  for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex];
    const currentImageFile = String(row[imageFileIndex] || "").trim();

    if (!currentImageFile) {
      continue;
    }

    const sourcePath = path.join(rootDir, "public-images", currentImageFile);
    const extension = path.extname(sourcePath) || ".png";
    const nextRelativePath = path.posix.join("records", buildSequentialName(counter, extension));
    const targetPath = path.join(tempDir, path.basename(nextRelativePath));

    await fs.copyFile(sourcePath, targetPath);
    row[imageFileIndex] = nextRelativePath;
    counter += 1;
  }

  const nextCsvText = rows.map((row) => row.map((value) => escapeCsv(value ?? "")).join(",")).join("\n");
  await fs.writeFile(csvPath, `${nextCsvText}\n`, "utf8");

  const backupDir = path.join(rootDir, "public-images", "records-backup-before-sequential");
  await fs.rm(backupDir, { recursive: true, force: true });
  await fs.rename(recordsDir, backupDir);
  await fs.rename(tempDir, recordsDir);
  await fs.rm(backupDir, { recursive: true, force: true });

  console.log(`Renamed ${counter - 1} record-linked images to coll### filenames.`);
}

main().catch(async (error) => {
  console.error(error);
  await fs.rm(tempDir, { recursive: true, force: true });
  process.exitCode = 1;
});
