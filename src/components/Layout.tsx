
import React from "react";
import { Navbar } from "./Navbar";
import { motion } from "framer-motion";

interface LayoutProps {
  children: React.ReactNode;
  showNav?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, showNav = true }) => {
  return (
    <div className="min-h-screen flex flex-col">
      {showNav && <Navbar />}
      <motion.main 
        className="flex-1"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 5 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.main>
      <footer className="py-6 border-t border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} HemoChecker AI. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-500 hover:text-primary transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-500 hover:text-primary transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-gray-500 hover:text-primary transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
