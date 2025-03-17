
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { X, CreditCard, Clock, Info } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface BillingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BillingModal = ({ isOpen, onClose }: BillingModalProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Simulating payment methods - in a real app, these would come from your payment provider
  const paymentMethods = [
    // This is empty since we're on the free plan
  ];
  
  const handleUpgrade = () => {
    onClose();
    navigate("/pricing");
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Billing Information</DialogTitle>
          <DialogDescription>
            Manage your subscription and payment methods
          </DialogDescription>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-4 top-4" 
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="glass-card rounded-lg p-4">
            <h3 className="text-lg font-medium mb-3">Current Plan</h3>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center">
                  <span className="font-semibold text-xl">Free Plan</span>
                  <Badge className="ml-2">Current</Badge>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Basic blood test analysis with limited features
                </p>
              </div>
              <span className="text-2xl font-bold">$0</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-500 mb-4">
              <Clock className="h-4 w-4 mr-1" />
              <span>Renews automatically</span>
            </div>
            
            <Button onClick={handleUpgrade} className="w-full">
              Upgrade Plan
            </Button>
          </div>
          
          <div className="glass-card rounded-lg p-4">
            <h3 className="text-lg font-medium mb-3 flex items-center">
              <CreditCard className="mr-2 h-5 w-5" />
              Payment Methods
            </h3>
            
            {paymentMethods.length > 0 ? (
              <div className="space-y-3">
                {paymentMethods.map((method, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                    {/* Payment method details would go here */}
                    <div className="flex items-center">
                      <CreditCard className="h-5 w-5 mr-3 text-primary" />
                      <div>
                        <p className="font-medium">•••• •••• •••• 4242</p>
                        <p className="text-xs text-gray-500">Expires 12/24</p>
                      </div>
                    </div>
                    <Badge>Default</Badge>
                  </div>
                ))}
                
                <Button variant="outline" className="w-full mt-3">
                  Add Payment Method
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="bg-muted inline-flex p-3 rounded-full mb-3">
                  <Info className="h-6 w-6 text-gray-400" />
                </div>
                <h4 className="font-medium mb-1">No payment methods</h4>
                <p className="text-sm text-gray-500 mb-4">
                  Add a payment method when you upgrade to a paid plan
                </p>
                <Button variant="outline" onClick={handleUpgrade}>
                  Upgrade Now
                </Button>
              </div>
            )}
          </div>
          
          <div className="text-center text-sm text-gray-500">
            <p>For billing questions, please contact support@bloodworkanalyzer.com</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
