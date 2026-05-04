import mysql from 'mysql2/promise';
import 'dotenv/config';

const run = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'snsb_db',
  });

  console.log('Migrating orders table for detailed shipping and financials...');

  try {
    // Add shipping columns
    await connection.execute('ALTER TABLE orders ADD COLUMN recipient_name VARCHAR(255) AFTER customer_email');
    await connection.execute('ALTER TABLE orders ADD COLUMN phone VARCHAR(20) AFTER recipient_name');
    await connection.execute('ALTER TABLE orders ADD COLUMN street_address TEXT AFTER phone');
    await connection.execute('ALTER TABLE orders ADD COLUMN city VARCHAR(100) AFTER street_address');
    await connection.execute('ALTER TABLE orders ADD COLUMN postal_code VARCHAR(20) AFTER city');
    
    // Add financial columns
    await connection.execute('ALTER TABLE orders ADD COLUMN tax_amount DECIMAL(15, 2) DEFAULT 0 AFTER total_price');
    await connection.execute('ALTER TABLE orders ADD COLUMN shipping_fee DECIMAL(15, 2) DEFAULT 0 AFTER tax_amount');
    await connection.execute('ALTER TABLE orders ADD COLUMN subtotal DECIMAL(15, 2) DEFAULT 0 AFTER shipping_fee');
    
    console.log('Updated orders table schema');
  } catch (e) { 
    console.log('Some columns might already exist or error:', e.message); 
  }

  console.log('Migration finished');
  await connection.end();
};

run().catch(console.error);
