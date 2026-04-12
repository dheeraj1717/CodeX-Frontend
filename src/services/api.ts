import axios from 'axios';

export const problemApi = axios.create({
  baseURL: 'http://localhost:4000/api/v1',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

export const submissionApi = axios.create({
  baseURL: 'http://localhost:4002/api/v1',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});
