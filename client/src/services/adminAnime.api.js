import axios from "axios";

const API_URL = "http://localhost:5000/api/admin/anime";

const authHeader = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const getAllAnime = (token) => {
  return axios.get(API_URL, token ? authHeader(token) : undefined);
};

export const createAnime = (payload, token) => {
  return axios.post(API_URL, payload, authHeader(token));
};

export const updateAnime = (id, payload, token) => {
  return axios.put(`${API_URL}/${id}`, payload, authHeader(token));
};

export const deleteAnime = (id, token) => {
  return axios.delete(`${API_URL}/${id}`, authHeader(token));
};

export const createVideoPayload = (form) => ({
  ...form,
  url: form.videoProvider === "local" ? form.videoUrl : form.muxPlaybackId,
});