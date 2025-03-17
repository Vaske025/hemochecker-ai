
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export const Pricing = () => {
  const [annual, setAnnual] = useState(true); // Set to true by default
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handlePlanSelect = (planName: string) => {
    // In a real app, this would redirect to a checkout page
    toast({
      title: "Coming Soon",
      description: `The ${planName} plan will be available for purchase soon!`,
    });
  };
  
  const plans = [
    {
      name: "Free",
      price: { monthly: 0, annual: 0 },
      description: "Perfect for getting started with basic blood test analysis",
      features: [
        "Upload up to 5 blood tests per month",
        "Basic health score tracking",
        "Simple AI analysis",
        "Email support"
      ],
      buttonText: "Current Plan",
      popular: false,
      disabled: true
    },
    {
      name: "Premium",
      price: { monthly: 14.99, annual: 149.99 },
      description: "Advanced analysis and unlimited uploads for individuals",
      features: [
        "Unlimited blood test uploads",
        "Detailed health score tracking",
        "Advanced AI analysis & recommendations",
        "Historical data comparison",
        "Priority email support",
        "Export reports as PDF"
      ],
      buttonText: "Get Premium",
      popular: true,
      disabled: false
    },
    {
      name: "Family",
      price: { monthly: 24.99, annual: 249.99 },
      description: "Monitor health for up to 5 family members",
      features: [
        "All Premium features",
        "Up to 5 user profiles",
        "Family health dashboard",
        "Cross-profile analysis",
        "Phone support",
        "Custom health alerts"
      ],
      buttonText: "Get Family Plan",
      popular: false,
      disabled: false
    }
  ];
  
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
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-12 text-center"
      >
        <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Select the plan that best fits your needs. All plans include our core analysis features,
          with premium options for more detailed insights and family coverage.
        </p>
        
        <div className="flex items-center justify-center mt-8">
          <span className={`mr-3 ${annual ? 'text-gray-500' : 'font-medium'}`}>Monthly</span>
          <Switch 
            checked={annual} 
            onCheckedChange={setAnnual}
          />
          <span className={`ml-3 ${annual ? 'font-medium' : 'text-gray-500'}`}>
            Annual <span className="text-green-500 text-sm">(Save 16%)</span>
          </span>
        </div>
      </motion.div>
      
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
      >
        {plans.map((plan) => (
          <motion.div
            key={plan.name}
            variants={item}
            className={`glass-card rounded-xl overflow-hidden ${
              plan.popular ? 'ring-2 ring-primary' : ''
            }`}
          >
            {plan.popular && (
              <div className="bg-primary text-primary-foreground text-center py-2 text-sm font-medium">
                MOST POPULAR
              </div>
            )}
            
            <div className="p-6">
              <h3 className="text-xl font-bold">{plan.name}</h3>
              
              <div className="mt-4 mb-6">
                <div className="flex items-end">
                  <span className="text-3xl font-bold">
                    ${annual ? plan.price.annual : plan.price.monthly}
                  </span>
                  <span className="text-gray-500 ml-2">
                    /{annual ? 'year' : 'month'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
              </div>
              
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                className="w-full" 
                variant={plan.disabled ? "outline" : "default"}
                disabled={plan.disabled}
                onClick={() => handlePlanSelect(plan.name)}
              >
                {plan.buttonText}
              </Button>
            </div>
          </motion.div>
        ))}
      </motion.div>
      
      <div className="mt-16 text-center">
        <h3 className="text-xl font-semibold mb-4">Need a custom solution?</h3>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-6">
          Contact us for enterprise options or tailored plans for healthcare providers and research institutions.
        </p>
        <Button variant="outline" onClick={() => navigate("/contact")}>
          Contact Sales
        </Button>
      </div>
    </div>
  );
};
