import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { FaTrash, FaExpand,FaArrowsAlt,FaCube } from "react-icons/fa"
import { getAllLayers, createLayer, deleteLayer } from "../../../services/api"
import arrowRight from "../../../assets/icons/Home/layer/arrow-right.svg";
import arrowDown from "../../../assets/icons/Home/layer/arrow-down.svg";

const LayerList = () => {
  const { pageId } = useParams()
  const [layers, setLayers] = useState([])
  const [expanded, setExpanded] = useState({})
  const [newLayerName, setNewLayerName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Demo actions 
  const demoActions = [
    { id: 1, name: "RESIZE", icon: <FaExpand /> },
    { id: 2, name: "DRAG", icon: <FaArrowsAlt /> },
    { id: 3, name: "3D ROTATION", icon: <FaCube /> }
  ]

  const loadLayers = async () => {
    if (!pageId) return

    setIsLoading(true)
    setError(null)

    try {
      const layersData = await getAllLayers(pageId)
      console.log("Layers Response:", layersData)
      
      const layersArray = Array.isArray(layersData) ? layersData : layersData.layers ? layersData.layers : []

      setLayers(
        layersArray.map((layer) => ({
          ...layer,
          id: layer._id || layer.id, 
          children: layer.children || [], 
        })),
      )
    } catch (error) {
      console.error("Error loading layers:", error)
      setError("Failed to load layers. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (pageId) {
      loadLayers()
    }
  }, [pageId])

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const deleteChild = (parentId, childIndex) => {
    setLayers((prevLayers) =>
      prevLayers.map((layer) =>
        layer.id === parentId
          ? {
              ...layer,
              children: layer.children.filter((_, i) => i !== childIndex),
            }
          : layer,
      ),
    )
  }

  const handleAddLayer = async () => {
    if (!newLayerName || !pageId) return

    try {
      const newLayer = { name: newLayerName }
      const createdLayer = await createLayer(pageId, newLayer)

      const layerToAdd = {
        ...createdLayer,
        id: createdLayer._id || createdLayer.id,
        children: createdLayer.children || [],
      }

      setLayers((prev) => [...prev, layerToAdd])
      setNewLayerName("")
      loadLayers()
    } catch (error) {
      console.error("Error adding layer:", error)
      setError("Failed to add layer. Please try again.")
    }
  }

  const handleDeleteLayer = async (layerId, e) => {
    if (!pageId) return

    e.stopPropagation() 

    try {
      await deleteLayer(pageId, layerId)
      setLayers((prev) => prev.filter((layer) => layer.id !== layerId))
    } catch (error) {
      console.error("Error deleting layer:", error)
      setError("Failed to delete layer. Please try again.")
    }
  }

  const handleActionClick = (actionName, layerId, e) => {
    e.stopPropagation()
 
    console.log(`Action "${actionName}" performed on layer ID: ${layerId}`)
   
  }

  return (
    <div className="file-list-section">
      <div className="layer-list">
        <h3>LAYERS</h3>
        <div className="layer-input-container">
          <input
            type="text"
            value={newLayerName}
            onChange={(e) => setNewLayerName(e.target.value)}
            placeholder="Enter new layer name"
          />
          <button onClick={handleAddLayer} disabled={!newLayerName || isLoading}>
            Add Layer
          </button>
        </div>

        {error && <p className="error-message">{error}</p>}

        {isLoading ? (
          <p>Loading layers...</p>
        ) : (
          <ul className="layers-container">
            {layers.length > 0 ? (
              layers.map((layer) => (
                <li key={layer.id} className="layer-list-item">
                  <div className="layer-item" onClick={() => toggleExpand(layer.id)}>
                    <span className="layer-arrow">
                      {expanded[layer.id] ? (
                        <img src={arrowDown} alt="Expand" width="8" height="8" />
                      ) : (
                        <img src={arrowRight} alt="Collapse" width="8" height="8" />
                      )}
                    </span>
                    <span className="layer-name">{layer.name}</span>
                    <FaTrash className="delete-icon" onClick={(e) => handleDeleteLayer(layer.id, e)} />
                  </div>

                  {expanded[layer.id] && (
                    <ul className="nested">
                      {/* this is just for demo purpose */}
                      {demoActions.map(action => (
                        <li key={action.id} className="nested-item action-item">
                          <div 
                            className="action-button"
                            onClick={(e) => handleActionClick(action.name, layer.id, e)}
                          >
                            <span className="action-icon">{action.icon}</span>
                            <span className="action-name">{action.name}</span>
                          </div>
                        </li>
                      ))}
                      
                     
                      {layer.children && layer.children.length > 0 && 
                        layer.children.map((child, index) => (
                          <li key={`child-${index}`} className="nested-item">
                            {child}
                            <FaTrash 
                              className="delete-icon" 
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteChild(layer.id, index);
                              }} 
                            />
                          </li>
                        ))
                      }
                    </ul>
                  )}
                </li>
              ))
            ) : (
              <p>No layers available</p>
            )}
          </ul>
        )}
      </div>
    </div>
  )
}

export default LayerList