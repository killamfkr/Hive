import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
        <BrandLogo showWordmark={false} className="sm:scale-110" />
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-emerald-400">
            Tech · Servers · IPTV
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Hive Tech Forum
          </h1>
        </div>
      </div>
      <h2 className="mt-8 text-xl font-semibold text-zinc-200 sm:text-2xl">
        Built for builders and operators
      </h2>
      <p className="mt-6 text-lg leading-relaxed text-zinc-400">
        Join free to read and post in public boards. Upgrade to Pro for a dedicated IPTV-pro area
        and an XUI line tied to your monthly subscription — created on signup and extended on each
        renewal when your panel API is configured.
      </p>
      <div className="mt-10 flex flex-wrap gap-4">
        <Link
          href="/forum"
          className="rounded-lg bg-emerald-600 px-5 py-2.5 font-medium text-white hover:bg-emerald-500"
        >
          Enter forum
        </Link>
        <Link
          href="/membership"
          className="rounded-lg border border-zinc-700 px-5 py-2.5 font-medium text-zinc-200 hover:border-zinc-500"
        >
          Membership & billing
        </Link>
      </div>
    </div>
  );
}
