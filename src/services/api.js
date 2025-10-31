import axios from "axios";

const api = axios.create({
    // baseURL: "http://192.168.5.242:3333/",
    // baseURL: "https://api.passebem.co.mz/",
    baseURL: "https://passe-bem-mobile-new-fork-8bbo.vercel.app/",
    timeout: 15000, // 15 segundos timeout
    headers: {
        'Content-Type': 'application/json',
    }
})

// Interceptor para logs de requisições
api.interceptors.request.use(
    (config) => {
        console.log('API Request:', config.method?.toUpperCase(), config.url);
        return config;
    },
    (error) => {
        console.log('API Request Error:', error);
        return Promise.reject(error);
    }
);

// Interceptor para logs de respostas
api.interceptors.response.use(
    (response) => {
        console.log('API Response:', response.status, response.config.url);
        return response;
    },
    (error) => {
        if (error.response) {
            console.log('API Response Error:', error.response.status, error.response.data);
        } else if (error.request) {
            console.log('API Network Error:', error.message);
        } else {
            console.log('API Error:', error.message);
        }
        return Promise.reject(error);
    }
);

export default api;