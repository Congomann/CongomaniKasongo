
import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { User, UserRole, AdvisorCategory, ProductType } from '../../types';
import { Trash2, Plus, Search, Edit2, Shield, Globe, Power, PowerOff, X, Check, Save, Archive, RotateCcw, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminUsers: React.FC = () => {
  const { allUsers, addAdvisor, deleteAdvisor, updateUser, restoreUser, permanentlyDeleteUser } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  
  // Add User Form State
  const [formData, setFormData] = useState<Partial<User>>({
      name: '',
      email: '',
      role: UserRole.ADVISOR,
      category: AdvisorCategory.INSURANCE,
      productsSold: [],
      micrositeEnabled: true
  });

  const filteredUsers = allUsers.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const isArchived = !!u.deletedAt;
    return matchesSearch && (showArchived ? isArchived : !isArchived);
  });

  const handleAddUser = (e: React.FormEvent) => {
      e.preventDefault();
      if(formData.name && formData.email) {
          addAdvisor(formData as User);
          setIsModalOpen(false);
          setFormData({ name: '', email: '', role: UserRole.ADVISOR, category: AdvisorCategory.INSURANCE, productsSold: [], micrositeEnabled: true });
      }
  };

  const handleDelete = (id: string, name: string) => {
      // Soft Delete Action
      if(window.confirm(`Are you sure you want to remove ${name}? They will be moved to the archive for 30 days.`)) {
          deleteAdvisor(id);
      }
  };

  const handlePermanentDelete = (id: string) => {
      if(window.confirm('This action is permanent and cannot be undone. Delete user forever?')) {
          permanentlyDeleteUser(id);
      }
  };
  
  const toggleMicrosite = (id: string, currentStatus: boolean | undefined) => {
      updateUser(id, { micrositeEnabled: !currentStatus });
  };

  const handleEditClick = (user: User) => {
      setEditingUser(user);
  };

  const handleUpdateUser = (e: React.FormEvent) => {
      e.preventDefault();
      if (editingUser) {
          updateUser(editingUser.id, editingUser);
          setEditingUser(null);
      }
  };

  return (
    <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold text-[#0B2240]">{showArchived ? 'Archived Users' : 'User Management'}</h1>
                <p className="text-slate-500">{showArchived ? 'View and restore deleted accounts.' : 'Manage advisor access, permissions, and public microsites.'}</p>
            </div>
            <div className="flex gap-3 mt-4 md:mt-0">
                <button 
                    onClick={() => setShowArchived(!showArchived)}
                    className={`px-5 py-2.5 rounded-full font-bold text-sm shadow-sm transition-colors flex items-center gap-2 border ${showArchived ? 'bg-slate-100 text-slate-700 border-slate-300' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                >
                    <Archive className="h-4 w-4" /> {showArchived ? 'View Active' : 'View Archived'}
                </button>
                {!showArchived && (
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-[#0A62A7] text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" /> Add User
                    </button>
                )}
            </div>
        </div>

        {/* List Container */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            {/* Toolbar */}
            <div className="p-6 border-b border-slate-100 flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder={showArchived ? "Search archived users..." : "Search users..."}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white text-slate-900 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500">
                        <tr>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Microsite</th>
                            <th className="px-6 py-4">Products</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredUsers.map(user => {
                            const advisorSlug = user.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                            return (
                                <tr key={user.id} className={`transition-colors ${showArchived ? 'bg-orange-50/30' : 'hover:bg-slate-50/50'}`}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`h-9 w-9 rounded-full overflow-hidden ${showArchived ? 'bg-slate-100 grayscale' : 'bg-slate-200'}`}>
                                                {user.avatar ? <img src={user.avatar} className="h-full w-full object-cover" /> : <div className="h-full w-full flex items-center justify-center font-bold text-slate-500">{user.name[0]}</div>}
                                            </div>
                                            <div>
                                                <p className={`font-bold ${showArchived ? 'text-slate-500' : 'text-[#0B2240]'}`}>{user.name}</p>
                                                <p className="text-xs text-slate-400">{user.email}</p>
                                                {user.deletedAt && (
                                                    <span className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-0.5">
                                                        <AlertTriangle className="h-3 w-3" /> 
                                                        Archived: {new Date(user.deletedAt).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${user.role === UserRole.ADMIN ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.role === UserRole.ADVISOR && !showArchived && (
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => toggleMicrosite(user.id, user.micrositeEnabled)} className={`p-1 rounded-full ${user.micrositeEnabled ? 'bg-green-100' : 'bg-slate-100'}`} title={user.micrositeEnabled ? 'Disable' : 'Enable'}>
                                                {user.micrositeEnabled ? <Power className="h-3 w-3 text-green-600"/> : <PowerOff className="h-3 w-3 text-slate-400"/>}
                                                </button>
                                                {user.micrositeEnabled && (
                                                    <Link to={`/advisor/${advisorSlug}`} target="_blank" className="text-slate-400 hover:text-blue-600" title="View Live Page">
                                                        <Globe className="h-4 w-4" />
                                                    </Link>
                                                )}
                                            </div>
                                        )}
                                        {showArchived && <span className="text-slate-400 text-xs italic">Disabled</span>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {user.productsSold?.slice(0,2).map(l => (
                                                <span key={l} className="text-[10px] bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-slate-500">
                                                    {l}
                                                </span>
                                            ))}
                                            {user.productsSold && user.productsSold.length > 2 && <span className="text-[10px] text-slate-400">+{user.productsSold.length - 2}</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {showArchived ? (
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => restoreUser(user.id)} 
                                                    className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-bold hover:bg-green-200 transition-colors flex items-center gap-1"
                                                >
                                                    <RotateCcw className="h-3 w-3" /> Restore
                                                </button>
                                                <button 
                                                    onClick={() => handlePermanentDelete(user.id)} 
                                                    className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-bold hover:bg-red-200 transition-colors flex items-center gap-1"
                                                >
                                                    <Trash2 className="h-3 w-3" /> Delete Forever
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex justify-end">
                                                <button onClick={() => handleEditClick(user)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-blue-600 mr-1" title="Edit">
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => handleDelete(user.id, user.name)} className="p-2 hover:bg-red-50 rounded-full text-slate-400 hover:text-red-600" title="Archive (Soft Delete)">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            )
                        })}
                        {filteredUsers.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center py-12 text-slate-400 italic">No {showArchived ? 'archived' : 'active'} users found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Add Modal */}
        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B2240]/50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-8 animate-fade-in">
                    <h2 className="text-xl font-bold text-[#0B2240] mb-6">Add New User</h2>
                    <form onSubmit={handleAddUser} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                            <input 
                                type="text" 
                                required
                                className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#0A62A7] focus:border-transparent"
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
                            <input 
                                type="email" 
                                required
                                className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#0A62A7] focus:border-transparent"
                                value={formData.email}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Role</label>
                            <select 
                                className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#0A62A7] focus:border-transparent"
                                value={formData.role}
                                onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
                            >
                                {Object.values(UserRole).filter(r => r !== UserRole.CLIENT).map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                        <div className="pt-4 flex gap-3">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors">Cancel</button>
                            <button type="submit" className="flex-1 py-3 rounded-xl font-bold bg-[#0A62A7] text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/20">Create User</button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* Edit User Modal */}
        {editingUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B2240]/50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-8 animate-fade-in relative">
                    <button onClick={() => setEditingUser(null)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"><X className="h-5 w-5"/></button>
                    <h2 className="text-xl font-bold text-[#0B2240] mb-6">Edit User Profile</h2>
                    <form onSubmit={handleUpdateUser} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                            <input 
                                type="text" 
                                required
                                className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#0A62A7] focus:border-transparent"
                                value={editingUser.name}
                                onChange={e => setEditingUser({...editingUser, name: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
                            <input 
                                type="email" 
                                required
                                className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#0A62A7] focus:border-transparent"
                                value={editingUser.email}
                                onChange={e => setEditingUser({...editingUser, email: e.target.value})}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Role</label>
                                <select 
                                    className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#0A62A7] focus:border-transparent"
                                    value={editingUser.role}
                                    onChange={e => setEditingUser({...editingUser, role: e.target.value as UserRole})}
                                >
                                    {Object.values(UserRole).map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">License State</label>
                                <input 
                                    type="text"
                                    className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#0A62A7] focus:border-transparent"
                                    value={editingUser.license_state || ''}
                                    onChange={e => setEditingUser({...editingUser, license_state: e.target.value})}
                                    placeholder="e.g. CA"
                                />
                            </div>
                        </div>

                        {/* Microsite Toggle in Edit Modal */}
                        {editingUser.role === UserRole.ADVISOR && (
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between mt-4">
                                <div>
                                    <p className="text-sm font-bold text-slate-700">Public Microsite</p>
                                    <p className="text-xs text-slate-500">Enable advisor public profile page</p>
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => setEditingUser({...editingUser, micrositeEnabled: !editingUser.micrositeEnabled})}
                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${editingUser.micrositeEnabled ? 'bg-green-500' : 'bg-slate-300'}`}
                                >
                                    <span 
                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${editingUser.micrositeEnabled ? 'translate-x-5' : 'translate-x-0'}`}
                                    />
                                </button>
                            </div>
                        )}

                        <div className="pt-6 flex gap-3">
                            <button type="button" onClick={() => setEditingUser(null)} className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors">Cancel</button>
                            <button type="submit" className="flex-1 py-3 rounded-xl font-bold bg-[#0A62A7] text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2">
                                <Save className="h-4 w-4" /> Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
};
