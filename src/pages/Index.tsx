
import { Layout } from "@/components/Layout";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Shield, Activity, TrendingUp, ChevronRight } from "lucide-react";

const Index = () => {
  return (
    <Layout>
      <Hero />
      <Features />
      
      {/* Premium Plan Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Unlock Premium Features
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Get deeper insights, unlimited uploads, and priority support with our Premium Plan
            </p>
          </motion.div>
          
          <div className="flex flex-col lg:flex-row gap-8 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex-1 glass-card rounded-xl p-8 border border-gray-200 dark:border-gray-800"
            >
              <div className="bg-primary/10 text-primary w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Free Plan</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Perfect for occasional use and basic analysis
              </p>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>5 uploads per month</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Basic analysis of results</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Store up to 3 reports</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Standard support</span>
                </li>
              </ul>
              
              <div className="text-2xl font-bold mb-6">$0 <span className="text-gray-500 text-sm font-normal">/month</span></div>
              
              <Button variant="outline" className="w-full">
                Current Plan
              </Button>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex-1 glass-card rounded-xl p-8 border-2 border-primary relative overflow-hidden shadow-lg"
            >
              <div className="absolute top-0 right-0">
                <div className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-md">
                  RECOMMENDED
                </div>
              </div>
              
              <div className="bg-primary w-12 h-12 rounded-full flex items-center justify-center mb-4 text-white">
                <Activity className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Premium Plan</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                For comprehensive health tracking and detailed insights
              </p>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>Unlimited</strong> uploads</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Advanced AI analysis with recommendations</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Historical trend visualization</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Downloadable PDF reports</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Priority support</span>
                </li>
              </ul>
              
              <div className="text-2xl font-bold mb-6">$9.99 <span className="text-gray-500 text-sm font-normal">/month</span></div>
              
              <Button className="w-full">
                Upgrade Now
              </Button>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Start Understanding Your Health Today
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Upload your first blood test result and get instant AI-powered insights
            </p>
            <Button size="lg" className="h-12">
              Get Started <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
