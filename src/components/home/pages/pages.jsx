import { useState, useEffect, useContext } from "react";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { AppContext } from "../../../context/AppContext";
import {
  createPage,
  getAllPages,
  updatePage,
  deletePage,
} from "../../../services/api";
import { useNavigate, useParams } from "react-router-dom";
import { message, Modal, Input } from "antd";


const SlideSection = () => {
  const { activityId } = useParams();
  const { setSelectedPage } = useContext(AppContext);
  const [slides, setSlides] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [pageName, setPageName] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    if (activityId) {
      loadPages();
    }
  }, [activityId]);

  const loadPages = async () => {
    try {
      const result = await getAllPages(activityId);
      setSlides(result.pages);
    } catch (error) {
      console.error("Failed to load pages:", error);
    }
  };

  const handleAddSlide = async () => {
  try {
    const result = await createPage(activityId, { title: "Untitled Page" });
    message.success("Page added!");
    loadPages();
  } catch (error) {
    console.error("Error creating page:", error);
  }
};

  const handleEditSlide = (page) => {
    setEditingPage(page);
    setPageName(page.title);
    setIsModalVisible(true);
    
  };

  const handleUpdatePage = async () => {
    try {
      const updated = await updatePage(editingPage._id, { title: pageName });
      setSlides((prev) =>{
        const updatedSlides = prev.map((slide) =>
          slide._id === updated._id ? { ...slide, title: updated.title } : slide
        );
        return updatedSlides;
      });
      message.success("Page updated!");
      setIsModalVisible(false);
    } catch (error) {
      message.error("Error updating page");
    }
  };

  const handleDeleteSlide = async (pageId) => {
    try {
      await deletePage(activityId, pageId);
      setSlides((prev) => prev.filter((s) => s._id !== pageId));
      message.success("Page deleted!");
    } catch (error) {
      message.error("Error deleting page");
    }
  };

  const handleSelectSlide = (id) => {
    setSelectedPage(id);
    navigate(`/activity/${activityId}/page/${id}/layer`);
  };

  return (
    <div className="slide-list-container">
      <div className="header">
        <h2>PAGES</h2>
        <div className="upload-section">
          <button onClick={handleAddSlide}>
            <PlusOutlined />
          </button>
        </div>
      </div>

      <div className="slide-grid">
        {slides.map((slide) => (
          <div
            key={slide._id}
            className="slide-card"
            onClick={() => handleSelectSlide(slide._id)}
          >
            <p>{slide.title}</p>
            <div className="slide-actions">
              <EditOutlined onClick={() => handleEditSlide(slide)} />
              <DeleteOutlined onClick={() => handleDeleteSlide(slide._id)} />
            </div>
          </div>
        ))}
      </div>

      <Modal
        title="Edit Page Name"
        open={isModalVisible}
        onOk={handleUpdatePage}
        onCancel={() => setIsModalVisible(false)}
        okText="Update"
      >
        <Input
          value={pageName}
          onChange={(e) => setPageName(e.target.value)}
          placeholder="Enter new page name"
        />
      </Modal>
    </div>
  );
};

export default SlideSection;
