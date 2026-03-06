/* eslint-disable react-refresh/only-export-components */
import { useContext, useEffect, useState } from "react";
import { UserContext } from "./UserContext";

const initialUser = {
  isLoggedIn: false,
  id: "",
  name: "",
  email: "",
  role: "",
};

function getInitialUserFromStorage() {
  const cached = localStorage.getItem("session");
  if (!cached) {
    return initialUser;
  }

  try {
    const parsed = JSON.parse(cached);
    return parsed?.isLoggedIn ? parsed : initialUser;
  } catch {
    localStorage.removeItem("session");
    return initialUser;
  }
}

export function UserProvider({ children }) {
  const API_URL = import.meta.env.VITE_API_URL;
  const [user, setUser] = useState(getInitialUserFromStorage);

  useEffect(() => {
    const bootstrapProfile = async () => {
      try {
        const res = await fetch(`${API_URL}/api/user/profile`, {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          return;
        }

        const profile = await res.json();
        const loggedInUser = {
          isLoggedIn: true,
          id: profile._id,
          name: profile.username || "",
          email: profile.email,
          role: profile.role || "USER",
        };
        setUser(loggedInUser);
        localStorage.setItem("session", JSON.stringify(loggedInUser));
      } catch {
        // Ignore bootstrap failures
      }
    };

    bootstrapProfile();
  }, [API_URL]);

  const login = async (email, password) => {
    try {
      const result = await fetch(`${API_URL}/api/user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      if (!result.ok) {
        return false;
      }

      const data = await result.json();
      const newUser = {
        isLoggedIn: true,
        id: data.user.id,
        name: data.user.username || "",
        email: data.user.email,
        role: data.user.role || "USER",
      };

      setUser(newUser);
      localStorage.setItem("session", JSON.stringify(newUser));
      return true;
    } catch {
      return false;
    }
  };

  const logout = async () => {
    await fetch(`${API_URL}/api/user/logout`, {
      method: "POST",
      credentials: "include",
    });
    const newUser = { ...initialUser };
    setUser(newUser);
    localStorage.setItem("session", JSON.stringify(newUser));
  };

  return <UserContext.Provider value={{ user, login, logout }}>{children}</UserContext.Provider>;
}

export function useUser() {
  return useContext(UserContext);
}
