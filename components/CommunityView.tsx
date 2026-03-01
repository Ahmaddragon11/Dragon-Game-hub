'use client';

import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs, doc, updateDoc, arrayUnion, arrayRemove, increment } from 'firebase/firestore';
import { UserProfile } from '@/lib/user-service';
import { Heart, Users, MessageSquare, ShieldCheck, UserPlus } from 'lucide-react';

export function CommunityView() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const q = query(collection(db, 'users'), orderBy('stats.points', 'desc'), limit(50));
        const snapshot = await getDocs(q);
        const userList = snapshot.docs.map(doc => doc.data() as UserProfile);
        setUsers(userList);
      } catch (error) {
        console.error("Error fetching community:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleLike = async (targetUid: string) => {
    if (!currentUser) return alert('يجب تسجيل الدخول للإعجاب!');
    
    // Optimistic update
    setUsers(prev => prev.map(u => {
      if (u.uid === targetUid) {
        const isLiked = u.likedBy?.includes(currentUser.uid);
        return {
          ...u,
          likes: isLiked ? u.likes - 1 : u.likes + 1,
          likedBy: isLiked ? u.likedBy.filter(id => id !== currentUser.uid) : [...(u.likedBy || []), currentUser.uid]
        };
      }
      return u;
    }));

    // Server update
    const targetRef = doc(db, 'users', targetUid);
    const user = users.find(u => u.uid === targetUid);
    const isLiked = user?.likedBy?.includes(currentUser.uid);

    if (isLiked) {
      await updateDoc(targetRef, {
        likes: increment(-1),
        likedBy: arrayRemove(currentUser.uid)
      });
    } else {
      await updateDoc(targetRef, {
        likes: increment(1),
        likedBy: arrayUnion(currentUser.uid)
      });
    }
  };

  if (loading) return <div className="text-center py-20 text-slate-400">جاري تحميل المجتمع...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
          <Users className="w-8 h-8 text-violet-400" />
          مجتمع اللاعبين
        </h2>
        <div className="text-sm text-slate-400">
          {users.length} عضو نشط
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user, index) => (
          <div key={user.uid} className="bg-slate-800/50 border border-slate-700/50 rounded-3xl p-6 flex flex-col gap-4 hover:bg-slate-800 transition-colors group relative overflow-hidden">
            {/* Rank Badge */}
            <div className="absolute top-0 left-0 bg-slate-900/80 px-4 py-2 rounded-br-2xl text-xs font-bold text-slate-400 border-r border-b border-slate-700/50">
              #{index + 1}
            </div>

            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img 
                    src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} 
                    alt={user.displayName} 
                    className="w-16 h-16 rounded-2xl border-2 border-violet-500/30 group-hover:border-violet-500 transition-colors object-cover"
                  />
                  {user.isAdmin && (
                    <div className="absolute -bottom-2 -right-2 bg-red-500 text-white p-1 rounded-full border-2 border-slate-800" title="Admin">
                      <ShieldCheck className="w-3 h-3" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-lg flex items-center gap-2">
                    {user.displayName}
                    <span className="text-xs font-normal text-slate-500 bg-slate-900 px-2 py-0.5 rounded-md">
                      @{user.customId}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-1">ID: {user.uniqueId}</p>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-1">{user.bio}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center bg-slate-900/50 rounded-xl p-3 border border-slate-800">
              <div>
                <div className="text-xs text-slate-500 mb-1">النقاط</div>
                <div className="font-bold text-amber-400">{user.stats?.points?.toLocaleString() || 0}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">المستوى</div>
                <div className="font-bold text-violet-400">{user.stats?.level || 1}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">الفوز</div>
                <div className="font-bold text-emerald-400">{user.stats?.wins || 0}</div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-700/50">
              <button 
                onClick={() => handleLike(user.uid)}
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                  user.likedBy?.includes(currentUser?.uid || '') 
                    ? 'text-pink-500' 
                    : 'text-slate-400 hover:text-pink-400'
                }`}
              >
                <Heart className={`w-4 h-4 ${user.likedBy?.includes(currentUser?.uid || '') ? 'fill-current' : ''}`} />
                {user.likes || 0}
              </button>

              <div className="flex gap-2">
                <button className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors" title="إرسال رسالة">
                  <MessageSquare className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors" title="إضافة صديق">
                  <UserPlus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
