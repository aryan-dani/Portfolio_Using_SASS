import { Component } from "react";

/**
 * React Error Boundary — catches render errors in the subtree and
 * shows a fallback UI instead of crashing the entire app.
 *
 * Use to wrap lazy-loaded pages so a single bad route doesn't
 * blank the whole application.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // In development, surface the error to the console so it's easy to debug.
    if (import.meta.env.DEV) {
      console.error("[ErrorBoundary] Caught error:", error, info.componentStack);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            minHeight: "60vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1.5rem",
            padding: "2rem",
            textAlign: "center",
            background: "var(--color-background)",
            color: "var(--color-on-surface)",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-headline, monospace)",
              fontSize: "clamp(1rem, 2vw, 1.25rem)",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              border: "4px solid var(--color-outline)",
              padding: "1rem 1.5rem",
              background: "var(--color-surface)",
              boxShadow: "4px 4px 0 var(--shadow-color)",
            }}
          >
            Something went wrong rendering this page.
          </p>
          <button
            onClick={this.handleReset}
            style={{
              background: "var(--color-primary-container)",
              color: "var(--color-on-primary-container)",
              border: "4px solid var(--color-outline)",
              padding: "0.75rem 1.5rem",
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              cursor: "pointer",
              boxShadow: "4px 4px 0 var(--shadow-color)",
            }}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
