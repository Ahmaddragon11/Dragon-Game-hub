'use client';

import { doc, getDoc, setDoc, updateDoc, onSnapshot, collection, query, where, getDocs, increment, arrayUnion, arrayRemove } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User } from 'firebase/auth';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  customId: string; // User set handle (e.g. @dragon)
  uniqueId: string; // Random 8-digit number
  bio: string;
  stats: {
    points: number;
    level: number;
    gamesPlayed: number;
    wins: number;
  };
  achievements: string[];
  likes: number;
  likedBy: string[];
  createdAt: string;
  isAdmin: boolean;
}

// Generate a random 8-digit ID
const generateUniqueId = () => {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
};

export const createUserProfile = async (user: User) => {
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    // Check if uniqueId exists (highly unlikely but good practice)
    let uniqueId = generateUniqueId();
    let isUnique = false;
    while (!isUnique) {
      const q = query(collection(db, 'users'), where('uniqueId', '==', uniqueId));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        isUnique = true;
      } else {
        uniqueId = generateUniqueId();
      }
    }

    const newProfile: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || 'اللاعب',
      photoURL: user.photoURL || '',
      customId: user.email?.split('@')[0] || 'user',
      uniqueId,
      bio: 'أحب الألعاب والتحدي! 🎮',
      stats: {
        points: 0,
        level: 1,
        gamesPlayed: 0,
        wins: 0,
      },
      achievements: [],
      likes: 0,
      likedBy: [],
      createdAt: new Date().toISOString(),
      isAdmin: user.email === 'ahmad22dragon113@gmail.com', // Auto-admin for specific email
    };

    await setDoc(userRef, newProfile);
    return newProfile;
  }

  return userSnap.data() as UserProfile;
};

export const updateUserStats = async (uid: string, points: number, won: boolean) => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    'stats.points': increment(points),
    'stats.gamesPlayed': increment(1),
    'stats.wins': increment(won ? 1 : 0),
    // Level calculation logic could be moved to a cloud function, but simple client-side for now
  });
};

export const toggleLikeUser = async (targetUid: string, currentUid: string) => {
  const targetRef = doc(db, 'users', targetUid);
  const targetSnap = await getDoc(targetRef);
  
  if (targetSnap.exists()) {
    const data = targetSnap.data() as UserProfile;
    const isLiked = data.likedBy?.includes(currentUid);

    if (isLiked) {
      await updateDoc(targetRef, {
        likes: increment(-1),
        likedBy: arrayRemove(currentUid)
      });
    } else {
      await updateDoc(targetRef, {
        likes: increment(1),
        likedBy: arrayUnion(currentUid)
      });
    }
  }
};

export const updateProfile = async (uid: string, data: Partial<UserProfile>) => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, data);
};
