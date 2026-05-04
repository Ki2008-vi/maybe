import mysql from 'mysql2/promise';
import 'dotenv/config';

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'snsb_db'
  });

  try {
    console.log('Adding images column to products table...');
    await connection.execute('ALTER TABLE products ADD COLUMN images TEXT AFTER description');
    console.log('Successfully added images column.');
  } catch (error) {
    if (error.code === 'ER_DUP_COLUMN_NAME') {
      console.log('Column "images" already exists.');
    } else {
      console.error('Error migrating database:', error);
    }
  } finally {
    await connection.end();
  }
}

migrate();
