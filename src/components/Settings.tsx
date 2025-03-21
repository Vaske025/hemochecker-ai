
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { UserCircle, CreditCard, Bell, Lock, ChevronRight, Moon, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ProfileModal } from "./ProfileModal";
import { EmailModal } from "./EmailModal";
import { BillingModal } from "./BillingModal";
import { PasswordModal } from "./PasswordModal";
import { DataManagementModal } from "./DataManagementModal";

export const Settings = () => {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Check if dark mode is enabled
  useEffect(() => {
    // Check if user prefers dark mode
    const isDarkMode = localStorage.getItem("darkMode") === "true" || 
                      window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDarkMode(isDarkMode);
    
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);
  
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", String(newDarkMode));
    
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };
  
  const handleChangePassword = () => {
    setActiveModal("password");
  };
  
  const handleDataManagement = () => {
    setActiveModal("data");
  };
  
  const handleUpgrade = () => {
    navigate("/pricing");
  };
  
  const handleProfileEdit = () => {
    setActiveModal("profile");
  };
  
  const handleEmailEdit = () => {
    setActiveModal("email");
  };
  
  const handleBillingEdit = () => {
    setActiveModal("billing");
  };
  
  const closeModal = () => {
    setActiveModal(null);
  };
  
  const settingsSections = [
    {
      id: "account",
      title: "Account Settings",
      icon: <UserCircle className="h-5 w-5" />,
      options: [
        {
          id: "profile",
          title: "Profile Information",
          description: "Update your personal information",
          action: <Button variant="ghost" size="sm" onClick={handleProfileEdit}><ChevronRight className="h-5 w-5 text-gray-400" /></Button>
        },
        {
          id: "email",
          title: "Email Address",
          description: user?.email || "Not available",
          action: <Button variant="ghost" size="sm" onClick={handleEmailEdit}><ChevronRight className="h-5 w-5 text-gray-400" /></Button>
        }
      ]
    },
    {
      id: "subscription",
      title: "Subscription",
      icon: <CreditCard className="h-5 w-5" />,
      options: [
        {
          id: "plan",
          title: "Current Plan",
          description: "Free Plan",
          action: <Badge variant="outline" className="cursor-pointer" onClick={handleUpgrade}>Upgrade</Badge>
        },
        {
          id: "billing",
          title: "Billing Information",
          description: "Manage payment methods",
          action: <Button variant="ghost" size="sm" onClick={handleBillingEdit}><ChevronRight className="h-5 w-5 text-gray-400" /></Button>
        }
      ]
    },
    {
      id: "preferences",
      title: "Preferences",
      icon: <Bell className="h-5 w-5" />,
      options: [
        {
          id: "notifications",
          title: "Notifications",
          description: "Receive email updates",
          action: (
            <Switch 
              checked={notifications} 
              onCheckedChange={setNotifications} 
            />
          )
        },
        {
          id: "theme",
          title: "Dark Mode",
          description: "Toggle light/dark theme",
          action: (
            <div className="flex items-center">
              {darkMode ? <Moon className="h-4 w-4 mr-2" /> : <Sun className="h-4 w-4 mr-2" />}
              <Switch 
                checked={darkMode} 
                onCheckedChange={toggleDarkMode}
              />
            </div>
          )
        }
      ]
    },
    {
      id: "privacy",
      title: "Privacy & Security",
      icon: <Lock className="h-5 w-5" />,
      options: [
        {
          id: "password",
          title: "Change Password",
          description: "Update your password",
          action: <Button variant="ghost" size="sm" onClick={handleChangePassword}><ChevronRight className="h-5 w-5 text-gray-400" /></Button>
        },
        {
          id: "data",
          title: "Manage Your Data",
          description: "Download or delete your data",
          action: <Button variant="ghost" size="sm" onClick={handleDataManagement}><ChevronRight className="h-5 w-5 text-gray-400" /></Button>
        }
      ]
    }
  ];
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 10 },
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
        <h2 className="text-3xl font-bold mb-2">Settings</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Manage your account preferences and subscription
        </p>
      </motion.div>
      
      <div className="max-w-3xl">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
          {settingsSections.map((section) => (
            <motion.div 
              key={section.id}
              variants={item}
              className="glass-card rounded-xl overflow-hidden"
            >
              <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center">
                <div className="bg-primary/10 rounded-full p-2 mr-3">
                  <span className="text-primary">{section.icon}</span>
                </div>
                <h3 className="text-lg font-semibold">{section.title}</h3>
              </div>
              
              <div>
                {section.options.map((option, index) => (
                  <div 
                    key={option.id}
                    className={`p-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors ${
                      index !== section.options.length - 1 ? "border-b border-gray-100 dark:border-gray-800/80" : ""
                    }`}
                  >
                    <div>
                      <h4 className="font-medium">{option.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {option.description}
                      </p>
                    </div>
                    {option.action}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
          
          <motion.div 
            variants={item}
            className="flex justify-end space-x-4 pt-4"
          >
            <Button variant="outline">Cancel</Button>
            <Button>Save Changes</Button>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Modals */}
      <ProfileModal 
        isOpen={activeModal === "profile"} 
        onClose={closeModal} 
      />
      
      <EmailModal 
        isOpen={activeModal === "email"} 
        onClose={closeModal} 
      />
      
      <BillingModal 
        isOpen={activeModal === "billing"} 
        onClose={closeModal} 
      />
      
      <PasswordModal 
        isOpen={activeModal === "password"} 
        onClose={closeModal} 
      />
      
      <DataManagementModal 
        isOpen={activeModal === "data"} 
        onClose={closeModal} 
      />
    </div>
  );
};
