import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { toast } from 'sonner';
import { 
  Users, Building2, Handshake, Eye, EyeOff, Crown, 
  Store, Warehouse, Factory, Ship,
  Trophy, Medal, Award, Landmark,
  LogIn, Copy, ArrowRight
} from 'lucide-react';

interface DemoAccount {
  email: string;
  password: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

export const DemoAccountsPage: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loggingIn, setLoggingIn] = useState<string | null>(null);

  const demoAccounts = {
    visitors: [
      {
        email: 'visitor-free@test.siport.com',
        password: 'Test123456!',
        name: 'Visiteur Gratuit',
        description: 'Accès de base au salon',
        icon: Users,
        color: 'blue'
      },
      {
        email: 'visitor-vip@test.siport.com',
        password: 'Test123456!',
        name: 'Visiteur VIP',
        description: 'Accès premium avec badge numérique',
        icon: Crown,
        color: 'purple'
      }
    ] as DemoAccount[],
    
    exhibitors: [
      {
        email: 'exhibitor-9m@test.siport.com',
        password: 'Test123456!',
        name: 'TechMarine Solutions',
        description: 'Stand 9m² - Starter',
        icon: Store,
        color: 'green'
      },
      {
        email: 'exhibitor-18m@test.siport.com',
        password: 'Test123456!',
        name: 'OceanLogistics Pro',
        description: 'Stand 18m² - Business',
        icon: Warehouse,
        color: 'teal'
      },
      {
        email: 'exhibitor-36m@test.siport.com',
        password: 'Test123456!',
        name: 'PortTech Industries',
        description: 'Stand 36m² - Premium',
        icon: Factory,
        color: 'cyan'
      },
      {
        email: 'exhibitor-54m@test.siport.com',
        password: 'Test123456!',
        name: 'Global Shipping Alliance',
        description: 'Stand 54m² - Enterprise',
        icon: Ship,
        color: 'indigo'
      }
    ] as DemoAccount[],
    
    partners: [
      {
        email: 'partner-museum@test.siport.com',
        password: 'Test123456!',
        name: 'Musée Maritime National',
        description: 'Partenaire institutionnel',
        icon: Landmark,
        color: 'amber'
      },
      {
        email: 'partner-silver@test.siport.com',
        password: 'Test123456!',
        name: 'Silver Maritime Services',
        description: 'Sponsor Silver',
        icon: Medal,
        color: 'gray'
      },
      {
        email: 'partner-gold@test.siport.com',
        password: 'Test123456!',
        name: 'Gold Shipping Corp',
        description: 'Sponsor Gold',
        icon: Award,
        color: 'yellow'
      },
      {
        email: 'partner-platinium@test.siport.com',
        password: 'Test123456!',
        name: 'Platinium Port Authority',
        description: 'Sponsor Platinium',
        icon: Trophy,
        color: 'slate'
      }
    ] as DemoAccount[]
  };

  const handleLogin = async (email: string, password: string) => {
    setLoggingIn(email);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;
      
      toast.success('Connexion réussie !');
      
      // Redirection selon le type de compte
      if (email.includes('visitor')) {
        navigate('/visitor/dashboard');
      } else if (email.includes('exhibitor')) {
        navigate('/exhibitor/dashboard');
      } else if (email.includes('partner')) {
        navigate('/partner/dashboard');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur de connexion');
    } finally {
      setLoggingIn(null);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copié !`);
  };

  const renderAccountCard = (account: DemoAccount) => {
    const Icon = account.icon;
    const isLoading = loggingIn === account.email;
    
    return (
      <Card key={account.email} className="p-6 hover:shadow-lg transition-all border-l-4" 
            style={{ borderLeftColor: `var(--color-${account.color}-500)` }}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-3 bg-${account.color}-100 rounded-lg`}>
              <Icon className={`h-6 w-6 text-${account.color}-600`} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{account.name}</h3>
              <p className="text-sm text-gray-600">{account.description}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <span className="text-sm text-gray-700">{account.email}</span>
            <button
              onClick={() => copyToClipboard(account.email, 'Email')}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <Copy className="h-4 w-4 text-gray-600" />
            </button>
          </div>
          
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <span className="text-sm font-mono text-gray-700">
              {showPassword ? account.password : '••••••••'}
            </span>
            <button
              onClick={() => copyToClipboard(account.password, 'Mot de passe')}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <Copy className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>

        <Button
          onClick={() => handleLogin(account.email, account.password)}
          disabled={isLoading}
          className="w-full"
          style={{ backgroundColor: `var(--color-${account.color}-600)` }}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Connexion...
            </>
          ) : (
            <>
              <LogIn className="h-4 w-4 mr-2" />
              Se connecter
            </>
          )}
        </Button>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🚀 Connexion rapide - Comptes de démonstration
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Explorez toutes les fonctionnalités avec nos comptes de test
          </p>
          
          <div className="inline-flex items-center space-x-4 p-4 bg-white rounded-lg shadow-md">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Mot de passe universel:</span>
              <code className="px-3 py-1 bg-gray-100 rounded font-mono text-sm font-semibold text-blue-600">
                {showPassword ? 'Test123456!' : '••••••••'}
              </code>
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                {showPassword ? <EyeOff className="h-5 w-5 text-gray-600" /> : <Eye className="h-5 w-5 text-gray-600" />}
              </button>
              <button
                onClick={() => copyToClipboard('Test123456!', 'Mot de passe')}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <Copy className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Visiteurs Section */}
        <section className="mb-12">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">👥 Visiteurs</h2>
              <p className="text-gray-600">Accès au salon et fonctionnalités visiteurs</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {demoAccounts.visitors.map(renderAccountCard)}
          </div>
        </section>

        {/* Exposants Section */}
        <section className="mb-12">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-green-100 rounded-lg">
              <Building2 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">🏢 Exposants</h2>
              <p className="text-gray-600">Gestion de stand et mini-site personnalisé</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {demoAccounts.exhibitors.map(renderAccountCard)}
          </div>
        </section>

        {/* Partenaires Section */}
        <section className="mb-12">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-amber-100 rounded-lg">
              <Handshake className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">🤝 Partenaires</h2>
              <p className="text-gray-600">Sponsors et partenaires institutionnels</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {demoAccounts.partners.map(renderAccountCard)}
          </div>
        </section>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-2 p-4 bg-blue-50 rounded-lg">
            <ArrowRight className="h-5 w-5 text-blue-600" />
            <p className="text-sm text-gray-700">
              Cliquez sur <strong>Se connecter</strong> pour accéder directement au tableau de bord
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default DemoAccountsPage;