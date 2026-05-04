import mysql from 'mysql2/promise';
import 'dotenv/config';

const run = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'snsb_db',
  });

  console.log('Adding payment_method to orders table...');

  try {
    await connection.execute('ALTER TABLE orders ADD COLUMN payment_method VARCHAR(50) AFTER total_price');
    console.log('Added payment_method column to orders');
  } catch (e) { console.log('payment_method column already exists or error'); }

  console.log('Migration finished');
  await connection.end();
};

run().catch(console.error);
