import { HeroSection } from '../components/home/HeroSection';
import { FeaturedExhibitors } from '../components/home/FeaturedExhibitors';
import { FeaturedPartners } from '../components/home/FeaturedPartners';
import { NetworkingSection } from '../components/home/NetworkingSection';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturedExhibitors />
      <FeaturedPartners />
      <NetworkingSection />
    </div>
  );
}