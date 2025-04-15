import { useState } from "react";
import { Form, Input, Button, Typography, Card, message } from "antd";
import { registerUser } from "../../services/api";

const { Title } = Typography;

const Signup = ({ setSignup }) => {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await registerUser(values);
      console.log("first",response)
      message.success(response.data.message);
      setSignup(false);
    } catch (error) {
      message.error(error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
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
            label="Full Name"
            name="fullName"
            rules={[
              { required: true, message: "Please input your full name!" },
            ]}
          >
            <Input />
          </Form.Item>

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
            <Button
              type="primary"
              htmlType="submit"
              className="login-button"
              loading={loading}
            >
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