import React, { useState } from "react";
// import FileUpload from "../assets/FileUpload";
import FileList from "../assets/FileLists";


const Asset = () => {
  const [refresh, setRefresh] = useState(false);

  // const handleUploadSuccess = () => {
  //   setRefresh(!refresh);
  // };

  return (
    <div className="asset-manager">
      {/* Title */}


      {/* Upload Section
      <div className="card upload-section">
        <h2>Upload a File</h2>
        <FileUpload onUploadSuccess={handleUploadSuccess} />
      </div> */}

      {/* File List Section */}
      <div className="file-list-section">
        {/* <h2>Uploaded Files</h2> */}
        <FileList key={refresh} />
      </div>
    </div>
  );
};

export default Asset;
