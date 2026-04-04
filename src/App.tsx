import React, { useState, useMemo, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { 
  Search, 
  Globe, 
  ShoppingCart, 
  Star, 
  ArrowRight, 
  Menu, 
  X,
  MessageSquare,
  Sparkles,
  Brain,
  Zap,
  Palette,
  Video,
  Instagram as InstagramIcon,
  MessageCircle,
  Send,
  Twitter,
  Hash,
  Tv,
  Music,
  Youtube,
  FileText,
  Github,
  Layers,
  PenTool,
  Facebook as FacebookIcon,
  Pen,
  Languages,
  Layout,
  Grid,
  Feather
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { translations, Language, Product } from './constants';
import { cn } from './lib/utils';
import VerifyPage from './pages/VerifyPage';
import AdminApp from './admin/App';

const iconMap: Record<string, React.ElementType> = {
  MessageSquare,
  Sparkles,
  Brain,
  Zap,
  Palette,
  Search,
  Video,
  Instagram: InstagramIcon,
  MessageCircle,
  Send,
  Twitter,
  Hash,
  Tv,
  Music,
  Youtube,
  FileText,
  Github,
  Layers,
  PenTool,
  Facebook: FacebookIcon,
  Pen,
  Languages,
  Layout,
  Grid,
  Feather
};

interface CartItem {
  product: Product;
  quantity: number;
}

function ShopPage() {
  const [lang, setLang] = useState<Language>('zh');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [purchaseStep, setPurchaseStep] = useState<'detail' | 'checkout' | 'email_input' | 'sending' | 'success'>('detail');
  const [userEmail, setUserEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const t = translations[lang];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      console.log('开始获取产品数据...');
      const response = await fetch('/api/products');
      console.log('响应状态:', response.status);
      console.log('响应状态文本:', response.statusText);
      
      const data = await response.json();
      console.log('响应数据:', data);
      
      if (data.success) {
        console.log('获取产品数据成功，数量:', data.data.length);
        setProducts(data.data);
      } else {
        console.error('获取产品数据失败:', data.error);
      }
    } catch (error) {
      console.error('获取产品数据失败:', error);
    } finally {
      setLoading(false);
      console.log('产品数据获取完成');
    }
  };

  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.product.id === product.id);
      if (existingItem) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, { product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prev => 
      prev.map(item => 
        item.product.id === productId 
          ? { ...item, quantity }
          : item
      )
    );
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setPurchaseStep('detail');
  };

  const handlePurchase = () => {
    setPurchaseStep('checkout');
    setTimeout(() => {
      setPurchaseStep('email_input');
    }, 1500);
  };

  const handleSendEmail = async () => {
    if (!userEmail || !selectedProduct) return;
    
    setPurchaseStep('sending');
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toEmail: userEmail,
          productId: selectedProduct.id,
          productName: selectedProduct.name,
          price: selectedProduct.price
        })
      });
      
      if (response.ok) {
        setPurchaseStep('success');
        setCartCount(c => c + 1);
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.details || (lang === 'zh' ? '发送失败，请检查邮箱地址或稍后重试。' : 'Failed to send. Please check email or try again.');
        alert(errorMessage);
        setPurchaseStep('email_input');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert(lang === 'zh' ? '网络错误，请稍后重试。' : 'Network error, please try again.');
      setPurchaseStep('email_input');
    }
  };

  const closeProductModal = () => {
    setSelectedProduct(null);
    setPurchaseStep('detail');
    setUserEmail('');
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description[lang].toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, activeCategory, lang]);

  const toggleLang = () => setLang(prev => prev === 'zh' ? 'en' : 'zh');

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans selection:bg-blue-100">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">G</div>
              <span className="text-xl font-bold tracking-tight text-blue-600 hidden sm:block">
                {t.title}
              </span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder={t.searchPlaceholder}
                  className="pl-10 pr-4 py-2 bg-gray-100 border-none rounded-full text-sm focus:ring-2 focus:ring-blue-500 w-64 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button 
                onClick={toggleLang}
                className="flex items-center gap-2 text-sm font-medium hover:text-blue-600 transition-colors"
              >
                <Globe className="w-4 h-4" />
                {lang === 'zh' ? 'English' : '中文'}
              </button>
              <div 
                className="relative cursor-pointer group"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingCart className="w-5 h-5 group-hover:text-blue-600 transition-colors" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cartItems.reduce((total, item) => total + item.quantity, 0)}
                  </span>
                )}
              </div>
            </div>

            <div className="md:hidden flex items-center gap-4">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
            >
              <div className="px-4 py-6 space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder={t.searchPlaceholder}
                    className="w-full pl-10 pr-4 py-3 bg-gray-100 border-none rounded-xl text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button 
                  onClick={() => { toggleLang(); setIsMenuOpen(false); }}
                  className="flex items-center gap-3 w-full py-2 text-lg font-medium"
                >
                  <Globe className="w-5 h-5" />
                  {lang === 'zh' ? 'English' : '中文'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <header className="relative py-12 sm:py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              {t.heroTitle}
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-10">
              {t.heroDesc}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="px-8 py-4 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2">
                {t.buyNow} <ArrowRight className="w-4 h-4" />
              </button>
              <button className="px-8 py-4 bg-white text-blue-600 border border-blue-100 rounded-full font-semibold hover:bg-blue-50 transition-all">
                {t.about}
              </button>
            </div>
          </motion.div>
        </div>
        
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-blue-400 rounded-full blur-[100px]" />
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-indigo-400 rounded-full blur-[100px]" />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex overflow-x-auto pb-4 mb-8 no-scrollbar gap-2 sm:gap-4">
          {Object.entries(t.categories).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border",
                activeCategory === key 
                  ? "bg-blue-600 text-white border-blue-600 shadow-md" 
                  : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            // 加载状态
            Array.from({ length: 12 }).map((_, idx) => (
              <div key={idx} className="bg-white rounded-3xl p-6 border border-gray-100 animate-pulse">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gray-200"></div>
                  <div className="w-16 h-6 rounded-full bg-gray-200"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-12 bg-gray-200 rounded mb-4"></div>
                <div className="flex items-center justify-between">
                  <div className="h-8 bg-gray-200 rounded w-24"></div>
                  <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                </div>
              </div>
            ))
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product, idx) => {
                const Icon = iconMap[product.icon] || Sparkles;
                return (
                  <motion.div
                    layout
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2, delay: idx * 0.05 }}
                    onClick={() => handleProductClick(product)}
                    className="group bg-white rounded-3xl p-6 border border-gray-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all flex flex-col cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                        product.category === 'AI' ? "bg-purple-50 text-purple-600" :
                        product.category === 'Social' ? "bg-blue-50 text-blue-600" :
                        product.category === 'Entertainment' ? "bg-red-50 text-red-600" :
                        "bg-green-50 text-green-600"
                      )}>
                        <Icon className="w-6 h-6" />
                      </div>
                      {product.popular && (
                        <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                          {t.popular}
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>
                    
                    <div className="flex items-center gap-1 mb-3">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-semibold text-gray-600">{product.rating}</span>
                      <span className="text-xs text-gray-400 ml-1">({Math.floor(Math.random() * 1000 + 100)})</span>
                    </div>

                    <p className="text-sm text-gray-500 mb-6 flex-grow line-clamp-2">
                      {product.description[lang]}
                    </p>

                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-400 uppercase font-bold tracking-tighter">Price</span>
                        <span className="text-lg font-bold text-gray-900">
                          {product.price === 0 ? t.free : `¥${product.price}`}
                        </span>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                        className="w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors shadow-lg"
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        {!loading && filteredProducts.length === 0 && (
          <div className="py-20 text-center">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No results found for your search.</p>
          </div>
        )}
      </main>

      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeProductModal}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-2xl rounded-[2rem] overflow-hidden shadow-2xl"
            >
              <button 
                onClick={closeProductModal}
                className="absolute top-6 right-6 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col md:flex-row h-full">
                <div className="p-8 md:w-1/2 bg-gray-50 flex flex-col items-center justify-center text-center">
                  <div className={cn(
                    "w-24 h-24 rounded-3xl flex items-center justify-center mb-6 shadow-xl",
                    selectedProduct.category === 'AI' ? "bg-purple-600 text-white" :
                    selectedProduct.category === 'Social' ? "bg-blue-600 text-white" :
                    selectedProduct.category === 'Entertainment' ? "bg-red-600 text-white" :
                    "bg-green-600 text-white"
                  )}>
                    {React.createElement(iconMap[selectedProduct.icon] || Sparkles, { className: "w-12 h-12" })}
                  </div>
                  <h2 className="text-3xl font-bold mb-2">{selectedProduct.name}</h2>
                  <div className="flex items-center gap-1 mb-4">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-bold">{selectedProduct.rating}</span>
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {selectedProduct.description[lang]}
                  </p>
                </div>

                <div className="p-8 md:w-1/2 flex flex-col justify-center">
                  {purchaseStep === 'detail' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <h3 className="text-xl font-bold mb-6">{lang === 'zh' ? '选择套餐' : 'Choose Plan'}</h3>
                      <div className="space-y-3 mb-8">
                        {[
                          { name: lang === 'zh' ? '永久使用权' : 'Lifetime Access', price: selectedProduct.price }
                        ].map((plan, i) => (
                          <div key={i} className="p-4 border-2 border-blue-600 rounded-2xl cursor-pointer transition-all flex justify-between items-center group">
                            <span className="font-medium text-blue-600">{plan.name}</span>
                            <span className="font-bold">¥{plan.price}</span>
                          </div>
                        ))}
                      </div>
                      <button 
                        onClick={handlePurchase}
                        className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                      >
                        {t.buyNow}
                      </button>
                    </motion.div>
                  )}

                  {purchaseStep === 'checkout' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
                      <h3 className="text-xl font-bold mb-2">{lang === 'zh' ? '正在处理支付...' : 'Processing Payment...'}</h3>
                      <p className="text-gray-500 text-sm">{lang === 'zh' ? '请稍候，正在为您连接安全网关' : 'Please wait while we connect to secure gateway'}</p>
                    </motion.div>
                  )}

                  {purchaseStep === 'email_input' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <h3 className="text-xl font-bold mb-2">{lang === 'zh' ? '支付成功！' : 'Payment Success!'}</h3>
                      <p className="text-gray-500 text-sm mb-6">{lang === 'zh' ? '请输入您的 QQ 邮箱以接收下载链接' : 'Enter your QQ email to receive download link'}</p>
                      <div className="space-y-4 mb-8">
                        <input 
                          type="email" 
                          placeholder="example@qq.com"
                          className="w-full px-4 py-3 bg-gray-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                          value={userEmail}
                          onChange={(e) => setUserEmail(e.target.value)}
                        />
                      </div>
                      <button 
                        onClick={handleSendEmail}
                        disabled={!userEmail.includes('@')}
                        className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50"
                      >
                        {lang === 'zh' ? '发送至邮箱' : 'Send to Email'}
                      </button>
                    </motion.div>
                  )}

                  {purchaseStep === 'sending' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
                      <h3 className="text-xl font-bold mb-2">{lang === 'zh' ? '正在发送邮件...' : 'Sending Email...'}</h3>
                      <p className="text-gray-500 text-sm">{lang === 'zh' ? '请稍候，正在通过安全通道发送' : 'Please wait, sending via secure channel'}</p>
                    </motion.div>
                  )}

                  {purchaseStep === 'success' && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                      <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Star className="w-8 h-8 fill-current" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">{lang === 'zh' ? '发送成功！' : 'Sent Successfully!'}</h3>
                      <p className="text-gray-500 text-sm mb-8">
                        {lang === 'zh' 
                          ? `验证链接已发送至 ${userEmail}，请检查您的收件箱（包括垃圾箱）。` 
                          : `Verification link sent to ${userEmail}, please check your inbox.`}
                      </p>
                      <button 
                        onClick={closeProductModal}
                        className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all"
                      >
                        {lang === 'zh' ? '返回商店' : 'Back to Store'}
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">G</div>
                <span className="text-xl font-bold tracking-tight text-blue-600">{t.title}</span>
              </div>
              <p className="text-gray-500 max-w-sm">
                {t.subtitle}. {t.heroDesc}
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-6">{t.categories.All}</h4>
              <ul className="space-y-4 text-sm text-gray-500">
                <li>{t.categories.AI}</li>
                <li>{t.categories.Social}</li>
                <li>{t.categories.Entertainment}</li>
                <li>{t.categories.Productivity}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6">{t.contact}</h4>
              <ul className="space-y-4 text-sm text-gray-500">
                <li>Email: support@globalapp.store</li>
                <li>Telegram: @globalapp_official</li>
                <li>WhatsApp: +1 234 567 890</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <p>{t.footer}</p>
            <div className="flex gap-8">
              <a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

      {/* 购物车模态框 */}
      <AnimatePresence>
        {isCartOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center"
            onClick={() => setIsCartOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 20 }}
              className="bg-white rounded-t-3xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">{lang === 'zh' ? '购物车' : 'Cart'}</h2>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="text-gray-500 hover:text-gray-900"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {cartItems.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">{lang === 'zh' ? '购物车为空' : 'Your cart is empty'}</p>
                    <button 
                      onClick={() => setIsCartOpen(false)}
                      className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                    >
                      {lang === 'zh' ? '继续购物' : 'Continue Shopping'}
                    </button>
                  </div>
                ) : (
                  <div>
                    {cartItems.map((item) => {
                      const Icon = iconMap[item.product.icon] || Sparkles;
                      return (
                        <div key={item.product.id} className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center",
                            item.product.category === 'AI' ? "bg-purple-50 text-purple-600" :
                            item.product.category === 'Social' ? "bg-blue-50 text-blue-600" :
                            item.product.category === 'Entertainment' ? "bg-red-50 text-red-600" :
                            "bg-green-50 text-green-600"
                          )}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <div className="flex-grow">
                            <h3 className="font-bold mb-1">{item.product.name}</h3>
                            <p className="text-sm text-gray-500 mb-2">{item.product.category}</p>
                            <div className="flex items-center justify-between">
                              <span className="font-bold">
                                {item.product.price === 0 ? (lang === 'zh' ? '免费' : 'Free') : `¥${item.product.price}`}
                              </span>
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                  className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-100"
                                >
                                  -
                                </button>
                                <span className="w-8 text-center">{item.quantity}</span>
                                <button 
                                  onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                  className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-100"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                          <button 
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      );
                    })}

                    <div className="mt-8 mb-6">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-600">{lang === 'zh' ? '小计' : 'Subtotal'}</span>
                        <span className="font-bold text-xl">
                          ¥{getTotalPrice().toFixed(2)}
                        </span>
                      </div>
                      <button 
                        onClick={() => {
                          setIsCartOpen(false);
                          if (cartItems.length > 0) {
                            // 这里可以实现结算逻辑
                            alert(lang === 'zh' ? '结算功能开发中...' : 'Checkout functionality coming soon...');
                          }
                        }}
                        className="w-full py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors font-bold"
                      >
                        {lang === 'zh' ? '去结算' : 'Checkout'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ShopPage />} />
      <Route path="/verify" element={<VerifyPage />} />
      <Route path="/admin/*" element={<AdminApp />} />
    </Routes>
  );
}
