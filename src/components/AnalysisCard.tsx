
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricProps {
  name: string;
  value: number;
  unit: string;
  status: "normal" | "elevated" | "low";
}

export const AnalysisCard = ({ metric }: { metric: MetricProps }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "elevated":
        return "text-orange-500 bg-orange-50 dark:bg-orange-900/20";
      case "low":
        return "text-blue-500 bg-blue-50 dark:bg-blue-900/20";
      default:
        return "text-green-500 bg-green-50 dark:bg-green-900/20";
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "elevated":
        return <TrendingUp className="h-3 w-3" />;
      case "low":
        return <TrendingDown className="h-3 w-3" />;
      default:
        return <Minus className="h-3 w-3" />;
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-100 dark:border-gray-700"
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-sm font-medium">{metric.name}</span>
        <span className={`text-xs px-1.5 py-0.5 rounded flex items-center ${getStatusColor(metric.status)}`}>
          {getStatusIcon(metric.status)}
          <span className="ml-1 capitalize">{metric.status}</span>
        </span>
      </div>
      <div className="flex items-baseline">
        <span className="text-2xl font-bold">{metric.value}</span>
        <span className="ml-1 text-xs text-gray-500">{metric.unit}</span>
      </div>
    </motion.div>
  );
};
