import { clsx } from "clsx";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  wide?: boolean;
}

export function PageContainer({ children, className, wide }: PageContainerProps) {
  return (
    <div
      className={clsx(
        "mx-auto w-full px-4 lg:px-8 py-4 lg:py-6",
        wide ? "max-w-7xl" : "max-w-5xl",
        className
      )}
    >
      {children}
    </div>
  );
}
