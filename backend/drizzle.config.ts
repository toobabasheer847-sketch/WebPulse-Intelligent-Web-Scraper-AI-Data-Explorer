import { defineConfig } from "drizzle-kit";
import "dotenv/config";

export default defineConfig({
  out: "./src/db/migrations",
  dialect: "postgresql",
  migrations: {
    table: "schema_migrations",
    schema: "public",
  },
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});