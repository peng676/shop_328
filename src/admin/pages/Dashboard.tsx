import React, { useState, useEffect } from 'react';
import { Layout, Menu, Typography, Card, Row, Col, Statistic, Button, message } from 'antd';
import { 
  DashboardOutlined, 
  ShoppingOutlined, 
  OrderedListOutlined, 
  UserOutlined, 
  LogoutOutlined 
} from '@ant-design/icons';
import Products from './Products';
import Orders from './Orders';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const Dashboard: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSales: 0,
    todayOrders: 0,
    todaySales: 0
  });
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    const adminUser = localStorage.getItem('adminUser');
    if (adminUser) {
      setUser(JSON.parse(adminUser));
    }
    
    fetchStats();
  }, []);
  
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/admin-api/orders/stats/summary', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('获取统计数据失败:', error);
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    window.location.href = '/admin/login';
  };
  
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div style={{ 
          height: '64px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          fontSize: '18px', 
          fontWeight: 'bold', 
          color: '#fff',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          后台管理
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['dashboard']}
          onSelect={({ key }) => setActiveMenu(key)}
          items={[
            {
              key: 'dashboard',
              icon: <DashboardOutlined />,
              label: '仪表盘'
            },
            {
              key: 'products',
              icon: <ShoppingOutlined />,
              label: '产品管理'
            },
            {
              key: 'orders',
              icon: <OrderedListOutlined />,
              label: '订单管理'
            },
            {
              key: 'users',
              icon: <UserOutlined />,
              label: '用户管理'
            }
          ]}
        />
      </Sider>
      
      <Layout className="site-layout">
        <Header className="site-layout-background" style={{ padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Title level={5} style={{ margin: 0, color: '#fff' }}>
            {activeMenu === 'dashboard' && '仪表盘'}
            {activeMenu === 'products' && '产品管理'}
            {activeMenu === 'orders' && '订单管理'}
            {activeMenu === 'users' && '用户管理'}
          </Title>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ color: '#fff' }}>欢迎, {user?.name || '管理员'}</span>
            <Button 
              type="text" 
              icon={<LogoutOutlined />} 
              onClick={handleLogout}
              style={{ color: '#fff' }}
            >
              退出登录
            </Button>
          </div>
        </Header>
        
        <Content style={{ margin: '24px', padding: 24, background: '#fff', borderRadius: 8, minHeight: 280 }}>
          {activeMenu === 'dashboard' && (
            <div>
              <Title level={4}>销售概览</Title>
              <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={6}>
                  <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '16px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                    <Statistic 
                      title="总订单数" 
                      value={stats.totalOrders} 
                      prefix={<OrderedListOutlined />}
                    />
                  </div>
                </Col>
                <Col span={6}>
                  <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '16px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                    <Statistic 
                      title="总销售额" 
                      value={stats.totalSales} 
                      prefix="¥"
                    />
                  </div>
                </Col>
                <Col span={6}>
                  <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '16px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                    <Statistic 
                      title="今日订单" 
                      value={stats.todayOrders} 
                      prefix={<OrderedListOutlined />}
                    />
                  </div>
                </Col>
                <Col span={6}>
                  <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '16px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                    <Statistic 
                      title="今日销售额" 
                      value={stats.todaySales} 
                      prefix="¥"
                    />
                  </div>
                </Col>
              </Row>
              
              <div style={{ marginTop: 40, textAlign: 'center' }}>
                <Title level={5}>后台管理系统</Title>
                <p>欢迎使用全球应用商店后台管理系统</p>
                <p>当前版本: 1.0.0</p>
              </div>
            </div>
          )}
          
          {activeMenu === 'products' && <Products />}
          
          {activeMenu === 'orders' && <Orders />}
          
          {activeMenu === 'users' && (
            <div>
              <Title level={4}>用户管理</Title>
              <p>用户管理功能开发中...</p>
            </div>
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;