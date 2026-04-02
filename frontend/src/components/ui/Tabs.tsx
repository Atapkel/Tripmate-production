import { clsx } from "clsx";

interface Tab {
  key: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  active: string;
  onChange: (key: string) => void;
}

export function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div className="flex gap-1 p-1 bg-surface-tertiary rounded-xl overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={clsx(
            "px-4 py-2 text-sm font-medium whitespace-nowrap rounded-lg transition-all duration-200",
            active === tab.key
              ? "bg-surface text-text-primary shadow-sm"
              : "text-text-secondary hover:text-text-primary"
          )}
        >
          {tab.label}
          {tab.count != null && (
            <span className={clsx(
              "ml-1.5 text-xs rounded-full px-1.5 py-0.5",
              active === tab.key ? "bg-primary-100 text-primary-700" : "bg-surface text-text-tertiary"
            )}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
