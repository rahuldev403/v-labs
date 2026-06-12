import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthenticationStatus } from "@nhost/react";
import Auth from "./Auth";
import Dashboard from "./Dashboard";

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthenticationStatus();
  if (isLoading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  if (!isAuthenticated) return <Navigate to="/" />;
  return children;
};

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
}
