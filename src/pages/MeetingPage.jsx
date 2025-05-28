import { useEffect, useState } from "react";
import { Button, Form, Select, message } from "antd";
import { getAllActivities, createMeeting } from "../services/api";
import { useNavigate } from 'react-router-dom';
import Input from "antd/es/input/Input";

const MeetingPage = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const res = await getAllActivities();
      setActivities(Array.isArray(res) ? res : []);
    } catch (error) {
      console.error("Failed to fetch activities", error);
      message.error("Failed to load activities. Please try again.");
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMeeting = async (values) => {
    try {
      const response = await createMeeting({meetingId: values.meetingId,
        activityId: values.activityId,
        flag: values.flag, });
      window.alert(`🎉🎉 Meeting created successfully for \n Activity Name :${response.activityTitle}\n with Meeting ID: ${response.meetingId}`);
      form.resetFields();
      navigate("/"); 
    } catch (error) {
      console.error("Failed to create meeting", error);
      message.error("Failed to create meeting.");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: "2em" }}>
      <h2>Create a New Meeting</h2>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleCreateMeeting}
        initialValues={{ activityId: null }}
      >
          <Form.Item
          name="meetingId"
          label="Meeting ID"
          rules={[
            { required: true, message: "Please enter a meeting ID!" },
            { pattern: /^bm/, message: "Meeting ID must start with 'bm'" },
            { max: 20, message: "Meeting ID cannot exceed 20 characters" },
          ]}
        >
          <Input placeholder="Enter meeting ID (e.g., bm123456)" />
        </Form.Item>
        <Form.Item
          name="activityId"
          label="Select Activity"
          rules={[{ required: true, message: "Please select an activity!" }]}
        >
          <Select placeholder="Choose an activity">
            {activities.map((activity) => (
              <Select.Option key={activity._id} value={activity._id}>
                {activity.title}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
         <Form.Item
          name="flag"
          label="Status"
          rules={[{ required: true, message: "Please select a status!" }]}
        >
          <Select placeholder="Select status">
            <Select.Option value="active">Active</Select.Option>
            <Select.Option value="inactive">Inactive</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Create Meeting
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default MeetingPage;