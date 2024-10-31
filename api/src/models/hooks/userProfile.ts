// src/hooks/useProfile.ts

import { useState, useEffect } from 'react';
import { FreelanceProfile, UpdateProfileDTO } from '@/types/profile';
import { profileService } from '@/services/api/profile';
import { useToast } from '@/components/ui/use-toast';

interface UseProfileReturn {
  profile: FreelanceProfile | null;
  isLoading: boolean;
  error: Error | null;
  updateProfile: (data: UpdateProfileDTO) => Promise<void>;
  uploadProfileImage: (file: File) => Promise<string>;
}

export function useProfile(): UseProfileReturn {
  const [profile, setProfile] = useState<FreelanceProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const response = await profileService.getProfile();
      setProfile(response.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load profile'));
      toast({
        title: "Erreur",
        description: "Impossible de charger le profil",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: UpdateProfileDTO) => {
    try {
      setIsLoading(true);
      const response = await profileService.updateProfile(data);
      setProfile(response.data);
      toast({
        title: "Succès",
        description: "Profil mis à jour avec succès",
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update profile');
      setError(error);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadProfileImage = async (file: File): Promise<string> => {
    try {
      setIsLoading(true);
      const response = await profileService.uploadProfileImage(file);
      toast({
        title: "Succès",
        description: "Image de profil mise à jour",
      });
      return response.data.imageUrl;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to upload image');
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    uploadProfileImage,
  };
}