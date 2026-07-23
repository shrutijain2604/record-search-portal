"use client";

import { type FormEvent } from "react";
import { POSP_COLUMNS } from "@/lib/posp-columns";

const ADVANCED_FIELDS = POSP_COLUMNS.filter((c) => c.type === "text" && c.key !== "type");

type AdvancedSearchFormProps = {
  values: Record<string, string>;
  onFieldChange: (key: string, value: string) => void;
  onSubmit: () => void;
  onClear: () => void;
  isLoading: boolean;
};

export function AdvancedSearchForm({
  values,
  onFieldChange,
  onSubmit,
  onClear,
  isLoading,
}: AdvancedSearchFormProps) {
  const hasAnyValue = Object.values(values).some((v) => v.trim());

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {ADVANCED_FIELDS.map((field) => (
          <div key={field.key}>
            <label
              htmlFor={`adv-${field.key}`}
              className="mb-1 block text-xs font-medium text-stone-500"
            >
              {field.label}
            </label>
            <input
              id={`adv-${field.key}`}
              type="text"
              value={values[field.key] ?? ""}
              onChange={(e) => onFieldChange(field.key, e.target.value)}
              className="w-full rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-900 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
            />
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          type="submit"
          disabled={isLoading || !hasAnyValue}
          className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
        >
          {isLoading ? "Searching..." : "Search"}
        </button>
        {hasAnyValue && (
          <button
            type="button"
            onClick={onClear}
            className="rounded-md px-3 py-2 text-sm font-medium text-stone-500 hover:text-stone-700"
          >
            Clear all
          </button>
        )}
      </div>
    </form>
  );
}
