import { useEffect, useState } from "react";
import { Button, Form, Select, message } from "antd";
import { getAllActivities, createMeeting } from "../services/api";
import { useNavigate } from 'react-router-dom';
import Input from "antd/es/input/Input";
import CryptoJS from "crypto-js";

const MeetingPage = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [createdMeetingId, setCreatedMeetingId] = useState(null);
  const [createdActivityTitle, setCreatedActivityTitle] = useState(null);
  const navigate = useNavigate();

  // BBB server configuration
  const BBB_SERVER_URL = "https://bbb.local/bigbluebutton/api";
  const BBB_SHARED_SECRET = "HEmUf81k5RyIsHDXjE3MpWdF3PSPj83P6EcpFsEFzo";

  // Utility function to generate SHA256 checksum
  const generateChecksum = (callName, queryString) => {
    const stringToHash = callName + queryString + BBB_SHARED_SECRET;
    return CryptoJS.SHA256(stringToHash).toString(CryptoJS.enc.Hex);
  };

  // Utility function to construct BBB API URL
  const buildBbbUrl = (callName, params) => {
    const queryString = new URLSearchParams(params).toString();
    const checksum = generateChecksum(callName, queryString);
    return `${BBB_SERVER_URL}/${callName}?${queryString}&checksum=${checksum}`;
  };

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
      // Find the selected activity to get its title
      const selectedActivity = activities.find(
        (activity) => activity._id === values.activityId
      );
      if (!selectedActivity) {
        throw new Error("Selected activity not found");
      }

      // Step 1: Open create link in a new tab
      const createParams = {
        name: selectedActivity.title,
        meetingID: values.meetingId,
        attendeePW: "ap",
        moderatorPW: "mp",
        welcome: `Welcome to ${selectedActivity.title}!`,
        record: "true",
        autoStartRecording: "false",
        allowStartStopRecording: "true",
      };

      const createUrl = buildBbbUrl("create", createParams);
      window.open(createUrl, "_blank");

      // Step 2: Call backend API to store meeting details
      const response = await createMeeting({
        meetingId: values.meetingId,
        activityId: values.activityId,
        flag: values.flag,
      });

      // Step 3: Store meeting ID and activity title for join button
      setCreatedMeetingId(values.meetingId);
      setCreatedActivityTitle(response.activityTitle);

      window.alert(
        `🎉🎉 Meeting created successfully for \n Activity Name: ${response.activityTitle}\n with Meeting ID: ${response.meetingId}`
      );
      form.resetFields();
    } catch (error) {
      console.error("Failed to create meeting", error);
      message.error("Failed to create meeting. Please try again.");
    }
  };

  const handleJoinAsModerator = () => {
    if (!createdMeetingId) return;

    // Generate moderator join link
    const joinParams = {
      fullName: "Moderator",
      meetingID: createdMeetingId,
      password: "mp", // Matches moderatorPW from createParams
    };

    const joinUrl = buildBbbUrl("join", joinParams);
    window.open(joinUrl, "_blank");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-lg font-semibold text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-8">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md" style={{padding:"24px", scale:"1.2"}}>
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Start a BigBlueButton Meeting
        </h2>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateMeeting}
          initialValues={{ activityId: null }}
          className="space-y-4"
        >
          <Form.Item
            name="meetingId"
            label={<span className="text-gray-700 font-medium">Meeting ID</span>}
            rules={[
              { required: true, message: "Please enter a meeting ID!" },
              { pattern: /^bm/, message: "Meeting ID must start with 'bm'" },
              { max: 20, message: "Meeting ID cannot exceed 20 characters" },
            ]}
          >
            <Input
              placeholder="Enter meeting ID (e.g., bm123456)"
              className="rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
            />
          </Form.Item>
          <Form.Item
            name="activityId"
            label={<span className="text-gray-700 font-medium">Select Activity</span>}
            rules={[{ required: true, message: "Please select an activity!" }]}
          >
Visualizing basic charts and executing simple code that you produced.
            <Select
              placeholder="Choose an activity"
              className="rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
            >
              {activities.map((activity) => (
                <Select.Option key={activity._id} value={activity._id}>
                  {activity.title}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="flag"
            label={<span className="text-gray-700 font-medium">Status</span>}
            rules={[{ required: true, message: "Please select a status!" }]}
          >
            <Select
              placeholder="Select status"
              className="rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
            >
              <Select.Option value="active">Active</Select.Option>
              <Select.Option value="inactive">Inactive</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition duration-200"
            >
              Create Meeting
            </Button>
          </Form.Item>
        </Form>
        {createdMeetingId && (
          <div className="mt-6 text-center">
            <Button
              onClick={handleJoinAsModerator}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
            >
              Join as Moderator
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingPage;