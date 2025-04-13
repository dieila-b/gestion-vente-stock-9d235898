
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";

interface ForgotPasswordFormProps {
  onBack: () => void;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
}

export function ForgotPasswordForm({ onBack, forgotPassword }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!email.trim()) {
      setError("Veuillez entrer votre adresse email.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await forgotPassword(email);
      
      if (result.success) {
        toast.success("Un lien de réinitialisation a été envoyé à votre adresse email.");
        onBack();
      } else {
        setError(result.message);
      }
    } catch (error: any) {
      console.error("Erreur lors de la demande de réinitialisation:", error);
      setError("Une erreur s'est produite lors de la demande de réinitialisation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleForgotPassword} className="space-y-4">
      {error && (
        <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
          {error}
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="votre.email@exemple.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10"
            disabled={isSubmitting}
          />
        </div>
      </div>
      
      <Button 
        type="submit" 
        className="w-full" 
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Envoi en cours...
          </>
        ) : (
          "Envoyer le lien de réinitialisation"
        )}
      </Button>
      
      <Button 
        type="button"
        variant="ghost" 
        className="w-full mt-2" 
        onClick={onBack}
        disabled={isSubmitting}
      >
        Retour à la connexion
      </Button>
    </form>
  );
}
