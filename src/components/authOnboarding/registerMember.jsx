import { useState } from 'react';
import { Form, Input, Button, Typography, Card, message } from 'antd';
import { registerMember } from '../../services/api';

const { Title } = Typography;

const MemberRegister = ({ setRegisterMember }) => {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await registerMember(values);
      message.success("Registration successful!");
      alert(`🎉 Your Member ID: ${response.memberId}\n 🔐 Your Password: ${response.password}`);
      setRegisterMember(false); 
    } catch (error) {
      message.error(error?.response?.data?.msg || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Card hoverable className="login-card">
        <Title level={3} className="login-title">Register on Binky Monkey</Title>

        <Form name="register" layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please enter your name' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Enter a valid email' }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              className="login-button" 
              loading={loading}
            >
              Register
            </Button>
          </Form.Item>

          <Form.Item>
            <div className="text-center">
              Already a member?{' '}
              <Button type="link" onClick={() => setRegisterMember(false)} style={{ padding: 0 }}>
                Login
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default MemberRegister;
