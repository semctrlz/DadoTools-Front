import axios from 'axios';

const api = axios.create({
  baseURL: 'http://159.65.71.178:3333/',
});

export default api;
