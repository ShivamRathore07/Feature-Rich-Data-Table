"use client";
import { useState } from "react";
import axios from "axios";

interface Location {
  id: number;
  name: string;
  city: string;
  country: string;
  province: string;
  code?: string;
  createdAt: string;
  updatedAt: string;
}

export const useApi = (baseUrl: string) => {
  const [data, setData] = useState<Location[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshData, setRefreshData] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = async (method: string, endpoint: string, payload: Location | null = null) => {
    setError('');
    try {
      const response = await axios({
        method,
        url: `${baseUrl}${endpoint}`,
        data: payload,
        timeout: 5000,
      });

      return response;
    } catch (err: any) {
      if (axios.isCancel(err)) {
        setError("Request was canceled.");
      } else {
        setError(`Error: ${err.message}`);
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  const get = async (endpoint: string) => {
    const response = await fetchData("get", endpoint);
    if (response) {
      setData(response.data);
      const totalCount = parseInt(response.headers["x-total-count"]);
      setTotalPages(Math.ceil(totalCount / 10));
    }
  };

  const post = async (endpoint: string, payload: Location) => {
    const response = await fetchData("post", endpoint, payload);
    if(response){
      setRefreshData(!refreshData);
    }
    return response;
  };

  const put = async (endpoint: string, payload: Location) => {
    const response = await fetchData("put", endpoint, payload);
    if(response){
      setRefreshData(!refreshData);
    }
    return response;
  };

  const del = async (endpoint: string) => {
    const response = await fetchData("delete", endpoint);
    if(response){
      setRefreshData(!refreshData);
    }
    return response;
  };

  return { data, totalPages, refreshData,  loading, error, get, post, put, del };
};
