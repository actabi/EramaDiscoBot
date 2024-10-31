// src/services/api/profile.ts

import { FreelanceProfile, CreateProfileDTO, UpdateProfileDTO, APIResponse, APIError } from '@/types/profile';

class ProfileService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = '/api/profile';
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error: APIError = await response.json();
      throw new Error(error.message || 'Une erreur est survenue');
    }
    return response.json();
  }

  async getProfile(): Promise<APIResponse<FreelanceProfile>> {
    try {
      const response = await fetch(this.baseUrl, {
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include', // Pour envoyer les cookies
      });
      return this.handleResponse<APIResponse<FreelanceProfile>>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateProfile(data: UpdateProfileDTO): Promise<APIResponse<FreelanceProfile>> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      return this.handleResponse<APIResponse<FreelanceProfile>>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async uploadProfileImage(file: File): Promise<APIResponse<{ imageUrl: string }>> {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${this.baseUrl}/image`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      return this.handleResponse<APIResponse<{ imageUrl: string }>>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    console.error('API Error:', error);
    return error instanceof Error ? error : new Error('Une erreur est survenue');
  }
}

export const profileService = new ProfileService();