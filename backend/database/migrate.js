import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";
import { config } from "../config/env.js";

const here = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const schema = await fs.readFile(path.join(here, "schema.sql"), "utf8");

  const bootstrap = await mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    multipleStatements: true,
  });

  await bootstrap.query(
    `CREATE DATABASE IF NOT EXISTS \`${config.db.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await bootstrap.changeUser({ database: config.db.database });
  await bootstrap.query(schema);
  await bootstrap.end();

  console.log(`Schema applied to database "${config.db.database}".`);
}

main().catch((error) => {
  console.error("Migration failed:", error.message);
  process.exit(1);
});
