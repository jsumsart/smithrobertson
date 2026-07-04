import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { escapeCsv, parseCsv } from "../csv-data.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const csvPath = path.join(rootDir, "data", "records.csv");
const publicImagesDir = path.join(rootDir, "public-images");
const tempImagesDir = path.join(rootDir, "public-images-renamed");

function slugify(value, fallback = "item") {
  const slug = String(value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  return slug || fallback;
}

function slugifyAccession(value) {
  return slugify(value, "record");
}

function buildRecordImagePath(record, extension) {
  const accessionSlug = slugifyAccession(record.accession_number);
  const titleSlug = slugify(record.title, "image").slice(0, 80).replace(/-+$/g, "");
  return path.posix.join("records", `${accessionSlug}--${titleSlug}${extension.toLowerCase()}`);
}

function buildSequencePath(folder, prefix, index, extension) {
  return path.posix.join(folder, `${prefix}-${String(index).padStart(3, "0")}${extension.toLowerCase()}`);
}

async function listFiles(dir) {
  const output = [];

  async function walk(current) {
    const entries = await fs.readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else {
        output.push(fullPath);
      }
    }
  }

  await walk(dir);
  return output;
}

async function ensureCleanDir(dir) {
  await fs.rm(dir, { recursive: true, force: true });
  await fs.mkdir(dir, { recursive: true });
}

async function copyFileIntoTree(sourcePath, relativeTargetPath) {
  const fullTargetPath = path.join(tempImagesDir, relativeTargetPath);
  await fs.mkdir(path.dirname(fullTargetPath), { recursive: true });
  await fs.copyFile(sourcePath, fullTargetPath);
}

async function main() {
  const csvText = await fs.readFile(csvPath, "utf8");
  const rows = parseCsv(csvText);
  const headers = rows[0];
  const records = rows.slice(1).map((row) => {
    const record = {};
    headers.forEach((header, index) => {
      record[header] = row[index] ?? "";
    });
    return record;
  });

  const allFiles = (await listFiles(publicImagesDir))
    .filter((filePath) => !path.relative(publicImagesDir, filePath).startsWith(`thumbs${path.sep}`))
    .sort((left, right) => path.relative(publicImagesDir, left).localeCompare(path.relative(publicImagesDir, right)));

  const referencedSources = new Set(
    records
      .map((record) => String(record.image_file || "").trim())
      .filter(Boolean)
      .map((relativePath) => path.normalize(relativePath))
  );

  await ensureCleanDir(tempImagesDir);

  for (const record of records) {
    const currentImagePath = String(record.image_file || "").trim();
    if (!currentImagePath) {
      continue;
    }

    const normalizedCurrentPath = path.normalize(currentImagePath);
    const sourcePath = path.join(publicImagesDir, normalizedCurrentPath);
    const extension = path.extname(sourcePath) || ".png";
    const nextImagePath = buildRecordImagePath(record, extension);

    await copyFileIntoTree(sourcePath, nextImagePath);
    record.image_file = nextImagePath;
  }

  const unreferencedFiles = allFiles
    .map((filePath) => ({
      absolute: filePath,
      relative: path.relative(publicImagesDir, filePath),
      normalized: path.normalize(path.relative(publicImagesDir, filePath))
    }))
    .filter((file) => !referencedSources.has(file.normalized));

  const siteGalleryFiles = unreferencedFiles.filter((file) => file.relative.startsWith(`srstart${path.sep}`));
  const sourceScanFiles = unreferencedFiles.filter((file) => file.relative.startsWith(`scans${path.sep}`));
  const otherUnreferencedFiles = unreferencedFiles.filter(
    (file) => !file.relative.startsWith(`srstart${path.sep}`) && !file.relative.startsWith(`scans${path.sep}`)
  );

  let index = 1;
  for (const file of siteGalleryFiles) {
    await copyFileIntoTree(file.absolute, buildSequencePath(path.posix.join("..", "preserved-images", "site-gallery"), "site-gallery", index, path.extname(file.absolute)));
    index += 1;
  }

  index = 1;
  for (const file of sourceScanFiles) {
    await copyFileIntoTree(file.absolute, buildSequencePath(path.posix.join("..", "preserved-images", "source-scans"), "source-scan", index, path.extname(file.absolute)));
    index += 1;
  }

  for (const file of otherUnreferencedFiles) {
    const baseName = slugify(path.basename(file.absolute, path.extname(file.absolute)), "asset");
    await copyFileIntoTree(file.absolute, path.posix.join("misc", `${baseName}${path.extname(file.absolute).toLowerCase()}`));
  }

  const nextCsvText = [
    headers.join(","),
    ...records.map((record) => headers.map((header) => escapeCsv(record[header] ?? "")).join(","))
  ].join("\n");
  await fs.writeFile(csvPath, `${nextCsvText}\n`, "utf8");

  const backupDir = path.join(rootDir, "public-images-backup-before-rename");
  await fs.rm(backupDir, { recursive: true, force: true });
  await fs.rename(publicImagesDir, backupDir);
  await fs.rename(tempImagesDir, publicImagesDir);
  await fs.rm(backupDir, { recursive: true, force: true });

  console.log(`Renamed ${records.filter((record) => String(record.image_file || "").trim()).length} record-linked images.`);
  console.log(`Moved ${siteGalleryFiles.length} site gallery files and ${sourceScanFiles.length} source scans into the new structure.`);
  console.log(`Moved ${otherUnreferencedFiles.length} additional unreferenced files into misc/.`);
}

main().catch(async (error) => {
  console.error(error);
  await fs.rm(tempImagesDir, { recursive: true, force: true });
  process.exitCode = 1;
});
