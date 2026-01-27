import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ExhibitorCreationSimulator from '../../components/admin/ExhibitorCreationSimulator';
import { SupabaseService } from '../../services/supabaseService';
import { toast } from 'sonner';
import { ROUTES } from '../../lib/routes';

export default function ExhibitorCreationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [exhibitorData, setExhibitorData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const editId = searchParams.get('edit');

  useEffect(() => {
    if (editId) {
      loadExhibitor(editId);
    }
  }, [editId]);

  const loadExhibitor = async (id: string) => {
    setIsLoading(true);
    try {
      const exhibitors = await SupabaseService.getExhibitors();
      const exhibitor = exhibitors.find(e => e.id === id);
      if (exhibitor) {
        setExhibitorData(exhibitor);
      } else {
        toast.error('Exposant non trouvé');
        navigate(ROUTES.ADMIN_EXHIBITORS);
      }
    } catch (error) {
      console.error('Erreur chargement exposant:', error);
      toast.error('Impossible de charger l\'exposant');
      navigate(ROUTES.ADMIN_EXHIBITORS);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <ExhibitorCreationSimulator 
      exhibitorToEdit={exhibitorData}
      editMode={!!editId}
    />
  );
}
