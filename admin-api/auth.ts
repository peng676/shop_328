import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getAdminUserByUsername, createAdminUser } from '../src/lib/db';

const router = express.Router();

// 生成 JWT 令牌
function generateToken(user: any) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );
}

// 验证 JWT 中间件
export function authMiddleware(req: any, res: express.Response, next: express.NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: '未授权' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: '无效的令牌' });
  }
}

// 登录路由
router.post('/login', async (req: express.Request, res: express.Response) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: '请提供用户名和密码' });
  }
  
  try {
    const user = await getAdminUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }
    
    const token = generateToken(user);
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 初始化默认管理员（仅在首次运行时使用）
router.post('/init-admin', async (req: express.Request, res: express.Response) => {
  try {
    const existingAdmin = await getAdminUserByUsername('admin');
    if (existingAdmin) {
      return res.status(400).json({ error: '管理员已存在' });
    }
    
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await createAdminUser('admin', hashedPassword, '超级管理员', 'admin');
    
    res.json({ success: true, message: '默认管理员创建成功' });
  } catch (error) {
    console.error('创建管理员错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

export default router;