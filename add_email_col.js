const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    await client.query('ALTER TABLE public.s_realestate_users ADD COLUMN IF NOT EXISTS email VARCHAR(255);');
    console.log('Successfully added email column');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

run();
