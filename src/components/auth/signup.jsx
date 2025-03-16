import React from "react";
import { Form, Input, Button, Typography, Card } from "antd";

const { Title } = Typography;

const Signup = ({setSignup}) => {
  const onFinish = (values) => {
    console.log("Success:", values);
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <div className="login-container">
      <Card hoverable className="login-card">
        <Title level={2} className="login-title">
          Create Your Account
        </Title>

        <Form
          name="signup"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          layout="vertical"
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Please input your email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input type="email" />
          </Form.Item>

          <Form.Item
            label="Phone Number"
            name="phone"
            rules={[
              { required: true, message: "Please input your phone number!" },
              {
                pattern: /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/,
                message: "Please enter a valid phone number!",
              },
            ]}
          >
            <Input addonBefore="+91" style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: "Please input your password!" },
              { min: 8, message: "Password must be at least 8 characters!" },
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            label="Confirm Password"
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Please confirm your password!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject("The two passwords do not match!");
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="login-button">
              Sign Up
            </Button>
          </Form.Item>
        </Form>

        <Form.Item>
          <div className="text-center">
            Already have an account?{" "}
            <Button
              type="link"
              onClick={() => setSignup(false)}
              style={{ padding: 0 }}
            >
              Login
            </Button>
          </div>
        </Form.Item>
      </Card>
    </div>
  );
};

export default Signup;
