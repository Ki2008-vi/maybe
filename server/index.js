import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Multer config — save files to server/uploads/
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

app.use(cors());
app.use(express.json());

// Serve uploaded images as static files
app.use('/uploads', express.static(uploadsDir));

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'snsb_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

pool.getConnection()
  .then(conn => { console.log('✅ Connected to MySQL database'); conn.release(); })
  .catch(err => console.error('❌ Error connecting to MySQL:', err));

// ─── IMAGE UPLOAD ─────────────────────────────────────────────────────────────
app.post('/api/upload', (req, res, next) => {
  upload.array('images', 10)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    } else if (err) {
      // An unknown error occurred when uploading.
      return res.status(400).json({ error: err.message });
    }

    if (!req.files || req.files.length === 0)
      return res.status(400).json({ error: 'No files uploaded' });

    const urls = req.files.map(f => {
      // Use the request host to construct the URL dynamically
      const protocol = req.protocol;
      const host = req.get('host');
      return `${protocol}://${host}/uploads/${f.filename}`;
    });
    res.json({ success: true, urls });
  });
});

// ─── USERS ────────────────────────────────────────────────────────────────────
app.post('/api/users/sync', async (req, res) => {
  const { uid, email, displayName, photoURL } = req.body;
  try {
    await pool.execute(
      'INSERT INTO users (id, email, display_name, photo_url) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE display_name = ?, photo_url = ?',
      [uid, email, displayName, photoURL, displayName, photoURL]
    );
    res.json({ success: true, message: 'User synced' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// ─── PRODUCTS ─────────────────────────────────────────────────────────────────
// GET all products
app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM products ORDER BY created_at DESC');
    // Parse images JSON string back to array
    const products = rows.map(p => ({
      ...p,
      images: (() => { try { return JSON.parse(p.images || '[]'); } catch { return []; } })(),
      paymentMethods: (() => { try { return JSON.parse(p.payment_methods || '[]'); } catch { return []; } })(),
      soldCount: p.sold_count,
      rating: p.rating,
    }));
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// ─── SETTINGS ─────────────────────────────────────────────────────────────────
app.get('/api/settings', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM settings WHERE id = 1');
    if (rows.length > 0) {
      res.json({
        storeTitle: rows[0].store_title,
        storeImage: rows[0].store_image
      });
    } else {
      res.json({ storeTitle: 'SNSB World', storeImage: '' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/settings', async (req, res) => {
  const { storeTitle, storeImage } = req.body;
  try {
    await pool.execute(
      'INSERT INTO settings (id, store_title, store_image) VALUES (1, ?, ?) ON DUPLICATE KEY UPDATE store_title = ?, store_image = ?',
      [storeTitle, storeImage, storeTitle, storeImage]
    );
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST add product
app.post('/api/products', async (req, res) => {
  const { id, name, category, price, status, description, images, paymentMethods, soldCount, rating } = req.body;
  try {
    await pool.execute(
      'INSERT INTO products (id, name, category, price, status, description, images, payment_methods, sold_count, rating) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name, category, price, status || 'In Stock', description || '', JSON.stringify(images || []), JSON.stringify(paymentMethods || []), soldCount || 0, rating || 0]
    );
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// PUT update product
app.put('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const { name, category, price, status, description, images, paymentMethods, soldCount, rating } = req.body;
  try {
    await pool.execute(
      'UPDATE products SET name = ?, category = ?, price = ?, status = ?, description = ?, images = ?, payment_methods = ?, sold_count = ?, rating = ? WHERE id = ?',
      [name, category, price, status, description || '', JSON.stringify(images || []), JSON.stringify(paymentMethods || []), soldCount || 0, rating || 0, id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// DELETE single product
app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.execute('DELETE FROM products WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// DELETE bulk products
app.post('/api/products/bulk-delete', async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0)
    return res.status(400).json({ error: 'No IDs provided' });
  try {
    const placeholders = ids.map(() => '?').join(',');
    await pool.execute(`DELETE FROM products WHERE id IN (${placeholders})`, ids);
    res.json({ success: true, deleted: ids.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// ─── ORDERS ───────────────────────────────────────────────────────────────────
app.get('/api/orders', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT *, 
             total_price as total, 
             tax_amount as taxAmount,
             shipping_fee as shippingFee,
             subtotal as subTotal,
             payment_method as paymentMethod,
             recipient_name as recipientName,
             street_address as streetAddress,
             postal_code as postalCode,
             created_at as createdAt 
      FROM orders 
      ORDER BY created_at DESC
    `);
    const ordersWithItems = await Promise.all(rows.map(async (order) => {
      // Join with products to get the name
      const [items] = await pool.execute(`
        SELECT oi.*, p.name 
        FROM order_items oi 
        JOIN products p ON oi.product_id = p.id 
        WHERE oi.order_id = ?
      `, [order.id]);
      return { ...order, items };
    }));
    res.json(ordersWithItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/orders', async (req, res) => {
  const { id, userId, customerEmail, financials, shippingDetails, paymentMethod, items } = req.body;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.execute(
      `INSERT INTO orders (
        id, user_id, customer_email, 
        total_price, tax_amount, shipping_fee, subtotal, 
        payment_method, recipient_name, phone, street_address, city, postal_code
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, userId, customerEmail,
        financials.grandTotal, financials.tax, financials.shippingFee, financials.subTotal,
        paymentMethod, 
        shippingDetails.recipientName, shippingDetails.phone, shippingDetails.streetAddress, shippingDetails.city, shippingDetails.postalCode
      ]
    );
    for (const item of items) {
      await connection.execute(
        'INSERT INTO order_items (order_id, product_id, quantity, price, size) VALUES (?, ?, ?, ?, ?)',
        [id, item.id, item.quantity, item.price, item.size]
      );
    }
    await connection.commit();
    res.json({ success: true, orderId: id });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  } finally {
    connection.release();
  }
});

app.listen(port, () => console.log(`🚀 Server running on port ${port}`));