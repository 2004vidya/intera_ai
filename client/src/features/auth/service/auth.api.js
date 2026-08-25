import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  withCredentials: true,
});

export async function register({ email, username, password }) {
  try {
    const response = await api.post("/api/auth/register", {
      email,
      username,
      password,
    });
    return response.data;
  } catch (error) {
    console.log(error);
  }
}

export async function login({ email, password }) {
  try {
    const response = await api.post("/api/auth/login", { email, password });
    return response.data;
  } catch (error) {
    console.log(error);
  }
}


export async function getMe(){
    try{
    const response = await api.get("/api/auth/me")
    return response.data;
    }catch(error){
        console.log(error);
    }
}

export async function logoutApi(){
    try{
        const response = await api.post("/api/auth/logout");
        return response.data;
    }catch(error){
        console.log(error);
    }
}