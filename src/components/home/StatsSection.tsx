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
    <section className="py-20 bg-gradient-to-b from-blue-50 via-blue-100/30 to-white relative overflow-hidden">
      {/* Moroccan Geometric Pattern Background */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute top-0 left-0 w-64 h-64 border-8 border-siports-gold rotate-45 transform -translate-x-32 -translate-y-32" />
        <div className="absolute bottom-0 right-0 w-64 h-64 border-8 border-green-600 rotate-45 transform translate-x-32 translate-y-32" />
        <div className="absolute top-1/2 left-1/4 w-48 h-48 border-8 border-red-600 rotate-45 transform" />
        <div className="absolute top-1/3 right-1/4 w-48 h-48 border-8 border-siports-gold rotate-45 transform" />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Decorative Moroccan Border */}
        <div className="flex items-center justify-center mb-12">
          <div className="h-1 w-24 bg-gradient-to-r from-transparent via-red-600 to-transparent"></div>
          <div className="mx-4 w-3 h-3 bg-siports-gold rotate-45"></div>
          <div className="h-1 w-24 bg-gradient-to-r from-transparent via-green-600 to-transparent"></div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative group"
            >
              {/* Moroccan Card with Zellige-inspired border */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-500 via-siports-gold to-green-600 rounded-2xl transform rotate-1 group-hover:rotate-2 transition-transform"></div>
              <div className="relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300">
                <div className="flex flex-col items-center text-center">
                  {/* Icon with Moroccan colors */}
                  <div className={`relative p-4 rounded-full ${stat.bg} mb-4 group-hover:scale-110 transition-transform`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-siports-gold/20 to-red-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <stat.icon className={`h-8 w-8 ${stat.color} relative z-10`} />
                  </div>
                  
                  <div className="text-4xl font-bold bg-gradient-to-r from-red-600 via-siports-gold to-green-600 bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  
                  <div className="text-gray-700 font-semibold">
                    {t(stat.labelKey) || stat.labelKey.split('.')[1]}
                  </div>
                  
                  {/* Decorative bottom accent */}
                  <div className="mt-4 flex space-x-1">
                    <div className="w-2 h-2 bg-red-600 rotate-45"></div>
                    <div className="w-2 h-2 bg-siports-gold rotate-45"></div>
                    <div className="w-2 h-2 bg-green-600 rotate-45"></div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Decorative bottom border */}
        <div className="flex items-center justify-center mt-12">
          <div className="h-1 w-24 bg-gradient-to-r from-transparent via-green-600 to-transparent"></div>
          <div className="mx-4 w-3 h-3 bg-red-600 rotate-45"></div>
          <div className="h-1 w-24 bg-gradient-to-r from-transparent via-siports-gold to-transparent"></div>
        </div>
      </div>
    </section>
  );
};
