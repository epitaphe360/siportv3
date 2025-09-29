import { useState } from 'react';
import { Building2 } from 'lucide-react';

interface LogoWithFallbackProps {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackIcon?: React.ReactNode;
}

export default function LogoWithFallback({ 
  src, 
  alt, 
  className = "h-12 w-12 rounded-lg object-cover",
  fallbackIcon 
}: LogoWithFallbackProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fonction pour générer un placeholder SVG avec les initiales
  const generatePlaceholder = (name: string) => {
    const initials = name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
    
    // Couleurs prédéfinies basées sur le hash du nom
    const colors = [
      '#1e40af', '#7c3aed', '#dc2626', '#059669', 
      '#ea580c', '#0891b2', '#be185d', '#4338ca'
    ];
    const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    const backgroundColor = colors[colorIndex];

    const svgData = `
      <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <rect width="48" height="48" rx="6" fill="${backgroundColor}"/>
        <text x="24" y="30" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="600" font-size="16">${initials}</text>
      </svg>
    `;
    
    return `data:image/svg+xml;base64,${btoa(svgData)}`;
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // Si pas de src ou erreur, afficher le fallback
  if (!src || hasError) {
    if (fallbackIcon) {
      return (
        <div className={`${className} bg-gray-100 flex items-center justify-center text-gray-400`}>
          {fallbackIcon}
        </div>
      );
    }
    
    return (
      <img
        src={generatePlaceholder(alt)}
        alt={alt}
        className={className}
      />
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className={`${className} bg-gray-200 animate-pulse flex items-center justify-center`}>
          <Building2 className="h-6 w-6 text-gray-400" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0 absolute' : 'opacity-100'} transition-opacity duration-200`}
        onError={handleError}
        onLoad={handleLoad}
        loading="lazy"
      />
    </div>
  );
}