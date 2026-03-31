import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SignOutButton } from "@/components/sign-out-link";

export async function Nav() {
  const session = await auth();
  let tier: string | null = null;
  if (session?.user?.id) {
    const u = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { membershipTier: true },
    });
    tier = u?.membershipTier ?? null;
  }

  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="font-semibold tracking-tight text-emerald-400">
          StreamLab Forum
        </Link>
        <nav className="flex flex-wrap items-center gap-4 text-sm text-zinc-300">
          <Link href="/forum" className="hover:text-white">
            Forum
          </Link>
          <Link href="/membership" className="hover:text-white">
            Membership
          </Link>
          {session?.user ? (
            <>
              <span className="text-zinc-500">
                {tier === "PAID" ? <span className="text-amber-400">Pro</span> : "Free"}
              </span>
              <Link href="/account" className="hover:text-white">
                Account
              </Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-white">
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-emerald-600 px-3 py-1.5 font-medium text-white hover:bg-emerald-500"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
