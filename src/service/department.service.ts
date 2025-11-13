import axios, { AxiosError, AxiosResponse } from "axios";
import { BASE_URL } from "../lib/api/apiUrl";
import { Department } from "../types/department";
import { ApiResponse } from "../types/ApiResponse";

const handleAxiosError = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ message?: string }>;
        return axiosError.response?.data?.message || axiosError.message;
    }
    return "An unexpected error occurred";
};

export const createDepartment = async (data: FormData): Promise<Department> => {
    try {
        const response: AxiosResponse<ApiResponse<Department>> = await axios.post(
            BASE_URL.DEPARTMENT_API.CREATE_DEPARTMENT,
            data,
            { headers: { "Content-Type": "multipart/form-data" } }
        );
        return response.data.data;
    } catch (error) {
        throw new Error(handleAxiosError(error));
    }
};

export const getDepartments = async (): Promise<Department[]> => {
    try {
        const response: AxiosResponse<ApiResponse<{ departments: Department[]; pagination: any }>> = await axios.get(
            BASE_URL.DEPARTMENT_API.GET_DEPARTMENTS
        );
        // Extract the array
        return response.data.data.departments;
    } catch (error) {
        throw new Error(handleAxiosError(error));
    }
};


export const getDepartment = async (id: string): Promise<Department> => {
    try {
        const response: AxiosResponse<ApiResponse<Department>> = await axios.get(
            BASE_URL.DEPARTMENT_API.GET_DEPARTMENT(id)
        );
        return response.data.data;
    } catch (error) {
        throw new Error(handleAxiosError(error));
    }
};

export const updateDepartment = async (id: string, data: FormData): Promise<Department> => {
    try {
        const response: AxiosResponse<ApiResponse<Department>> = await axios.put(
            BASE_URL.DEPARTMENT_API.UPDATE_DEPARTMENT(id),
            data,
            { headers: { "Content-Type": "multipart/form-data" } }
        );
        return response.data.data;
    } catch (error) {
        throw new Error(handleAxiosError(error));
    }
};

export const deleteDepartment = async (id: string): Promise<void> => {
    try {
        await axios.delete(BASE_URL.DEPARTMENT_API.DELETE_DEPARTMENT(id));
    } catch (error) {
        throw new Error(handleAxiosError(error));
    }
};
