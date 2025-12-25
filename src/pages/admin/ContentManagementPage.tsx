import ContentManagement from '../../components/admin/ContentManagement';
import { useTranslation } from '../../hooks/useTranslation';

export default function ContentManagementPage() {
  const { t } = useTranslation();
  return <ContentManagement />;
}



