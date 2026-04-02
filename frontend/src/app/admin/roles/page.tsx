'use client';

import { useState, useEffect } from 'react';
import { roleApi } from '@/lib/api';
import { Role } from '@/types';
import { 
  ShieldCheck, 
  Plus, 
  Pencil, 
  Trash2, 
  CheckCircle, 
  XCircle,
  Key
} from 'lucide-react';

interface Permission {
  id: string;
  label: string;
  module: string;
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
    isActive: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [rolesData, permsData] = await Promise.all([
        roleApi.getAll(),
        roleApi.getPermissions()
      ]);
      setRoles(rolesData);
      setPermissions(permsData);
    } catch (error) {
      console.error('Failed to load roles data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openAddForm = () => {
    setEditingRole(null);
    setFormData({ name: '', description: '', permissions: [], isActive: true });
    setIsModalOpen(true);
  };

  const openEditForm = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description || '',
      permissions: role.permissions || [],
      isActive: role.isActive,
    });
    setIsModalOpen(true);
  };

  const togglePermission = (permId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permId)
        ? prev.permissions.filter(p => p !== permId)
        : [...prev.permissions, permId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRole) {
        await roleApi.update(editingRole.id, formData);
      } else {
        await roleApi.create(formData);
      }
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      console.error('Failed to save role:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this role?')) return;
    try {
      await roleApi.delete(id);
      loadData();
    } catch (error) {
      console.error('Failed to delete role:', error);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-indigo-600" />
            Role Management
          </h1>
          <p className="text-slate-500 mt-1 font-medium italic">Define access levels and permissions</p>
        </div>
        <button
          onClick={openAddForm}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl transition-all shadow-md hover:shadow-indigo-200 active:scale-95 font-semibold"
        >
          <Plus className="h-5 w-5" />
          Create New Role
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="p-5 text-sm font-bold text-slate-600 uppercase tracking-wider">Role Name</th>
              <th className="p-5 text-sm font-bold text-slate-600 uppercase tracking-wider">Description</th>
              <th className="p-5 text-sm font-bold text-slate-600 uppercase tracking-wider text-center">Permissions</th>
              <th className="p-5 text-sm font-bold text-slate-600 uppercase tracking-wider text-center">Status</th>
              <th className="p-5 text-sm font-bold text-slate-600 uppercase tracking-wider text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="p-10 text-center text-slate-400 font-medium italic animate-pulse">
                  Loading roles...
                </td>
              </tr>
            ) : roles.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-10 text-center text-slate-400 font-medium italic">
                  No roles found. Create your first role!
                </td>
              </tr>
            ) : (
              roles.map((role) => (
                <tr key={role.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-5 font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{role.name}</td>
                  <td className="p-5 text-slate-500 font-medium italic">{role.description || '-'}</td>
                  <td className="p-5 text-center">
                    <div className="flex flex-wrap justify-center gap-1 max-w-[300px] mx-auto">
                      {role.permissions && role.permissions.length > 0 ? (
                        role.permissions.map(pId => {
                          const perm = permissions.find(p => p.id === pId);
                          return (
                            <span key={pId} className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full text-[10px] font-bold border border-indigo-100 shadow-sm" title={perm?.label}>
                              {pId.split(':')[0]}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-slate-400 text-xs italic">No permissions</span>
                      )}
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex justify-center">
                      {role.isActive ? (
                        <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100 shadow-sm">
                          <CheckCircle className="h-4 w-4" /> Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-rose-600 bg-rose-50 px-3 py-1 rounded-full text-xs font-bold border border-rose-100 shadow-sm">
                          <XCircle className="h-4 w-4" /> Inactive
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => openEditForm(role)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all active:scale-90"
                        title="Edit Role"
                      >
                        <Pencil className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(role.id)}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-all active:scale-90"
                        title="Delete Role"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Role Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in zoom-in duration-300">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-200">
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-8 text-white relative">
              <h2 className="text-2xl font-black">{editingRole ? 'Edit Role' : 'Create New Role'}</h2>
              <p className="opacity-80 font-semibold italic mt-1">Configure access levels and permissions</p>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
                title="Close"
              >
                 <XCircle className="h-8 w-8" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 pl-1 uppercase tracking-wider">Role Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border-2 border-slate-100 rounded-xl p-4 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all placeholder:italic font-medium"
                    placeholder="e.g. branch_manager"
                  />
                </div>
                <div className="space-y-2 flex flex-col justify-end pb-2">
                   <label className="flex items-center gap-3 cursor-pointer group bg-slate-50/50 p-4 rounded-xl border border-dashed border-slate-300 hover:border-indigo-400 transition-all">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-6 h-6 rounded-md text-indigo-600 focus:ring-indigo-500 border-slate-300 transition-all"
                    />
                    <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors uppercase tracking-wider">This Role is Active</span>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 pl-1 uppercase tracking-wider">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border-2 border-slate-100 rounded-xl p-4 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all placeholder:italic font-medium min-h-[100px]"
                  placeholder="What can this role do?"
                />
              </div>

              <div className="space-y-4">
                <label className="text-sm font-bold text-slate-700 pl-1 uppercase tracking-wider flex items-center gap-2">
                  <Key className="h-5 w-5 text-amber-500" />
                  Module Permissions
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {permissions.map((perm) => (
                    <label 
                      key={perm.id} 
                      className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer group hover:scale-[1.02] active:scale-95 ${
                        formData.permissions.includes(perm.id)
                          ? 'bg-indigo-50 border-indigo-200 shadow-sm'
                          : 'bg-white border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(perm.id)}
                        onChange={() => togglePermission(perm.id)}
                        className="w-6 h-6 rounded-md text-indigo-600 focus:ring-indigo-500 border-slate-300 transition-all"
                      />
                      <div>
                        <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-700 transition-colors tracking-tight">{perm.label}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{perm.module}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t border-slate-100 mt-8">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-4 rounded-xl border-2 border-slate-100 hover:bg-slate-50 text-slate-600 font-bold transition-all active:scale-95 uppercase tracking-wider text-sm shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold transition-all shadow-lg hover:shadow-indigo-200 active:scale-95 uppercase tracking-wider text-sm"
                >
                  {editingRole ? 'Save Changes' : 'Create Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
