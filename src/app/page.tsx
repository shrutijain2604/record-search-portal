"use client";

import { useEffect, useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import { AdvancedSearchForm } from "@/components/AdvancedSearchForm";
import { ResultsTable } from "@/components/ResultsTable";
import type { PospRecord } from "@/lib/posp-columns";

const PAGE_SIZE = 10;

type Status = "idle" | "loading" | "error";
type Mode = "simple" | "advanced";

export default function Home() {
  const [mode, setMode] = useState<Mode>("simple");
  const [query, setQuery] = useState("");
  const [advancedValues, setAdvancedValues] = useState<Record<string, string>>({});
  const [searchedQuery, setSearchedQuery] = useState("");
  const [results, setResults] = useState<PospRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function fetchRecords(targetPage: number, opts?: { mode: Mode; query: string; advancedValues: Record<string, string> }) {
    const activeMode = opts?.mode ?? mode;
    const activeQuery = opts?.query ?? query;
    const activeAdvancedValues = opts?.advancedValues ?? advancedValues;

    const params = new URLSearchParams();
    params.set("page", String(targetPage));
    params.set("pageSize", String(PAGE_SIZE));

    if (activeMode === "simple") {
      const trimmed = activeQuery.trim();
      if (trimmed) params.set("q", trimmed);
      setSearchedQuery(trimmed);
    } else {
      const entries = Object.entries(activeAdvancedValues).filter(([, v]) => v.trim());
      for (const [key, value] of entries) params.set(key, value.trim());
      setSearchedQuery("");
    }

    setStatus("loading");

    try {
      const res = await fetch(`/api/search?${params.toString()}`);
      const body = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMessage(body.error ?? "Search failed.");
        return;
      }

      setResults(body.results ?? []);
      setTotal(body.total ?? 0);
      setPage(targetPage);
      setStatus("idle");
    } catch {
      setStatus("error");
      setErrorMessage("Could not reach the search service.");
    }
  }

  // Load the full record list on first render, so the table isn't empty
  // until someone types a search.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional mount-time data fetch
    fetchRecords(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function clearSearch() {
    setQuery("");
    setAdvancedValues({});
    fetchRecords(1, { mode, query: "", advancedValues: {} });
  }

  function switchMode(next: Mode) {
    setMode(next);
    setQuery("");
    setAdvancedValues({});
    fetchRecords(1, { mode: next, query: "", advancedValues: {} });
  }

  return (
    <div className="flex min-h-screen flex-col bg-stone-100 font-sans">
      <header className="border-b border-stone-200 bg-white">
        <div className="flex items-center gap-3 px-6 py-4 sm:px-10">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
            <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5">
              <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M18 18L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-stone-900">Record Search Portal</p>
            <p className="text-xs text-stone-500">POSP associate directory</p>
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-10 sm:px-10">
        <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-stone-900">Find a record</h1>
              <p className="mt-1 text-sm text-stone-500">
                Search across every associate record instantly.
              </p>
            </div>
            <div className="flex shrink-0 rounded-md border border-stone-200 p-0.5 text-sm">
              <button
                type="button"
                onClick={() => switchMode("simple")}
                className={`rounded px-3 py-1 font-medium transition-colors ${
                  mode === "simple" ? "bg-blue-600 text-white" : "text-stone-500 hover:text-stone-700"
                }`}
              >
                Simple
              </button>
              <button
                type="button"
                onClick={() => switchMode("advanced")}
                className={`rounded px-3 py-1 font-medium transition-colors ${
                  mode === "advanced" ? "bg-blue-600 text-white" : "text-stone-500 hover:text-stone-700"
                }`}
              >
                Advanced
              </button>
            </div>
          </div>

          {mode === "simple" ? (
            <SearchBar
              query={query}
              onQueryChange={setQuery}
              onSubmit={() => fetchRecords(1)}
              onClear={clearSearch}
              isLoading={status === "loading"}
            />
          ) : (
            <AdvancedSearchForm
              values={advancedValues}
              onFieldChange={(key, value) =>
                setAdvancedValues((prev) => ({ ...prev, [key]: value }))
              }
              onSubmit={() => fetchRecords(1)}
              onClear={clearSearch}
              isLoading={status === "loading"}
            />
          )}

          {status === "error" && <p className="mt-4 text-sm text-red-600">{errorMessage}</p>}
        </div>

        {status !== "error" && (
          <div className="mt-6 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
            {total === 0 && status === "idle" ? (
              <p className="px-4 py-8 text-center text-sm text-stone-500">
                No matching records found.
              </p>
            ) : (
              <ResultsTable
                results={results}
                searchedQuery={searchedQuery}
                total={total}
                page={page}
                pageSize={PAGE_SIZE}
                onPageChange={(p) => fetchRecords(p)}
              />
            )}
          </div>
        )}
      </main>

      <footer className="border-t border-stone-200 px-6 py-6 text-center text-xs text-stone-400 sm:px-10">
        Internal tool — handle associate data (Aadhar, PAN, bank details) responsibly.
      </footer>
    </div>
  );
}
