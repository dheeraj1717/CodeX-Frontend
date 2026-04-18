import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const problemApi = axios.create({
  baseURL: `${API_BASE_URL}/problems/api/v1`,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

export const submissionApi = axios.create({
  baseURL: `${API_BASE_URL}/submissions/api/v1`,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});
