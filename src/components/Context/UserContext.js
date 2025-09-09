import React, { createContext, useState, useContext, useMemo } from "react";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);

  const value = useMemo(
    () => ({ currentUser, setCurrentUser }),
    [currentUser]
  );

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
