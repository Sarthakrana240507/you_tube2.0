import React from "react";
import { useAuth } from "../lib/AuthContext";

const Login = () => {
  const { handlegooglesignin } = useAuth();

  return (
    <div className="flex items-center justify-center h-screen bg-black text-white">
      <div className="w-[350px] p-6 rounded-lg border border-gray-700 bg-[#121212]">
        <h2 className="text-2xl font-semibold text-center mb-4">
          Sign In to YourTube
        </h2>

        <button
          onClick={handlegooglesignin}
          className="w-full flex items-center justify-center gap-3 bg-white text-black font-medium py-2 rounded hover:bg-gray-300 transition"
        >
          <img
            src="https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png"
            alt="Google logo"
            className="w-5 h-5"
          />
          Sign in with Google
        </button>

        <p className="text-sm text-center text-gray-400 mt-4">
          This will log you in using your Google account
        </p>
      </div>
    </div>
  );
};

export default Login;
