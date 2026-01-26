/**
 * Project Bold Platform - API Client
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getAuthHeader(): Record<string, string> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
    });
    return response.json();
  }

  async post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: data ? JSON.stringify(data) : undefined,
    });
    return response.json();
  }

  async patch<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
    });
    return response.json();
  }

  // Specific API methods
  async getDepartments() {
    return this.get('/api/v1/departments');
  }

  async getDepartment(slug: string) {
    return this.get(`/api/v1/departments/${slug}`);
  }

  async getPolicies(params?: { department?: string; status?: string }) {
    const searchParams = new URLSearchParams(params as Record<string, string>);
    return this.get(`/api/v1/policies?${searchParams}`);
  }

  async getPolicy(id: string) {
    return this.get(`/api/v1/policies/${id}`);
  }

  async getWellnessResources(type?: string) {
    const params = type ? `?type=${type}` : '';
    return this.get(`/api/v1/wellness/resources${params}`);
  }

  async getMentorshipStatus() {
    return this.get('/api/v1/academic/mentorship');
  }

  async submitMentorshipRequest(data: {
    role: 'mentor' | 'mentee';
    disciplines: string[];
    topics: string[];
    availability: string[];
    goals: string;
    preferences: Record<string, unknown>;
  }) {
    return this.post('/api/v1/academic/mentorship/request', data);
  }

  async getServiceHours() {
    return this.get('/api/v1/civic/service-hours');
  }

  async logServiceHours(data: {
    hours: number;
    date: string;
    description: string;
    organizationName?: string;
  }) {
    return this.post('/api/v1/civic/service-hours', data);
  }

  async getEvents(params?: { department?: string; upcoming?: boolean }) {
    const searchParams = new URLSearchParams();
    if (params?.department) searchParams.set('department', params.department);
    if (params?.upcoming) searchParams.set('upcoming', 'true');
    return this.get(`/api/v1/events?${searchParams}`);
  }

  async submitFeedback(data: {
    type: string;
    category: string;
    subject: string;
    message: string;
    isAnonymous?: boolean;
  }) {
    return this.post('/api/v1/feedback', data);
  }

  async getMetrics() {
    return this.get('/api/v1/communications/metrics');
  }
}

export const api = new ApiClient(API_URL);
