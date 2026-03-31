import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { registerAction } from "./actions";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (session?.user) {
    redirect("/forum");
  }
  const params = await searchParams;

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold text-white">Create account</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Already registered?{" "}
        <Link href="/login" className="text-emerald-400 hover:underline">
          Sign in
        </Link>
      </p>
      {params.error && (
        <p className="mt-4 rounded-md border border-red-900 bg-red-950/50 px-3 py-2 text-sm text-red-200">
          {params.error}
        </p>
      )}
      <form
        className="mt-8 space-y-4"
        action={async (fd) => {
          "use server";
          const r = await registerAction(fd);
          if (r?.error) {
            redirect(`/register?error=${encodeURIComponent(r.error)}`);
          }
          redirect("/login?registered=1");
        }}
      >
        <div>
          <label htmlFor="name" className="block text-sm text-zinc-400">
            Display name (optional)
          </label>
          <input
            id="name"
            name="name"
            type="text"
            maxLength={80}
            className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-emerald-500"
          />
        </div>
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
            Password (min 8 characters)
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-emerald-500"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-md bg-emerald-600 py-2.5 font-medium text-white hover:bg-emerald-500"
        >
          Register
        </button>
      </form>
    </div>
  );
}
