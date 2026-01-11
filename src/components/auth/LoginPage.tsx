import React, { useState, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Anchor,
  AlertCircle,
  Loader
} from 'lucide-react';
import { ROUTES } from '../../lib/routes';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import useAuthStore from '../../store/authStore';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useTranslation } from '../../hooks/useTranslation';
import { MoroccanPattern, MoroccanArch } from '../ui/MoroccanDecor';

export default function LoginPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true); // ✅ Par défaut activé pour meilleure UX
  const [error, setError] = useState('');
  const { login, loginWithGoogle, isLoading, isGoogleLoading } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // ✅ CRITICAL FIX: Récupérer l'URL de redirection depuis les paramètres d'URL
  const redirectUrl = useMemo(() => {
    const param = searchParams.get('redirect');
    return param ? decodeURIComponent(param) : null;
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    try {
      // ✅ Passer l'option rememberMe au login
      await login(email, password, { rememberMe });

      // ✅ Rediriger vers le dashboard approprié selon le type d'utilisateur
      const { user } = useAuthStore.getState();

      // 🔴 CRITICAL: Block VIP visitors who haven't paid
      if (user?.type === 'visitor' && (user?.visitor_level === 'vip' || user?.visitor_level === 'premium') && user?.status === 'pending_payment') {
        // Log out immediately
        await supabase.auth.signOut();

        // Show payment required error
        setError('Paiement requis pour accéder au tableau de bord VIP. Veuillez finaliser votre paiement.');

        // Redirect to payment page after 2 seconds
        setTimeout(() => {
          navigate(ROUTES.VISITOR_SUBSCRIPTION, {
            state: {
              userId: user.id,
              email: user.email,
              name: user.name,
              paymentRequired: true
            }
          });
        }, 2000);

        return;
      }

      // ✅ CRITICAL FIX: Si URL de redirection fournie, l'utiliser en priorité
      if (redirectUrl) {
        console.log('🔄 Redirection post-connexion vers:', redirectUrl);
        navigate(redirectUrl, { replace: true });
        return;
      }

      // Sinon, redirection par défaut selon le type d'utilisateur
      if (user?.type === 'admin') {
        navigate(ROUTES.ADMIN_DASHBOARD);
      } else if (user?.type === 'partner') {
        navigate(ROUTES.PARTNER_DASHBOARD);
      } else if (user?.type === 'exhibitor') {
        navigate(ROUTES.EXHIBITOR_DASHBOARD);
      } else if (user?.type === 'visitor') {
        // All visitors go to dashboard (Free and VIP)
        navigate(ROUTES.VISITOR_DASHBOARD);
      } else {
        // Par défaut pour les autres types ou si type non défini
        navigate(ROUTES.DASHBOARD);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Email ou mot de passe incorrect';
      setError(errorMessage);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) throw error;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la connexion Google';
      setError(errorMessage);
    }
  };

  const handleLinkedInLogin = async () => {
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin_oidc',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) throw error;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la connexion LinkedIn';
      setError(errorMessage);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-siports-primary via-siports-secondary to-siports-accent flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Pattern */}
      <MoroccanPattern className="opacity-10" color="white" scale={1.5} />
      
      {/* Decorative Arch at bottom */}
      <MoroccanArch className="text-white/10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full relative z-10"
      >
        <Card className="p-8 border-t-4 border-t-siports-gold shadow-2xl backdrop-blur-sm bg-white/95">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <img 
                src="/salon-logo01.png" 
                alt="SIPORTS Logo" 
                className="h-20 w-auto object-contain"
                onError={(e) => {
                  // Fallback to icon if image fails to load
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div className="items-center justify-center space-x-2 hidden">
                <div className="bg-blue-600 p-3 rounded-lg">
                  <Anchor className="h-8 w-8 text-white" />
                </div>
                <div>
                  <span className="text-2xl font-bold text-gray-900">SIPORTS</span>
                  <span className="text-sm text-gray-500 block leading-none">2026</span>
                </div>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t('login.title')}
            </h2>
            <p className="text-gray-600">
              {t('login.subtitle')}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2"
            >
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="text-red-700 text-sm">{error}</span>
            </motion.div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                {t('login.email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="votre@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                {t('login.password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  {t('login.remember_me')}
                </label>
              </div>

              <Link
                to={ROUTES.FORGOT_PASSWORD}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                {t('login.forgot_password')}
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader className="animate-spin h-4 w-4 mr-2" />
                  {t('login.connecting')}
                </>
              ) : (
                t('login.button')
              )}
            </Button>
          </form>

          {/* Quick Login Buttons */}
          <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
            <h4 className="text-sm font-semibold text-blue-900 mb-4 flex items-center">
              <span className="mr-2">🚀</span>
              {t('login.demo_accounts')}
            </h4>
            {(import.meta.env.VITE_SHOW_DEMO_LOGINS !== 'false') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Visiteur Free */}
                <div className="bg-white rounded-lg p-3 shadow-sm border-2 border-gray-200">
                  <p className="text-xs font-semibold text-gray-700 mb-1 flex items-center">
                    👥 Visiteur <span className="ml-auto text-[10px] bg-gray-100 px-2 py-0.5 rounded-full">Free</span>
                  </p>
                  <p className="text-[9px] text-gray-500 mb-2 font-mono truncate">
                    📧 visitor-free@test.siport.com
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      setEmail('visitor-free@test.siport.com');
                      setPassword('Test123456!');
                      setError('');
                      try {
                        await login('visitor-free@test.siport.com', 'Test123456!', { rememberMe: true });
                      } catch (err: any) {
                        setError(err.message || 'Erreur de connexion');
                      }
                    }}
                    className="w-full text-xs h-8 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 border-0"
                  >
                    ✅ Connexion
                  </Button>
                </div>

                {/* Visiteur VIP */}
                <div className="bg-white rounded-lg p-3 shadow-sm border-2 border-amber-300">
                  <p className="text-xs font-semibold text-gray-700 mb-1 flex items-center">
                    👑 Visiteur <span className="ml-auto text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">VIP</span>
                  </p>
                  <p className="text-[9px] text-gray-500 mb-2 font-mono truncate">
                    📧 visitor-vip@test.siport.com
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      setEmail('visitor-vip@test.siport.com');
                      setPassword('Test123456!');
                      setError('');
                      try {
                        await login('visitor-vip@test.siport.com', 'Test123456!', { rememberMe: true });
                      } catch (err: any) {
                        setError(err.message || 'Erreur de connexion');
                      }
                    }}
                    className="w-full text-xs h-8 bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 border-0"
                  >
                    ✅ Connexion
                  </Button>
                </div>

                {/* Exposant 9m² */}
                <div className="bg-white rounded-lg p-3 shadow-sm border-2 border-purple-200">
                  <p className="text-xs font-semibold text-gray-700 mb-1 flex items-center">
                    🏢 Exposant <span className="ml-auto text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">9m²</span>
                  </p>
                  <p className="text-[9px] text-gray-500 mb-2 font-mono truncate">
                    📧 exhibitor-9m@test.siport.com
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      setEmail('exhibitor-9m@test.siport.com');
                      setPassword('Test123456!');
                      setError('');
                      try {
                        await login('exhibitor-9m@test.siport.com', 'Test123456!', { rememberMe: true });
                      } catch (err: any) {
                        setError(err.message || 'Erreur de connexion');
                      }
                    }}
                    className="w-full text-xs h-8 bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 border-0"
                  >
                    ✅ Connexion
                  </Button>
                </div>

                {/* Exposant 18m² */}
                <div className="bg-white rounded-lg p-3 shadow-sm border-2 border-purple-300">
                  <p className="text-xs font-semibold text-gray-700 mb-1 flex items-center">
                    🏢 Exposant <span className="ml-auto text-[10px] bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full">18m²</span>
                  </p>
                  <p className="text-[9px] text-gray-500 mb-2 font-mono truncate">
                    📧 exhibitor-18m@test.siport.com
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      setEmail('exhibitor-18m@test.siport.com');
                      setPassword('Test123456!');
                      setError('');
                      try {
                        await login('exhibitor-18m@test.siport.com', 'Test123456!', { rememberMe: true });
                      } catch (err: any) {
                        setError(err.message || 'Erreur de connexion');
                      }
                    }}
                    className="w-full text-xs h-8 bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 border-0"
                  >
                    ✅ Connexion
                  </Button>
                </div>

                {/* Exposant 36m² */}
                <div className="bg-white rounded-lg p-3 shadow-sm border-2 border-purple-400">
                  <p className="text-xs font-semibold text-gray-700 mb-1 flex items-center">
                    🏢 Exposant <span className="ml-auto text-[10px] bg-purple-300 text-purple-900 px-2 py-0.5 rounded-full font-semibold">36m²</span>
                  </p>
                  <p className="text-[9px] text-gray-500 mb-2 font-mono truncate">
                    📧 exhibitor-36m@test.siport.com
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      setEmail('exhibitor-36m@test.siport.com');
                      setPassword('Test123456!');
                      setError('');
                      try {
                        await login('exhibitor-36m@test.siport.com', 'Test123456!', { rememberMe: true });
                      } catch (err: any) {
                        setError(err.message || 'Erreur de connexion');
                      }
                    }}
                    className="w-full text-xs h-8 bg-gradient-to-r from-purple-700 to-purple-800 text-white hover:from-purple-800 hover:to-purple-900 border-0"
                  >
                    ✅ Connexion
                  </Button>
                </div>

                {/* Exposant 54m² */}
                <div className="bg-white rounded-lg p-3 shadow-sm border-2 border-purple-500">
                  <p className="text-xs font-semibold text-gray-700 mb-1 flex items-center">
                    🏢 Exposant <span className="ml-auto text-[10px] bg-purple-400 text-purple-950 px-2 py-0.5 rounded-full font-bold">54m²</span>
                  </p>
                  <p className="text-[9px] text-gray-500 mb-2 font-mono truncate">
                    📧 exhibitor-54m@test.siport.com
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      setEmail('exhibitor-54m@test.siport.com');
                      setPassword('Test123456!');
                      setError('');
                      try {
                        await login('exhibitor-54m@test.siport.com', 'Test123456!', { rememberMe: true });
                      } catch (err: any) {
                        setError(err.message || 'Erreur de connexion');
                      }
                    }}
                    className="w-full text-xs h-8 bg-gradient-to-r from-purple-800 to-purple-900 text-white hover:from-purple-900 hover:to-purple-950 border-0"
                  >
                    ✅ Connexion
                  </Button>
                </div>

                {/* Partenaire Bronze */}
                <div className="bg-white rounded-lg p-3 shadow-sm border-2 border-orange-200">
                  <p className="text-xs font-semibold text-gray-700 mb-1 flex items-center">
                    🤝 Partenaire <span className="ml-auto text-[10px] bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">Bronze</span>
                  </p>
                  <p className="text-[9px] text-gray-500 mb-2 font-mono truncate">
                    📧 demo.partner@siports.com
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      setEmail('demo.partner@siports.com');
                      setPassword('Test123456!');
                      setError('');
                      try {
                        await login('demo.partner@siports.com', 'Test123456!', { rememberMe: true });
                      } catch (err: any) {
                        setError(err.message || 'Erreur de connexion');
                      }
                    }}
                    className="w-full text-xs h-8 bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 border-0"
                  >
                    ✅ Connexion
                  </Button>
                </div>

                {/* Partenaire Silver */}
                <div className="bg-white rounded-lg p-3 shadow-sm border-2 border-gray-300">
                  <p className="text-xs font-semibold text-gray-700 mb-1 flex items-center">
                    🤝 Partenaire <span className="ml-auto text-[10px] bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full font-semibold">Silver</span>
                  </p>
                  <p className="text-[9px] text-gray-500 mb-2 font-mono truncate">
                    📧 partner-silver@test.siport.com
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      setEmail('partner-silver@test.siport.com');
                      setPassword('Test123456!');
                      setError('');
                      try {
                        await login('partner-silver@test.siport.com', 'Test123456!', { rememberMe: true });
                      } catch (err: any) {
                        setError(err.message || 'Erreur de connexion');
                      }
                    }}
                    className="w-full text-xs h-8 bg-gradient-to-r from-gray-400 to-gray-500 text-white hover:from-gray-500 hover:to-gray-600 border-0"
                  >
                    ✅ Connexion
                  </Button>
                </div>

                {/* Partenaire Gold */}
                <div className="bg-white rounded-lg p-3 shadow-sm border-2 border-amber-300">
                  <p className="text-xs font-semibold text-gray-700 mb-1 flex items-center">
                    🤝 Partenaire <span className="ml-auto text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-bold">Gold</span>
                  </p>
                  <p className="text-[9px] text-gray-500 mb-2 font-mono truncate">
                    📧 partner-gold@test.siport.com
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      setEmail('partner-gold@test.siport.com');
                      setPassword('Test123456!');
                      setError('');
                      try {
                        await login('partner-gold@test.siport.com', 'Test123456!', { rememberMe: true });
                      } catch (err: any) {
                        setError(err.message || 'Erreur de connexion');
                      }
                    }}
                    className="w-full text-xs h-8 bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 border-0"
                  >
                    ✅ Connexion
                  </Button>
                </div>

                {/* Partenaire Platinum */}
                <div className="bg-white rounded-lg p-3 shadow-sm border-2 border-blue-400">
                  <p className="text-xs font-semibold text-gray-700 mb-1 flex items-center">
                    🤝 Partenaire <span className="ml-auto text-[10px] bg-blue-200 text-blue-900 px-2 py-0.5 rounded-full font-bold">Platinum</span>
                  </p>
                  <p className="text-[9px] text-gray-500 mb-2 font-mono truncate">
                    📧 partner-platinum@test.siport.com
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      setEmail('partner-platinum@test.siport.com');
                      setPassword('Test123456!');
                      setError('');
                      try {
                        await login('partner-platinum@test.siport.com', 'Test123456!', { rememberMe: true });
                      } catch (err: any) {
                        setError(err.message || 'Erreur de connexion');
                      }
                    }}
                    className="w-full text-xs h-8 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 border-0"
                  >
                    ✅ Connexion
                  </Button>
                </div>

                {/* Admin */}
                <div className="col-span-1 md:col-span-2 bg-white rounded-lg p-3 shadow-sm border-2 border-red-300">
                  <p className="text-xs font-semibold text-gray-700 mb-1 flex items-center">
                    ⚙️ Administrateur <span className="ml-auto text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-bold">ADMIN</span>
                  </p>
                  <p className="text-[9px] text-gray-500 mb-2 font-mono truncate">
                    📧 admin@siports.com
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      setEmail('admin@siports.com');
                      setPassword('Test123456!');
                      setError('');
                      try {
                        await login('admin@siports.com', 'Test123456!', { rememberMe: true });
                      } catch (err: any) {
                        setError(err.message || 'Erreur de connexion');
                      }
                    }}
                    className="w-full text-xs h-8 bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 border-0"
                  >
                    ✅ Connexion Admin
                  </Button>
                </div>

                {/* Exposants avec créneaux */}
                <div className="col-span-2 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-3 border border-purple-200">
                  <p className="text-xs font-semibold text-purple-800 mb-2">
                    🏢 Exposants avec créneaux de démo
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEmail('exhibitor-9m@test.siport.com');
                        setPassword('Test123456!');
                      }}
                      className="text-[10px] h-8 bg-white hover:bg-purple-50 border-purple-200"
                    >
                      🚢 TechMarine
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEmail('exhibitor-18m@test.siport.com');
                        setPassword('Test123456!');
                      }}
                      className="text-[10px] h-8 bg-white hover:bg-purple-50 border-purple-200"
                    >
                      🌊 OceanLogistics
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEmail('exhibitor-36m@test.siport.com');
                        setPassword('Test123456!');
                      }}
                      className="text-[10px] h-8 bg-white hover:bg-purple-50 border-purple-200"
                    >
                      ⚙️ PortTech
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEmail('exhibitor-54m@test.siport.com');
                        setPassword('Test123456!');
                      }}
                      className="text-[10px] h-8 bg-white hover:bg-purple-50 border-purple-200"
                    >
                      🌐 Global Ship.
                    </Button>
                  </div>
                  <p className="text-[9px] text-purple-600 mt-2 text-center">
                    Créneaux: 30 déc, 31 déc, 2 janv, 4 janv
                  </p>
                </div>

                {/* Note */}
                <div className="col-span-2 p-2 bg-blue-100/50 rounded-lg">
                  <p className="text-[10px] text-blue-800 text-center">
                    💡 <strong>Mot de passe:</strong> Test123456! (Test123456! pour admin)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">🚀 Accès rapide - Démo</p>
                <p className="text-xs text-gray-600">Testez toutes les fonctionnalités</p>
              </div>
              <Link to={ROUTES.DEMO_ACCOUNTS}>
                <Button variant="outline" className="text-sm bg-white hover:bg-gray-50">
                  Voir les comptes
                </Button>
              </Link>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Pas encore de compte ?{' '}
              <Link
                to={ROUTES.VISITOR_SUBSCRIPTION}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Créer un compte
              </Link>
            </p>
          </div>

          {/* Social Login */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Ou continuer avec</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="w-full flex items-center justify-center"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader className="animate-spin h-4 w-4" />
                ) : (
                  <>
                    <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                className="w-full flex items-center justify-center"
                onClick={handleLinkedInLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader className="animate-spin h-4 w-4" />
                ) : (
                  <>
                    <svg className="h-5 w-5 mr-2" fill="#0A66C2" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    LinkedIn
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};