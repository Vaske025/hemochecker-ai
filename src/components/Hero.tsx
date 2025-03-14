
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Hero = () => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  
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
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <section className="relative overflow-hidden py-20 md:py-28 lg:py-32">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-20 top-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute right-20 bottom-1/4 w-80 h-80 bg-secondary/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="max-w-3xl mx-auto text-center space-y-10"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={item} className="space-y-4">
            <span className="inline-block py-1 px-3 bg-primary/10 text-primary text-sm font-medium rounded-full">
              AI-Powered Health Insights
            </span>
            <h1 className="font-bold text-4xl md:text-5xl lg:text-6xl">
              Understand Your Blood Tests with
              <span className="text-primary"> AI Analysis</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Upload your blood test results and receive instant, personalized insights powered by advanced AI. No medical jargon, just clear explanations.
            </p>
          </motion.div>
          
          <motion.div variants={item} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg" 
              className="relative group h-12 pl-6 pr-8"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onClick={() => navigate("/dashboard")}
            >
              <span className="mr-2">Upload Your Results</span>
              <motion.span
                className="inline-block"
                animate={{ x: isHovered ? 5 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight size={18} />
              </motion.span>
              
              <motion.span
                className="absolute inset-0 -z-10 rounded-md opacity-0 bg-primary/20 blur-md"
                animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1.05 : 1 }}
                transition={{ duration: 0.2 }}
              />
            </Button>
            
            <Button variant="outline" size="lg" className="h-12">
              Learn More
            </Button>
          </motion.div>
          
          <motion.div 
            variants={item}
            className="pt-4 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400"
          >
            <span className="flex items-center before:content-[''] before:h-px before:w-5 before:bg-gray-300 before:mr-2 after:content-[''] after:h-px after:w-5 after:bg-gray-300 after:ml-2">
              GDPR & HIPAA Compliant
            </span>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" className="w-full">
          <path 
            fill="currentColor" 
            fillOpacity="0.03"
            d="M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,80C672,64,768,64,864,69.3C960,75,1056,85,1152,90.7C1248,96,1344,96,1392,96L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </svg>
      </div>
    </section>
  );
};
