import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../utils/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const UserContext = createContext();
export const useUser = () => useContext(UserContext);

export function UserProvider({ children }) {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true); // ✅ Add loading state

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Try localStorage
        const cached = localStorage.getItem("bookblog_user");
        if (cached) {
          setUserProfile(JSON.parse(cached));
          setLoading(false);
          return;
        }

        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userData = { uid: user.uid, ...docSnap.data() };
          localStorage.setItem("bookblog_user", JSON.stringify(userData));
          setUserProfile(userData);
        }
      } else {
        setUserProfile(null);
        localStorage.removeItem("bookblog_user");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ userProfile, setUserProfile, loading }}>
      {children}
    </UserContext.Provider>
  );
}
