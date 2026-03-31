import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { 
  Shield, Users, Server, CheckCircle2, 
  Clock, XCircle, Trash2, Edit2, 
  ExternalLink, Search, Filter, ArrowUpDown, 
  UserMinus, UserPlus, Bell, Info, Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const { profile } = useAuth();
  const { t } = useTranslation();
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('requests');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchData();
  }, [tab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (tab === 'requests') {
        const { data, error } = await supabase
          .from('server_requests')
          .select('*, owner:profiles(*)')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setRequests(data || []);
      } else if (tab === 'users') {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setUsers(data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('server_requests')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      toast.success(`Request ${newStatus.toLowerCase()} successfully`);
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error updating status');
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
      fetchData();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Error updating user status');
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.server_name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 flex items-center gap-4">
            <Shield className="text-primary" size={40} />
            <span>Admin Control Panel</span>
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">Manage server requests and user accounts.</p>
        </div>

        <div className="flex bg-muted/30 p-1.5 rounded-2xl border border-border">
          <button 
            onClick={() => setTab('requests')}
            className={`px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${tab === 'requests' ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground hover:text-primary'}`}
          >
            Requests
          </button>
          <button 
            onClick={() => setTab('users')}
            className={`px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${tab === 'users' ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground hover:text-primary'}`}
          >
            Users
          </button>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Requests', value: requests.length, icon: <Server />, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Pending', value: requests.filter(r => r.status === 'Pending').length, icon: <Clock />, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'Total Users', value: users.length, icon: <Users />, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Blocked', value: users.filter(u => u.role === 'Blocked').length, icon: <UserMinus />, color: 'text-red-600', bg: 'bg-red-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-border shadow-sm flex items-center gap-6">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color}`}>{stat.icon}</div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-3xl font-black text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-border overflow-hidden min-h-[500px]">
        {/* Table Controls */}
        <div className="p-8 border-b border-muted flex flex-col md:flex-row gap-4 items-center justify-between bg-muted/10">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input 
              type="text" 
              placeholder="Search..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white rounded-xl border border-transparent focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium"
            />
          </div>

          {tab === 'requests' && (
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
              {['all', 'Pending', 'Accepted', 'Rejected'].map((status) => (
                <button 
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${filterStatus === status ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white text-muted-foreground border-border hover:border-primary/50'}`}
                >
                  {status}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-20 text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div></div>
          ) : tab === 'requests' ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/30 border-b border-muted">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Server Name</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Owner</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Type/Difficulty</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-muted">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-primary/5 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-muted overflow-hidden flex-shrink-0 border border-border">
                          {req.images?.[0] ? <img src={req.images[0]} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-muted-foreground/30"><Server size={20} /></div>}
                        </div>
                        <div>
                          <p className="font-black text-gray-900 leading-none mb-1">{req.server_name}</p>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{req.code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        {req.owner?.avatar_url ? <img src={req.owner.avatar_url} alt="" className="w-8 h-8 rounded-full" /> : <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary"><Users size={14} /></div>}
                        <p className="text-sm font-bold text-gray-700">{req.owner?.username || 'Unknown'}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex gap-2">
                        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-lg text-[10px] font-black uppercase tracking-widest">{req.type}</span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-[10px] font-black uppercase tracking-widest">{req.difficulty}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${req.status === 'Accepted' ? 'bg-green-100 text-green-800 border-green-200' : req.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'bg-red-100 text-red-800 border-red-200'}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex gap-2">
                        {req.status === 'Pending' && (
                          <>
                            <button onClick={() => handleStatusUpdate(req.id, 'Accepted')} className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all"><CheckCircle2 size={18} /></button>
                            <button onClick={() => handleStatusUpdate(req.id, 'Rejected')} className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all"><XCircle size={18} /></button>
                          </>
                        )}
                        <Link to={`/request/${req.code}`} className="p-2 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-white transition-all"><ExternalLink size={18} /></Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/30 border-b border-muted">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">User</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Role</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-muted">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-primary/5 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        {user.avatar_url ? <img src={user.avatar_url} alt="" className="w-10 h-10 rounded-full" /> : <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary"><Users size={18} /></div>}
                        <p className="font-black text-gray-900">{user.username}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm font-bold text-muted-foreground">{user.email}</td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${user.role === 'Owner' ? 'bg-red-100 text-red-800' : user.role === 'Admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {user.is_active ? 'Active' : 'Blocked'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex gap-2">
                        {user.role !== 'Owner' && (
                          <button 
                            onClick={() => handleUserStatus(user.id, !user.is_active)}
                            className={`p-2 rounded-xl transition-all ${user.is_active ? 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white' : 'bg-green-50 text-green-600 hover:bg-green-600 hover:text-white'}`}
                          >
                            {user.is_active ? <UserMinus size={18} /> : <UserPlus size={18} />}
                          </button>
                        )}
                        <button className="p-2 bg-muted/50 text-muted-foreground rounded-xl hover:bg-primary hover:text-white transition-all"><Mail size={18} /></button>
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

export default AdminDashboard;
