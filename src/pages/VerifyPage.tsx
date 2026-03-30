import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, Download, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

export default function VerifyPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      verifyOrder();
    } else {
      setStatus('error');
      setError('缺少验证参数');
    }
  }, [token]);

  const verifyOrder = async () => {
    try {
      const response = await fetch(`/api/verify?token=${token}`);
      const data = await response.json();
      
      if (data.success) {
        setOrder(data.order);
        setStatus('success');
      } else {
        setStatus('error');
        setError(data.error || '验证失败');
      }
    } catch (err) {
      setStatus('error');
      setError('网络错误，请稍后重试');
    }
  };

  const handleDownload = async () => {
    if (!token) return;
    
    setIsDownloading(true);
    try {
      const response = await fetch('/api/verify/use', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      
      const data = await response.json();
      
      if (data.success && data.downloadLink) {
        window.open(data.downloadLink, '_blank');
      }
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-xl"
      >
        {status === 'loading' && (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">正在验证...</h2>
            <p className="text-gray-500">请稍候，正在验证您的订单</p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">验证失败</h2>
            <p className="text-red-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-black transition-colors inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              返回首页
            </button>
          </div>
        )}

        {status === 'success' && order && (
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-2">验证成功！</h2>
            <p className="text-gray-500 mb-6">您的订单已验证，可以下载了</p>

            <div className="bg-gray-50 rounded-2xl p-6 mb-6 text-left">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">订单号</span>
                  <span className="font-semibold text-gray-800">{order.orderNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">商品</span>
                  <span className="font-semibold text-gray-800">{order.productName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">邮箱</span>
                  <span className="font-semibold text-gray-800">{order.userEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">下单时间</span>
                  <span className="text-gray-600 text-sm">{formatDate(order.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">有效期至</span>
                  <span className="text-orange-600 font-semibold text-sm">{formatDate(order.expiresAt)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isDownloading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  处理中...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  立即下载
                </>
              )}
            </button>

            <button
              onClick={() => navigate('/')}
              className="w-full mt-4 py-3 text-gray-600 hover:text-gray-800 transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              返回商店
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
