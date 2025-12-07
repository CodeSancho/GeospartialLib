import React, { createContext, useState, useContext } from 'react';


const UserContext = createContext();


const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData)); // optional
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

// 3️⃣ Custom hook to use context
export const useAuth = () => useContext(UserContext);


export default AuthProvider;
