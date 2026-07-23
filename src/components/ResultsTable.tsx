import { Fragment } from "react";
import { POSP_COLUMNS, type PospRecord } from "@/lib/posp-columns";

type ResultsTableProps = {
  results: PospRecord[];
  searchedQuery: string;
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
};

function formatDate(value: string | number | null): string {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function highlight(text: string, term: string) {
  if (!term) return text;
  const start = text.toLowerCase().indexOf(term.toLowerCase());
  if (start === -1) return text;
  const end = start + term.length;
  return (
    <Fragment>
      {text.slice(0, start)}
      <mark className="rounded-sm bg-amber-200 px-0.5">{text.slice(start, end)}</mark>
      {text.slice(end)}
    </Fragment>
  );
}

function formatCell(value: string | number | null, type: "text" | "date", term: string) {
  if (value === null || value === undefined || value === "") return "";
  if (type === "date") return formatDate(value);
  return highlight(String(value), term);
}

export function ResultsTable({
  results,
  searchedQuery,
  total,
  page,
  pageSize,
  onPageChange,
}: ResultsTableProps) {
  // Only show columns that actually have a value somewhere in this result
  // set, instead of a wall of empty cells for optional fields like GST/city.
  const visibleColumns = POSP_COLUMNS.filter((col) =>
    results.some((row) => row[col.key] !== null && row[col.key] !== undefined && row[col.key] !== "")
  );
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
        <p className="text-sm text-stone-500">
          {total} record{total === 1 ? "" : "s"} found
        </p>
      </div>

      <div className="overflow-auto p-4">
        <table className="min-w-full border-collapse border border-stone-200 text-sm">
          <thead className="bg-stone-50">
            <tr>
              {visibleColumns.map((col) => (
                <th
                  key={col.key}
                  className="whitespace-nowrap border border-stone-200 px-4 py-2 text-left font-medium text-stone-600"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.map((row, i) => (
              <tr key={i} className="hover:bg-stone-50">
                {visibleColumns.map((col) => (
                  <td
                    key={col.key}
                    className="whitespace-nowrap border border-stone-200 px-4 py-2 text-stone-700"
                  >
                    {formatCell(row[col.key], col.type, searchedQuery)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-stone-200 px-4 py-3">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-stone-600 hover:bg-stone-100 disabled:opacity-40"
          >
            Previous
          </button>
          <p className="text-sm text-stone-500">
            Page {page} of {totalPages}
          </p>
          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-stone-600 hover:bg-stone-100 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
