// src/app/profile/page.tsx
'use client';

import { useProfile } from '@/hooks/useProfile';
import FreelanceProfile from '@/components/profile/FreelanceProfile';
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function ProfilePage() {
  const {
    profile,
    isLoading,
    error,
    updateProfile,
    uploadProfileImage
  } = useProfile();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl text-red-600 mb-4">Erreur</h1>
        <p className="mb-4">{error.message}</p>
        <Button onClick={() => window.location.reload()}>
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Mon Profil Freelance</h1>
      <FreelanceProfile 
        initialData={profile} 
        onSave={updateProfile}
        onImageUpload={uploadProfileImage}
      />
    </div>
  );
}