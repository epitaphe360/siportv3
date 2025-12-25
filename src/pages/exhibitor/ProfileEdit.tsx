import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { SupabaseService } from '../../services/supabaseService';
import { ROUTES } from '../../lib/routes';

const ProfileEdit: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [companyName, setCompanyName] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    // prefill values from user.exhibitor if present
    (async () => {
      try {
        if (!user) return;
        const exhibitor = await SupabaseService.getExhibitorByUserId(user.id).catch(() => null);
        if (exhibitor) {
          setCompanyName(exhibitor.companyName || '');
          setDescription(exhibitor.description || '');
          setWebsite(exhibitor.website || '');
        }
      } catch {
        // ignore
      }
    })();
  }, [user]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    if (f) setFile(f);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return setError('Vous devez Ãªtre connectÃ©.');
    setError(null);
    setLoading(true);
    try {
      let logoUrl: string | undefined = undefined;
      if (file) {
        const res = await SupabaseService.uploadExhibitorLogo(user.id, file);
        if (res?.publicUrl) logoUrl = res.publicUrl;
      }

      const updates: any = {
        companyName,
        description,
        website
      };
      if (logoUrl) updates.logo = logoUrl;

      // Find exhibitor id by user id
  const exhibitor = await SupabaseService.getExhibitorByUserId(user.id as string);
      if (!exhibitor) {
        // create exhibitor if none
        await SupabaseService.createExhibitor({ userId: user.id, companyName, description, website, logo: logoUrl });
      } else {
        await SupabaseService.updateExhibitor(exhibitor.id, updates);
      }

      navigate(ROUTES.EXHIBITOR_DASHBOARD);
    } catch (err: unknown) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Ã‰diter le profil exposant</h1>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Nom de la sociÃ©tÃ©</label>
          <input value={companyName} onChange={e => setCompanyName(e.target.value)} className="mt-1 block w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} className="mt-1 block w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium">Site web</label>
          <input value={website} onChange={e => setWebsite(e.target.value)} className="mt-1 block w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium">Logo</label>
          <input type="file" accept="image/*" onChange={onFileChange} />
        </div>

        <div>
          <button disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">
            {loading ? 'En cours...' : 'Sauvegarder'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileEdit;



