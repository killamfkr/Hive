"use server";

import { unstable_rethrow } from "next/navigation";
import { signOut } from "@/auth";

export async function signOutAction() {
  try {
    await signOut({ redirectTo: "/" });
  } catch (e) {
    unstable_rethrow(e);
    throw e;
  }
}
