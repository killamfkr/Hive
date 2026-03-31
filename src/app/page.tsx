import Link from "next/link";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <p className="text-sm font-medium uppercase tracking-widest text-emerald-400">
        Tech · Servers · IPTV
      </p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">
        A forum built for builders and operators
      </h1>
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
