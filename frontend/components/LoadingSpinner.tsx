export default function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="loading-spinner mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Smart Bus System</h2>
        <p className="text-gray-600">Initializing real-time tracking and optimization...</p>
      </div>
    </div>
  );
}

