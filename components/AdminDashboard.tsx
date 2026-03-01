'use client';

import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { UserProfile } from '@/lib/user-service';
import { Shield, Trash2, Edit, Save, X } from 'lucide-react';

export function AdminDashboard() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<UserProfile>>({});

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        setUsers(snapshot.docs.map(doc => doc.data() as UserProfile));
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleEdit = (user: UserProfile) => {
    setEditingUser(user.uid);
    setEditForm(user);
  };

  const handleSave = async (uid: string) => {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, editForm);
      setUsers(prev => prev.map(u => u.uid === uid ? { ...u, ...editForm } : u));
      setEditingUser(null);
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleDelete = async (uid: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم نهائياً؟')) return;
    try {
      await deleteDoc(doc(db, 'users', uid));
      setUsers(prev => prev.filter(u => u.uid !== uid));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  if (loading) return <div className="text-center py-20 text-slate-400">جاري تحميل لوحة التحكم...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="w-8 h-8 text-red-500" />
        <h2 className="text-3xl font-bold text-slate-100">لوحة التحكم (Admin)</h2>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-slate-700/50 shadow-2xl">
        <table className="w-full text-right text-sm text-slate-400">
          <thead className="bg-slate-900/50 text-xs uppercase text-slate-500 font-bold">
            <tr>
              <th className="px-6 py-4">المستخدم</th>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">النقاط</th>
              <th className="px-6 py-4">الحالة</th>
              <th className="px-6 py-4">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 bg-slate-800/20">
            {users.map((user) => (
              <tr key={user.uid} className="hover:bg-slate-800/50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-200 flex items-center gap-3">
                  <img 
                    src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} 
                    alt="" 
                    className="w-8 h-8 rounded-full"
                  />
                  {editingUser === user.uid ? (
                    <input 
                      value={editForm.displayName || ''} 
                      onChange={e => setEditForm({...editForm, displayName: e.target.value})}
                      className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white w-32"
                    />
                  ) : (
                    user.displayName
                  )}
                </td>
                <td className="px-6 py-4 font-mono">{user.uniqueId}</td>
                <td className="px-6 py-4 text-amber-400 font-bold">
                  {editingUser === user.uid ? (
                    <input 
                      type="number"
                      value={editForm.stats?.points || 0} 
                      onChange={e => setEditForm({...editForm, stats: {...editForm.stats!, points: parseInt(e.target.value)}})}
                      className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white w-20"
                    />
                  ) : (
                    user.stats?.points?.toLocaleString()
                  )}
                </td>
                <td className="px-6 py-4">
                  {user.isAdmin ? (
                    <span className="px-2 py-1 bg-red-500/20 text-red-300 rounded text-xs font-bold border border-red-500/20">Admin</span>
                  ) : (
                    <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs font-bold border border-green-500/20">User</span>
                  )}
                </td>
                <td className="px-6 py-4 flex gap-2">
                  {editingUser === user.uid ? (
                    <>
                      <button onClick={() => handleSave(user.uid)} className="p-2 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30">
                        <Save className="w-4 h-4" />
                      </button>
                      <button onClick={() => setEditingUser(null)} className="p-2 bg-slate-700 text-slate-400 rounded hover:bg-slate-600">
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEdit(user)} className="p-2 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(user.uid)} className="p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
