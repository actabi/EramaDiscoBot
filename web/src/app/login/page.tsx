'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Discord } from "lucide-react";

export default function LoginPage() {
  const handleLogin = () => {
    // Redirection vers l'endpoint d'authentification Discord
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/discord`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-[380px]">
        <CardHeader>
          <CardTitle>Connexion</CardTitle>
          <CardDescription>
            Connectez-vous avec votre compte Discord pour accéder à votre espace freelance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            className="w-full flex items-center justify-center gap-2"
            onClick={handleLogin}
          >
            <Discord className="h-5 w-5" />
            Connexion avec Discord
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}