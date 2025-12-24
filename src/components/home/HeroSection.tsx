import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Building2, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { motion } from 'framer-motion';
import { useTranslation } from '../../hooks/useTranslation';
import { ROUTES } from '../../lib/routes';

export const HeroSection: React.FC = () => {
  const [timeLeft, setTimeLeft] = React.useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const { t } = useTranslation();

  React.useEffect(() => {
    // Date du salon SIPORTS 2026 (1-3 Avril 2026)
    const salonDate = new Date('2026-04-01T09:00:00');
    
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = salonDate.getTime() - now.getTime();

      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000)
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num: number) => {
    return num.toString().padStart(2, '0');
  };

  const getTimeUnit = (value: number, singularKey: string, pluralKey: string) => {
    return value <= 1 ? t(singularKey) : t(pluralKey);
  };

  return (
    <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-6">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mb-4">
                <Calendar className="h-4 w-4 mr-2" />
                1-3 Avril 2026
              </span>
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
                {t('hero.title')}
              </h1>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                {t('hero.subtitle')}
              </p>
            </div>

            {/* Compte à Rebours */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mb-8"
            >
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
                <h2 className="text-2xl font-bold text-center mb-2 text-white">
                  {t('hero.countdown.title')}
                </h2>
                <p className="text-center text-blue-200 mb-6 text-sm">
                  {t('hero.countdown.subtitle')}
                </p>
                
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 shadow-2xl text-center">
                    <div className="text-3xl font-bold text-white mb-1">
                      {formatNumber(timeLeft.days)}
                    </div>
                    <div className="text-blue-100 text-xs font-medium uppercase tracking-wide">
                      {getTimeUnit(timeLeft.days, 'time.day', 'time.days')}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-4 shadow-2xl text-center">
                    <div className="text-3xl font-bold text-white mb-1">
                      {formatNumber(timeLeft.hours)}
                    </div>
                    <div className="text-purple-100 text-xs font-medium uppercase tracking-wide">
                      {getTimeUnit(timeLeft.hours, 'time.hour', 'time.hours')}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-4 shadow-2xl text-center">
                    <div className="text-3xl font-bold text-white mb-1">
                      {formatNumber(timeLeft.minutes)}
                    </div>
                    <div className="text-green-100 text-xs font-medium uppercase tracking-wide">
                      {getTimeUnit(timeLeft.minutes, 'time.minute', 'time.minutes')}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-4 shadow-2xl text-center">
                    <div className="text-3xl font-bold text-white mb-1">
                      {formatNumber(timeLeft.seconds)}
                    </div>
                    <div className="text-orange-100 text-xs font-medium uppercase tracking-wide">
                      {getTimeUnit(timeLeft.seconds, 'time.second', 'time.seconds')}
                    </div>
                  </div>
                </div>
                
                <div className="text-center mt-6">
                  <div className="inline-flex items-center space-x-2 bg-white/10 rounded-full px-4 py-2 backdrop-blur-sm">
                    <MapPin className="h-4 w-4 text-white" />
                    <span className="text-white text-sm font-medium">
                      Mohammed VI Exhibition Center • {t('hero.stats.location')}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Event Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">{t('hero.stats.location')}</p>
                  <p className="text-blue-200 text-sm">Morocco</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">6 000+</p>
                  <p className="text-blue-200 text-sm">{t('hero.stats.participants')}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">300+</p>
                  <p className="text-blue-200 text-sm">{t('hero.stats.exhibitors')}</p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to={ROUTES.REGISTER_EXHIBITOR}>
                <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50 w-full sm:w-auto">
                  {t('hero.cta.exhibitor')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to={ROUTES.EXHIBITORS}>
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-900 w-full sm:w-auto">
                  {t('hero.cta.discover')}
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/906982/pexels-photo-906982.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Port maritime moderne avec grues portuaires et navires cargo"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent rounded-2xl" />
              
              {/* Floating Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="absolute -bottom-8 -left-8 bg-white text-siports-dark p-6 rounded-2xl shadow-2xl border border-siports-gray-200"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-siports-primary/10 p-3 rounded-xl">
                    <Users className="h-6 w-6 text-siports-primary" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-siports-primary">40</p>
                    <p className="text-sm text-siports-gray-600 font-medium">Pays représentés</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="absolute -top-8 -right-8 bg-white text-siports-dark p-6 rounded-2xl shadow-2xl border border-siports-gray-200"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-siports-primary/10 p-3 rounded-xl">
                    <Calendar className="h-6 w-6 text-siports-primary" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-siports-primary">30+</p>
                    <p className="text-sm text-siports-gray-600 font-medium">Conférences</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Wave Separator */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          className="w-full h-12 text-white"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
            opacity=".25"
            fill="currentColor"
          />
          <path
            d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
            opacity=".5"
            fill="currentColor"
          />
          <path
            d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </section>
  );
};