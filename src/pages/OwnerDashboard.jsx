import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { 
  Shield, Users, Server, CheckCircle2, 
  Clock, XCircle, Trash2, Edit2, 
  ExternalLink, Search, Filter, ArrowUpDown, 
  UserMinus, UserPlus, Bell, Info, Mail,
  ShieldAlert, ShieldCheck, Database, Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const OwnerDashboard = () => {
  const { profile } = useAuth();
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdate = async (userId, newRole) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;
      toast.success(`User role updated to ${newRole}`);
      fetchUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Error updating role');
    }
  };

  const handleUserStatus = async (userId, isActive) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: isActive, role: isActive ? 'User' : 'Blocked' })
        .eq('id', userId);

      if (error) throw error;
      toast.success(`User ${isActive ? 'unblocked' : 'blocked'} successfully`);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Error updating user status');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.username.toLowerCase().includes(search.toLowerCase()) || 
                          u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-[2rem] bg-red-500 text-white flex items-center justify-center shadow-2xl shadow-red-200">
            <ShieldAlert size={40} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Owner Control Hub</h1>
            <p className="text-muted-foreground mt-1 font-medium italic">Highest authority level. Absolute site control.</p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="bg-white p-4 rounded-3xl border border-border shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><Database size={20} /></div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Database</p>
              <p className="text-sm font-black text-gray-900 leading-none">Healthy</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-3xl border border-border shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center"><Settings size={20} /></div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">System</p>
              <p className="text-sm font-black text-gray-900 leading-none">Online</p>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Admins', value: users.filter(u => u.role === 'Admin').length, icon: <ShieldCheck />, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Total Owners', value: users.filter(u => u.role === 'Owner').length, icon: <ShieldAlert />, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Standard Users', value: users.filter(u => u.role === 'User').length, icon: <Users />, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Blocked Users', value: users.filter(u => u.role === 'Blocked').length, icon: <UserMinus />, color: 'text-gray-600', bg: 'bg-gray-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-border shadow-sm flex items-center gap-6 group hover:shadow-xl transition-all">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${stat.bg} ${stat.color}`}>{stat.icon}</div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-4xl font-black text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[3rem] shadow-2xl border border-border overflow-hidden min-h-[600px]">
        {/* Controls */}
        <div className="p-10 border-b border-muted flex flex-col md:flex-row gap-6 items-center justify-between bg-muted/5">
          <div className="relative w-full md:w-[400px]">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-white rounded-2xl border border-transparent focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold text-gray-700 shadow-sm"
            />
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 md:pb-0">
            {['all', 'Owner', 'Admin', 'User', 'Blocked'].map((role) => (
              <button 
                key={role}
                onClick={() => setFilterRole(role)}
                className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${filterRole === role ? 'bg-primary text-white border-primary shadow-xl shadow-primary/30' : 'bg-white text-muted-foreground border-border hover:border-primary/50'}`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* User Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-20 text-center"><div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto"></div></div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/20 border-b border-muted">
                  <th className="px-10 py-6 text-xs font-black uppercase tracking-widest text-muted-foreground">User Profile</th>
                  <th className="px-10 py-6 text-xs font-black uppercase tracking-widest text-muted-foreground">Security Role</th>
                  <th className="px-10 py-6 text-xs font-black uppercase tracking-widest text-muted-foreground">Account Status</th>
                  <th className="px-10 py-6 text-xs font-black uppercase tracking-widest text-muted-foreground">Admin Privileges</th>
                  <th className="px-10 py-6 text-xs font-black uppercase tracking-widest text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-muted">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-primary/[0.02] transition-colors group">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-6">
                        <div className="relative">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt="" className="w-14 h-14 rounded-2xl object-cover shadow-md" />
                          ) : (
                            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20"><Users size={24} /></div>
                          )}
                          <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        </div>
                        <div>
                          <p className="font-black text-lg text-gray-900 group-hover:text-primary transition-colors">{user.username}</p>
                          <p className="text-sm font-bold text-muted-foreground leading-none mt-1">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${user.role === 'Owner' ? 'bg-red-100 text-red-800 border-red-200' : user.role === 'Admin' ? 'bg-purple-100 text-purple-800 border-purple-200' : 'bg-blue-100 text-blue-800 border-blue-200'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex flex-col">
                        <span className={`text-sm font-black uppercase tracking-tighter ${user.is_active ? 'text-green-600' : 'text-red-600'}`}>
                          {user.is_active ? 'Verified Active' : 'Account Blocked'}
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">ID: {user.id.slice(0, 8)}</span>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      {user.role !== 'Owner' && (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleRoleUpdate(user.id, user.role === 'Admin' ? 'User' : 'Admin')}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border shadow-sm ${user.role === 'Admin' ? 'bg-purple-50 text-purple-600 border-purple-100 hover:bg-purple-600 hover:text-white' : 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-600 hover:text-white'}`}
                          >
                            {user.role === 'Admin' ? <ShieldCheck size={14} /> : <ShieldCheck size={14} />}
                            {user.role === 'Admin' ? 'Revoke Admin' : 'Make Admin'}
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex gap-3">
                        {user.role !== 'Owner' && (
                          <button 
                            onClick={() => handleUserStatus(user.id, !user.is_active)}
                            className={`p-3 rounded-2xl transition-all shadow-sm border ${user.is_active ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-600 hover:text-white' : 'bg-green-50 text-green-600 border-green-100 hover:bg-green-600 hover:text-white'}`}
                            title={user.is_active ? 'Block User' : 'Unblock User'}
                          >
                            {user.is_active ? <UserMinus size={20} /> : <UserPlus size={20} />}
                          </button>
                        )}
                        <button className="p-3 bg-muted/50 text-muted-foreground rounded-2xl hover:bg-primary hover:text-white transition-all shadow-sm border border-muted" title="Message User"><Mail size={20} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
