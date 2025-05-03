import { useState, useEffect, useCallback, useContext } from "react";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { AppContext } from "../../context/AppContext";
import { createPage, getAllPages, updatePage, deletePage, getAllLayers } from "../../services/api";
import { message, Modal, Input, Button } from "antd";

const Pages = () => {
  const { selectedActivity, setSelectedPage, selectedSlideId, setSelectedSlideId, pageName, setPageName, setLayers } = useContext(AppContext);
  const [slides, setSlides] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPage, setEditingPage] = useState(null);

  const loadPages = useCallback(async () => {
    try {
      const result = await getAllPages(selectedActivity);
      setSlides(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error("Failed to load pages:", error);
      message.error("Failed to load pages. Please try again.");
    }
  }, [selectedActivity]);

  const loadLayers = useCallback(async (pageId) => {
    if (!pageId) {
      console.log("No pageId, clearing layers");
      setLayers([]);
      return;
    }
    try {
      console.log("Fetching layers for pageId:", pageId);
      const result = await getAllLayers(pageId);
      console.log("API response:", result);
      const apiLayers = (Array.isArray(result) ? result : []).map((layer) => ({
        ...layer,
        saved: true,
        properties: {
          ...layer.properties,
          type: layer.properties.type || (layer.properties.imgUrl.match(/\.(mp4|webm|ogg)$/i) ? "video" : "image"),
        },
      }));
      console.log("Processed layers:", apiLayers);
      setLayers(apiLayers);
    } catch (error) {
      console.error("Failed to load layers:", error);
      message.error("Failed to load layers. Please try again.");
      setLayers([]);
    }
  }, [setLayers]);

  useEffect(() => {
    if (selectedActivity) {
      loadPages();
    }
  }, [selectedActivity, loadPages]);

  const handleAddSlide = async () => {
    try {
      await createPage({ title: "Untitled Page", activityId: selectedActivity });
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
      loadPages();
    } catch (error) {
      console.error("Error updating page:", error);
      message.error("Failed to update page. Please try again.");
    }
  };

  const handleDeleteSlide = async (pageId) => {
    try {
      await deletePage(pageId);
      setSlides((prev) => prev.filter((s) => s._id !== pageId));
      message.success("Page deleted successfully!");
      if (selectedSlideId === pageId) {
        setSelectedPage(null);
        setSelectedSlideId(null);
        setPageName("");
        setLayers([]);
      }
    } catch (error) {
      console.error("Error deleting page:", error);
      message.error("Failed to delete page. Please try again.");
    }
  };

  const handleSelectSlide = useCallback((id, title) => {
    console.log("Selected Slide ID:", id);
    setSelectedPage(id);
    setSelectedSlideId(id);
    setPageName(title);
    loadLayers(id); // Load layers immediately when a page is selected
  }, [setSelectedPage, setSelectedSlideId, loadLayers]);

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setPageName("");
    setEditingPage(null);
  };

  return (
    <div className="slide-list-container">
      <div className="header">
        <h3>PAGES</h3>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddSlide}
          aria-label="Add new page"
        >
          Add Page
        </Button>
      </div>

      <div className="slide-grid">
        {slides.length === 0 ? (
          <p>No pages available. Create a new page to get started!</p>
        ) : (
          slides.map((slide) => (
            <div
              key={slide._id}
              className={`slide-card ${selectedSlideId === slide._id ? 'selected' : ''}`}
              onClick={() => handleSelectSlide(slide._id, slide.title)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && handleSelectSlide(slide._id, slide.title)}
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