"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";

interface ChatErrorBoundaryProps {
  children: React.ReactNode;
  panelName?: string;
  onReset?: () => void;
}

interface ChatErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ChatErrorBoundary extends React.Component<
  ChatErrorBoundaryProps,
  ChatErrorBoundaryState
> {
  constructor(props: ChatErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const panelName = this.props.panelName || "Chat";
    console.error(`Error in ${panelName} panel:`, error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    this.props.onReset?.();
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
          <div className="text-center max-w-sm">
            <div className="flex justify-center mb-4">
              <AlertTriangle className="w-12 h-12 text-red-600" />
            </div>
            <h3 className="font-semibold text-lg text-gray-900 mb-2">
              Something went wrong
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {this.props.panelName && `An error occurred in the ${this.props.panelName} panel. `}
              Please try again or refresh the page if the problem persists.
            </p>
            {this.state.error && (
              <p className="text-xs text-gray-500 bg-white rounded p-2 mb-4 border border-gray-200 font-mono break-words max-h-20 overflow-y-auto">
                {this.state.error.message}
              </p>
            )}
            <button
              onClick={this.handleReset}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
