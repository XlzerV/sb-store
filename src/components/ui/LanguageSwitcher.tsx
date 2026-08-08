"use client";

import { useLocale } from "next-intl";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

const languages = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "ar", label: "العربية" },
];

export default function LanguageSwitcher() {
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const current = languages.find((l) => l.code === locale) || languages[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-body-sm text-text-muted hover:text-text px-2 py-1 border border-border rounded-xl"
      >
        {current.label} <ChevronDown size={14} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-bg-elevated border border-border rounded-xl shadow-elevation-4 z-50 overflow-hidden">
          {languages.map((lang) => (
            <Link
              key={lang.code}
              href={`/${lang.code}`}
              className="block px-4 py-2.5 text-body-sm text-text-muted hover:text-text hover:bg-bg-muted whitespace-nowrap"
              onClick={() => setOpen(false)}
            >
              {lang.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
