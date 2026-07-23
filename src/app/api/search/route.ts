import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { SEARCHABLE_COLUMNS } from "@/lib/posp-columns";

const MAX_QUERY_LENGTH = 100;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;

// PostgREST reserves `,`, `.`, `(`, `)` in filter values; quoting the value
// (with `"` and `\` escaped) lets user input contain them safely.
function escapeForPostgrestFilter(value: string): string {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const query = params.get("q")?.trim().slice(0, MAX_QUERY_LENGTH);
  const page = Math.max(1, Math.trunc(Number(params.get("page")) || 1));
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, Math.trunc(Number(params.get("pageSize")) || DEFAULT_PAGE_SIZE))
  );

  // Advanced search: one or more column-specific values, combined with AND.
  // Only columns in SEARCHABLE_COLUMNS are honored, so this can't be used to
  // filter on arbitrary columns.
  const fieldFilters = SEARCHABLE_COLUMNS.flatMap((column) => {
    const value = params.get(column)?.trim().slice(0, MAX_QUERY_LENGTH);
    return value ? [{ column, value }] : [];
  });

  let builder = supabaseServer.from("posp_records").select("*", { count: "exact" });

  if (fieldFilters.length > 0) {
    // .ilike() encodes its value as a single filter param, so no manual
    // escaping is needed here (unlike the combined .or() string below).
    for (const { column, value } of fieldFilters) {
      builder = builder.ilike(column, `%${value}%`);
    }
  } else if (query) {
    const escaped = escapeForPostgrestFilter(`%${query}%`);
    const orFilter = SEARCHABLE_COLUMNS.map((column) => `${column}.ilike.${escaped}`).join(",");
    builder = builder.or(orFilter);
  }
  // No query and no field filters: browse the full table, unfiltered.

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await builder.order("id", { ascending: true }).range(from, to);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ results: data, total: count ?? 0, page, pageSize });
}
