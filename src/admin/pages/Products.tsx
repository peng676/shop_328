import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, InputNumber, Switch, message, Typography, Space, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title } = Typography;

interface Product {
  id: string;
  name: string;
  category: string;
  description_zh: string;
  description_en: string;
  price: number;
  icon: string;
  rating: number;
  popular: boolean;
  created_at: string;
  updated_at: string;
}

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form] = Form.useForm();
  
  const categories = ['AI', 'Social', 'Entertainment', 'Productivity'];
  const icons = [
    'MessageSquare', 'Sparkles', 'Brain', 'Zap', 'Palette', 'Search', 'Video',
    'Instagram', 'MessageCircle', 'Send', 'Twitter', 'Hash', 'Tv', 'Music',
    'Youtube', 'FileText', 'Github', 'Layers', 'PenTool', 'Facebook', 'Pen',
    'Languages', 'Layout', 'Grid', 'Feather'
  ];
  
  useEffect(() => {
    fetchProducts();
  }, []);
  
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/admin-api/products', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setProducts(data.data);
      } else {
        message.error('获取产品列表失败');
      }
    } catch (error) {
      console.error('获取产品列表错误:', error);
      message.error('网络错误');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddProduct = () => {
    setEditingProduct(null);
    form.resetFields();
    setModalVisible(true);
  };
  
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    form.setFieldsValue({
      id: product.id,
      name: product.name,
      category: product.category,
      description_zh: product.description_zh,
      description_en: product.description_en,
      price: product.price,
      icon: product.icon,
      rating: product.rating,
      popular: product.popular
    });
    setModalVisible(true);
  };
  
  const handleDeleteProduct = async (id: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/admin-api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        message.success('产品删除成功');
        fetchProducts();
      } else {
        message.error('删除失败');
      }
    } catch (error) {
      console.error('删除产品错误:', error);
      message.error('网络错误');
    }
  };
  
  const handleSubmit = async (values: any) => {
    try {
      const token = localStorage.getItem('adminToken');
      let response;
      
      if (editingProduct) {
        // 更新产品
        response = await fetch(`/admin-api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(values)
        });
      } else {
        // 添加产品
        response = await fetch('/admin-api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(values)
        });
      }
      
      const data = await response.json();
      if (data.success) {
        message.success(editingProduct ? '产品更新成功' : '产品添加成功');
        setModalVisible(false);
        fetchProducts();
      } else {
        message.error(data.error || '操作失败');
      }
    } catch (error) {
      console.error('保存产品错误:', error);
      message.error('网络错误');
    }
  };
  
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 120,
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      render: (price: number) => `¥${price}`,
    },
    {
      title: '评分',
      dataIndex: 'rating',
      key: 'rating',
      width: 80,
    },
    {
      title: '热门',
      dataIndex: 'popular',
      key: 'popular',
      width: 80,
      render: (popular: boolean) => (
        <Switch checked={popular} disabled />
      ),
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
      width: 150,
      render: (_: any, record: Product) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => handleEditProduct(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除此产品吗？"
            onConfirm={() => handleDeleteProduct(record.id)}
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
        <Title level={4}>产品管理</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={handleAddProduct}
        >
          添加产品
        </Button>
      </div>
      
      <Table 
        columns={columns} 
        dataSource={products} 
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
        }}
      />
      
      <Modal
        title={editingProduct ? '编辑产品' : '添加产品'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="id"
            label="产品ID"
            rules={[{ required: true, message: '请输入产品ID' }]}
          >
            <Input placeholder="请输入产品ID" />
          </Form.Item>
          
          <Form.Item
            name="name"
            label="产品名称"
            rules={[{ required: true, message: '请输入产品名称' }]}
          >
            <Input placeholder="请输入产品名称" />
          </Form.Item>
          
          <Form.Item
            name="category"
            label="分类"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select placeholder="请选择分类">
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="description_zh"
            label="中文描述"
            rules={[{ required: true, message: '请输入中文描述' }]}
          >
            <Input.TextArea placeholder="请输入中文描述" rows={3} />
          </Form.Item>
          
          <Form.Item
            name="description_en"
            label="英文描述"
            rules={[{ required: true, message: '请输入英文描述' }]}
          >
            <Input.TextArea placeholder="请输入英文描述" rows={3} />
          </Form.Item>
          
          <Form.Item
            name="price"
            label="价格"
            rules={[{ required: true, message: '请输入价格' }]}
          >
            <InputNumber
              placeholder="请输入价格"
              min={0}
              step={0.01}
              style={{ width: '100%' }}
            />
          </Form.Item>
          
          <Form.Item
            name="icon"
            label="图标"
            rules={[{ required: true, message: '请选择图标' }]}
          >
            <Select placeholder="请选择图标">
              {icons.map(icon => (
                <option key={icon} value={icon}>{icon}</option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="rating"
            label="评分"
            rules={[{ required: true, message: '请输入评分' }]}
          >
            <InputNumber
              placeholder="请输入评分"
              min={0}
              max={5}
              step={0.1}
              style={{ width: '100%' }}
            />
          </Form.Item>
          
          <Form.Item
            name="popular"
            label="热门"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
            <Button onClick={() => setModalVisible(false)}>取消</Button>
            <Button type="primary" htmlType="submit">
              {editingProduct ? '更新' : '添加'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Products;