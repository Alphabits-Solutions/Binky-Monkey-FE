
import { useState } from "react";
import { FaTrash } from "react-icons/fa";


const initialLayers = [
  {
    id: 1,
    name: "Rectangle",
    children: ["Resize", "Drag", "Audio Action", "Vibration"],
  },
  { id: 2, name: "Student Image", children: [] },
  { id: 3, name: "Graphic Element", children: [] },
  { id: 4, name: "Triangle Shape", children: [] },
  { id: 5, name: "Video", children: [] },
];

const LayerList = () => {
  const [layers, setLayers] = useState(initialLayers);
  const [expanded, setExpanded] = useState({});

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const deleteChild = (parentId, childIndex) => {
    setLayers((prevLayers) =>
      prevLayers.map((layer) =>
        layer.id === parentId
          ? {
              ...layer,
              children: layer.children.filter((_, i) => i !== childIndex),
            }
          : layer
      )
    );
  };

  return (
    <div className="layer-list">
      <h3>LAYERS</h3>
      <ul>
        {layers.map((layer) => (
          <li key={layer.id}>
            <div className="layer-item" onClick={() => toggleExpand(layer.id)}>
              <span>
                {layer.children.length > 0 ? (
                  expanded[layer.id] ? (
                    <img
                      src="src\assets\icons\Home\layer\arrow-down.svg"
                      alt="Expand"
                      width="8"
                      height="8"
                    />
                  ) : (
                    <img
                      src="src\assets\icons\Home\layer\arrow-right.svg"
                      alt="Collapse"
                      width="8"
                      height="8"
                    />
                  )
                ) : (
                  <img src="src\assets\icons\Home\layer\arrow-right.svg" alt="Right" width="8" height="8" />
                )}
              </span>
              {layer.name}
            </div>

            {expanded[layer.id] && layer.children.length > 0 && (
              <ul className="nested">
                {layer.children.map((child, index) => (
                  <li key={index} className="nested-item">
                    {child}
                    <FaTrash
                      className="delete-icon"
                      onClick={() => deleteChild(layer.id, index)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LayerList;
