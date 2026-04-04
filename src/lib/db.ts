import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'wangshuo666',
  database: process.env.MYSQL_DATABASE || 'shop_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

function getExpirationTime(hours: number = 24): Date {
  const expires = new Date();
  expires.setHours(expires.getHours() + hours);
  return expires;
}

export async function initDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'localhost',
      port: parseInt(process.env.MYSQL_PORT || '3306'),
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || 'wangshuo666'
    });

    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${process.env.MYSQL_DATABASE || 'shop_db'}\``);
    console.log('Database created or already exists');

    await connection.end();

    await createTables();
    await migrateOrdersTable();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

async function createTables() {
  const connection = await pool.getConnection();

  try {
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category ENUM('AI', 'Social', 'Entertainment', 'Productivity') NOT NULL,
        description_zh TEXT,
        description_en TEXT,
        price DECIMAL(10, 2) NOT NULL,
        icon VARCHAR(100),
        rating DECIMAL(3, 2),
        popular BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_no VARCHAR(50) UNIQUE NOT NULL,
        product_id VARCHAR(50) NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        user_email VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        download_link TEXT NOT NULL,
        token VARCHAR(64) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        status ENUM('pending', 'completed', 'cancelled', 'used') DEFAULT 'completed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(100) NOT NULL,
        role ENUM('admin', 'editor') DEFAULT 'editor',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('Tables created successfully');
  } finally {
    connection.release();
  }
}

async function migrateOrdersTable() {
  const connection = await pool.getConnection();
  try {
    const [columns] = await connection.execute(`
      SHOW COLUMNS FROM orders LIKE 'token'
    `);
    
    if ((columns as any[]).length === 0) {
      await connection.execute(`
        ALTER TABLE orders 
        ADD COLUMN order_no VARCHAR(50) UNIQUE AFTER id,
        ADD COLUMN token VARCHAR(64) UNIQUE AFTER download_link,
        ADD COLUMN expires_at TIMESTAMP AFTER token,
        MODIFY COLUMN status ENUM('pending', 'completed', 'cancelled', 'used') DEFAULT 'completed'
      `);
      console.log('Orders table migrated successfully');
    }
  } catch (error) {
    console.log('Migration check completed');
  } finally {
    connection.release();
  }
}

function generateOrderNo(): string {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD${timestamp}${random}`;
}

export async function createOrder(
  productId: string,
  productName: string,
  userEmail: string,
  price: number,
  downloadLink: string
) {
  const connection = await pool.getConnection();
  try {
    const orderNo = generateOrderNo();
    const token = generateToken();
    const expiresAt = getExpirationTime(24);

    const [result] = await connection.execute(
      `INSERT INTO orders (order_no, product_id, product_name, user_email, price, download_link, token, expires_at, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'completed')`,
      [orderNo, productId, productName, userEmail, price, downloadLink, token, expiresAt]
    );
    
    return { 
      ...result, 
      orderNo, 
      token, 
      expiresAt 
    };
  } finally {
    connection.release();
  }
}

export async function verifyOrder(token: string, userEmail?: string) {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      'SELECT * FROM orders WHERE token = ?',
      [token]
    );
    
    const orders = rows as any[];
    if (orders.length === 0) {
      return { valid: false, error: '订单不存在' };
    }

    const order = orders[0];
    
    if (userEmail && order.user_email !== userEmail) {
      return { valid: false, error: '订单不属于您' };
    }

    const now = new Date();
    const expiresAt = new Date(order.expires_at);
    if (now > expiresAt) {
      return { valid: false, error: '链接已过期' };
    }

    if (order.status === 'used') {
      return { valid: false, error: '链接已使用' };
    }

    return { valid: true, order };
  } finally {
    connection.release();
  }
}

export async function markOrderAsUsed(token: string) {
  const connection = await pool.getConnection();
  try {
    await connection.execute(
      'UPDATE orders SET status = ?, updated_at = NOW() WHERE token = ?',
      ['used', token]
    );
  } finally {
    connection.release();
  }
}

export async function getOrders() {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute('SELECT * FROM orders ORDER BY created_at DESC');
    return rows;
  } finally {
    connection.release();
  }
}

export async function getProduct(productId: string) {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute('SELECT * FROM products WHERE id = ?', [productId]);
    return (rows as any[])[0];
  } finally {
    connection.release();
  }
}

export async function insertProducts(products: any[]) {
  const connection = await pool.getConnection();
  try {
    for (const product of products) {
      await connection.execute(
        `INSERT IGNORE INTO products 
         (id, name, category, description_zh, description_en, price, icon, rating, popular)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          product.id,
          product.name,
          product.category,
          product.description.zh,
          product.description.en,
          product.price,
          product.icon,
          product.rating,
          product.popular ? 1 : 0
        ]
      );
    }
    console.log('Products inserted successfully');
  } finally {
    connection.release();
  }
}

export async function createAdminUser(username: string, password: string, name: string, role: string = 'editor') {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.execute(
      'INSERT INTO admin_users (username, password, name, role) VALUES (?, ?, ?, ?)',
      [username, password, name, role]
    );
    return result;
  } finally {
    connection.release();
  }
}

export async function getAdminUserByUsername(username: string) {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      'SELECT * FROM admin_users WHERE username = ?',
      [username]
    );
    return (rows as any[])[0];
  } finally {
    connection.release();
  }
}

export async function getAdminUsers() {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute('SELECT * FROM admin_users ORDER BY created_at DESC');
    return rows;
  } finally {
    connection.release();
  }
}

export default pool;
