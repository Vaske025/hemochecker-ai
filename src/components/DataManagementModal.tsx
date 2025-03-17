
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { X, Loader2, Download, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getUserBloodTests } from "@/services/bloodTestService";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface DataManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataManagementModal = ({ isOpen, onClose }: DataManagementModalProps) => {
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  const handleDownloadData = async () => {
    if (!user) return;
    
    setDownloadLoading(true);
    try {
      // Get user's blood tests
      const bloodTests = await getUserBloodTests();
      
      // Get user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      // Combine the data
      const userData = {
        profile: profileData,
        email: user.email,
        bloodTests
      };
      
      // Create a JSON file to download
      const dataStr = JSON.stringify(userData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      // Create download link and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = 'bloodwork-data.json';
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Data downloaded",
        description: "Your data has been downloaded successfully."
      });
    } catch (error: any) {
      toast({
        title: "Download failed",
        description: error.message || "Failed to download your data.",
        variant: "destructive"
      });
    } finally {
      setDownloadLoading(false);
    }
  };
  
  const handleDeleteData = async () => {
    if (!user || !confirmDelete) return;
    
    setDeleteLoading(true);
    try {
      // Get user's blood tests to delete their files
      const bloodTests = await getUserBloodTests();
      
      // Delete all blood tests and related data
      // Note: In a production app, this would be handled by a database cascade
      for (const test of bloodTests) {
        // Delete the file from storage
        if (test.file_path) {
          await supabase.storage.from('blood-tests').remove([test.file_path]);
        }
        
        // Delete the blood test record
        await supabase
          .from('blood_tests')
          .delete()
          .eq('id', test.id);
      }
      
      // Delete user profile data
      await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);
      
      // Delete the user account
      const { error } = await supabase.auth.admin.deleteUser(user.id);
      if (error) throw error;
      
      toast({
        title: "Account deleted",
        description: "Your account and all associated data have been deleted."
      });
      
      // Log the user out
      logout();
      onClose();
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete your data.",
        variant: "destructive"
      });
      setConfirmDelete(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => {
      if (!open) {
        setConfirmDelete(false);
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manage Your Data</DialogTitle>
          <DialogDescription>
            Download or delete all your data from our platform
          </DialogDescription>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-4 top-4 h-8 w-8 p-0" 
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="glass-card rounded-lg p-4">
            <h3 className="text-lg font-medium mb-2 flex items-center">
              <Download className="mr-2 h-5 w-5 text-primary" />
              Download Your Data
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Download all your account information and blood test data in JSON format.
            </p>
            <Button 
              onClick={handleDownloadData} 
              disabled={downloadLoading}
              className="w-full"
            >
              {downloadLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Download Data
            </Button>
          </div>
          
          <div className="glass-card rounded-lg p-4 border border-destructive/20">
            <h3 className="text-lg font-medium mb-2 flex items-center text-destructive">
              <Trash2 className="mr-2 h-5 w-5" />
              Delete Your Account
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            
            {!confirmDelete ? (
              <Button 
                variant="destructive" 
                onClick={() => setConfirmDelete(true)}
                className="w-full"
              >
                Delete Account
              </Button>
            ) : (
              <>
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>
                    Are you sure you want to delete your account? This will immediately delete all your data and cannot be reversed.
                  </AlertDescription>
                </Alert>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setConfirmDelete(false)}
                    disabled={deleteLoading}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleDeleteData}
                    disabled={deleteLoading}
                    className="flex-1"
                  >
                    {deleteLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Confirm Delete
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
