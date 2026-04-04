import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Select, 
  message, 
  Typography, 
  Space,
  Popconfirm
} from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';

const { Title } = Typography;

interface Order {
  id: string;
  product_id: string;
  product_name: string;
  price: number;
  email: string;
  status: string;
  token: string;
  download_link: string;
  created_at: string;
  updated_at: string;
}

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [form] = Form.useForm();
  
  const statusOptions = [
    { value: 'pending', label: '待处理' },
    { value: 'completed', label: '已完成' },
    { value: 'cancelled', label: '已取消' },
    { value: 'used', label: '已使用' }
  ];
  
  useEffect(() => {
    fetchOrders();
  }, []);
  
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/admin-api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setOrders(data.data);
      } else {
        message.error('获取订单列表失败');
      }
    } catch (error) {
      console.error('获取订单列表错误:', error);
      message.error('网络错误');
    } finally {
      setLoading(false);
    }
  };
  
  const handleViewOrder = async (order: Order) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/admin-api/orders/${order.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setCurrentOrder(data.data);
        form.setFieldsValue({
          status: data.data.status
        });
        setModalVisible(true);
      } else {
        message.error('获取订单详情失败');
      }
    } catch (error) {
      console.error('获取订单详情错误:', error);
      message.error('网络错误');
    }
  };
  
  const handleDeleteOrder = async (id: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/admin-api/orders/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        message.success('订单删除成功');
        fetchOrders();
      } else {
        message.error('删除失败');
      }
    } catch (error) {
      console.error('删除订单错误:', error);
      message.error('网络错误');
    }
  };
  
  const handleUpdateStatus = async (values: any) => {
    if (!currentOrder) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/admin-api/orders/${currentOrder.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: values.status })
      });
      const data = await response.json();
      if (data.success) {
        message.success('订单状态更新成功');
        setModalVisible(false);
        fetchOrders();
      } else {
        message.error('更新失败');
      }
    } catch (error) {
      console.error('更新订单状态错误:', error);
      message.error('网络错误');
    }
  };
  
  const columns = [
    {
      title: '订单ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '产品',
      dataIndex: 'product_name',
      key: 'product_name',
      width: 150,
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      render: (price: number) => `¥${price}`,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 180,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const statusMap: Record<string, { text: string; color: string }> = {
          pending: { text: '待处理', color: 'orange' },
          completed: { text: '已完成', color: 'green' },
          cancelled: { text: '已取消', color: 'red' },
          used: { text: '已使用', color: 'blue' }
        };
        const statusInfo = statusMap[status] || { text: status, color: 'gray' };
        return (
          <span style={{ color: statusInfo.color, fontWeight: 'bold' }}>
            {statusInfo.text}
          </span>
        );
      },
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (time: string) => new Date(time).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_: any, record: Order) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EyeOutlined />} 
            size="small"
            onClick={() => handleViewOrder(record)}
          >
            查看
          </Button>
          <Popconfirm
            title="确定删除此订单吗？"
            onConfirm={() => handleDeleteOrder(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              danger 
              icon={<DeleteOutlined />} 
              size="small"
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];
  
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4}>订单管理</Title>
        <Button 
          type="primary"
          onClick={fetchOrders}
        >
          刷新订单
        </Button>
      </div>
      
      <Table 
        columns={columns} 
        dataSource={orders} 
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
        }}
      />
      
      <Modal
        title="订单详情"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        {currentOrder && (
          <div>
            <div className="mb-6">
              <h3 className="font-bold mb-2">订单信息</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">订单ID</p>
                  <p className="font-medium">{currentOrder.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">产品</p>
                  <p className="font-medium">{currentOrder.product_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">价格</p>
                  <p className="font-medium">¥{currentOrder.price}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">邮箱</p>
                  <p className="font-medium">{currentOrder.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">创建时间</p>
                  <p className="font-medium">{new Date(currentOrder.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">下载链接</p>
                  <a 
                    href={currentOrder.download_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-medium text-blue-600 hover:underline"
                  >
                    访问链接
                  </a>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="font-bold mb-2">更新状态</h3>
              <Form
                form={form}
                layout="vertical"
                onFinish={handleUpdateStatus}
              >
                <Form.Item
                  name="status"
                  label="订单状态"
                  rules={[{ required: true, message: '请选择订单状态' }]}
                >
                  <Select placeholder="请选择订单状态">
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </Select>
                </Form.Item>
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
                  <Button onClick={() => setModalVisible(false)}>取消</Button>
                  <Button type="primary" htmlType="submit">
                    更新状态
                  </Button>
                </div>
              </Form>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Orders;