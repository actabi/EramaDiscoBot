// src/app/auth/callback/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      // Stocke le token
      localStorage.setItem('auth_token', token);
      
      // Redirige vers le profil
      router.push('/profile');
    } else {
      // En cas d'erreur, redirige vers la page de login
      router.push('/login');
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p>Finalisation de la connexion...</p>
      </div>
    </div>
  );
}