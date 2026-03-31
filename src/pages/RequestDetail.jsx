import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  Shield, Globe, Users, Info, ExternalLink, 
  CheckCircle2, Clock, XCircle, Trash2, Edit2, 
  ChevronLeft, Share2, Map, Layout, MessageSquare 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const RequestDetail = () => {
  const { code } = useParams();
  const { t, i18n } = useTranslation();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    fetchRequest();
  }, [code]);

  const fetchRequest = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('server_requests')
        .select(`
          *,
          owner:profiles(*)
        `)
        .eq('code', code)
        .single();

      if (error) throw error;
      setRequest(data);
    } catch (error) {
      console.error('Error fetching request:', error);
      toast.error('Request not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this request?')) return;
    
    try {
      const { error } = await supabase
        .from('server_requests')
        .delete()
        .eq('id', request.id);

      if (error) throw error;
      toast.success('Request deleted successfully');
      navigate('/');
    } catch (error) {
      console.error('Error deleting request:', error);
      toast.error('Error deleting request');
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      const { error } = await supabase
        .from('server_requests')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', request.id);

      if (error) throw error;
      toast.success(`Request ${newStatus.toLowerCase()} successfully`);
      fetchRequest();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error updating status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isOwner = profile?.id === request?.owner_id;
  const isAdmin = ['Admin', 'Owner'].includes(profile?.role);
  const canManage = isOwner || isAdmin;

  const statusInfo = {
    'Pending': { icon: <Clock size={20} />, color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    'Accepted': { icon: <CheckCircle2 size={20} />, color: 'bg-green-100 text-green-800 border-green-200' },
    'Rejected': { icon: <XCircle size={20} />, color: 'bg-red-100 text-red-800 border-red-200' }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header Navigation */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary font-bold uppercase tracking-widest text-sm transition-colors"
        >
          <ChevronLeft size={18} />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              toast.success('Link copied to clipboard!');
            }}
            className="p-2 bg-muted/50 rounded-xl hover:bg-primary/10 hover:text-primary transition-all shadow-sm"
          >
            <Share2 size={20} />
          </button>
          
          {canManage && (
            <>
              <button 
                onClick={handleDelete}
                className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm border border-red-100"
              >
                <Trash2 size={20} />
              </button>
              {isAdmin && request.status === 'Pending' && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleStatusUpdate('Accepted')}
                    className="px-4 py-2 bg-green-500 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-green-600 transition-all shadow-lg shadow-green-200"
                  >
                    Accept
                  </button>
                  <button 
                    onClick={() => handleStatusUpdate('Rejected')}
                    className="px-4 py-2 bg-red-500 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-200"
                  >
                    Reject
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Images and Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Image Gallery */}
          <section className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-border">
            <div className="relative aspect-video bg-muted">
              {request.images && request.images.length > 0 ? (
                <img 
                  src={request.images[activeImage]} 
                  alt={request.server_name} 
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <Shield size={80} className="opacity-10" />
                </div>
              )}
              
              <div className={`absolute top-6 left-6 px-4 py-2 rounded-2xl flex items-center gap-2 border shadow-2xl font-black text-xs uppercase tracking-widest backdrop-blur-md ${statusInfo[request.status].color}`}>
                {statusInfo[request.status].icon}
                <span>{request.status}</span>
              </div>
            </div>

            {request.images && request.images.length > 1 && (
              <div className="p-4 flex gap-4 overflow-x-auto border-t border-border bg-muted/20">
                {request.images.map((img, i) => (
                  <button 
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`relative w-24 aspect-square rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${activeImage === i ? 'border-primary shadow-lg scale-105' : 'border-transparent opacity-60'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Description */}
          <section className="bg-white p-8 rounded-3xl shadow-sm border border-border">
            <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
              <Info className="text-primary" />
              <span>Server Description</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap font-medium">
              {request.description}
            </p>
          </section>
        </div>

        {/* Right Column: Info Card and Links */}
        <div className="space-y-8">
          <section className="bg-white p-8 rounded-3xl shadow-sm border border-border sticky top-24">
            <div className="text-center mb-8 pb-8 border-b border-muted">
              <h1 className="text-3xl font-black text-gray-900 mb-2">{request.server_name}</h1>
              <div className="flex items-center justify-center gap-2 text-muted-foreground uppercase text-xs font-black tracking-widest">
                <Globe size={14} />
                <span>{request.language}</span>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="p-2 bg-muted/50 rounded-xl group-hover:bg-primary/10 group-hover:text-primary transition-all">
                    <Shield size={18} />
                  </div>
                  <span className="text-sm font-bold uppercase tracking-tight">Type</span>
                </div>
                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-lg text-xs font-black uppercase tracking-widest">{request.type}</span>
              </div>

              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="p-2 bg-muted/50 rounded-xl group-hover:bg-primary/10 group-hover:text-primary transition-all">
                    <Clock size={18} />
                  </div>
                  <span className="text-sm font-bold uppercase tracking-tight">Difficulty</span>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-xs font-black uppercase tracking-widest">{request.difficulty}</span>
              </div>

              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="p-2 bg-muted/50 rounded-xl group-hover:bg-primary/10 group-hover:text-primary transition-all">
                    <Users size={18} />
                  </div>
                  <span className="text-sm font-bold uppercase tracking-tight">Players</span>
                </div>
                <span className="text-lg font-black text-primary">{request.players_count}</span>
              </div>
            </div>

            {request.links && request.links.length > 0 && (
              <div className="mt-8 pt-8 border-t border-muted space-y-4">
                <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                  <ExternalLink size={14} />
                  <span>Contact & Socials</span>
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {request.links.map((link, i) => (
                    <a 
                      key={i}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between px-4 py-3 bg-primary/5 hover:bg-primary text-primary hover:text-white rounded-2xl transition-all group font-black text-xs uppercase tracking-widest border border-primary/10"
                    >
                      <span>{link.label}</span>
                      <ExternalLink size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 pt-8 border-t border-muted">
              <div className="flex items-center gap-3 mb-4">
                {request.owner?.avatar_url ? (
                  <img src={request.owner.avatar_url} alt="" className="w-10 h-10 rounded-full border border-border" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Users size={20} />
                  </div>
                )}
                <div className="text-left">
                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground leading-none mb-1">Owner</p>
                  <p className="text-sm font-black text-gray-900">{request.owner?.username || 'Unknown'}</p>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground font-medium italic">
                Submitted on {new Date(request.created_at).toLocaleDateString()}
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default RequestDetail;
