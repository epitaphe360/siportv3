import { HeroSection } from '../components/home/HeroSection';
import { FeaturedExhibitors } from '../components/home/FeaturedExhibitors';
import { FeaturedPartners } from '../components/home/FeaturedPartners';
import { NetworkingSection } from '../components/home/NetworkingSection';
import { useTranslation } from '../hooks/useTranslation';

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturedExhibitors />
      <FeaturedPartners />
      <NetworkingSection />
    </div>
  );
}