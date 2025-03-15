
import { supabase } from "@/integrations/supabase/client";
import { BloodTest, BloodTestMetric, BloodTestReport, HealthScore } from "@/types/BloodTest";
import { toast } from "sonner";

export const uploadBloodTest = async (file: File, userId: string): Promise<BloodTest | null> => {
  try {
    // 1. Upload file to storage
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/${crypto.randomUUID()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('blood_test_files')
      .upload(filePath, file);
      
    if (uploadError) throw uploadError;
    
    // 2. Create record in blood_tests table
    const { data, error } = await supabase
      .from('blood_tests')
      .insert({
        user_id: userId,
        file_path: filePath,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
      })
      .select()
      .single();
      
    if (error) throw error;

    // 3. Simulate processing of the blood test (would be a server-side process in production)
    setTimeout(async () => {
      try {
        await processBloodTest(data.id);
      } catch (error) {
        console.error("Error processing blood test:", error);
      }
    }, 5000); // Simulate 5 second processing time
    
    return data as BloodTest;
  } catch (error: any) {
    console.error("Error uploading blood test:", error);
    toast.error("Failed to upload blood test. Please try again.");
    return null;
  }
};

export const getUserBloodTests = async (): Promise<BloodTest[]> => {
  try {
    const { data, error } = await supabase
      .from('blood_tests')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return data as BloodTest[];
  } catch (error: any) {
    console.error("Error fetching blood tests:", error);
    toast.error("Failed to fetch blood test records");
    return [];
  }
};

export const getBloodTestById = async (id: string): Promise<BloodTest | null> => {
  try {
    const { data, error } = await supabase
      .from('blood_tests')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    
    return data as BloodTest;
  } catch (error: any) {
    console.error("Error fetching blood test by ID:", error);
    toast.error("Failed to fetch blood test details");
    return null;
  }
};

export const getBloodTestFileUrl = async (filePath: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase.storage
      .from('blood_test_files')
      .createSignedUrl(filePath, 3600); // 1 hour expiry
      
    if (error) throw error;
    
    return data.signedUrl;
  } catch (error) {
    console.error("Error getting file URL:", error);
    return null;
  }
};

export const deleteBloodTest = async (id: string, filePath: string): Promise<boolean> => {
  try {
    // First delete the storage file
    const { error: storageError } = await supabase.storage
      .from('blood_test_files')
      .remove([filePath]);
      
    if (storageError) throw storageError;
    
    // Then delete the database record
    const { error: dbError } = await supabase
      .from('blood_tests')
      .delete()
      .eq('id', id);
      
    if (dbError) throw dbError;
    
    toast.success("Blood test report deleted successfully");
    return true;
  } catch (error) {
    console.error("Error deleting blood test:", error);
    toast.error("Failed to delete blood test");
    return false;
  }
};

// Simulate processing a blood test
export const processBloodTest = async (id: string): Promise<boolean> => {
  try {
    // In a real app, this would analyze the actual file
    // For now, we'll just update the processed status
    const { error } = await supabase
      .from('blood_tests')
      .update({ processed: true })
      .eq('id', id);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Error processing blood test:", error);
    return false;
  }
};

// Get blood test report data (simulated)
export const getBloodTestReport = async (id: string): Promise<BloodTestReport | null> => {
  try {
    const bloodTest = await getBloodTestById(id);
    if (!bloodTest) return null;
    
    if (!bloodTest.processed) {
      return null;
    }
    
    // Generate random metrics for demonstration
    const metrics: BloodTestMetric[] = [
      {
        name: "Hemoglobin",
        value: 14.2 + Math.random(),
        unit: "g/dL",
        status: Math.random() > 0.7 ? "elevated" : Math.random() > 0.7 ? "low" : "normal"
      },
      {
        name: "Glucose",
        value: 90 + Math.random() * 30,
        unit: "mg/dL",
        status: Math.random() > 0.7 ? "elevated" : Math.random() > 0.7 ? "low" : "normal"
      },
      {
        name: "Cholesterol",
        value: 170 + Math.random() * 50,
        unit: "mg/dL",
        status: Math.random() > 0.7 ? "elevated" : Math.random() > 0.7 ? "low" : "normal"
      },
      {
        name: "LDL",
        value: 100 + Math.random() * 40,
        unit: "mg/dL",
        status: Math.random() > 0.7 ? "elevated" : Math.random() > 0.7 ? "low" : "normal"
      },
      {
        name: "HDL",
        value: 45 + Math.random() * 20,
        unit: "mg/dL",
        status: Math.random() > 0.7 ? "elevated" : Math.random() > 0.7 ? "low" : "normal"
      },
      {
        name: "Triglycerides",
        value: 120 + Math.random() * 80,
        unit: "mg/dL",
        status: Math.random() > 0.7 ? "elevated" : Math.random() > 0.7 ? "low" : "normal"
      },
      {
        name: "Creatinine",
        value: 0.8 + Math.random() * 0.4,
        unit: "mg/dL",
        status: Math.random() > 0.7 ? "elevated" : Math.random() > 0.7 ? "low" : "normal"
      },
      {
        name: "Platelets",
        value: 250000 + Math.random() * 100000,
        unit: "cells/μL",
        status: Math.random() > 0.7 ? "elevated" : Math.random() > 0.7 ? "low" : "normal"
      }
    ];
    
    return {
      id: bloodTest.id,
      date: bloodTest.created_at,
      name: bloodTest.file_name,
      metrics
    };
  } catch (error) {
    console.error("Error getting blood test report:", error);
    return null;
  }
};

// Get health scores based on past blood tests
export const getHealthScores = async (): Promise<HealthScore[]> => {
  try {
    const bloodTests = await getUserBloodTests();
    
    // Only include processed tests
    const processedTests = bloodTests.filter(test => test.processed);
    
    // Generate health scores based on the test dates
    return processedTests.map(test => ({
      date: test.created_at,
      score: 70 + Math.random() * 30 // Random score between 70-100
    }));
  } catch (error) {
    console.error("Error getting health scores:", error);
    return [];
  }
};
