import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useTranslation } from '../hooks/useTranslation';
import { supabase, isSupabaseReady } from '../lib/supabase';

function parseHashTokens(hash: string) {
  // hash like #access_token=...&refresh_token=...
  const trimmed = hash.startsWith('#') ? hash.slice(1) : hash;
  const params = new URLSearchParams(trimmed);
  return {
    access_token: params.get('access_token'),
    refresh_token: params.get('refresh_token'),
  };
}

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasTokens, setHasTokens] = useState(false);

  useEffect(() => {
    // Try to parse tokens from URL fragment
    try {
      const { access_token, refresh_token } = parseHashTokens(window.location.hash || '');
      if (access_token) {
        setHasTokens(true);
        // set session so supabase client is authenticated
        if (isSupabaseReady() && supabase) {
          (async () => {
            try {
              await (supabase as any).auth.setSession({ access_token, refresh_token });
            } catch (e) {
              console.warn('Could not set session from tokens', e);
            }
          })();
        }
      }
    } catch (e) {
      console.warn('reset token parsing failed', e);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      if (!isSupabaseReady() || !supabase) {
        setError('Supabase non configurÃ©.');
        setLoading(false);
        return;
      }

      // Update user password (requires an authenticated session set via tokens)
  const { error: updErr } = await (supabase as any).auth.updateUser({ password: newPassword });
  if (updErr) {
        setError(updErr.message || 'Erreur lors de la rÃ©initialisation du mot de passe.');
      } else {
        setMessage('Mot de passe changÃ© avec succÃ¨s. Vous pouvez maintenant vous connecter.');
        // Clear URL fragment for security
        try { history.replaceState({}, '', window.location.pathname); } catch (e) { console.warn(e) }
      }
    } catch (err: unknown) {
      setError(err?.message || String(err));
    }
    setLoading(false);
  };

  return (
    <Card className="max-w-md mx-auto p-8 mt-12">
      <h2 className="text-2xl font-bold mb-4">RÃ©initialiser le mot de passe</h2>
      {!hasTokens && (
        <div className="mb-4 text-gray-700">Le lien de rÃ©initialisation semble incomplet ou expirÃ©. Assurez-vous d'utiliser le lien envoyÃ© par email.</div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block font-medium mb-2">Nouveau mot de passe</label>
          <Input type="password" name="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Nouveau mot de passe" required minLength={8} />
        </div>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        {message && <div className="text-green-600 mb-2">{message}</div>}
        <div className="flex justify-end">
          <Button type="submit" disabled={loading || !hasTokens}>{loading ? 'En cours...' : 'Changer le mot de passe'}</Button>
        </div>
      </form>
    </Card>
  );
}


