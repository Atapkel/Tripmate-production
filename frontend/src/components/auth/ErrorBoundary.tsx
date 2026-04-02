import React from "react";
import { Button } from "@/components/ui/Button";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-dvh p-4">
          <h1 className="text-2xl font-heading font-bold mb-2">Something went wrong</h1>
          <p className="text-text-secondary mb-6 text-center">
            An unexpected error occurred. Please try again.
          </p>
          <Button onClick={() => window.location.reload()}>Reload Page</Button>
        </div>
      );
    }
    return this.props.children;
  }
}
