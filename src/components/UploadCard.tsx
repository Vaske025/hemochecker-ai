
import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { FileUp, X, Check, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { uploadBloodTest } from "@/services/bloodTestService";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const UploadCard = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast: uiToast } = useToast();
  
  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  
  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);
  
  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    
    if (droppedFile) {
      // Validate file type
      const validTypes = ['application/pdf', 'text/csv', 'image/jpeg', 'image/png'];
      if (validTypes.includes(droppedFile.type)) {
        setFile(droppedFile);
      } else {
        uiToast({
          title: "Invalid file type",
          description: "Please upload a PDF, CSV, or image file",
          variant: "destructive"
        });
      }
    }
  }, [uiToast]);
  
  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };
  
  const clearFile = () => {
    setFile(null);
  };
  
  const processFile = async () => {
    if (!file || !user) return;
    
    setUploading(true);
    
    try {
      const result = await uploadBloodTest(file, user.id);
      
      if (result) {
        toast.success("Upload successful", {
          description: "Your file has been uploaded and is being processed"
        });
        
        // Navigate to the report page for the newly uploaded file
        navigate(`/report/${result.id}`);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Upload failed", {
        description: "There was a problem uploading your file. Please try again."
      });
    } finally {
      setUploading(false);
      setFile(null);
    }
  };

  return (
    <div className="max-w-lg w-full mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.3 }}
        className="glass-card rounded-xl p-6 overflow-hidden"
      >
        <h3 className="text-xl font-semibold mb-4">Upload Blood Test Results</h3>
        
        {!file ? (
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`border-2 border-dashed rounded-lg p-8 transition-all duration-300 text-center ${
              isDragging 
                ? "border-primary bg-primary/5" 
                : "border-gray-200 dark:border-gray-700 hover:border-primary/50 hover:bg-primary/5"
            }`}
          >
            <motion.div 
              className="flex flex-col items-center"
              initial={{ scale: 1 }}
              animate={{ scale: isDragging ? 1.05 : 1 }}
              transition={{ duration: 0.2 }}
            >
              <div className="rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center text-primary mb-4">
                <FileUp size={24} />
              </div>
              <p className="mb-2 text-lg font-medium">
                {isDragging ? "Drop your file here" : "Drag & Drop your file here"}
              </p>
              <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                Supported formats: PDF, CSV, JPG, PNG
              </p>
              
              <label className="relative">
                <span className="bg-primary hover:bg-primary/90 transition-colors duration-300 text-white rounded-md px-4 py-2 cursor-pointer">
                  Browse Files
                </span>
                <input
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={onFileSelect}
                  accept=".pdf,.csv,.jpg,.jpeg,.png"
                />
              </label>
            </motion.div>
          </div>
        ) : (
          <div className="mb-4">
            <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="bg-primary/10 rounded-full p-2 mr-3">
                <Check className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button 
                onClick={clearFile}
                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <div className="flex space-x-3 mt-4">
              <Button 
                onClick={processFile} 
                disabled={uploading}
                className="flex-1"
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Upload File"
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={clearFile}
                disabled={uploading}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
        
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Your data is encrypted and securely processed. We never share your health information with third parties.
              By uploading, you agree to our <a href="/terms" className="text-primary hover:underline">Terms</a> and <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
