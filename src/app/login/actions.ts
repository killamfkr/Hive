"use server";

import { AuthError } from "next-auth";
import { redirect, unstable_rethrow } from "next/navigation";
import { signIn } from "@/auth";

export async function loginAction(formData: FormData, callbackUrl?: string) {
  const safeCallback =
    callbackUrl && callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")
      ? callbackUrl
      : "/forum";
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: safeCallback,
    });
  } catch (e) {
    unstable_rethrow(e);
    if (e instanceof AuthError) {
      redirect(
        `/login?error=1${callbackUrl && callbackUrl.startsWith("/") && !callbackUrl.startsWith("//") ? `&callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`
      );
    }
    throw e;
  }
}
