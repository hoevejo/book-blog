import React, { createContext, useEffect, useState } from "react";
import { auth, db } from "../utils/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (uid) => {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const userData = { uid, ...docSnap.data() };
      localStorage.setItem("bookblog_user", JSON.stringify(userData));
      setUserProfile(userData);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Try localStorage first
        const cached = localStorage.getItem("bookblog_user");
        if (cached) {
          setUserProfile(JSON.parse(cached));
          setLoading(false);
          // Also re-fetch in background
          fetchUserProfile(user.uid);
          return;
        }
        await fetchUserProfile(user.uid);
      } else {
        setUserProfile(null);
        localStorage.removeItem("bookblog_user");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ userProfile, fetchUserProfile, setUserProfile, loading }}>
      {children}
    </UserContext.Provider>
  );
}