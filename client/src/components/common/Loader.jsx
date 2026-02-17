const Loader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
      <p className="text-gray-500 text-sm">Loading...</p>
    </div>
  </div>
);

export default Loader;
