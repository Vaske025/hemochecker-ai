
import { supabase } from "@/integrations/supabase/client";
import { BloodTest } from "@/types/BloodTest";
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
