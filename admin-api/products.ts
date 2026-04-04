import express from 'express';
import { authMiddleware } from './auth';
import pool from '../src/lib/db';

const router = express.Router();

// 获取产品列表
router.get('/', authMiddleware, async (req: express.Request, res: express.Response) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM products ORDER BY CAST(id AS UNSIGNED) ASC');
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('获取产品列表错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取产品详情
router.get('/:id', authMiddleware, async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.execute('SELECT * FROM products WHERE id = ?', [id]);
    if ((rows as any[]).length === 0) {
      return res.status(404).json({ error: '产品不存在' });
    }
    res.json({
      success: true,
      data: (rows as any[])[0]
    });
  } catch (error) {
    console.error('获取产品详情错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 添加产品
router.post('/', authMiddleware, async (req: express.Request, res: express.Response) => {
  const { id, name, category, description_zh, description_en, price, icon, rating, popular } = req.body;
  
  if (!id || !name || !category || !price) {
    return res.status(400).json({ error: '请提供必要的产品信息' });
  }
  
  try {
    await pool.execute(
      `INSERT INTO products 
       (id, name, category, description_zh, description_en, price, icon, rating, popular)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, name, category, description_zh, description_en, price, icon, rating, popular ? 1 : 0]
    );
    res.json({ success: true, message: '产品添加成功' });
  } catch (error) {
    console.error('添加产品错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 更新产品
router.put('/:id', authMiddleware, async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  const { name, category, description_zh, description_en, price, icon, rating, popular } = req.body;
  
  try {
    await pool.execute(
      `UPDATE products SET 
       name = ?, category = ?, description_zh = ?, description_en = ?, 
       price = ?, icon = ?, rating = ?, popular = ?
       WHERE id = ?`,
      [name, category, description_zh, description_en, price, icon, rating, popular ? 1 : 0, id]
    );
    res.json({ success: true, message: '产品更新成功' });
  } catch (error) {
    console.error('更新产品错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 删除产品
router.delete('/:id', authMiddleware, async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  try {
    await pool.execute('DELETE FROM products WHERE id = ?', [id]);
    res.json({ success: true, message: '产品删除成功' });
  } catch (error) {
    console.error('删除产品错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

export default router;