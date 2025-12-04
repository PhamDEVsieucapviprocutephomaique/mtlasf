import React, { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-green-400 flex items-center justify-center p-4">
          <div className="max-w-2xl text-center">
            <div className="text-6xl mb-6">💥</div>
            <h1 className="text-3xl font-bold mb-4 text-red-500">
              SYSTEM ERROR
            </h1>
            <div className="bg-black bg-opacity-50 border border-red-700 rounded-lg p-6 mb-6">
              <p className="text-lg mb-4">Hệ thống gặp lỗi nghiêm trọng</p>
              <code className="block bg-gray-900 p-3 rounded text-sm text-left overflow-auto">
                {this.state.error?.toString() || "Unknown error"}
              </code>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-green-700 border border-green-500 rounded-lg hover:bg-green-600 transition-all font-bold"
              >
                🔄 RELOAD SYSTEM
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                className="ml-4 px-6 py-3 bg-gray-700 border border-gray-500 rounded-lg hover:bg-gray-600 transition-all"
              >
                🏠 GO TO HOME
              </button>
            </div>
            <div className="mt-8 text-sm text-green-600">
              <p>Nếu lỗi vẫn tiếp diễn, vui lòng liên hệ admin:</p>
              <p className="mt-2">
                Email: admin@checkscam.vn | Telegram: @checkscam_support
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
