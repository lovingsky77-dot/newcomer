import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./infrastructure/database/drizzle",
  schema: "./src/db/schema.ts",
  dialect: "sqlite",
});
