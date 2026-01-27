import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import PartnerCreationForm from '../../components/admin/PartnerCreationForm';
import { SupabaseService } from '../../services/supabaseService';
import { toast } from 'sonner';
import { ROUTES } from '../../lib/routes';

export default function PartnerCreationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [partnerData, setPartnerData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const editId = searchParams.get('edit');

  useEffect(() => {
    if (editId) {
      loadPartner(editId);
    }
  }, [editId]);

  const loadPartner = async (id: string) => {
    setIsLoading(true);
    try {
      const partners = await SupabaseService.getPartners();
      const partner = partners.find(p => p.id === id);
      if (partner) {
        setPartnerData(partner);
      } else {
        toast.error('Partenaire non trouvé');
        navigate(ROUTES.ADMIN_PARTNERS_MANAGE);
      }
    } catch (error) {
      console.error('Erreur chargement partenaire:', error);
      toast.error('Impossible de charger le partenaire');
      navigate(ROUTES.ADMIN_PARTNERS_MANAGE);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <PartnerCreationForm 
      partnerToEdit={partnerData}
      editMode={!!editId}
    />
  );
}
