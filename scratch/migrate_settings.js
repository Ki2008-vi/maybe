import mysql from 'mysql2/promise';
import 'dotenv/config';

const run = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'snsb_db',
  });

  console.log('Migrating database...');

  // Add images and payment_methods to products if missing
  try {
    await connection.execute('ALTER TABLE products ADD COLUMN images TEXT AFTER description');
    console.log('Added images column to products');
  } catch (e) { console.log('images column already exists or error'); }

  try {
    await connection.execute('ALTER TABLE products ADD COLUMN payment_methods TEXT AFTER images');
    console.log('Added payment_methods column to products');
  } catch (e) { console.log('payment_methods column already exists or error'); }

  // Create settings table
  try {
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS settings (
        id INT PRIMARY KEY DEFAULT 1,
        store_title VARCHAR(255) DEFAULT 'SNSB World',
        store_image TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    // Insert initial settings if empty
    const [rows] = await connection.execute('SELECT * FROM settings WHERE id = 1');
    if (rows.length === 0) {
      await connection.execute('INSERT INTO settings (id, store_title) VALUES (1, "SNSB World")');
    }
    console.log('Settings table ready');
  } catch (e) { console.log('Error creating settings table:', e); }

  console.log('Migration finished');
  await connection.end();
};

run().catch(console.error);
