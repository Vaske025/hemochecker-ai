
import { motion } from "framer-motion";
import { Activity, FileText, TrendingUp, Shield, BarChart, Award } from "lucide-react";

const features = [
  {
    icon: <FileText className="h-6 w-6" />,
    title: "Easy Test Upload",
    description: "Upload PDFs, CSVs, or images of your blood test results with a simple drag and drop interface."
  },
  {
    icon: <Activity className="h-6 w-6" />,
    title: "AI Analysis",
    description: "Get instant insights from our AI about your results and what they mean for your health."
  },
  {
    icon: <TrendingUp className="h-6 w-6" />,
    title: "Track Progress",
    description: "Monitor your health metrics over time to see improvements and catch potential issues early."
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Privacy First",
    description: "Your health data is encrypted and protected. We're fully GDPR and HIPAA compliant."
  },
  {
    icon: <BarChart className="h-6 w-6" />,
    title: "Visual Reports",
    description: "View your results in easy-to-understand charts and graphs with color-coded indicators."
  },
  {
    icon: <Award className="h-6 w-6" />,
    title: "Premium Insights",
    description: "Unlock deeper analysis, unlimited uploads, and downloadable reports with Premium."
  }
];

export const Features = () => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <section className="py-20 bg-gray-50/50 dark:bg-gray-900/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Powerful Features for Your Health Insights
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            HemoChecker combines AI technology with an intuitive interface to give you clear insights about your blood test results.
          </p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={item}
              className="glass-card rounded-xl p-6 h-full transition-all duration-300 hover:shadow-md hover:translate-y-[-5px]"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center text-primary mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
