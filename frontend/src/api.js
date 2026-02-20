// src/api.js
import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:3000", // Ajusta al puerto de tu backend
});