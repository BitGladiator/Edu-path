const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

class ApiClient {
  constructor() {
    this.tokenKey = "edupath_token";
    this.userKey = "edupath_user";
  }

  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  setToken(token) {
    if (token) {
      localStorage.setItem(this.tokenKey, token);
    } else {
      localStorage.removeItem(this.tokenKey);
    }
  }

  getUser() {
    try {
      const data = localStorage.getItem(this.userKey);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  setUser(user) {
    if (user) {
      localStorage.setItem(this.userKey, JSON.stringify(user));
    } else {
      localStorage.removeItem(this.userKey);
    }
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      ...(options.headers || {}),
    };

    // If not FormData, default to application/json
    if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    const token = this.getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      // Handle 401 Unauthorized
      if (response.status === 401) {
        // Clear token if expired
        // this.setToken(null);
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: response.statusText }));
        const error = new Error(errorData.detail || "API Request Failed");
        error.status = response.status;
        error.data = errorData;
        throw error;
      }

      return await response.json();
    } catch (err) {
      console.error(`API Error [${options.method || "GET"} ${endpoint}]:`, err);
      throw err;
    }
  }

  get(endpoint, headers = {}) {
    return this.request(endpoint, { method: "GET", headers });
  }

  post(endpoint, body, headers = {}) {
    return this.request(endpoint, {
      method: "POST",
      headers,
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  put(endpoint, body, headers = {}) {
    return this.request(endpoint, {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
    });
  }

  delete(endpoint, headers = {}) {
    return this.request(endpoint, { method: "DELETE", headers });
  }
}

export const apiClient = new ApiClient();
