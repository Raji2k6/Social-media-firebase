import { createContext, useContext, useEffect, useState } from "react";

/*
  This context manages authentication state
*/
const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // TEMP: Simulate logged-in user (replace with Firebase later)
  useEffect(() => {
    const fakeUser = {
      uid: "123",
      email: "user@example.com",
      name: "Demo User",
    };

    setUser(fakeUser);
    setLoading(false);
  }, []);

  // Auth functions (to be connected to Firebase)
  const login = (email, password) => {
    setUser({ uid: "123", email });
  };

  const signup = (email, password) => {
    setUser({ uid: "123", email });
  };

  const logout = () => {
    setUser(null);
  };

  const value = {
    user,
    login,
    signup,
    logout,
  };

  if (loading) return <p>Loading...</p>;

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
