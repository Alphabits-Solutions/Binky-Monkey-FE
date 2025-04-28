import { useState, useEffect, useCallback, useContext } from "react";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { AppContext } from "../../context/AppContext";
import { createPage, getAllPages, updatePage, deletePage } from "../../services/api";
import { useParams } from "react-router-dom";
import { message, Modal, Input, Button } from "antd";

const Pages = () => {
  const { activityId } = useParams();
  const { setSelectedPage,selectedSlideId, setSelectedSlideId } = useContext(AppContext);
  const [slides, setSlides] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [pageName, setPageName] = useState("");
  // const navigate = useNavigate();

  const loadPages = useCallback(async () => {
    try {
      const result = await getAllPages(activityId);
      setSlides(result.pages || []);
    } catch (error) {
      console.error("Failed to load pages:", error);
      message.error("Failed to load pages. Please try again.");
    }
  }, [activityId]);

  useEffect(() => {
    if (activityId) {
      loadPages();
    }
  }, [activityId, loadPages]);

  const handleAddSlide = async () => {
    try {
      await createPage(activityId, { title: "Untitled Page" });
      message.success("Page created successfully!");
      loadPages();
    } catch (error) {
      console.error("Error creating page:", error);
      message.error("Failed to create page. Please try again.");
    }
  };

  const handleEditSlide = useCallback((page) => {
    setEditingPage(page);
    setPageName(page.title);
    setIsModalVisible(true);
  }, []);

  const handleUpdatePage = async () => {
    if (!pageName.trim()) {
      message.error("Page name cannot be empty.");
      return;
    }

    try {
      const updated = await updatePage(editingPage._id, { title: pageName.trim() });
      setSlides((prev) =>
        prev.map((slide) =>
          slide._id === updated._id ? { ...slide, title: updated.title } : slide
        )
      );
      message.success("Page updated successfully!");
      setIsModalVisible(false);
      setPageName("");
      setEditingPage(null);
    } catch (error) {
      console.error("Error updating page:", error);
      message.error("Failed to update page. Please try again.");
    }
  };

  const handleDeleteSlide = async (pageId) => {
    try {
      await deletePage(activityId, pageId);
      setSlides((prev) => prev.filter((s) => s._id !== pageId));
      message.success("Page deleted successfully!");
    } catch (error) {
      console.error("Error deleting page:", error);
      message.error("Failed to delete page. Please try again.");
    }
  };

  const handleSelectSlide = useCallback((id) => {
    console.log("Selected Slide ID:", id);
    setSelectedPage(id);
    setSelectedSlideId(id); 
    // navigate(`/activity/${activityId}/game?tab=asset`);
  }, [setSelectedPage,setSelectedSlideId]);

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setPageName("");
    setEditingPage(null);
  };

  return (
    <div className="slide-list-container">
      <div className="header">
        <h2>PAGES</h2>
        <div className="upload-section">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddSlide}
            aria-label="Add new page"
          >
            Add Page
          </Button>
        </div>
      </div>

      <div className="slide-grid">
        {slides.length === 0 ? (
          <p>No pages available. Create a new page to get started!</p>
        ) : (
          slides.map((slide) => (
            <div
              key={slide._id}
              className={`slide-card ${selectedSlideId === slide._id ? 'selected' : ''}`} 
              onClick={() => handleSelectSlide(slide._id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && handleSelectSlide(slide._id)}
              aria-label={`Select page ${slide.title}`}
            >
              <p>{slide.title}</p>
              <div className="slide-actions" onClick={(e) => e.stopPropagation()}>
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => handleEditSlide(slide)}
                  aria-label={`Edit page ${slide.title}`}
                />
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  onClick={() => handleDeleteSlide(slide._id)}
                  aria-label={`Delete page ${slide.title}`}
                />
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        title="Edit Page Name"
        open={isModalVisible}
        onOk={handleUpdatePage}
        onCancel={handleModalCancel}
        okText="Update"
        cancelText="Cancel"
        okButtonProps={{ disabled: !pageName.trim() }}
      >
        <Input
          value={pageName}
          onChange={(e) => setPageName(e.target.value)}
          placeholder="Enter page name"
          autoFocus
          aria-label="Page name input"
        />
      </Modal>
    </div>
  );
};

export default Pages;