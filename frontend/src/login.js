import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { auth, db } from "./Firebase";
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { query, getDocs, collection, where} from "firebase/firestore";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const googleProvider = new GoogleAuthProvider();
  const signInWithGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const user = res.user;
      const q = query(collection(db, "users"), where("uid", "==", user.uid));
      const docs = await getDocs(q);
      if (docs.docs.length === 0) {
         alert("User does not exist");
         navigate("/signup");
         return;
      }
      navigate("/");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const logInWithEmailAndPassword = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <div className="relative flex flex-col justify-center items-center w-screen h-screen overflow-hidden">
      {/* Background with curved S-shape divider */}
      <div className="absolute inset-0 bg-pink-400">
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
          <path d="M0,0 L100,0 L100,40 C70,30 30,70 0,60 L0,0 Z" fill="#3b82f6" />
        </svg>
      </div>

      {/* Login Form */}
      <div className="z-10 bg-white backdrop-blur-sm p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">Login</h1>

        <div className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Enter your Email"
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Enter your Password"
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <button
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl transition duration-200 ease-in-out"
            onClick={() =>
              setTimeout(() => {
                logInWithEmailAndPassword();
              }, 1500)
            }
          >
            Login
          </button>

          <div
            onClick={() => navigate("/password_reset")}
            className="text-sm text-blue-600 hover:text-blue-800 text-center cursor-pointer underline"
          >
            Forgot password?
          </div>

          <div className="flex items-center my-4">
            <div className="flex-1 h-px bg-gray-300"></div>
            <div className="px-4 text-gray-500 text-sm">OR</div>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          <button
            onClick={() => signInWithGoogle()}
            className="w-full flex items-center justify-center gap-2 border border-gray-300 py-3 px-4 rounded-xl hover:bg-gray-100 transition duration-200 ease-in-out"
          >
            <FcGoogle className="text-xl" />
            <span className="font-medium">Continue with Google</span>
          </button>
        </div>
      </div>
    </div>
  );
}