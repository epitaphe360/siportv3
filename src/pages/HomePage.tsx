import { HeroSection } from '../components/home/HeroSection';
import { StatsSection } from '../components/home/StatsSection';
import { FeaturedExhibitors } from '../components/home/FeaturedExhibitors';
import { FeaturedPartners } from '../components/home/FeaturedPartners';
import { NetworkingSection } from '../components/home/NetworkingSection';
import { ServicesSection } from '../components/home/ServicesSection';
import { useTranslation } from '../hooks/useTranslation';

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen">
      <HeroSection />
      <StatsSection />
      <FeaturedExhibitors />
      <FeaturedPartners />
      <NetworkingSection />
      <ServicesSection />
    </div>
  );
}

