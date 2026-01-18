import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { useState, useEffect, useContext, createContext } from "react";
import { provider, auth } from "./firebase";
import axiosInstance from "./axiosinstance";
import { getUserLocation } from "@/utils/getLocation";
import { getOtpMethod } from "@/utils/otpUtils";
import { toast } from "sonner";

const UserContext = createContext();

export const useAuth = () => {
  if (typeof window === "undefined") {
    return { user: null, setUser: () => { }, login: () => { }, logout: () => { }, handlegooglesignin: () => { } };
  }
  return useContext(UserContext);
};

export const useUser = useAuth;

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async (userdata) => {
    if (typeof window === "undefined") return;

    if (!userdata?._id) {
      console.error("Login aborted: User ID missing");
      setUser(null);
      return;
    }

    setUser(userdata);
    localStorage.setItem("user", JSON.stringify(userdata));

    try {
      const state = await getUserLocation();
      const otpMethod = getOtpMethod(state);

      await axiosInstance.post("/otp/send-otp", {
        method: otpMethod,
        email: userdata.email,
        phone: userdata.phone || "9999999999",
      });

      toast.success(`Verification OTP sent via ${otpMethod === 'email' ? 'Email' : 'SMS'}`, {
        description: `Location detected: ${state || 'Unknown'}. Theme adjusted accordingly.`,
      });
      console.log("OTP sent via:", otpMethod);
    } catch (err) {
      console.error("OTP request failed:", err);
      toast.error("Login security verification failed. Please try again.");
    }
  };

  const logout = async () => {
    if (typeof window === "undefined") return;

    setUser(null);
    localStorage.removeItem("user");

    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };

  const handlegooglesignin = async () => {
    if (typeof window === "undefined") return;

    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseuser = result.user;

      const payload = {
        email: firebaseuser.email,
        name: firebaseuser.displayName,
        image: firebaseuser.photoURL,
        phone: "9999999999",
      };

      const response = await axiosInstance.post("/auth/login", payload);
      await login(response.data.result);
    } catch (error) {
      console.error("Google Sign-in failed:", error);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseuser) => {
      if (!firebaseuser) return;

      try {
        const payload = {
          email: firebaseuser.email,
          name: firebaseuser.displayName,
          image: firebaseuser.photoURL,
          phone: "9999999999",
        };

        const response = await axiosInstance.post("/auth/login", payload);
        login(response.data.result);
      } catch (error) {
        console.error(error);
        logout();
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, login, logout, handlegooglesignin }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
