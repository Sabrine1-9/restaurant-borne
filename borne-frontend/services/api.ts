import axios from "axios";
import { Category, Product, Order } from "../types";

/**
 * api.ts acts as the single bridge between the React frontend and NestJS backend.
 * All HTTP requests (GET, POST, PATCH, DELETE) go through this configured tool so we
 * don't have to repeatedly type 'http://localhost:3000' in our components.
 */
const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
});

/**
 * The interceptor automatically attaches the JWT token
 * to every outgoing request when the user is logged in.
 */
API.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

/* =========================
   CATEGORIES
========================= */

export const getCategories = async (
  lang: string = "fr",
  excludePages: boolean = false
): Promise<Category[]> => {
  const response = await API.get<Category[]>(
    `/categories?lang=${lang}&excludePages=${excludePages}`
  );

  return response.data;
};

export const createCategory = async (
  category: Partial<Category>
): Promise<Category> => {
  const response = await API.post<Category>("/categories", category);
  return response.data;
};

export const deleteCategory = async (id: number): Promise<void> => {
  await API.delete(`/categories/${id}`);
};

export const updateCategory = async (
  id: number,
  category: Partial<Category>
): Promise<Category> => {
  const response = await API.patch<Category>(
    `/categories/${id}`,
    category
  );

  return response.data;
};

/* =========================
   PRODUCTS
========================= */

export const getProducts = async (
  lang: string = "fr",
  excludePages: boolean = false
): Promise<Product[]> => {
  const response = await API.get<Product[]>(
    `/products?lang=${lang}&excludePages=${excludePages}`
  );

  return response.data;
};

export const createProduct = async (
  product: Partial<Product>
): Promise<Product> => {
  const response = await API.post<Product>("/products", product);
  return response.data;
};

export const deleteProduct = async (id: number): Promise<void> => {
  await API.delete(`/products/${id}`);
};

export const updateProduct = async (
  id: number,
  product: Partial<Product>
): Promise<Product> => {
  const response = await API.patch<Product>(
    `/products/${id}`,
    product
  );

  return response.data;
};

/* =========================
   ORDERS
========================= */

export const createOrder = async (
  items: {
    productId: number;
    quantity: number;
    selectedOptions?: string;
  }[]
): Promise<Order> => {
  const response = await API.post<Order>("/orders", {
    items,
  });

  return response.data;
};

/* =========================
   IMAGE UPLOAD
========================= */

export const uploadImage = async (
  file: File
): Promise<{ filename: string }> => {
  const formData = new FormData();

  formData.append("image", file);

  const response = await API.post(
    "/products/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

/* =========================
   USERS
========================= */

export type UserRole =
  | "SUPER_ADMIN"
  | "ADMIN";

export interface AdminUser {
  ID: number;
  username: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const getUsers = async (): Promise<AdminUser[]> => {
  const response =
    await API.get<AdminUser[]>("/users");

  return response.data;
};

export const createUser = async (data: {
  username: string;
  password: string;
  role?: UserRole;
}): Promise<AdminUser> => {
  const response =
    await API.post<AdminUser>("/users", data);

  return response.data;
};

export const updateUser = async (
  id: number,
  data: {
    username?: string;
    role?: UserRole;
  }
): Promise<AdminUser> => {
  const response =
    await API.patch<AdminUser>(
      `/users/${id}`,
      data
    );

  return response.data;
};

export const changeUserPassword = async (
  id: number,
  password: string
): Promise<{ message: string }> => {
  const response = await API.patch(
    `/users/${id}/password`,
    {
      password,
    }
  );

  return response.data;
};

export const changeUserStatus = async (
  id: number,
  isActive: boolean
): Promise<AdminUser> => {
  const response =
    await API.patch<AdminUser>(
      `/users/${id}/status`,
      {
        isActive,
      }
    );

  return response.data;
};

export const deleteUser = async (
  id: number
): Promise<{ message: string }> => {
  const response =
    await API.delete(`/users/${id}`);

  return response.data;
};

export default API;