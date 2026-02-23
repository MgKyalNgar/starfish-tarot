// components/AuthButton.jsx
"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";

export default function AuthButton() {
  const { data: session } = useSession();

  if (session) {
    // User is signed in
    return (
      <div className="flex items-center gap-4">
        <p className="text-sky-300">{session.user.name}</p>
        {session.user.image && (
          <Image
            src={session.user.image}
            alt={session.user.name}
            width={40}
            height={40}
            className="rounded-full"
          />
        )}
        <button
          onClick={() => signOut()}
          className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-500 transition-colors"
        >
          Sign Out
        </button>
      </div>
    );
  }

  // User is not signed in
  return (
    <button
      onClick={() => signIn("google")}
      className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 transition-colors"
    >
      Sign in with Google
    </button>
  );
}
