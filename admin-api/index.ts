import express from 'express';
import authRouter from './auth';
import productsRouter from './products';
import ordersRouter from './orders';

const router = express.Router();

// 认证路由
router.use('/auth', authRouter);

// 产品管理路由
router.use('/products', productsRouter);

// 订单管理路由
router.use('/orders', ordersRouter);

export default router;