import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { LogIn, Eye, EyeOff } from 'lucide-react';

interface QuickAccount {
  email: string;
  password: string;
  label: string;
  type: 'visitor' | 'exhibitor' | 'partner' | 'marketing' | 'admin';
  color: string;
}

export const DemoAccountsPage: React.FC = () => {
  const navigate = useNavigate();
  const [showPasswords, setShowPasswords] = useState(false);
  const [loggingIn, setLoggingIn] = useState<string | null>(null);

  // 🚀 TOUS LES COMPTES RAPIDES
  const quickAccounts: QuickAccount[] = [
    // Visiteurs
    { email: 'visitor-free@test.siport.com', password: 'Demo2026!', label: '👤 Visiteur Gratuit', type: 'visitor', color: '#3B82F6' },
    { email: 'visitor-vip@test.siport.com', password: 'Demo2026!', label: '👑 Visiteur VIP', type: 'visitor', color: '#8B5CF6' },
    
    // Exposants
    { email: 'exhibitor-9m@test.siport.com', password: 'Demo2026!', label: '🏪 Exposant 9m²', type: 'exhibitor', color: '#10B981' },
    { email: 'exhibitor-18m@test.siport.com', password: 'Demo2026!', label: '🏭 Exposant 18m²', type: 'exhibitor', color: '#14B8A6' },
    { email: 'exhibitor-36m@test.siport.com', password: 'Demo2026!', label: '🏗️ Exposant 36m²', type: 'exhibitor', color: '#06B6D4' },
    { email: 'exhibitor-54m@test.siport.com', password: 'Demo2026!', label: '🚢 Exposant 54m²', type: 'exhibitor', color: '#6366F1' },
    
    // Partenaires
    { email: 'demo.partner@siports.com', password: 'Demo2026!', label: '🤝 Partner Demo', type: 'partner', color: '#F59E0B' },
    { email: 'partner-museum@test.siport.com', password: 'Demo2026!', label: '🏛️ Musée Maritime', type: 'partner', color: '#D97706' },
    { email: 'partner-silver@test.siport.com', password: 'Demo2026!', label: '🥈 Sponsor Silver', type: 'partner', color: '#9CA3AF' },
    { email: 'partner-gold@test.siport.com', password: 'Demo2026!', label: '🥇 Sponsor Gold', type: 'partner', color: '#EAB308' },
    { email: 'partner-platinum@test.siport.com', password: 'Demo2026!', label: '💎 Sponsor Platinum', type: 'partner', color: '#64748B' },
    
    // Marketing
    { email: 'marketing@siports.com', password: 'Demo2026!', label: '📊 Marketing', type: 'marketing', color: '#EC4899' },
    
    // Admin
    { email: 'admin@siports.com', password: 'Demo2026!', label: '⚙️ Administrateur', type: 'admin', color: '#EF4444' },
  ];

  const handleLogin = async (account: QuickAccount) => {
    setLoggingIn(account.email);
    try {
      const { error } = await supabase.auth.signInWithPassword({ 
        email: account.email, 
        password: account.password 
      });
      
      if (error) throw error;
      
      toast.success(`✅ Connecté: ${account.label}`);
      
      // Redirection selon le type
      const routes: Record<string, string> = {
        visitor: '/visitor/dashboard',
        exhibitor: '/exhibitor/dashboard',
        partner: '/partner/dashboard',
        marketing: '/marketing/dashboard',
        admin: '/admin/dashboard'
      };
      navigate(routes[account.type] || '/');
    } catch (error: any) {
      toast.error(error.message || 'Erreur de connexion');
    } finally {
      setLoggingIn(null);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '2.5rem', color: 'white', marginBottom: '10px' }}>
            ⚡ COMPTES RAPIDES
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
            Cliquez sur un compte pour vous connecter instantanément
          </p>
          <button
            onClick={() => setShowPasswords(!showPasswords)}
            style={{
              marginTop: '15px',
              padding: '8px 16px',
              background: '#334155',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {showPasswords ? <EyeOff size={18} /> : <Eye size={18} />}
            {showPasswords ? 'Masquer mots de passe' : 'Afficher mots de passe'}
          </button>
        </div>

        {/* Grille de comptes */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
          gap: '15px' 
        }}>
          {quickAccounts.map((account) => (
            <button
              key={account.email}
              onClick={() => handleLogin(account)}
              disabled={loggingIn === account.email}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '16px 20px',
                background: loggingIn === account.email ? '#1e293b' : '#0f172a',
                border: `2px solid ${account.color}`,
                borderRadius: '12px',
                cursor: loggingIn === account.email ? 'wait' : 'pointer',
                transition: 'all 0.2s',
                opacity: loggingIn === account.email ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (loggingIn !== account.email) {
                  e.currentTarget.style.background = account.color + '20';
                  e.currentTarget.style.transform = 'scale(1.02)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#0f172a';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <div style={{ 
                fontSize: '1.2rem', 
                fontWeight: 'bold', 
                color: account.color,
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                {loggingIn === account.email ? (
                  <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span>
                ) : (
                  <LogIn size={18} />
                )}
                {account.label}
              </div>
              <div style={{ 
                fontSize: '0.85rem', 
                color: '#94a3b8',
                fontFamily: 'monospace'
              }}>
                {account.email}
              </div>
              {showPasswords && (
                <div style={{ 
                  fontSize: '0.8rem', 
                  color: '#64748b',
                  fontFamily: 'monospace',
                  marginTop: '4px'
                }}>
                  🔑 {account.password}
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Note */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '30px',
          padding: '15px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '12px'
        }}>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            💡 Mot de passe par défaut: <code style={{ color: '#60a5fa' }}>Demo2026!</code> | 
            Admin: <code style={{ color: '#f87171' }}>Demo2026!</code>
          </p>
        </div>
      </div>
    </div>
  );
};
export default DemoAccountsPage;
