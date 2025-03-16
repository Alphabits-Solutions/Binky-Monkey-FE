import React from 'react';
import { Form, Input, Button, Checkbox, Typography, Card } from 'antd';

const { Title } = Typography;

const Login = ( {setSignup} ) => {
  const onFinish = (values) => {
    console.log('Success:', values);
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  return (
    <div className="login-container">
      <Card hoverable className="login-card">
        <Title level={3} className="login-title">Welcome To Binky Monkey</Title>
        
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          layout="vertical"
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: 'Please input your email!' }]}
          >
            <Input type="email" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item name="remember" valuePropName="checked">
            <div className="form-options">
              <Checkbox>Remember Me</Checkbox>
              <Button type="link" className="forgot-password">
                Forgot Password?
              </Button>
            </div>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="login-button">
              Sign in
            </Button>
          </Form.Item>
          <Form.Item>
            <div className="text-center">
              Not a member?{' '}
              <Button 
                type="link" 
                onClick={() => setSignup(true)}
                style={{ padding: 0 }}
              >
                Signup
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;