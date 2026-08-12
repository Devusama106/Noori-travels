"use client";

import { useState, useRef, useEffect } from "react";

/**
 * options: array of { label, value } — value is what gets set via onChange,
 * label is what's shown/matched against as the person types.
 */
export default function AutocompleteInput({
  value,
  onChange,
  onSelect,
  options = [],
  placeholder,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = value
    ? options.filter((o) => o.label.toLowerCase().includes(value.toLowerCase()))
    : options;

  return (
    <div ref={wrapRef} className="relative">
      <input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        autoComplete="off"
        className={className}
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-20 mt-1 w-full max-h-56 overflow-y-auto bg-white border border-black/10 rounded-lg shadow-lg py-1">
          {filtered.slice(0, 8).map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => {
                onChange(o.value);
                onSelect?.(o);
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-noori-primary-light text-noori-ink flex items-center justify-between"
            >
              <span>{o.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
