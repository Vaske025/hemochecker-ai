
import { Layout } from "@/components/Layout";
import { HealthAssistant } from "@/components/HealthAssistant";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

const HealthAssistantPage = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <Layout>
      <HealthAssistant />
    </Layout>
  );
};

export default HealthAssistantPage;
