import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Upload, X, Plus, Trash2, Send, Shield, Info, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const SubmitServer = () => {
  const { t, i18n } = useTranslation();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [links, setLinks] = useState([{ label: '', url: '' }]);

  const [formData, setFormData] = useState({
    serverName: '',
    type: 'PvP',
    difficulty: 'Easy',
    language: i18n.language === 'ar' ? 'Arabic' : 'English',
    playersCount: 1,
    description: '',
  });

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    const uploadedImages = [];

    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `server-images/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('server-hub-bucket')
        .upload(filePath, file);

      if (uploadError) {
        toast.error(`Error uploading image: ${uploadError.message}`);
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('server-hub-bucket')
        .getPublicUrl(filePath);

      uploadedImages.push(publicUrl);
    }

    setImages([...images, ...uploadedImages]);
    setUploading(false);
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const addLink = () => {
    setLinks([...links, { label: '', url: '' }]);
  };

  const removeLink = (index) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const updateLink = (index, field, value) => {
    const newLinks = [...links];
    newLinks[index][field] = value;
    setLinks(newLinks);
  };

  const generateCode = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profile) return toast.error('Please login to submit a server.');
    
    setLoading(true);
    const code = generateCode();

    try {
      const { error, data } = await supabase
        .from('server_requests')
        .insert({
          code,
          server_name: formData.serverName,
          owner_id: profile.id,
          type: formData.type,
          difficulty: formData.difficulty,
          language: formData.language,
          players_count: formData.playersCount,
          description: formData.description,
          images: images,
          links: links.filter(l => l.label && l.url),
          status: 'Pending',
          created_at: new Date().toISOString()
        })
        .select();

      if (error) {
        console.error('Supabase Insert Error:', error);
        throw error;
      }

      toast.success(t('submit.successMsg'));
      navigate(`/request/${code}`);
    } catch (error) {
      console.error('Error submitting server:', error);
      toast.error(error.message || t('submit.errorMsg'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl border border-border overflow-hidden"
      >
        <div className="bg-primary p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <h1 className="text-3xl font-black mb-2 relative z-10">{t('submit.title')}</h1>
          <p className="text-white/80 relative z-10 font-medium">Create a new server listing for the ARK Mobile community.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Basic Info */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-sm border-b border-muted pb-4">
              <Info size={18} />
              <span>Basic Information</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-black text-gray-700 uppercase tracking-tight">{t('submit.serverName')}</label>
                <input 
                  required
                  type="text" 
                  value={formData.serverName}
                  onChange={(e) => setFormData({ ...formData, serverName: e.target.value })}
                  className="w-full px-4 py-3 bg-muted/30 rounded-xl border border-transparent focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-gray-700 uppercase tracking-tight">{t('submit.type')}</label>
                <select 
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-3 bg-muted/30 rounded-xl border border-transparent focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium appearance-none"
                >
                  <option value="PvP">PvP</option>
                  <option value="PvE">PvE</option>
                  <option value="PvX">PvX</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-gray-700 uppercase tracking-tight">{t('submit.difficulty')}</label>
                <select 
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  className="w-full px-4 py-3 bg-muted/30 rounded-xl border border-transparent focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium appearance-none"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                  <option value="Brutal">Brutal</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-gray-700 uppercase tracking-tight">{t('submit.language')}</label>
                <select 
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="w-full px-4 py-3 bg-muted/30 rounded-xl border border-transparent focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium appearance-none"
                >
                  <option value="Arabic">Arabic</option>
                  <option value="English">English</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-gray-700 uppercase tracking-tight">{t('submit.playersCount')}</label>
                <input 
                  required
                  type="number" 
                  min="1"
                  value={formData.playersCount}
                  onChange={(e) => setFormData({ ...formData, playersCount: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-muted/30 rounded-xl border border-transparent focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-gray-700 uppercase tracking-tight">{t('submit.description')}</label>
              <textarea 
                required
                rows="4"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-muted/30 rounded-xl border border-transparent focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium resize-none"
              ></textarea>
            </div>
          </section>

          {/* Images Upload */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-sm border-b border-muted pb-4">
              <ImageIcon size={18} />
              <span>{t('submit.images')}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              <AnimatePresence>
                {images.map((url, index) => (
                  <motion.div 
                    key={url}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative aspect-square rounded-2xl overflow-hidden group border border-border"
                  >
                    <img src={url} alt="Server" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <Trash2 size={14} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              <label className={`aspect-square rounded-2xl border-2 border-dashed border-muted flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  disabled={uploading}
                  className="hidden" 
                />
                <Upload className={uploading ? 'animate-bounce' : ''} />
                <span className="text-xs font-bold uppercase tracking-tighter">{uploading ? 'Uploading...' : 'Add Image'}</span>
              </label>
            </div>
          </section>

          {/* Links Section */}
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-muted pb-4">
              <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-sm">
                <LinkIcon size={18} />
                <span>{t('submit.optionalLinks')}</span>
              </div>
              <button 
                type="button" 
                onClick={addLink}
                className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-all"
              >
                <Plus size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {links.map((link, index) => (
                <div key={index} className="flex gap-4 items-end">
                  <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Label</label>
                      <input 
                        placeholder="Discord, WhatsApp, etc."
                        value={link.label}
                        onChange={(e) => updateLink(index, 'label', e.target.value)}
                        className="w-full px-4 py-2 bg-muted/30 rounded-lg border border-transparent focus:border-primary focus:bg-white transition-all outline-none text-sm font-medium"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">URL</label>
                      <input 
                        placeholder="https://..."
                        value={link.url}
                        onChange={(e) => updateLink(index, 'url', e.target.value)}
                        className="w-full px-4 py-2 bg-muted/30 rounded-lg border border-transparent focus:border-primary focus:bg-white transition-all outline-none text-sm font-medium"
                      />
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => removeLink(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all mb-1"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <button 
            type="submit" 
            disabled={loading || uploading}
            className="w-full bg-primary text-white py-4 rounded-2xl font-black uppercase tracking-widest text-lg shadow-xl shadow-primary/30 hover:bg-primary-600 hover:shadow-2xl transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <span>{t('submit.submitBtn')}</span>
                <Send size={20} />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default SubmitServer;
