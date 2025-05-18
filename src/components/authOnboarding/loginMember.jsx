import { useState } from 'react';
import { Form, Input, Button, Typography, Card, message } from 'antd';
import { loginMember } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const MemberLogin = ({ setRegisterMember }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await loginMember(values); 
      message.success(response.message || "Login successful");
      sessionStorage.setItem("x-auth-token", response.token);
      navigate("/"); 
    } catch (error) {
      message.error(error?.response?.data?.msg || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Card hoverable className="login-card">
        <Title level={3} className="login-title">Welcome to Binky Monkey As Member</Title>

        <Form
          name="login"
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ remember: true }}
        >
          <Form.Item
            label="Member ID"
            name="memberId"
            rules={[{ required: true, message: 'Please enter your Member ID!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please enter your password!' }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="login-button"
              loading={loading}
            >
              Sign in
            </Button>
          </Form.Item>

          <Form.Item>
            <div className="text-center">
              Not a member?{' '}
              <Button
                type="link"
                onClick={() => setRegisterMember(true)}
                style={{ padding: 0 }}
              >
                Register
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default MemberLogin;
