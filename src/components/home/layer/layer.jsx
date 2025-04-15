import React, { useState } from "react";
import LayerList from "./layerlist";


const layer = () => {
  const [refresh, setRefresh] = useState(false);

  // const handleUploadSuccess = () => {
  //   setRefresh(!refresh);
  // };

  return (
    
      <div className="file-list-section">
       
        <LayerList key={refresh} />
      </div>

  );
};

export default layer;
