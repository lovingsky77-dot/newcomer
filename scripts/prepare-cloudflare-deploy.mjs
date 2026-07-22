import { readFile, writeFile } from "node:fs/promises";

const configPath = new URL("../dist/server/wrangler.json", import.meta.url);
const databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID?.trim();
const databaseName = process.env.CLOUDFLARE_D1_DATABASE_NAME?.trim() || "daedong-great-journey-db";

if (!databaseId) {
  throw new Error("CLOUDFLARE_D1_DATABASE_ID is required for production deployment.");
}

const config = JSON.parse(await readFile(configPath, "utf8"));
config.name = "daedong-great-journey";
config.topLevelName = "daedong-great-journey";
config.d1_databases = [
  {
    binding: "DB",
    database_name: databaseName,
    database_id: databaseId,
    migrations_dir: "../../drizzle",
  },
];

await writeFile(configPath, `${JSON.stringify(config)}\n`, "utf8");

