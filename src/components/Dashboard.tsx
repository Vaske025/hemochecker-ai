
import { motion } from "framer-motion";
import { CalendarDays, Clock, ChevronRight, Plus, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { UploadCard } from "./UploadCard";
import { Button } from "@/components/ui/button";
import { getUserBloodTests, deleteBloodTest } from "@/services/bloodTestService";
import { BloodTest } from "@/types/BloodTest";
import { format } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const Dashboard = () => {
  const [tests, setTests] = useState<BloodTest[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchUserBloodTests();
  }, []);
  
  const fetchUserBloodTests = async () => {
    setLoading(true);
    const bloodTests = await getUserBloodTests();
    setTests(bloodTests);
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
        className="mb-12"
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
              <h3 className="text-xl font-semibold">Your Blood Test Reports</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchUserBloodTests} 
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
                      
                      <h4 className="text-lg font-medium mb-3 truncate" title={test.file_name}>
                        {test.file_name}
                      </h4>
                      
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 mb-3">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {test.file_type.split('/').pop()?.toUpperCase()} · {(test.file_size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      
                      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
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
                <Button onClick={() => document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' })}>
                  <Plus className="h-4 w-4 mr-2" /> Upload Your First Test
                </Button>
              </div>
            )}
          </motion.div>
          
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="glass-card rounded-xl p-6"
          >
            <motion.h3 variants={item} className="text-xl font-semibold mb-4">
              Your Health Journey
            </motion.h3>
            
            <motion.div 
              variants={item}
              className="bg-gray-50 dark:bg-gray-800/30 rounded-lg p-6"
            >
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Track your health metrics over time and get personalized insights.
                </p>
                
                {tests.length === 0 && (
                  <Button>
                    <Plus className="h-4 w-4 mr-2" /> Upload Your First Test
                  </Button>
                )}
                
                {tests.length > 0 && tests.length < 3 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Upload more tests to see trends and comparisons over time.
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        </div>
        
        <div className="space-y-8" id="upload-section">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <UploadCard />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="glass-card rounded-xl p-6"
          >
            <h3 className="text-xl font-semibold mb-4">Subscription Status</h3>
            
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-4">
              <div className="flex items-start">
                <div className="flex-1">
                  <p className="font-medium">Free Plan</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {tests.length} of 5 uploads used this month
                  </p>
                </div>
                <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                  Active
                </span>
              </div>
              
              <div className="mt-3 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                <div 
                  className="bg-primary h-1.5 rounded-full" 
                  style={{ width: `${Math.min(tests.length / 5 * 100, 100)}%` }}
                ></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-gray-600 dark:text-gray-300">
                  Resets in 14 days
                </span>
              </div>
            </div>
            
            <Button className="w-full mt-4">
              Upgrade to Premium
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
