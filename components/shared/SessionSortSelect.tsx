"use client";

import React from "react";
import { ArrowUpDown } from "lucide-react";
import { SessionSortKey, SESSION_SORT_OPTIONS } from "./sessionSort";

interface SessionSortSelectProps {
  value: SessionSortKey;
  onChange: (value: SessionSortKey) => void;
  className?: string;
  id?: string;
}

export default function SessionSortSelect({
  value,
  onChange,
  className = "",
  id = "session-sort-select",
}: SessionSortSelectProps) {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <label
        htmlFor={id}
        className="flex items-center gap-1.5 text-xs md:text-sm font-medium text-lovely/80 cursor-pointer select-none"
      >
        <ArrowUpDown className="w-3.5 h-3.5 md:w-4 md:h-4 text-lovely" />
        <span>Sort:</span>
      </label>
      <div className="relative inline-block">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value as SessionSortKey)}
          className="appearance-none rounded-xl border border-lovely/20 bg-white/95 px-3 py-1.5 pr-8 text-xs md:text-sm font-semibold text-lovely shadow-sm backdrop-blur-sm transition-all hover:border-lovely/40 focus:border-lovely focus:outline-none focus:ring-2 focus:ring-lovely/20 cursor-pointer"
        >
          {SESSION_SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} className="text-gray-800 bg-white font-normal">
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-lovely/70">
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
