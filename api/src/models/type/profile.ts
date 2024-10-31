// src/types/profile.ts

export interface Skill {
    id: string;
    name: string;
    level: 'beginner' | 'intermediate' | 'expert';
  }
  
  export interface FreelanceProfile {
    id: string;
    userId: string;
    skills: Skill[];
    hourlyRate: number;
    availability: string;
    description: string;
    portfolio: string;
    github: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export type CreateProfileDTO = Omit<FreelanceProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;
  export type UpdateProfileDTO = Partial<CreateProfileDTO>;
  
  // Types pour les réponses API
  export interface APIResponse<T> {
    data: T;
    message?: string;
  }
  
  export interface APIError {
    message: string;
    errors?: Record<string, string[]>;
  }