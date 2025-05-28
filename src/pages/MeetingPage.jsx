import { useEffect, useState } from "react";
import { Button, Form, Select, message } from "antd";
import { getAllActivities, createMeeting } from "../services/api";
import { useNavigate } from 'react-router-dom';

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
      const response = await createMeeting({ activityId: values.activityId });
      window.alert(`🎉🎉 Meeting created successfully for \n Acitvity Name :${response.activityTitle}\n with Meeting ID: ${response.meetingId}`);
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