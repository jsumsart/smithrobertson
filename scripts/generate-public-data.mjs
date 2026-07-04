import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { buildPublishedRecordsPayload, parseCsvRecords } from "../csv-data.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const inputPath = path.join(rootDir, "data", "records.csv");
const outputPath = path.join(rootDir, "data", "public-records.json");

async function main() {
  const csvText = await fs.readFile(inputPath, "utf8");
  const records = parseCsvRecords(csvText);
  const payload = buildPublishedRecordsPayload(records);

  await fs.writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`Generated ${path.relative(rootDir, outputPath)} with ${payload.total_public_records} public records.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
