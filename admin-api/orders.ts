import express from 'express';
import { authMiddleware } from './auth';
import pool from '../src/lib/db';

const router = express.Router();

// 获取订单列表
router.get('/', authMiddleware, async (req: express.Request, res: express.Response) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM orders ORDER BY created_at DESC');
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('获取订单列表错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取订单详情
router.get('/:id', authMiddleware, async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.execute('SELECT * FROM orders WHERE id = ?', [id]);
    if ((rows as any[]).length === 0) {
      return res.status(404).json({ error: '订单不存在' });
    }
    res.json({
      success: true,
      data: (rows as any[])[0]
    });
  } catch (error) {
    console.error('获取订单详情错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 更新订单状态
router.put('/:id/status', authMiddleware, async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!status) {
    return res.status(400).json({ error: '请提供订单状态' });
  }
  
  try {
    await pool.execute(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, id]
    );
    res.json({ success: true, message: '订单状态更新成功' });
  } catch (error) {
    console.error('更新订单状态错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 删除订单
router.delete('/:id', authMiddleware, async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  try {
    await pool.execute('DELETE FROM orders WHERE id = ?', [id]);
    res.json({ success: true, message: '订单删除成功' });
  } catch (error) {
    console.error('删除订单错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取订单统计
router.get('/stats/summary', authMiddleware, async (req: express.Request, res: express.Response) => {
  try {
    // 总订单数
    const [totalOrders] = await pool.execute('SELECT COUNT(*) as count FROM orders');
    
    // 总销售额
    const [totalSales] = await pool.execute('SELECT SUM(price) as amount FROM orders');
    
    // 今日订单数
    const [todayOrders] = await pool.execute('SELECT COUNT(*) as count FROM orders WHERE DATE(created_at) = DATE(NOW())');
    
    // 今日销售额
    const [todaySales] = await pool.execute('SELECT SUM(price) as amount FROM orders WHERE DATE(created_at) = DATE(NOW())');
    
    res.json({
      success: true,
      data: {
        totalOrders: (totalOrders as any[])[0].count,
        totalSales: (totalSales as any[])[0].amount || 0,
        todayOrders: (todayOrders as any[])[0].count,
        todaySales: (todaySales as any[])[0].amount || 0
      }
    });
  } catch (error) {
    console.error('获取订单统计错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

export default router;