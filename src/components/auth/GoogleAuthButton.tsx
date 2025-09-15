import React from 'react';
import { Loader } from 'lucide-react';
import { Button, buttonVariants } from '../ui/Button';
import useAuthStore from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';
import { VariantProps } from 'class-variance-authority';

interface GoogleAuthButtonProps extends VariantProps<typeof buttonVariants> {
  className?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  variant = 'outline',
  size = 'default',
  className = '',
  onSuccess,
  onError
}) => {
  const { loginWithGoogle, isGoogleLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      // Vérifier si Firebase est configuré
      if (!import.meta.env.VITE_FIREBASE_API_KEY) {
        throw new Error('L\'authentification Google n\'est pas configurée. Utilisez l\'authentification par email.');
      }
      
      await loginWithGoogle();
      
      if (onSuccess) {
        onSuccess();
      } else {
  navigate(ROUTES.DASHBOARD);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la connexion Google';
      
      if (onError) {
        onError(errorMessage);
      } else {
        alert(`❌ ${errorMessage}`);
      }
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={`w-full ${className}`}
      onClick={handleGoogleLogin}
      disabled={isGoogleLoading}
    >
      {isGoogleLoading ? (
        <>
          <Loader className="animate-spin h-4 w-4 mr-2" />
          Connexion en cours...
        </>
      ) : (
        <>
          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continuer avec Google
        </>
      )}
    </Button>
  );
};