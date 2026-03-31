import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Globe, Users, Info, Shield, Map, Layout, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const ServerCard = ({ server }) => {
  const { t, i18n } = useTranslation();
  
  const difficultyColors = {
    'Easy': 'bg-green-100 text-green-800',
    'Medium': 'bg-blue-100 text-blue-800',
    'Hard': 'bg-orange-100 text-orange-800',
    'Brutal': 'bg-red-100 text-red-800'
  };

  const typeColors = {
    'PvP': 'bg-red-500 text-white',
    'PvE': 'bg-green-500 text-white',
    'PvX': 'bg-purple-500 text-white'
  };

  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl border border-border transition-all flex flex-col h-full group"
    >
      {/* Image Banner */}
      <div className="relative h-48 overflow-hidden">
        {server.images && server.images.length > 0 ? (
          <img 
            src={server.images[0]} 
            alt={server.server_name} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center text-primary/40 group-hover:scale-110 transition-transform duration-700">
            <Shield size={64} />
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg ${typeColors[server.type]}`}>
            {server.type}
          </span>
          <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg ${difficultyColors[server.difficulty]}`}>
            {server.difficulty}
          </span>
        </div>
        
        <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
            <Users size={18} />
          </div>
          <div>
            <p className="text-xs font-bold leading-none uppercase tracking-tighter text-white/70">Players</p>
            <p className="text-sm font-black">{server.players_count}</p>
          </div>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow gap-4">
        <div>
          <h3 className="text-2xl font-black text-gray-900 group-hover:text-primary transition-colors line-clamp-1">
            {server.server_name}
          </h3>
          <div className="flex items-center gap-2 mt-2 text-muted-foreground">
            <Globe size={16} />
            <span className="text-sm font-bold uppercase tracking-tight">{server.language}</span>
          </div>
        </div>

        <p className="text-muted-foreground text-sm line-clamp-3 font-medium leading-relaxed">
          {server.description}
        </p>

        <div className="mt-auto pt-6 flex items-center justify-between border-t border-muted">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-primary">
              <Shield size={16} />
            </div>
            <span className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Active Hub</span>
          </div>
          
          <Link 
            to={`/request/${server.code}`}
            className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-black hover:bg-primary-600 transition-all shadow-lg shadow-primary/20 active:scale-95"
          >
            <span>VIEW DETAILS</span>
            <ExternalLink size={16} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default ServerCard;
