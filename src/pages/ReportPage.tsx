
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { getBloodTestById, getBloodTestFileUrl, getBloodTestReport, processBloodTest } from "@/services/bloodTestService";
import { BloodTest, BloodTestReport } from "@/types/BloodTest";
import { motion } from "framer-motion";
import { Loader2, Calendar, FileText, Download, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { toast } from "sonner";
import { AnalysisCard } from "@/components/AnalysisCard";
import { AiChat } from "@/components/AiChat";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { analyzeBloodTest } from "@/services/qwenApi";

const ReportPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [bloodTest, setBloodTest] = useState<BloodTest | null>(null);
  const [report, setReport] = useState<BloodTestReport | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<string>("");
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [processingStarted, setProcessingStarted] = useState(false);
  const [processingChecks, setProcessingChecks] = useState(0);
  const [extractedText, setExtractedText] = useState<string>("");

  useEffect(() => {
    const fetchReportData = async () => {
      if (!id) return;
      
      setLoading(true);
      const testData = await getBloodTestById(id);
      setBloodTest(testData);
      
      if (testData?.file_path) {
        const url = await getBloodTestFileUrl(testData.file_path);
        setFileUrl(url);
        
        // In a real implementation, you would extract text from the PDF here
        // For demo purposes, we'll simulate extracted text
        if (testData.extracted_text) {
          setExtractedText(testData.extracted_text);
        } else {
          // Simulate some extracted text if none exists
          setExtractedText(`
Blood Test Results
Date: ${new Date().toLocaleDateString()}
Patient ID: 123456789

Complete Blood Count (CBC)
Hemoglobin: ${Math.round(Math.random() * 3 + 13)} g/dL (Reference Range: 13.5-17.5 g/dL)
Red Blood Cells: ${(Math.random() * 1 + 4.5).toFixed(2)} million/μL (Reference Range: 4.5-5.9 million/μL)
White Blood Cells: ${Math.round(Math.random() * 6000 + 5000)} cells/μL (Reference Range: 4,500-11,000 cells/μL)
Platelets: ${Math.round(Math.random() * 100000 + 150000)} cells/μL (Reference Range: 150,000-450,000 cells/μL)

Metabolic Panel
Glucose: ${Math.round(Math.random() * 50 + 80)} mg/dL (Reference Range: 70-100 mg/dL)
Creatinine: ${(Math.random() * 0.6 + 0.7).toFixed(2)} mg/dL (Reference Range: 0.7-1.3 mg/dL)

Lipid Panel
Total Cholesterol: ${Math.round(Math.random() * 50 + 170)} mg/dL (Reference Range: <200 mg/dL)
LDL Cholesterol: ${Math.round(Math.random() * 40 + 100)} mg/dL (Reference Range: <130 mg/dL)
HDL Cholesterol: ${Math.round(Math.random() * 20 + 50)} mg/dL (Reference Range: >40 mg/dL for men, >50 mg/dL for women)
Triglycerides: ${Math.round(Math.random() * 50 + 100)} mg/dL (Reference Range: <150 mg/dL)
          `);
        }
      }
      
      if (testData?.processed) {
        const reportData = await getBloodTestReport(id);
        setReport(reportData);
        
        if (reportData) {
          setAnalyzeLoading(true);
          try {
            const analysisResult = await analyzeBloodTest({ 
              metrics: reportData.metrics,
              rawContent: extractedText // Pass the extracted text to the analysis
            });
            setAnalysis(analysisResult.analysis);
            setRecommendations(analysisResult.recommendations);
          } catch (error) {
            console.error("Error analyzing blood test:", error);
            toast.error("Could not generate analysis");
          } finally {
            setAnalyzeLoading(false);
          }
        }
      } else if (testData && !testData.processed && !processingStarted) {
        // Automatically start processing if not already processed
        handleProcessNow();
      }
      
      setLoading(false);
    };
    
    fetchReportData();
  }, [id, processingStarted, extractedText]);

  // Auto-refresh the page if processing is in progress
  useEffect(() => {
    if (bloodTest && !bloodTest.processed && processingStarted && processingChecks < 3) {
      const timer = setTimeout(() => {
        setProcessingChecks(prev => prev + 1);
        // Refetch the blood test to check if it's processed
        const checkProcessing = async () => {
          if (!id) return;
          const updatedTest = await getBloodTestById(id);
          if (updatedTest?.processed) {
            window.location.reload();
          } else if (processingChecks >= 2) {
            // After 3 checks, force reload to see the latest status
            window.location.reload();
          }
        };
        checkProcessing();
      }, 2000); // Check every 2 seconds
      
      return () => clearTimeout(timer);
    }
  }, [bloodTest, processingStarted, processingChecks, id]);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  const handleDownload = () => {
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    } else {
      toast.error("Download link unavailable");
    }
  };

  const handleProcessNow = async () => {
    if (!id || processingStarted) return;
    
    setProcessingStarted(true);
    toast.info("Processing your blood test...");
    
    try {
      await processBloodTest(id);
      // Processing will be checked by the useEffect
    } catch (error) {
      console.error("Error processing test:", error);
      toast.error("Failed to process test. Please try again.");
      setProcessingStarted(false);
    }
  };

  const renderLoadingState = () => (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  const renderNotFoundState = () => (
    <div className="text-center py-12">
      <h2 className="text-xl font-semibold mb-2">Report Not Found</h2>
      <p className="text-muted-foreground mb-6">
        The report you're looking for doesn't exist or you don't have permission to view it.
      </p>
      <Button onClick={() => navigate('/dashboard')}>
        Return to Dashboard
      </Button>
    </div>
  );

  const renderProcessingState = () => (
    <div className="glass-card p-6 rounded-xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-bold mb-2 sm:mb-0">{bloodTest?.file_name}</h1>
        {fileUrl && (
          <Button variant="default" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" /> Download Original
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="flex items-center text-primary mb-2">
            <Calendar className="h-5 w-5 mr-2" />
            <h3 className="font-medium">Upload Date</h3>
          </div>
          <p>{bloodTest?.created_at ? formatDate(bloodTest.created_at) : "Unknown"}</p>
        </div>
        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="flex items-center text-primary mb-2">
            <FileText className="h-5 w-5 mr-2" />
            <h3 className="font-medium">File Details</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            {bloodTest?.file_type.split('/').pop()?.toUpperCase()} · {bloodTest ? (bloodTest.file_size / 1024 / 1024).toFixed(2) : 0} MB
          </p>
        </div>
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-lg text-amber-800 dark:text-amber-200 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          Processing Your Blood Test
        </h2>
        <p className="mb-2">
          Your blood test is currently being processed automatically. This usually takes a few moments.
        </p>
        <p className="mb-4">
          Results will be available soon. You'll be able to view detailed analysis, chat with our AI assistant, and track health metrics.
        </p>
        
        <div className="flex justify-center mt-4">
          <div className="inline-flex items-center px-4 py-2 rounded-md bg-amber-100 dark:bg-amber-800 text-amber-800 dark:text-amber-200">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processing in progress...
          </div>
        </div>
      </div>

      <div className="text-center mt-8">
        <Button onClick={() => window.location.reload()}>
          Check Again
        </Button>
      </div>
    </div>
  );

  const renderReportContent = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="glass-card p-6 rounded-xl mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h1 className="text-2xl font-bold mb-2 sm:mb-0">{report?.name}</h1>
          {fileUrl && (
            <Button variant="default" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" /> Download Original
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center text-primary mb-2">
              <Calendar className="h-5 w-5 mr-2" />
              <h3 className="font-medium">Test Date</h3>
            </div>
            <p>{report?.date ? formatDate(report.date) : "Unknown"}</p>
          </div>
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center text-primary mb-2">
              <FileText className="h-5 w-5 mr-2" />
              <h3 className="font-medium">File Details</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {bloodTest?.file_type.split('/').pop()?.toUpperCase()} · {bloodTest ? (bloodTest.file_size / 1024 / 1024).toFixed(2) : 0} MB
            </p>
          </div>
        </div>

        <Tabs defaultValue="analysis">
          <TabsList className="mb-4">
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            {extractedText && <TabsTrigger value="raw">Raw Data</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="analysis" className="space-y-4">
            {analyzeLoading ? (
              <div className="p-8 flex justify-center">
                <Loader2 className="animate-spin h-6 w-6 text-primary" />
              </div>
            ) : (
              <>
                <div className="bg-primary/5 p-6 rounded-lg">
                  <h3 className="text-lg font-medium mb-4">Analysis Summary</h3>
                  <p className="text-gray-700 dark:text-gray-300">{analysis}</p>
                  
                  <h4 className="text-md font-medium mt-6 mb-3">Recommendations</h4>
                  <ul className="space-y-2">
                    {recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start">
                        <span className="bg-primary/20 text-primary rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5 text-xs font-bold">
                          {index + 1}
                        </span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <AiChat 
                  initialAnalysis={analysis} 
                  recommendations={recommendations} 
                  metrics={report?.metrics}
                  rawContent={extractedText}
                />
              </>
            )}
          </TabsContent>
          
          <TabsContent value="metrics">
            <h3 className="text-lg font-medium mb-4">Blood Test Results</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {report?.metrics.map((metric, index) => (
                <AnalysisCard key={index} metric={metric} />
              ))}
            </div>
          </TabsContent>
          
          {extractedText && (
            <TabsContent value="raw">
              <h3 className="text-lg font-medium mb-4">Extracted Text from PDF</h3>
              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg overflow-auto max-h-[600px]">
                <pre className="whitespace-pre-wrap font-mono text-sm">
                  {extractedText}
                </pre>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </motion.div>
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="outline"
          size="sm"
          className="mb-6"
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
        </Button>

        {loading ? (
          renderLoadingState()
        ) : !bloodTest ? (
          renderNotFoundState()
        ) : !bloodTest.processed ? (
          renderProcessingState()
        ) : report ? (
          renderReportContent()
        ) : (
          <div className="text-center">
            <p>Error loading report data. Please try again.</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Reload
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ReportPage;
