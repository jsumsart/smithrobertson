import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const recordsDir = path.join(rootDir, "public-images");

function buildSequentialName(index, extension) {
  return `coll${String(index).padStart(3, "0")}${extension.toLowerCase()}`;
}

async function getNextIndex() {
  const entries = await fs.readdir(recordsDir);
  const numbers = entries
    .map((entry) => entry.match(/^coll(\d+)\.[a-z0-9]+$/i))
    .filter(Boolean)
    .map((match) => Number.parseInt(match[1], 10))
    .filter((value) => Number.isFinite(value));

  return (numbers.length ? Math.max(...numbers) : 0) + 1;
}

async function main() {
  const sourceArg = process.argv[2];

  if (!sourceArg) {
    console.error("Usage: node ./scripts/add-record-image.mjs /absolute/path/to/photo.png");
    process.exitCode = 1;
    return;
  }

  const sourcePath = path.resolve(process.cwd(), sourceArg);
  const extension = path.extname(sourcePath) || ".png";
  const nextIndex = await getNextIndex();
  const fileName = buildSequentialName(nextIndex, extension);
  const destinationPath = path.join(recordsDir, fileName);

  await fs.copyFile(sourcePath, destinationPath);

  console.log(`Copied image to: ${destinationPath}`);
  console.log(`CSV image_file value: ${fileName}`);
  console.log("Next step: paste that image_file value into data/records.csv for the matching row.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
