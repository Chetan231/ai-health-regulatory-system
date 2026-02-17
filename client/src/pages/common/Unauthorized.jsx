import { Link } from 'react-router-dom';

const Unauthorized = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-red-500 mb-4">403</h1>
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">Access Denied</h2>
      <p className="text-gray-500 mb-6">You don't have permission to view this page.</p>
      <Link to="/" className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
        Go Home
      </Link>
    </div>
  </div>
);

export default Unauthorized;
