import React, { useState, useContext } from "react";
import { EditOutlined, CopyOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { AppContext } from "../../../context/AppContext";

const SlideSection = () => {
  const { setSelectedPage } = useContext(AppContext);
  const [slides, setSlides] = useState([
    { id: 1, name: "Slide 1", active: true },
    { id: 2, name: "Slide 2", active: false },
    { id: 3, name: "Slide 3", active: false },
    { id: 4, name: "Slide 4", active: false },
    { id: 5, name: "Slide 5", active: false },
  ]);

  const handleAddSlide = () => {
    const newSlide = {
      id: slides.length + 1,
      name: `Slide ${slides.length + 1}`,
      active: false,
    };
    setSlides([...slides, newSlide]);
  };

  const handleSelectSlide = (id) => {
    setSlides(slides.map((slide) => ({ ...slide, active: slide.id === id })));
    setSelectedPage(id);
  };

  const handleDeleteSlide = (id) => {
    const filteredSlides = slides.filter((slide) => slide.id !== id);
    const newSlides = filteredSlides.length > 0 ? filteredSlides : [{ id: 1, name: "Slide 1", active: true }];
    setSlides(newSlides);
    if (filteredSlides.length === 0) {
      setSelectedPage(null);
    }
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
            key={slide.id}
            className={`slide-card ${slide.active ? "active" : ""}`}
            onClick={() => handleSelectSlide(slide.id)}
          >
            <p>{slide.name}</p>
            {slide.active && (
              <div className="slide-actions">
                <EditOutlined className="edit-icon" />
                <CopyOutlined className="edit-icon" />
                <DeleteOutlined className="delete-icon" onClick={() => handleDeleteSlide(slide.id)} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SlideSection;