"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { FileUpIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileFieldProps {
  value: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
  maxBytes?: number;
  id?: string;
  className?: string;
}

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

// 取代原生 file input：本地化文案、拖拽、类型/大小前置校验、可清除。
export function FileField({ value, onChange, accept, maxBytes, id, className }: FileFieldProps) {
  const t = useTranslations("common");
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const take = (file: File | null | undefined) => {
    if (!file) return;
    const specs = (accept ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const typeOk =
      specs.length === 0 ||
      specs.some((spec) =>
        spec.startsWith(".")
          ? file.name.toLowerCase().endsWith(spec.toLowerCase())
          : file.type === spec,
      );
    if (!typeOk) {
      setError(t("fileTypeMismatch"));
      return;
    }
    if (maxBytes && file.size > maxBytes) {
      setError(t("fileTooLarge"));
      return;
    }
    setError(null);
    onChange(file);
  };

  return (
    <div className={cn("grid gap-1.5", className)}>
      <button
        type="button"
        id={id}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          take(e.dataTransfer.files?.[0]);
        }}
        className={cn(
          "border-border bg-bg hover:border-primary flex items-center justify-between gap-3 rounded-lg border border-dashed px-3 py-2.5 text-left text-sm transition-colors",
          drag && "border-primary bg-surface",
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          <FileUpIcon className="text-text-muted size-4 shrink-0" />
          <span className={cn("truncate", !value && "text-text-muted")}>
            {value ? `${value.name} · ${fmtSize(value.size)}` : t("noFile")}
          </span>
        </span>
        <span className="text-text-muted flex shrink-0 items-center gap-1 text-xs">
          {value && (
            <XIcon
              role="button"
              tabIndex={0}
              aria-label={t("clear")}
              className="hover:text-text size-3.5"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.stopPropagation();
                  onChange(null);
                }
              }}
            />
          )}
          {t("chooseFile")}
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => take(e.target.files?.[0])}
      />
      <p className="text-text-muted text-xs">{t("dropHint")}</p>
      {error && <p className="text-danger text-xs">{error}</p>}
    </div>
  );
}
