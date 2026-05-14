import axios from 'axios';

export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({ baseURL: BASE_URL });

export const uploadFile = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await api.post('/api/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => onProgress && onProgress(Math.round((e.loaded * 100) / e.total)),
  });
  return res.data;
};

export const getChartData = async (sessionId, chartType, xCol, yCol, bins = 20) => {
  const res = await api.post('/api/chart-data', {
    session_id: sessionId,
    chart_type: chartType,
    x_col: xCol,
    y_col: yCol,
    bins,
  });
  return res.data;
};

export const getCustomChartData = async (sessionId, chartType, xCol, yCol, aggregation = 'mean', bins = 20) => {
  const res = await api.post('/api/custom-chart', {
    session_id: sessionId,
    chart_type: chartType,
    x_col: xCol,
    y_col: yCol,
    aggregation,
    bins,
  });
  return res.data;
};

export const cleanData = async (sessionId, operations) => {
  const res = await api.post('/api/clean-data', {
    session_id: sessionId,
    operations,
  });
  return res.data;
};

export const getDownloadUrl = (sessionId) => {
  return `${BASE_URL}/api/download?session_id=${sessionId}`;
};
