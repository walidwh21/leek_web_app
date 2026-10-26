export function SetupSupabase() {
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-amber-200 bg-amber-50 p-8 text-amber-950">
      <h1 className="text-xl font-semibold">Configure Supabase</h1>
      <p className="mt-2 text-sm leading-relaxed">
        Copy <code className="rounded bg-amber-100 px-1 font-mono text-xs">.env.local.example</code> to{" "}
        <code className="rounded bg-amber-100 px-1 font-mono text-xs">.env.local</code> and set{" "}
        <code className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
        <code className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>. Restart{" "}
        <code className="font-mono text-xs">npm run dev</code>.
      </p>
    </div>
  );
}
