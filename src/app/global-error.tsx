"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ background: "#09090b", color: "#fafafa", fontFamily: "system-ui", padding: 24 }}>
        <h1 style={{ fontSize: 20, marginBottom: 12 }}>Hive Tech Forum — error</h1>
        <p style={{ color: "#a1a1aa", marginBottom: 16 }}>{error.message}</p>
        <button
          type="button"
          onClick={() => reset()}
          style={{
            background: "#059669",
            color: "#fff",
            border: "none",
            padding: "8px 16px",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
