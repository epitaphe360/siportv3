import { HeroSection } from '../components/home/HeroSection';
import { FeaturedExhibitors } from '../components/home/FeaturedExhibitors';
import { NetworkingSection } from '../components/home/NetworkingSection';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturedExhibitors />
      <NetworkingSection />
    </div>
  );
}