
import { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { UserCircle, CreditCard, Bell, Lock, ChevronRight, Moon, Sun } from "lucide-react";

export const Settings = () => {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // In a real app, we would apply the dark mode class to the document here
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
          action: <ChevronRight className="h-5 w-5 text-gray-400" />
        },
        {
          id: "email",
          title: "Email Address",
          description: "user@example.com",
          action: <ChevronRight className="h-5 w-5 text-gray-400" />
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
          action: <Badge variant="outline">Upgrade</Badge>
        },
        {
          id: "billing",
          title: "Billing Information",
          description: "Manage payment methods",
          action: <ChevronRight className="h-5 w-5 text-gray-400" />
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
            <Switch 
              checked={darkMode} 
              onCheckedChange={toggleDarkMode}
              icon={darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            />
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
          action: <ChevronRight className="h-5 w-5 text-gray-400" />
        },
        {
          id: "data",
          title: "Manage Your Data",
          description: "Download or delete your data",
          action: <ChevronRight className="h-5 w-5 text-gray-400" />
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
    </div>
  );
};
