import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { loginAction } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string; registered?: string }>;
}) {
  const session = await auth();
  if (session?.user) {
    redirect("/forum");
  }
  const params = await searchParams;
  const callbackUrl = params.callbackUrl;

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold text-white">Sign in</h1>
      <p className="mt-2 text-sm text-zinc-400">
        No account?{" "}
        <Link href="/register" className="text-emerald-400 hover:underline">
          Register
        </Link>
      </p>
      {params.registered && (
        <p className="mt-4 rounded-md border border-emerald-900/50 bg-emerald-950/30 px-3 py-2 text-sm text-emerald-100">
          Account created — you can sign in now.
        </p>
      )}
      {params.error && (
        <p className="mt-4 rounded-md border border-red-900 bg-red-950/50 px-3 py-2 text-sm text-red-200">
          Invalid email or password.
        </p>
      )}
      <form
        className="mt-8 space-y-4"
        action={async (fd) => {
          "use server";
          await loginAction(fd, callbackUrl);
        }}
      >
        <div>
          <label htmlFor="email" className="block text-sm text-zinc-400">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-emerald-500"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm text-zinc-400">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-emerald-500"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-md bg-emerald-600 py-2.5 font-medium text-white hover:bg-emerald-500"
        >
          Sign in
        </button>
      </form>
    </div>
  );
}
