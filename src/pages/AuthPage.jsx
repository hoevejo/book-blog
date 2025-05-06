import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, googleProvider, db } from "../utils/firebaseConfig";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

export default function AuthPage() {
    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [displayName, setDisplayName] = useState("");
    const navigate = useNavigate(); // ✅ Add this

    const handleEmailAuth = async () => {
        try {
            let userCredential;
            if (isRegister) {
                if (!displayName) {
                    alert("Please enter a display name.");
                    return;
                }

                userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                const diceBearUrl = `https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(displayName)}`;

                await setDoc(doc(db, "users", user.uid), {
                    displayName,
                    profilePicture: diceBearUrl,
                    currentBooks: [],
                    favorites: [],
                    totalRead: 0,
                });
            } else {
                userCredential = await signInWithEmailAndPassword(auth, email, password);
            }

            console.log("Email auth success:", userCredential.user);
            navigate("/"); // ✅ Redirect after success
        } catch (err) {
            console.error("Auth error:", err.message);
            alert(err.message);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                await setDoc(docRef, {
                    displayName: user.displayName,
                    profilePicture: user.photoURL,
                    currentBooks: [],
                    favorites: [],
                    totalRead: 0,
                });
            }

            console.log("Google login success:", user);
            navigate("/"); // ✅ Redirect after Google login
        } catch (err) {
            console.error("Google login error:", err.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold text-center mb-6">
                    {isRegister ? "Create Account" : "Login"}
                </h2>

                <div className="space-y-4">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-indigo-400"
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-indigo-400"
                    />

                    {isRegister && (
                        <>
                            <input
                                type="text"
                                placeholder="Display Name"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-indigo-400"
                            />

                            {displayName && (
                                <div className="flex justify-center">
                                    <img
                                        src={`https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(displayName)}`}
                                        alt="Avatar Preview"
                                        className="w-16 h-16 rounded-full mt-2"
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>

                <button
                    onClick={handleEmailAuth}
                    className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition"
                >
                    {isRegister ? "Register" : "Login"}
                </button>

                <button
                    onClick={handleGoogleLogin}
                    className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md transition"
                >
                    Continue with Google
                </button>

                <p className="text-center text-sm mt-6">
                    {isRegister ? "Already have an account?" : "Need an account?"}{" "}
                    <span
                        className="text-indigo-600 hover:underline cursor-pointer"
                        onClick={() => setIsRegister(!isRegister)}
                    >
                        {isRegister ? "Login here" : "Register here"}
                    </span>
                </p>
            </div>
        </div>
    );
}
