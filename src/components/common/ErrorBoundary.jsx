import React from "react";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="h-10 w-10" />
          </div>
          
          <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Something went wrong
          </h1>
          
          <p className="mb-8 max-w-md text-lg text-muted-foreground">
            We encountered an unexpected error. Don't worry, your data is safe. 
            You can try refreshing the page or returning home.
          </p>

          {process.env.NODE_ENV === "development" && (
            <div className="mb-8 w-full max-w-2xl overflow-auto rounded-lg border border-border bg-muted/50 p-4 text-left font-mono text-sm text-destructive">
              <p className="font-bold">{this.state.error?.toString()}</p>
              <pre className="mt-2 whitespace-pre-wrap opacity-80">
                {this.state.error?.stack}
              </pre>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button 
              size="lg" 
              variant="default" 
              onClick={this.handleReset}
              className="min-w-[160px] gap-2"
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh Page
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={this.handleGoHome}
              className="min-w-[160px] gap-2"
            >
              <Home className="h-4 w-4" />
              Return Home
            </Button>
          </div>

          <p className="mt-12 text-sm text-muted-foreground">
            If the problem persists, please contact support.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
