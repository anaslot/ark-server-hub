import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { 
  User, Mail, Shield, Calendar, Edit2, 
  CheckCircle2, Clock, XCircle, Trash2, 
  ExternalLink, Upload, Save, X, Camera 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { profile, setProfile } = useAuth();
  const { t } = useTranslation();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [newUsername, setNewUsername] = useState(profile?.username || '');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (profile) {
      fetchUserRequests();
    }
  }, [profile]);

  const fetchUserRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('server_requests')
        .select('*')
        .eq('owner_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!newUsername.trim()) return toast.error('Username cannot be empty');
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ username: newUsername })
        .eq('id', profile.id)
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
      setEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error updating profile');
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('server-hub-bucket')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('server-hub-bucket')
        .getPublicUrl(filePath);

      const { data, error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id)
        .select()
        .single();

      if (updateError) throw updateError;
      setProfile(data);
      toast.success('Avatar updated successfully');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Error uploading avatar');
    } finally {
      setUploading(false);
    }
  };

  const statusColors = {
    'Pending': 'bg-yellow-100 text-yellow-800',
    'Accepted': 'bg-green-100 text-green-800',
    'Rejected': 'bg-red-100 text-red-800'
  };

  const roleColors = {
    'Guest': 'bg-gray-100 text-gray-800',
    'User': 'bg-blue-100 text-blue-800',
    'Admin': 'bg-purple-100 text-purple-800',
    'Owner': 'bg-red-100 text-red-800'
  };

  if (!profile) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-12">
      {/* Profile Header Card */}
      <section className="bg-white rounded-[2.5rem] shadow-2xl border border-border overflow-hidden">
        <div className="h-40 bg-gradient-to-r from-primary to-primary-800 relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-32 -mb-32"></div>
        </div>
        
        <div className="px-8 pb-10 relative">
          <div className="flex flex-col md:flex-row items-end gap-6 -mt-20 mb-8">
            <div className="relative group">
              <div className="w-40 h-40 rounded-[2.5rem] bg-white p-2 shadow-2xl border border-border">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover rounded-[2rem]" />
                ) : (
                  <div className="w-full h-full rounded-[2rem] bg-primary/5 flex items-center justify-center text-primary">
                    <User size={64} />
                  </div>
                )}
              </div>
              <label className="absolute bottom-4 right-4 p-2 bg-primary text-white rounded-xl shadow-lg cursor-pointer hover:bg-primary-600 transition-all active:scale-90 group-hover:scale-110">
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} />
                <Camera size={20} />
              </label>
            </div>

            <div className="flex-grow text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                {editing ? (
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className="text-3xl font-black text-gray-900 bg-muted/30 px-4 py-1 rounded-xl border border-primary/20 outline-none"
                    />
                    <button onClick={handleUpdateProfile} className="p-2 text-green-500 hover:bg-green-50 rounded-xl"><Save size={24} /></button>
                    <button onClick={() => setEditing(false)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl"><X size={24} /></button>
                  </div>
                ) : (
                  <>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">{profile.username}</h1>
                    <button onClick={() => setEditing(true)} className="p-2 text-muted-foreground hover:text-primary transition-colors"><Edit2 size={20} /></button>
                  </>
                )}
              </div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-sm ${roleColors[profile.role]}`}>
                  {profile.role}
                </span>
                <div className="flex items-center gap-1.5 text-muted-foreground font-bold text-xs uppercase tracking-tighter">
                  <Mail size={14} />
                  <span>{profile.email}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground font-bold text-xs uppercase tracking-tighter">
                  <Calendar size={14} />
                  <span>Joined {new Date(profile.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats and Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Your Requests */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-4">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
              <Shield className="text-primary" />
              <span>Your Server Requests</span>
            </h2>
            <Link 
              to="/submit" 
              className="px-6 py-2 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary-600 transition-all shadow-lg shadow-primary/20 active:scale-95"
            >
              New Server
            </Link>
          </div>

          <div className="space-y-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-32 bg-white rounded-3xl animate-pulse border border-border"></div>
              ))
            ) : requests.length > 0 ? (
              requests.map((req) => (
                <motion.div 
                  key={req.id}
                  whileHover={{ x: 10 }}
                  className="bg-white p-6 rounded-3xl border border-border shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 group hover:shadow-xl transition-all"
                >
                  <div className="flex items-center gap-6 w-full sm:w-auto">
                    <div className="w-16 h-16 rounded-2xl bg-muted overflow-hidden flex-shrink-0">
                      {req.images?.[0] ? (
                        <img src={req.images[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/30"><Shield size={24} /></div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-gray-900 group-hover:text-primary transition-colors">{req.server_name}</h3>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Code: {req.code}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm border ${statusColors[req.status]}`}>
                      {req.status}
                    </span>
                    <Link 
                      to={`/request/${req.code}`}
                      className="p-3 bg-muted/50 text-muted-foreground hover:bg-primary hover:text-white rounded-2xl transition-all shadow-sm"
                    >
                      <ExternalLink size={20} />
                    </Link>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="bg-white p-12 rounded-3xl border border-border text-center shadow-sm">
                <div className="bg-muted/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground"><Shield size={32} /></div>
                <h3 className="text-xl font-bold text-gray-900">No requests yet</h3>
                <p className="text-muted-foreground mt-2">Submit your first server to get started!</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Notifications & Activity */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3 px-4">
            <Calendar className="text-primary" />
            <span>Account Stats</span>
          </h2>

          <div className="bg-white p-8 rounded-3xl border border-border shadow-sm space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Total Servers</p>
                <p className="text-4xl font-black text-gray-900">{requests.length}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary"><Shield size={28} /></div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Accepted</p>
                <p className="text-4xl font-black text-green-600">{requests.filter(r => r.status === 'Accepted').length}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center text-green-600"><CheckCircle2 size={28} /></div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Pending</p>
                <p className="text-4xl font-black text-yellow-600">{requests.filter(r => r.status === 'Pending').length}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-yellow-50 flex items-center justify-center text-yellow-600"><Clock size={28} /></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
