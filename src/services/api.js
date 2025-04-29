import axios from "axios";

// Access environment variables correctly
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
const API_ASSET_URL= "/asset";
const API_AUDIO_URL= "http://localhost:8000/audio";

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


export const deletePage = async ( pageId) => {
  try {
    const response = await api.delete(`/page/${pageId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting page:", error);
    throw error.response?.data || error;
  }
};


// Layer API
export const getAllLayers = async (pageId) => {
  try {
    const response = await api.get(`/page/${pageId}/layer`)
    return response.data
  } catch (error) {
    console.error("Error fetching layers:", error)
    throw error
  }
}

export const createLayer = async (pageId, newLayer) => {
  try {
    const response = await api.post(`/page/${pageId}/layer`, newLayer)
    return response.data
  } catch (error) {
    console.error("Error creating layer:", error)
    throw error
  }
}

export const deleteLayer = async (pageId, layerId) => {
  try {
    await api.delete(`/page/${pageId}/layer/${layerId}`)
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

export default api;