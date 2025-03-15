
import { motion } from "framer-motion";
import { CalendarDays, ChevronRight, Plus, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { UploadCard } from "./UploadCard";
import { Button } from "@/components/ui/button";
import { getUserBloodTests, deleteBloodTest, getHealthScores } from "@/services/bloodTestService";
import { BloodTest, HealthScore } from "@/types/BloodTest";
import { format } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { HealthScoreChart } from "./HealthScoreChart";

export const Dashboard = () => {
  const [tests, setTests] = useState<BloodTest[]>([]);
  const [healthScores, setHealthScores] = useState<HealthScore[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchUserData();
  }, []);
  
  const fetchUserData = async () => {
    setLoading(true);
    const [bloodTests, scores] = await Promise.all([
      getUserBloodTests(),
      getHealthScores()
    ]);
    setTests(bloodTests);
    setHealthScores(scores);
    setLoading(false);
  };
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };
  
  const handleDeleteTest = async (id: string, filePath: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm("Are you sure you want to delete this report?")) {
      const success = await deleteBloodTest(id, filePath);
      if (success) {
        setTests(tests.filter(test => test.id !== id));
      }
    }
  };
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold mb-2">Your Health Dashboard</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Upload, analyze, and track your blood test results over time.
        </p>
      </motion.div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <motion.div 
            className="mb-8"
            variants={container}
            initial="hidden"
            animate="show"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Health Overview</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchUserData} 
                className="flex items-center"
              >
                <RefreshCw className="mr-1 h-4 w-4" />
                Refresh
              </Button>
            </div>
            
            {loading ? (
              <div className="glass-card rounded-xl p-12 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="glass-card rounded-xl p-6">
                {healthScores.length > 1 ? (
                  <HealthScoreChart data={healthScores} />
                ) : (
                  <div className="p-6 text-center">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      Not enough data to display health score trends
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                      Upload more blood tests to see your health score over time
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
          
          <motion.div 
            className="mb-8"
            variants={container}
            initial="hidden"
            animate="show"
          >
            <h3 className="text-xl font-semibold mb-4">Your Blood Test Reports</h3>
            
            {loading ? (
              <div className="glass-card rounded-xl p-12 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : tests.length > 0 ? (
              <div className="space-y-4">
                {tests.map((test) => (
                  <motion.div
                    key={test.id}
                    variants={item}
                    className="glass-card rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md cursor-pointer"
                    onClick={() => navigate(`/report/${test.id}`)}
                  >
                    <div className="p-5">
                      <div className="flex justify-between mb-3">
                        <div className="flex items-center">
                          <CalendarDays className="h-4 w-4 text-gray-500 mr-1" />
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {formatDate(test.created_at)}
                          </span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          test.processed 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        }`}>
                          {test.processed ? 'Processed' : 'Pending Analysis'}
                        </span>
                      </div>
                      
                      <h4 className="text-lg font-medium mb-2 truncate" title={test.file_name}>
                        {test.file_name}
                      </h4>
                      
                      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                          onClick={(e) => handleDeleteTest(test.id, test.file_path, e)}
                        >
                          Delete
                        </Button>
                        
                        <Link 
                          to={`/report/${test.id}`}
                          className="text-primary hover:text-primary/80 text-sm font-medium flex items-center"
                        >
                          View Details <ChevronRight className="ml-1 h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="glass-card rounded-xl p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  No test results found
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                  Upload your first blood test to get started
                </p>
              </div>
            )}
          </motion.div>
        </div>
        
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <UploadCard onUploadSuccess={fetchUserData} />
          </motion.div>
        </div>
      </div>
    </div>
  );
};
