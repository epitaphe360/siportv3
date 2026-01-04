import React from 'react';
import { motion } from 'framer-motion';
import { Users, Building2, Globe, Mic2 } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

const stats = [
  {
    icon: Building2,
    value: '150+',
    labelKey: 'stats.exhibitors',
    color: 'text-blue-500',
    bg: 'bg-blue-100'
  },
  {
    icon: Users,
    value: '5000+',
    labelKey: 'stats.visitors',
    color: 'text-green-500',
    bg: 'bg-green-100'
  },
  {
    icon: Globe,
    value: '25+',
    labelKey: 'stats.countries',
    color: 'text-purple-500',
    bg: 'bg-purple-100'
  },
  {
    icon: Mic2,
    value: '40+',
    labelKey: 'stats.conferences',
    color: 'text-orange-500',
    bg: 'bg-orange-100'
  }
];

export const StatsSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="py-16 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex flex-col items-center text-center p-6 rounded-2xl hover:bg-gray-50 transition-colors duration-300"
            >
              <div className={`p-4 rounded-full ${stat.bg} mb-4`}>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {stat.value}
              </div>
              <div className="text-gray-600 font-medium">
                {t(stat.labelKey) || stat.labelKey.split('.')[1]} {/* Fallback if translation missing */}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
