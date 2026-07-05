import apiClient from "./axios";

export async function request<T>(url: string, options?: any): Promise<T> {
  const response = await apiClient({ url, ...options });
  return response.data;
}
