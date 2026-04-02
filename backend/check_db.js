const { Client } = require('pg');
require('dotenv').config();

async function checkConnection() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
      rejectUnauthorized: false
    }
  });

  console.log('🔍 Checking database connection to:', process.env.DB_HOST);

  try {
    await client.connect();
    console.log('✅ Success! Connected to the database.');
    const res = await client.query('SELECT NOW()');
    console.log('🕔 Database time:', res.rows[0].now);
    await client.end();
  } catch (err) {
    console.error('❌ Database connection failed:');
    console.error(err.message);
  }
}

checkConnection();
