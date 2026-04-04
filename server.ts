import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { initDatabase, insertProducts, createOrder, verifyOrder, markOrderAsUsed } from "./src/lib/db";
import pool from "./src/lib/db";
import { products } from "./src/constants";
import adminRouter from "./admin-api";

dotenv.config();

async function startServer() {
  console.log('Initializing database...');
  await initDatabase();
  await insertProducts(products);
  console.log('Database ready!');

  const app = express();
  const PORT = 3001;
  const APP_URL = process.env.APP_URL || `http://localhost:${PORT}`;

  app.use(express.json());

  const corsOptions = {
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  };
  app.use(cors(corsOptions));

  // 后台管理 API 路由
  app.use('/admin-api', adminRouter);

  // 暂时禁用 rate limit 以便测试
  // const apiLimiter = rateLimit({
  //   windowMs: 15 * 60 * 1000,
  //   max: 10,
  //   message: { error: '请求过于频繁，请稍后再试' },
  //   standardHeaders: true,
  //   legacyHeaders: false,
  // });

  // app.use('/api/', apiLimiter);

  function generateDownloadLink(productId: string): string {
    const randomToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    return `https://dl.globalapp.store/v1/pkg/${productId.toLowerCase()}-${randomToken}`;
  }

  app.post("/api/send-email", async (req, res) => {
    const { toEmail, productName, productId, price } = req.body;

    if (!toEmail || !productName || !productId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const downloadLink = generateDownloadLink(productId);

    const orderResult = await createOrder(
      productId,
      productName,
      toEmail,
      price || 9.9,
      downloadLink
    );

    const verificationLink = `${APP_URL}/verify?token=${(orderResult as any).token}`;

    const transporter = nodemailer.createTransport({
      host: "smtp.qq.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.QQ_EMAIL || "3849016053@qq.com",
        pass: process.env.QQ_AUTH_CODE || "opciboigkosecdid",
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const mailOptions = {
      from: `"Global App Store" <${process.env.QQ_EMAIL || "3849016053@qq.com"}>`,
      to: toEmail,
      subject: `【交付】您的 ${productName} 软件及加速器下载链接`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px; margin: auto;">
          <h2 style="color: #2563eb;">感谢您的购买！</h2>
          <p>您购买的 <strong>${productName}</strong> 专属安装包（含软件 + 高速加速器）已准备就绪。</p>
          <p style="font-size: 13px; color: #666;">订单号：<strong>${(orderResult as any).orderNo}</strong></p>
          
          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <p style="margin: 0 0 10px 0; font-size: 14px; color: #1e40af; font-weight: bold;">点击下方按钮获取下载链接：</p>
            <a href="${verificationLink}" style="display: inline-block; padding: 14px 40px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">立即获取下载链接</a>
            <p style="margin: 10px 0 0 0; font-size: 12px; color: #6b7280;">或复制此链接到浏览器：</p>
            <p style="margin: 8px 0 0 0; font-family: monospace; word-break: break-all; font-size: 12px; color: #374151; background: #f3f4f6; padding: 8px; border-radius: 4px;">${verificationLink}</p>
          </div>
          
          <div style="background: #fffbeb; border: 1px solid #fcd34d; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #92400e; font-weight: bold;">⏰ 重要提示：</p>
            <ul style="margin: 10px 0 0 20px; padding: 0; font-size: 13px; color: #78350f;">
              <li style="margin-bottom: 5px;">此链接有效期为 <strong>24小时</strong>，过期后将无法使用</li>
              <li style="margin-bottom: 5px;">此链接为您专属，<strong>请勿转发或分享</strong>给他人</li>
              <li style="margin-bottom: 5px;">请妥善保管您的邮箱账号，防止被盗</li>
              <li>我们不会通过其他方式索要您的链接或个人信息</li>
            </ul>
          </div>
          
          <p style="font-size: 14px; color: #666;">如有疑问，请回复此邮件或联系客服。</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #999; text-align: center;">© 2026 Global App Store. 一站式获取顶尖 AI 与国际社交软件</p>
        </div>
      `,
    };

    try {
      console.log("Processing order...");

      const info = await transporter.sendMail(mailOptions);
      console.log("Email sent successfully");
      console.log("Order created successfully, orderNo:", (orderResult as any).orderNo);

      res.json({ success: true, orderId: (orderResult as any).insertId, orderNo: (orderResult as any).orderNo });
    } catch (error) {
      console.error("Operation failed:", error);
      res.status(500).json({ 
        error: "订单处理失败，请稍后重试" 
      });
    }
  });

  app.get("/api/verify", async (req, res) => {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ error: "缺少 token 参数" });
    }

    const result = await verifyOrder(token);

    if (!result.valid) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      success: true,
      order: {
        orderNo: result.order.order_no,
        productName: result.order.product_name,
        productId: result.order.product_id,
        downloadLink: result.order.download_link,
        userEmail: result.order.user_email,
        createdAt: result.order.created_at,
        expiresAt: result.order.expires_at
      }
    });
  });

  app.post("/api/verify/use", async (req, res) => {
    const { token } = req.body;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ error: "缺少 token 参数" });
    }

    const result = await verifyOrder(token);

    if (!result.valid) {
      return res.status(400).json({ error: result.error });
    }

    await markOrderAsUsed(token);

    res.json({
      success: true,
      downloadLink: result.order.download_link
    });
  });

  // 公共产品 API 端点
  app.get("/api/products", async (req, res) => {
    try {
      const [rows] = await pool.execute('SELECT * FROM products ORDER BY CAST(id AS UNSIGNED) ASC');
      // 转换数据格式以匹配前端需要的结构
      const products = (rows as any[]).map(product => ({
        id: product.id,
        name: product.name,
        category: product.category,
        description: {
          zh: product.description_zh,
          en: product.description_en
        },
        price: product.price,
        icon: product.icon,
        rating: product.rating,
        popular: product.popular === 1
      }));
      res.json({
        success: true,
        data: products
      });
    } catch (error) {
      console.error('获取产品列表错误:', error);
      res.status(500).json({ error: '服务器错误' });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
