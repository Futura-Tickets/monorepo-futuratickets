'use client';

import { useState, useEffect } from 'react';
import {
  Button,
  Table,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Tag,
  Space,
  Card
} from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { getAdminAccounts, createPromoterAccount, deleteAdminAccount } from '@/shared/services/auth.service';

const { Option } = Select;

interface User {
  _id: string;
  name: string;
  lastName: string;
  email: string;
  role: string;
  createdAt?: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getAdminAccounts();
      setUsers(data || []);
    } catch (error) {
      message.error('Error al cargar usuarios');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (values: any) => {
    try {
      setLoading(true);
      await createPromoterAccount({
        name: values.name,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        role: values.role,
      });
      message.success('Usuario creado exitosamente');
      setModalVisible(false);
      form.resetFields();
      loadUsers();
    } catch (error: any) {
      message.error(error?.message || 'Error al crear usuario');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      setLoading(true);
      await deleteAdminAccount(userId);
      message.success('Usuario eliminado exitosamente');
      loadUsers();
    } catch (error) {
      message.error('Error al eliminar usuario');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: User) => `${text} ${record.lastName}`,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Rol',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        const color = role === 'ADMIN' ? 'red' : role === 'PROMOTER' ? 'blue' : 'green';
        return <Tag color={color}>{role}</Tag>;
      },
    },
    {
      title: 'Fecha de Creación',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => date ? new Date(date).toLocaleDateString() : 'N/A',
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_: any, record: User) => (
        <Space>
          <Popconfirm
            title="¿Estás seguro de eliminar este usuario?"
            onConfirm={() => handleDeleteUser(record._id)}
            okText="Sí"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />} size="small">
              Eliminar
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title="Gestión de Usuarios"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalVisible(true)}
          >
            Crear Usuario
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={users}
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} usuarios`,
          }}
        />
      </Card>

      <Modal
        title="Crear Nuevo Usuario"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateUser}
        >
          <Form.Item
            name="name"
            label="Nombre"
            rules={[
              { required: true, message: 'Por favor ingresa el nombre' },
              { min: 2, message: 'El nombre debe tener al menos 2 caracteres' }
            ]}
          >
            <Input placeholder="Juan" />
          </Form.Item>

          <Form.Item
            name="lastName"
            label="Apellido"
            rules={[
              { required: true, message: 'Por favor ingresa el apellido' },
              { min: 2, message: 'El apellido debe tener al menos 2 caracteres' }
            ]}
          >
            <Input placeholder="Pérez" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Por favor ingresa el email' },
              { type: 'email', message: 'Por favor ingresa un email válido' }
            ]}
          >
            <Input placeholder="usuario@ejemplo.com" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Contraseña"
            rules={[
              { required: true, message: 'Por favor ingresa la contraseña' },
              { min: 8, message: 'La contraseña debe tener al menos 8 caracteres' }
            ]}
          >
            <Input.Password placeholder="Mínimo 8 caracteres" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirmar Contraseña"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Por favor confirma la contraseña' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Las contraseñas no coinciden'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Repite la contraseña" />
          </Form.Item>

          <Form.Item
            name="role"
            label="Rol"
            rules={[{ required: true, message: 'Por favor selecciona un rol' }]}
            initialValue="PROMOTER"
          >
            <Select placeholder="Selecciona un rol">
              <Option value="ADMIN">Administrador</Option>
              <Option value="PROMOTER">Promotor</Option>
              <Option value="ACCESS">Control de Acceso</Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => {
                setModalVisible(false);
                form.resetFields();
              }}>
                Cancelar
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Crear Usuario
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}