import React, { useState } from "react";
import AudioList from "../audio/AudioList";


const more = () => {
  const [refresh, setRefresh] = useState(false);

  // const handleUploadSuccess = () => {
  //   setRefresh(!refresh);
  // };

  return (
    
      <div className="file-list-section">
       
        <AudioList key={refresh} />
      </div>

  );
};

export default more;
