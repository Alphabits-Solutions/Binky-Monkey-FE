import React, { useState } from "react";
import FileList from "../assets/FileLists";

const Asset = () => {
  const [refresh, setRefresh] = useState(false);

  return (
  
      <div className="file-list-section">
        <FileList key={refresh} />
      </div>
 
  );
};

export default Asset;