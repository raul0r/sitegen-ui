import { Component, type ErrorInfo, type ReactNode } from "react";

import { Button } from "@/components/ui/button";

type Props = { children: ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("operator-ui-error", error.message, info.componentStack);
  }

  render() {
    if (!this.state.error) {
      return this.props.children;
    }
    return (
      <div className="mx-auto max-w-lg p-8">
        <h1 className="text-lg font-semibold">The operator UI crashed</h1>
        <p className="mt-2 text-sm text-muted-foreground">{this.state.error.message}</p>
        <Button className="mt-4" onClick={() => this.setState({ error: null })}>
          Reload view
        </Button>
      </div>
    );
  }
}
