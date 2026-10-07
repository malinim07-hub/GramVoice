import api from "./api";

interface RegisterUserData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: "citizen" | "officer" | "admin";
  preferredLanguage: "en" | "ta";
}

interface LoginUserData {
  email: string;
  password: string;
}

export const registerUser = (data: RegisterUserData) => {
  return api.post("/auth/register", data);
};

export const loginUser = (data: LoginUserData) => {
  return api.post("/auth/login", data);
};