// Applique database/schema.sql sur la base pointée par DATABASE_URL.
// Usage : npm run db:migrate
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await pool.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;'); // pour gen_random_uuid()
  await pool.query(sql);
  console.log('Migration terminée ✔');
  await pool.end();
}

main().catch((err) => {
  console.error('Échec de la migration :', err);
  process.exit(1);
});
