import { useContext, useEffect, useState } from "react";
import { Button, Card, Dropdown, Form, Input, message, Modal } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import folder from "../assets/icons/folder.svg";
import {
  createActivity,
  deleteActivity,
  getAllActivities,
  updateActivity,
} from "../services/api";

const ActivitySection = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const navigate = useNavigate();
  const { setSelectedActivity: setContextActivity } = useContext(AppContext);

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

  const handleCreateActivity = async (values) => {
    try {
      const newActivity = {
        title: values.title,
        description: values.description,
      };
      await createActivity(newActivity);
      message.success("Activity created successfully");
      setIsCreateModalOpen(false);
      createForm.resetFields();
      fetchActivities();
    } catch (error) {
      console.error("Failed to create activity", error);
      message.error("Failed to create activity.");
    }
  };

  const handleEditActivity = async (values) => {
    try {
      await updateActivity(selectedActivity._id, {
        title: values.title,
        description: values.description,
      });
      message.success("Activity updated successfully");
      setIsEditModalOpen(false);
      editForm.resetFields();
      setSelectedActivity(null);
      fetchActivities();
    } catch (error) {
      console.error("Failed to update activity", error);
      message.error("Failed to update activity.");
    }
  };

  const handleDeleteActivity = async (activityId) => {
    try {
      await deleteActivity(activityId);
      message.success("Activity deleted successfully");
      fetchActivities();
    } catch (error) {
      console.error("Failed to delete activity", error);
      message.error("Failed to delete activity.");
    }
  };

  const handleCardClick = (activityId) => {
    setContextActivity(activityId);
    navigate(`/home`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="content-header">
        <h2 className="title">Activity file</h2>
        <Button
          type="primary"
          className="create-btn"
          onClick={() => setIsCreateModalOpen(true)}
        >
          Create New Activity
        </Button>
      </div>

      {/* Create Activity Modal */}
      <Modal
        title="Create New Activity"
        open={isCreateModalOpen}
        onCancel={() => {
          setIsCreateModalOpen(false);
          createForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateActivity}
          initialValues={{ title: "", description: "" }}
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[
              { required: true, message: "Please enter the activity title" },
              { max: 100, message: "Title cannot exceed 100 characters" },
            ]}
          >
            <Input placeholder="Enter activity title" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ max: 500, message: "Description cannot exceed 500 characters" }]}
          >
            <Input.TextArea
              placeholder="Enter activity description (optional)"
              rows={4}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Create Activity
            </Button>
            <Button
              style={{ marginLeft: 8 }}
              onClick={() => {
                setIsCreateModalOpen(false);
                createForm.resetFields();
              }}
            >
              Cancel
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Activity Modal */}
      <Modal
        title="Edit Activity"
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          editForm.resetFields();
          setSelectedActivity(null);
        }}
        footer={null}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditActivity}
          initialValues={{
            title: selectedActivity?.title || "",
            description: selectedActivity?.description || "",
          }}
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[
              { required: true, message: "Please enter the activity title" },
              { max: 100, message: "Title cannot exceed 100 characters" },
            ]}
          >
            <Input placeholder="Enter activity title" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ max: 500, message: "Description cannot exceed 500 characters" }]}
          >
            <Input.TextArea
              placeholder="Enter activity description (optional)"
              rows={4}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Update Activity
            </Button>
            <Button
              style={{ marginLeft: 8 }}
              onClick={() => {
                setIsEditModalOpen(false);
                editForm.resetFields();
                setSelectedActivity(null);
              }}
            >
              Cancel
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <div className="activity-grid">
        {activities.length === 0 ? (
          <p>No activities found.</p>
        ) : (
          activities.map((activity) => {
            const items = [
              {
                key: "edit",
                label: "Edit",
                onClick: () => {
                  setSelectedActivity(activity);
                  setIsEditModalOpen(true);
                },
              },
              {
                key: "delete",
                label: "Delete",
                danger: true,
                onClick: () => handleDeleteActivity(activity._id),
              },
            ];

            return (
              <Card
                key={activity._id}
                className="activity-card"
                onClick={() => handleCardClick(activity._id)}
              >
                <div
                  style={{
                    marginTop: "2em",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <img src={folder} alt="folder" />
                  <div onClick={(e) => e.stopPropagation()}>
                    <Dropdown menu={{ items }} trigger={["click"]}>
                      <MoreOutlined
                        style={{ fontSize: "30px", cursor: "pointer" }}
                      />
                    </Dropdown>
                  </div>
                </div>
                <p style={{ marginTop: "15px" }}>{activity.title}</p>
              </Card>
            );
          })
        )}
      </div>
    </>
  );
};

export default ActivitySection;