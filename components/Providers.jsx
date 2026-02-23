// components/Providers.jsx
"use client"; // <-- This is the magic key

import AuthProvider from './AuthProvider';
import { AppProvider } from '@/context/AppContext';

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <AppProvider>
        {children}
      </AppProvider>
    </AuthProvider>
  );
}
