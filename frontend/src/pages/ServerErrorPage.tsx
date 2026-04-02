import { ServerCrash } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ServerErrorPage() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-primary-50 via-surface-secondary to-accent-50">
      <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-error/10 text-error mb-6">
        <ServerCrash className="h-10 w-10" />
      </div>
      <h1 className="text-3xl font-heading font-bold text-text-primary mb-2">Server Unavailable</h1>
      <p className="text-text-secondary mb-8 max-w-md">
        We can't reach the server right now. Please check that the backend is running and try again.
      </p>
      <Button onClick={() => window.location.reload()}>Try Again</Button>
    </div>
  );
}
