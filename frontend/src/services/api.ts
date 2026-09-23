const API_BASE = 'http://127.0.0.1:8000/api';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'STUDENT' | 'SUPER_ADMIN' | 'ASSESSMENT_ADMIN' | 'REVIEWER';
  is_active: boolean;
  created_at: string;
}

export interface QuestionAdmin {
  id: number;
  question_id: string;
  level_num: number;
  level_name: string;
  topic?: string;
  difficulty?: string;
  title: string;
  problem_statement: string;
  input_format?: string;
  output_format?: string;
  question_max_marks: number;
  hidden_test_cases_count: number;
  sample_test_cases: { id: number; input_data: string; expected_output: string; is_sample: boolean }[];
}

export const api = {
  getToken: () => localStorage.getItem('token'),

  setToken: (token: string) => localStorage.setItem('token', token),

  clearToken: () => localStorage.removeItem('token'),

  async fetch(endpoint: string, options: RequestInit = {}) {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({ detail: 'An error occurred' }));
      throw new Error(errData.detail || 'Request failed');
    }
    return response.json();
  },

  async login(email: string, password: string) {
    const data = await this.fetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.access_token);
    return data;
  },

  async register(email: string, full_name: string, password: string, role = 'STUDENT') {
    return this.fetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, full_name, password, role }),
    });
  },

  async getProfile() {
    return this.fetch('/auth/me');
  },

  async getAdminQuestionBank(level?: number): Promise<QuestionAdmin[]> {
    const query = level ? `?level=${level}` : '';
    return this.fetch(`/questions/admin/bank${query}`);
  },

  async getVerifyCounts() {
    return this.fetch('/questions/verify-counts');
  },

  async getAdminStats() {
    return this.fetch('/admin/stats');
  },

  async getAdminStudents() {
    return this.fetch('/admin/students');
  },

  async getStudentDashboardStats() {
    return this.fetch('/student/dashboard-stats');
  },

  async getStudentHistory() {
    return this.fetch('/student/history');
  }
};
