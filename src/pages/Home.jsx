import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Filter, SlidersHorizontal, ArrowUpDown, Server, Globe, Users, Info } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import ServerCard from '../components/ServerCard';

const Home = () => {
  const { t, i18n } = useTranslation();
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    difficulty: 'all',
    language: 'all'
  });
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchServers();
  }, [filters, sortBy, search]);

  const fetchServers = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('server_requests')
        .select('*')
        .eq('status', 'Accepted');

      if (search) {
        query = query.ilike('server_name', `%${search}%`);
      }

      if (filters.type !== 'all') {
        query = query.eq('type', filters.type);
      }

      if (filters.difficulty !== 'all') {
        query = query.eq('difficulty', filters.difficulty);
      }

      if (filters.language !== 'all') {
        query = query.eq('language', filters.language);
      }

      if (sortBy === 'newest') {
        query = query.order('created_at', { ascending: false });
      } else if (sortBy === 'players') {
        query = query.order('players_count', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      setServers(data || []);
    } catch (error) {
      console.error('Error fetching servers:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <section className="text-center py-12 px-6 bg-gradient-to-br from-primary to-primary-800 rounded-3xl text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-32 -mb-32 animate-pulse"></div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-black mb-4 tracking-tight"
        >
          {t('home.title')}
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto"
        >
          {t('home.subtitle')}
        </motion.p>
      </section>

      {/* Search and Filters */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-border">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          {/* Search Input */}
          <div className="relative w-full md:flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <input 
              type="text" 
              placeholder={t('common.search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-muted/50 rounded-xl border border-transparent focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-48">
              <ArrowUpDown className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-muted/50 rounded-xl border border-transparent focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none appearance-none"
              >
                <option value="newest">{t('home.sortByDate')}</option>
                <option value="players">{t('home.sortByPlayers')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-border">
          <div className="flex items-center gap-2 text-muted-foreground mr-2">
            <Filter size={18} />
            <span className="font-semibold text-sm uppercase tracking-wider">{t('common.filter')}</span>
          </div>

          {/* Type Filter */}
          <select 
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="px-4 py-2 bg-muted/50 rounded-lg border border-transparent hover:border-primary/30 transition-all outline-none text-sm font-medium"
          >
            <option value="all">{t('home.filterByType')}</option>
            <option value="PvP">PvP</option>
            <option value="PvE">PvE</option>
            <option value="PvX">PvX</option>
          </select>

          {/* Difficulty Filter */}
          <select 
            value={filters.difficulty}
            onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
            className="px-4 py-2 bg-muted/50 rounded-lg border border-transparent hover:border-primary/30 transition-all outline-none text-sm font-medium"
          >
            <option value="all">{t('home.filterByDifficulty')}</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
            <option value="Brutal">Brutal</option>
          </select>

          {/* Language Filter */}
          <select 
            value={filters.language}
            onChange={(e) => setFilters({ ...filters, language: e.target.value })}
            className="px-4 py-2 bg-muted/50 rounded-lg border border-transparent hover:border-primary/30 transition-all outline-none text-sm font-medium"
          >
            <option value="all">{t('home.filterByLanguage')}</option>
            <option value="Arabic">العربية</option>
            <option value="English">English</option>
          </select>
        </div>
      </section>

      {/* Servers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-80 animate-pulse border border-border"></div>
          ))
        ) : servers.length > 0 ? (
          <AnimatePresence>
            {servers.map((server) => (
              <motion.div 
                key={server.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                layout
              >
                <ServerCard server={server} />
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <div className="col-span-full py-20 text-center">
            <div className="bg-muted/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
              <Server size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-900">{t('home.noServers')}</h3>
            <p className="text-muted-foreground mt-2">Try adjusting your filters or search query.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
