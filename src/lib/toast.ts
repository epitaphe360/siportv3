/**
 * Unified Toast Wrapper
 * 
 * Ce fichier unifie l'utilisation des toasts dans l'application.
 * Utilise react-hot-toast car c'est ce qui est configuré dans App.tsx avec <Toaster />
 * 
 * USAGE:
 * import { toast } from '@/lib/toast';
 * toast.success('Message');
 * toast.error('Erreur');
 */

import hotToast from 'react-hot-toast';

export const toast = {
  success: (message: string, options?: { id?: string; duration?: number }) => {
    return hotToast.success(message, {
      id: options?.id,
      duration: options?.duration || 4000,
    });
  },
  
  error: (message: string, options?: { id?: string; duration?: number }) => {
    return hotToast.error(message, {
      id: options?.id,
      duration: options?.duration || 5000,
    });
  },
  
  info: (message: string, options?: { id?: string; duration?: number }) => {
    return hotToast(message, {
      id: options?.id,
      duration: options?.duration || 4000,
      icon: 'ℹ️',
    });
  },
  
  warning: (message: string, options?: { id?: string; duration?: number }) => {
    return hotToast(message, {
      id: options?.id,
      duration: options?.duration || 4000,
      icon: '⚠️',
      style: {
        background: '#FEF3C7',
        color: '#92400E',
      },
    });
  },
  
  loading: (message: string, options?: { id?: string }) => {
    return hotToast.loading(message, {
      id: options?.id,
    });
  },
  
  dismiss: (toastId?: string) => {
    return hotToast.dismiss(toastId);
  },
  
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return hotToast.promise(promise, messages);
  },
};

export default toast;
