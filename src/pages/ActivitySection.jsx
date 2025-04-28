import { useContext, useEffect, useState } from "react";
import { Button, Card, Dropdown, message } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import {AppContext} from "../context/AppContext";
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
  const navigate = useNavigate();

  const {setSelectedActivity} = useContext(AppContext);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const res = await getAllActivities();
      setActivities(res.activities);
    } catch (error) {
      console.error("Failed to fetch activities", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateActivity = async () => {
    const title = prompt("Enter activity name:");
    if (title) {
      try {
        const newActivity = { title };
        await createActivity(newActivity);
        fetchActivities();
      } catch (error) {
        console.error("Failed to create activity", error);
      }
    }
  };

  const handleDeleteActivity = async (activityId) => {
    try {
      await deleteActivity(activityId);
      fetchActivities();
    } catch (error) {
      console.error("Failed to delete activity", error);
    }
  };

  const handleCardClick = (activityId) => {
    setSelectedActivity(activityId);
    navigate(`/home`);
  };

  return (
    <>
      <div className="content-header">
        <h2 className="title">Activity file</h2>
        <Button
          type="color"
          className="create-btn"
          onClick={handleCreateActivity}
        >
          Create New Activity
        </Button>
      </div>

      <div className="activity-grid">
        {activities.map((activity) => {
          const items = [
            {
              key: "edit",
              label: "Edit",
              onClick: async () => {
                const newTitle = prompt("Edit activity title:", activity.title);
                if (newTitle && newTitle !== activity.title) {
                  try {
                    await updateActivity(activity._id, { title: newTitle });
                    message.success("Activity updated successfully");
                    fetchActivities();
                  } catch (error) {
                    message.error("Failed to update activity");
                  }
                }
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
        })}
      </div>
    </>
  );
};

export default ActivitySection;
