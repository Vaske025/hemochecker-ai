
import { motion } from "framer-motion";
import { CalendarDays, Clock, ChevronRight } from "lucide-react";
import { AnalysisCard } from "./AnalysisCard";
import { UploadCard } from "./UploadCard";

// Sample data for demonstration
const recentTests = [
  {
    id: 1,
    date: "2023-10-15",
    name: "Complete Blood Count",
    metrics: [
      { name: "Hemoglobin", value: 14.2, unit: "g/dL", status: "normal" },
      { name: "White Blood Cells", value: 7.5, unit: "K/uL", status: "normal" },
      { name: "Platelets", value: 350, unit: "K/uL", status: "elevated" }
    ]
  },
  {
    id: 2,
    date: "2023-08-22",
    name: "Lipid Panel",
    metrics: [
      { name: "Total Cholesterol", value: 195, unit: "mg/dL", status: "normal" },
      { name: "LDL", value: 130, unit: "mg/dL", status: "elevated" },
      { name: "HDL", value: 55, unit: "mg/dL", status: "normal" }
    ]
  }
];

export const Dashboard = () => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
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
              <h3 className="text-xl font-semibold">Recent Test Results</h3>
              <a href="#" className="text-primary hover:underline flex items-center text-sm">
                View all <ChevronRight className="ml-1 h-4 w-4" />
              </a>
            </div>
            
            {recentTests.length > 0 ? (
              <div className="space-y-4">
                {recentTests.map((test) => (
                  <motion.div
                    key={test.id}
                    variants={item}
                    className="glass-card rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md"
                  >
                    <div className="p-5">
                      <div className="flex justify-between mb-3">
                        <div className="flex items-center">
                          <CalendarDays className="h-4 w-4 text-gray-500 mr-1" />
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {formatDate(test.date)}
                          </span>
                        </div>
                        <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                          {test.name}
                        </span>
                      </div>
                      
                      <h4 className="text-lg font-medium mb-3">{test.name}</h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {test.metrics.map((metric, idx) => (
                          <AnalysisCard key={idx} metric={metric} />
                        ))}
                      </div>
                      
                      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                        <a 
                          href="#" 
                          className="text-primary hover:text-primary/80 text-sm font-medium flex items-center"
                        >
                          View full report <ChevronRight className="ml-1 h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="glass-card rounded-xl p-6 text-center">
                <p className="text-gray-500 dark:text-gray-400 mb-2">
                  No test results found
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Upload your first blood test to get started
                </p>
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
              Your Health Trends
            </motion.h3>
            
            <motion.div 
              variants={item}
              className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800/30 rounded-lg"
            >
              <div className="text-center">
                <p className="text-gray-500 dark:text-gray-400 mb-2">
                  Need more data to show trends
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Upload at least 3 tests to see your health trends over time
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
        
        <div className="space-y-8">
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
                    3 of 5 uploads used this month
                  </p>
                </div>
                <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                  Active
                </span>
              </div>
              
              <div className="mt-3 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                <div className="bg-primary h-1.5 rounded-full" style={{ width: "60%" }}></div>
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

// Make sure to create a Button component from shadcn/ui
function Button({ children, className, ...props }: React.ComponentProps<typeof import("@/components/ui/button").Button>) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`bg-primary text-white font-medium py-2 px-4 rounded-md transition-colors hover:bg-primary/90 ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
