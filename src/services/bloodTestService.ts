
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

// Process a blood test - improved to be more reliable
export const processBloodTest = async (id: string): Promise<boolean> => {
  try {
    // Update the processed status to true
    const { error } = await supabase
      .from('blood_tests')
      .update({ processed: true })
      .eq('id', id);
      
    if (error) throw error;
    
    // Allow a small delay for the database to update
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Verify the update was successful
    const { data, error: verifyError } = await supabase
      .from('blood_tests')
      .select('processed')
      .eq('id', id)
      .single();
      
    if (verifyError) throw verifyError;
    
    if (data && data.processed) {
      console.log("Blood test processing confirmed");
      return true;
    } else {
      console.error("Blood test processing verification failed");
      return false;
    }
  } catch (error) {
    console.error("Error processing blood test:", error);
    toast.error("Failed to process blood test");
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
    
    // Generate consistent metrics based on the test ID
    // This ensures same test always gets same results
    const seed = Array.from(id).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const randomWithSeed = (min: number, max: number) => {
      const x = Math.sin(seed) * 10000;
      const rand = x - Math.floor(x);
      return min + rand * (max - min);
    };
    
    const getStatus = (value: number, lowThreshold: number, highThreshold: number) => {
      if (value < lowThreshold) return "low";
      if (value > highThreshold) return "elevated";
      return "normal";
    };
    
    const metrics: BloodTestMetric[] = [
      {
        name: "Hemoglobin",
        value: 13 + randomWithSeed(0, 3),
        unit: "g/dL",
        status: getStatus(13 + randomWithSeed(0, 3), 12, 16)
      },
      {
        name: "Glucose",
        value: 85 + randomWithSeed(0, 40),
        unit: "mg/dL",
        status: getStatus(85 + randomWithSeed(0, 40), 70, 100)
      },
      {
        name: "Cholesterol",
        value: 160 + randomWithSeed(0, 60),
        unit: "mg/dL",
        status: getStatus(160 + randomWithSeed(0, 60), 150, 200)
      },
      {
        name: "LDL",
        value: 90 + randomWithSeed(0, 50),
        unit: "mg/dL",
        status: getStatus(90 + randomWithSeed(0, 50), 70, 130)
      },
      {
        name: "HDL",
        value: 40 + randomWithSeed(0, 30),
        unit: "mg/dL",
        status: getStatus(40 + randomWithSeed(0, 30), 40, 60)
      },
      {
        name: "Triglycerides",
        value: 100 + randomWithSeed(0, 100),
        unit: "mg/dL",
        status: getStatus(100 + randomWithSeed(0, 100), 50, 150)
      },
      {
        name: "Creatinine",
        value: 0.7 + randomWithSeed(0, 0.6),
        unit: "mg/dL",
        status: getStatus(0.7 + randomWithSeed(0, 0.6), 0.6, 1.2)
      },
      {
        name: "Platelets",
        value: 200000 + randomWithSeed(0, 150000),
        unit: "cells/μL",
        status: getStatus(200000 + randomWithSeed(0, 150000), 150000, 350000)
      },
      {
        name: "White Blood Cells",
        value: 7000 + randomWithSeed(0, 4000),
        unit: "cells/μL",
        status: getStatus(7000 + randomWithSeed(0, 4000), 4500, 11000)
      },
      {
        name: "Red Blood Cells",
        value: 4.5 + randomWithSeed(0, 1.5),
        unit: "million/μL",
        status: getStatus(4.5 + randomWithSeed(0, 1.5), 4.2, 5.8)
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

// Get health scores based on past blood tests with consistent calculation
export const getHealthScores = async (): Promise<HealthScore[]> => {
  try {
    const bloodTests = await getUserBloodTests();
    
    // Only include processed tests
    const processedTests = bloodTests.filter(test => test.processed);
    
    // Generate consistent health scores based on test IDs
    return Promise.all(processedTests.map(async (test) => {
      // Get the actual report data
      const report = await getBloodTestReport(test.id);
      
      if (!report || !report.metrics) {
        // Fallback if report not available
        return {
          date: test.created_at,
          score: calculateFallbackScore(test.id)
        };
      }
      
      // Calculate score based on metrics
      let totalScore = 0;
      let metricsCount = 0;
      
      // Evaluate each metric's contribution to the health score
      report.metrics.forEach(metric => {
        const metricScore = calculateMetricScore(metric);
        if (metricScore !== null) {
          totalScore += metricScore;
          metricsCount++;
        }
      });
      
      // Calculate final score (scale to 0-100)
      const finalScore = metricsCount > 0 
        ? Math.min(100, Math.max(0, (totalScore / metricsCount) * 100)) 
        : calculateFallbackScore(test.id);
      
      return {
        date: test.created_at,
        score: Math.round(finalScore)
      };
    }));
  } catch (error) {
    console.error("Error getting health scores:", error);
    return [];
  }
};

// Calculate score for a specific metric
const calculateMetricScore = (metric: BloodTestMetric): number | null => {
  // Score each metric based on its status
  switch (metric.status) {
    case "normal":
      return 1.0; // Perfect score
    case "low":
      // For low values, score depends on how far from normal range
      // We'll use a generic approach here
      return 0.7;
    case "elevated":
      // For elevated values, score depends on how far above normal
      return 0.5;
    default:
      return null; // Skip metrics we can't evaluate
  }
};

// Fallback score calculation using test ID as seed
const calculateFallbackScore = (id: string): number => {
  // Create a deterministic score based on the test ID
  const hash = Array.from(id).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const normalizedHash = (hash % 30) + 70; // Range: 70-100
  return normalizedHash;
};
