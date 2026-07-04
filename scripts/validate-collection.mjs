import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { normalizeImageFile, parseCsvRecords } from "../csv-data.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const csvPath = path.join(rootDir, "data", "records.csv");
const publicImagesDir = path.join(rootDir, "public-images");

async function main() {
  const csvText = await fs.readFile(csvPath, "utf8");
  const records = parseCsvRecords(csvText);
  const recordImageEntries = await fs.readdir(publicImagesDir, { withFileTypes: true });
  const recordImages = recordImageEntries
    .filter((entry) => entry.isFile() && /^coll\d+\.[a-z0-9]+$/i.test(entry.name))
    .map((entry) => entry.name)
    .sort();
  const referencedImages = new Set(
    records
      .map((record) => normalizeImageFile(record.image_file))
      .filter(Boolean)
  );

  const recordsMissingImages = records.filter((record) => !normalizeImageFile(record.image_file));
  const missingReferencedFiles = records
    .map((record) => ({
      accession_number: record.accession_number,
      title: record.title,
      image_file: normalizeImageFile(record.image_file)
    }))
    .filter((record) => record.image_file)
    .filter((record) => !recordImages.includes(path.basename(record.image_file)));
  const unreferencedFiles = recordImages.filter((entry) => !referencedImages.has(entry));
  const publicRecordsMissingImages = recordsMissingImages.filter((record) => record.is_public);

  console.log(`Total records: ${records.length}`);
  console.log(`Public records: ${records.filter((record) => record.is_public).length}`);
  console.log(`Records with image_file: ${records.filter((record) => normalizeImageFile(record.image_file)).length}`);
  console.log(`Files in public-images: ${recordImages.length}`);
  console.log(`Records missing images: ${recordsMissingImages.length}`);
  console.log(`Public records missing images: ${publicRecordsMissingImages.length}`);
  console.log(`Missing referenced files: ${missingReferencedFiles.length}`);
  console.log(`Unreferenced files: ${unreferencedFiles.length}`);

  if (publicRecordsMissingImages.length) {
    console.log("\nPublic records missing images:");
    for (const record of publicRecordsMissingImages) {
      console.log(`- ${record.accession_number}: ${record.title}`);
    }
  }

  if (missingReferencedFiles.length) {
    console.log("\nCSV image paths with no file on disk:");
    for (const record of missingReferencedFiles) {
      console.log(`- ${record.accession_number}: ${record.image_file}`);
    }
  }

  if (unreferencedFiles.length) {
    console.log("\nFiles in public-images with no matching CSV row:");
    for (const file of unreferencedFiles) {
      console.log(`- ${file}`);
    }
  }

  if (missingReferencedFiles.length) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
