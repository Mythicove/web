"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FilterRowProps {
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
  label: (v: string) => string;
}

export function FilterRow({ options, value, onChange, label }: FilterRowProps) {
  const t = useTranslations("common");
  return (
    <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label={t("search")}>
      {options.map((o) => (
        <Button
          key={o || "all"}
          size="sm"
          variant={value === o ? "default" : "outline"}
          onClick={() => onChange(o)}
          className={cn(value === o && "shadow-card")}
        >
          {label(o)}
        </Button>
      ))}
    </div>
  );
}
