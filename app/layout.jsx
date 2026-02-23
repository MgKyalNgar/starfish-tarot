// app/layout.jsx

import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers"; // <-- Import our new Providers component

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Starfish Tarot",
  description: "Your mystical journey begins here.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Now, we just use the single Providers component */}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
