"use client";

import { signOutAction } from "@/app/actions/auth";

export function SignOutButton() {
  return (
    <form action={signOutAction} className="inline">
      <button type="submit" className="text-sm text-zinc-300 hover:text-white">
        Sign out
      </button>
    </form>
  );
}
