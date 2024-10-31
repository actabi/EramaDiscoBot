import { useState } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export interface FreelanceProfileProps {
  initialData?: {
    skills: string[];
    hourlyRate: string;
    availability: string;
    description: string;
    portfolio: string;
    github: string;
  };
  onSave?: (data: any) => Promise<void>;
}

const FreelanceProfile: React.FC<FreelanceProfileProps> = ({ 
  initialData,
  onSave 
}) => {
  const [profile, setProfile] = useState(initialData || {
    skills: [],
    hourlyRate: '',
    availability: '',
    description: '',
    portfolio: '',
    github: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onSave) {
      await onSave(profile);
    }
  };

  // ... reste du composant comme avant ...
};

export default FreelanceProfile;