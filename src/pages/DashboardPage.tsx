
import { Layout } from "@/components/Layout";
import { Dashboard } from "@/components/Dashboard";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

const DashboardPage = () => {
  const { isAuthenticated } = useAuth();

  // This is a redundant check since we're using ProtectedRoute,
  // but it's good to have as a safety net
  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <Layout>
      <Dashboard />
    </Layout>
  );
};

export default DashboardPage;
