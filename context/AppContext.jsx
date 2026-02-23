// context/AppContext.jsx
"use client";

import { createContext, useContext, useState } from 'react';
import { useSession } from 'next-auth/react';

const AppContext = createContext();

export function AppProvider({ children }) {
  const { data: session, status } = useSession(); // Real session from NextAuth
  const [isGuest, setIsGuest] = useState(false); // Our virtual guest state

  const currentUser = session?.user;
  const isLoading = status === 'loading';

  // If user is logged in, they are not a guest
  if (currentUser && isGuest) {
    setIsGuest(false);
  }
  
  const value = {
    currentUser,  // The actual user object if logged in
    isGuest,      // True if they clicked "Continue as Guest"
    isLoading,    // True while NextAuth is checking the session
    loginAsGuest: () => setIsGuest(true),
    logoutGuest: () => setIsGuest(false),
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

// Custom hook to easily access the context
export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
