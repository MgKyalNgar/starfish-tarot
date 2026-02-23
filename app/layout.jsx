// app/layout.jsx

import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider"; // <-- AuthProvider
import { AppProvider } from '@/context/AppContext';  // <-- AppProvider

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Starfish Tarot",
  description: "Your mystical journey begins here.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <AppProvider> {/* <-- Wrap with AppProvider */}
            {children}
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
