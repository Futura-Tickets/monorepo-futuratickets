'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import Button from 'antd/es/button';
import * as Sentry from '@sentry/nextjs';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  eventId: string | null;
}

/**
 * Error Boundary Component for Futura Admin Panel
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors to Sentry, and displays a fallback UI.
 *
 * Usage:
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Send to Sentry with React component stack
    const eventId = Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
      tags: {
        errorBoundary: true,
      },
      level: 'error',
    });

    this.setState({
      error,
      errorInfo,
      eventId,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    });
  };

  handleReportFeedback = () => {
    if (this.state.eventId) {
      Sentry.showReportDialog({ eventId: this.state.eventId });
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-black p-4">
          <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-4">
            <div className="flex items-center space-x-3">
              <svg
                className="w-8 h-8 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <h1 className="text-2xl font-bold text-white">
                Oops! Something went wrong
              </h1>
            </div>

            <p className="text-zinc-400">
              We're sorry, but something unexpected happened. Our team has been notified and is working on a fix.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-zinc-500 hover:text-zinc-300">
                  Technical Details (Development Only)
                </summary>
                <div className="mt-2 p-4 bg-zinc-950 rounded border border-zinc-800 overflow-auto max-h-64">
                  <p className="text-xs text-red-400 font-mono mb-2">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <pre className="text-xs text-zinc-500 whitespace-pre-wrap font-mono">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </details>
            )}

            <div className="flex flex-col space-y-3 pt-4">
              <div className="flex space-x-3">
                <Button
                  onClick={this.handleReset}
                  type="default"
                  style={{ flex: 1 }}
                >
                  Try Again
                </Button>
                <Button
                  onClick={() => window.location.href = '/'}
                  type="primary"
                  style={{ flex: 1, backgroundColor: '#00c8b3', borderColor: '#00c8b3' }}
                >
                  Go Home
                </Button>
              </div>
              {this.state.eventId && (
                <Button
                  onClick={this.handleReportFeedback}
                  type="dashed"
                  block
                  className="text-zinc-400 border-zinc-700 hover:text-white hover:border-zinc-500"
                >
                  Report Feedback
                </Button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Functional wrapper for Error Boundary (easier to use in function components)
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );
}
