interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      {icon && (
        <div className="mb-5 flex items-center justify-center w-20 h-20 rounded-2xl bg-primary-50 text-primary-400">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-heading font-semibold text-text-primary mb-1.5">{title}</h3>
      {description && (
        <p className="text-sm text-text-secondary mb-5 max-w-sm">{description}</p>
      )}
      {action}
    </div>
  );
}
