type Props = {
  message: string;
  title?: string;
};

export function CatalogErrorPanel({ message, title = "We can’t load the catalogue yet" }: Props) {
  const isRls = /permission denied|row-level security|\bRLS\b/i.test(message);

  return (
    <div
      className="overflow-hidden rounded-2xl border border-red-200/80 bg-gradient-to-br from-red-50 to-white shadow-sm"
      role="alert"
    >
      <div className="border-b border-red-100 bg-red-50/80 px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-red-800/90">Catalogue</p>
        <h2 className="mt-1 text-lg font-semibold text-red-950">{title}</h2>
        <p className="mt-2 font-mono text-xs text-red-900/70">{message}</p>
      </div>
      <div className="space-y-4 px-5 py-5 text-sm text-stone-700">
        {isRls ? (
          <>
            <p>
              Your app is talking to Supabase, but the database role used for public browsing doesn’t have permission
              to read the <strong className="font-medium text-stone-900">products</strong> table (and often{" "}
              <strong className="font-medium text-stone-900">inventory</strong>). That usually means Row Level Security
              policies or grants still need to be applied.
            </p>
            <ol className="list-decimal space-y-2 pl-5 text-stone-600">
              <li>
                In Supabase, open <strong className="text-stone-800">SQL Editor</strong> and run the script{" "}
                <code className="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-xs text-stone-800">
                  leek_app/supabase/fix-public-catalog-rls.sql
                </code>
                .
              </li>
              <li>
                Or set <code className="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-xs">SUPABASE_SERVICE_ROLE_KEY</code>{" "}
                in <code className="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-xs">.env.local</code> (server only;
                never <code className="font-mono text-xs">NEXT_PUBLIC_*</code>), then restart the dev server.
              </li>
            </ol>
          </>
        ) : (
          <p>Check your Supabase project URL and keys in <code className="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-xs">.env.local</code>, then try again.</p>
        )}
        <p className="text-xs text-stone-500">
          After fixing access, refresh this page — categories and products will appear in the grid below.
        </p>
      </div>
    </div>
  );
}
