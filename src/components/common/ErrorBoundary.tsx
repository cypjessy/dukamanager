"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("App error:", error.message, errorInfo.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleContinue = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #faf8f5, #f5f0ea)",
          padding: "24px",
          fontFamily: "system-ui, sans-serif",
        }}>
          <div style={{ textAlign: "center", maxWidth: 400 }}>
            <div style={{
              width: 64, height: 64, margin: "0 auto 20px",
              borderRadius: 16,
              background: "linear-gradient(135deg, #C75B39, #D4A574)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 8px 24px rgba(199, 91, 57, 0.3)",
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#3f3d39", margin: "0 0 8px" }}>
              Duka<span style={{ color: "#C75B39" }}>Manager</span>
            </h1>
            <p style={{ fontSize: 14, color: "#6b6960", margin: "0 0 6px", fontWeight: 600 }}>
              Something went wrong
            </p>
            <p style={{ fontSize: 12, color: "#8c8a85", margin: "0 0 24px" }}>
              {this.state.error?.message || "An unexpected error occurred."}
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button onClick={this.handleContinue}
                style={{
                  padding: "10px 20px", borderRadius: 10, border: "1px solid #d4d0c8",
                  background: "white", color: "#6b6960", fontSize: 13, fontWeight: 700,
                  cursor: "pointer", fontFamily: "inherit",
                }}>
                Continue anyway
              </button>
              <button onClick={this.handleRetry}
                style={{
                  padding: "10px 20px", borderRadius: 10, border: "none",
                  background: "linear-gradient(135deg, #C75B39, #D4A574)",
                  color: "white", fontSize: 13, fontWeight: 700,
                  cursor: "pointer", fontFamily: "inherit",
                  boxShadow: "0 4px 12px rgba(199, 91, 57, 0.3)",
                }}>
                Reload page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
