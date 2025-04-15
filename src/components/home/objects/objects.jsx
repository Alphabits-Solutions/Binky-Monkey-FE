import React, { useState } from "react";
import AudioList from "../audio/AudioList";
import ObjectList from "./ObjectList";


const objects = () => {
  const [refresh, setRefresh] = useState(false);

  // const handleUploadSuccess = () => {
  //   setRefresh(!refresh);
  // };

  return (
    
      <div className="file-list-section">
       
        {/* <AudioList key={refresh} /> */}
        <ObjectList key={refresh}/>
      </div>

  );
};

export default objects;
