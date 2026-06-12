import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthenticationStatus } from "@nhost/react";
import Auth from "./Auth";
import Dashboard from "./Dashboard";

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthenticationStatus();
  if (isLoading) return <div>Loading session...</div>;
  if (!isAuthenticated) return <Navigate to="/" />;
  return children;
};

export default function App() {
  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "2rem",
        fontFamily: "sans-serif",
      }}
    >
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
  );
}
