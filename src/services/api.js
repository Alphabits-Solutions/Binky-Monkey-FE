import axios from "axios";

// Access environment variables correctly
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
const API_ASSET_URL= "/asset";
const API_AUDIO_URL= "http://localhost:8000/audio";
const API_OBJECT_URL= "http://localhost:8000/object";


const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Register User
export const registerUser = async (userData) => {
  try {
    const response = await api.post("/auth/register", userData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Login User
export const loginUser = async (credentials) => {
  try {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const createActivity = async (activityData) => {
  try {
    const response = await api.post("/activity", activityData);
    return response.data;
  } catch (error) {
    console.error("Error creating activity:", error);
    throw error.response?.data || error;
  }
};

//Get All Activity
export const getAllActivities = async () => {
  try {
    const response = await api.get("/activity");
    return response.data;
  } catch (error) {
    console.error("Error fetching activities:", error);
    throw error.response?.data || error;
  }
};

// Get activity by ID
export const getActivityById = async (activityId) => {
  try {
    const response = await api.get(`/activity/${activityId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching activity:", error);
    throw error.response?.data || error;
  }
};

// Update activity
export const updateActivity = async (activityId, updatedData) => {
  try {
    const response = await api.put(`/activity/${activityId}`, updatedData);
    return response.data;
  } catch (error) {
    console.error("Error updating activity:", error);
    throw error.response?.data || error;
  }
};

// Delete activity
export const deleteActivity = async (activityId) => {
  try {
    const response = await api.delete(`/activity/${activityId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting activity:", error);
    throw error.response?.data || error;
  }
};

export const toggleActivityStatus = async (activityId, currentStatus) => {
  try {
    const response = await api.put(
      `/activity/${activityId}`,
      { isEnabled: !currentStatus },
    );

    return response.data;
  } catch (error) {
    console.error("Error toggling activity status:", error.message || error);
    throw new Error(
      error.response?.data?.message || error.message || "Failed to toggle activity status."
    );
  }
};

export const createPage = async ( data) => {
  try {
    const response = await api.post(`/page`, data);
    return response.data;
  } catch (error) {
    console.error("Error creating page:", error);
    throw error.response?.data || error;
  }
};

export const getAllPages = async (activityId) => {
  try {
    const response = await api.get(`/page`, {
      params: { activityId },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching pages:", error);
    throw error.response?.data || error;
  }
};

export const updatePage = async (pageId, pageData) => {
  try {
    const response = await api.put(`/page/${pageId}`, pageData);
    return response.data;
  } catch (error) {
    console.error("Error updating page:", error);
    throw error.response?.data || error;
  }
};


export const deletePage = async (pageId) => {
  try {
    const response = await api.delete(`/page/${pageId}`)
    return response.data;
  } catch (error) {
    console.error("Error deleting page:", error);
    throw error.response?.data || error;
  }
};


// Layer API
export const getAllLayers = async (pageId) => {
  const response = await api.get(`/layer`, {
    params: { pageId },
  });
  return response.data;
};

export const createLayer = async ( layerData) => {
  const response = await api.post(`/layer`, layerData, {
  });
  return response.data;
};

export const deleteLayer = async ( layerId ) => {
  try {
    await api.delete(`layer/${layerId}`)
  } catch (error) {
    console.error("Error deleting layer:", error)
    throw error
  }
}


//Assets uploading
export const uploadAsset = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await axios.post(`${API_BASE_URL}${API_ASSET_URL}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};
//Get All Assets

export const getAllAssets = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}${API_ASSET_URL}`);
    return response.data.files;
  } catch (error) {
    console.error("Error fetching files:", error);
    throw error;
  }
};

// services/api.js
export const deleteAsset = async (id) => {
  const response = await axios.delete(`${API_BASE_URL}${API_ASSET_URL}/${id}`);
  if (!response.status == 200) {
    throw new Error("Failed to delete asset");
  }
  return response;
};



export const getAllAudios = async () => {
  try {
    const response = await axios.get(API_AUDIO_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching audios:", error);
    return [];
  }
};

export const uploadAudio = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await axios.post(API_AUDIO_URL, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.error("Audio upload failed:", error);
    throw error;
  }
};

export const deleteAudio = async (id) => {
  const response = await axios.delete(`${API_AUDIO_URL}/${id}`);
  if (!response.status == 200) {
    throw new Error("Failed to delete Audio");
  }
  return response;
};

export const uploadObject = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await axios.post(API_OBJECT_URL, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.error("Audio upload failed:", error);
    throw error;
  }
};

export const getAllObjects = async () => {
  try {
    const response = await axios.get(API_OBJECT_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching audios:", error);
    return [];
  }}

  export const deleteObject = async (objectId) => {
    try {
      const response = await api.delete(`object/${objectId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting activity:", error);
      throw error.response?.data || error;
    }
  };

export default api;