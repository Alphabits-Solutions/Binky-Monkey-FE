import axios from "axios";

// Access environment variables correctly
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
const API_ASSET_URL= "http://localhost:8000/asset";
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

//Assets uploading
export const uploadAsset = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await axios.post(API_ASSET_URL, formData, {
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
    const response = await axios.get(API_ASSET_URL);
    return response.data.files;
  } catch (error) {
    console.error("Error fetching files:", error);
    throw error;
  }
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

export default api;