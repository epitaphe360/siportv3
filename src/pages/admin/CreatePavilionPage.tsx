import CreatePavilionForm from '../../components/admin/CreatePavilionForm';
import { useTranslation } from '../../hooks/useTranslation';

export default function CreatePavilionPage() {
  const { t } = useTranslation();
  return <CreatePavilionForm />;
}



