"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search, FolderOpen, User, Home, X } from "lucide-react";

type SearchResult = {
  cases: { id: string; tenant: { firstName: string; lastName: string }; property: { name: string }; status: string; totalUnpaidCents: number }[];
  tenants: { id: string; firstName: string; lastName: string; email: string }[];
  properties: { id: string; name: string; address: string; city: string }[];
};

function formatEuro(cents: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(cents / 100);
}

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const normalizedQuery = query.trim();
    if (normalizedQuery.length < 2) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(normalizedQuery)}`);
        const data = await res.json();
        if (cancelled) return;
        setResults(data);
        setOpen(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const hasResults = results && (results.cases.length + results.tenants.length + results.properties.length) > 0;

  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (value.trim().length < 2) {
      setResults(null);
      setOpen(false);
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setQuery("");
    setResults(null);
    setOpen(false);
    setLoading(false);
  };

  return (
    <div ref={ref} className="relative w-full max-w-xs">
      <div className="flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-1.5 text-sm focus-within:border-navy/40 focus-within:ring-2 focus-within:ring-navy/10">
        <Search className="h-3.5 w-3.5 shrink-0 text-ink/35" />
        <input
          className="w-full bg-transparent text-sm text-ink placeholder:text-ink/35 focus:outline-none"
          placeholder="Rechercher..."
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onFocus={() => results && setOpen(true)}
        />
        {query && (
          <button type="button" onClick={clearSearch} aria-label="Effacer la recherche">
            <X className="h-3 w-3 text-ink/35 hover:text-ink/60" />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1.5 w-80 rounded-xl border border-line bg-white shadow-soft">
          {loading && <p className="px-4 py-3 text-xs text-ink/40">Recherche...</p>}

          {!loading && !hasResults && (
            <p className="px-4 py-3 text-xs text-ink/40">Aucun résultat pour "{query}"</p>
          )}

          {!loading && hasResults && (
            <div className="divide-y divide-line">
              {results.cases.length > 0 && (
                <div className="p-2">
                  <p className="mb-1 px-2 text-[10px] font-bold uppercase tracking-wider text-ink/35">Dossiers</p>
                  {results.cases.map((c) => (
                    <Link
                      key={c.id}
                      href={`/app/cases/${c.id}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-paper"
                    >
                      <FolderOpen className="h-4 w-4 shrink-0 text-navy/40" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-navy">{c.tenant.firstName} {c.tenant.lastName}</p>
                        <p className="truncate text-[11px] text-ink/50">{c.property.name}</p>
                      </div>
                      <span className="shrink-0 text-xs font-bold text-danger">{formatEuro(c.totalUnpaidCents)}</span>
                    </Link>
                  ))}
                </div>
              )}

              {results.tenants.length > 0 && (
                <div className="p-2">
                  <p className="mb-1 px-2 text-[10px] font-bold uppercase tracking-wider text-ink/35">Locataires</p>
                  {results.tenants.map((t) => (
                    <Link
                      key={t.id}
                      href="/app/tenants"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-paper"
                    >
                      <User className="h-4 w-4 shrink-0 text-navy/40" />
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-navy">{t.firstName} {t.lastName}</p>
                        <p className="truncate text-[11px] text-ink/50">{t.email}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {results.properties.length > 0 && (
                <div className="p-2">
                  <p className="mb-1 px-2 text-[10px] font-bold uppercase tracking-wider text-ink/35">Biens</p>
                  {results.properties.map((p) => (
                    <Link
                      key={p.id}
                      href="/app/properties"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-paper"
                    >
                      <Home className="h-4 w-4 shrink-0 text-navy/40" />
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-navy">{p.name}</p>
                        <p className="truncate text-[11px] text-ink/50">{p.address}, {p.city}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
