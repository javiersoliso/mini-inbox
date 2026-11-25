import type { StatusFilter } from "@mini-inbox/types";

const OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "open", label: "Abiertas" },
  { value: "resolved", label: "Resueltas" },
  { value: "all", label: "Todas" },
];

interface StatusFilterTabsProps {
  value: StatusFilter;
  onChange: (value: StatusFilter) => void;
}

export function StatusFilterTabs({ value, onChange }: StatusFilterTabsProps) {
  return (
    <div className="status-tabs" role="group" aria-label="Filtrar por estado">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
