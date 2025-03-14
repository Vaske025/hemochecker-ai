
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { getBloodTestById, getBloodTestFileUrl } from "@/services/bloodTestService";
import { BloodTest } from "@/types/BloodTest";
import { motion } from "framer-motion";
import { Loader2, Calendar, FileText, Download, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { toast } from "sonner";

const ReportPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<BloodTest | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      if (!id) return;
      
      setLoading(true);
      const reportData = await getBloodTestById(id);
      setReport(reportData);
      
      if (reportData?.file_path) {
        const url = await getBloodTestFileUrl(reportData.file_path);
        setFileUrl(url);
      }
      
      setLoading(false);
    };
    
    fetchReport();
  }, [id]);

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
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : report ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="glass-card p-6 rounded-xl">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <h1 className="text-2xl font-bold mb-2 sm:mb-0">{report.file_name}</h1>
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
                  <p>{formatDate(report.created_at)}</p>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex items-center text-primary mb-2">
                    <FileText className="h-5 w-5 mr-2" />
                    <h3 className="font-medium">File Details</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {report.file_type.split('/').pop()?.toUpperCase()} · {(report.file_size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>

              <div className="bg-muted/30 p-6 rounded-lg mb-6">
                <h2 className="text-xl font-semibold mb-4">Processing Status</h2>
                <div className="flex items-center">
                  <div className={`h-3 w-3 rounded-full mr-2 ${report.processed ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                  <p>{report.processed ? 'Processed' : 'Pending Analysis'}</p>
                </div>
                
                {!report.processed && (
                  <p className="mt-4 text-sm text-muted-foreground">
                    Your blood test is currently being processed. Results will be available soon.
                  </p>
                )}
              </div>

              {!report.processed && (
                <div className="text-center mt-8">
                  <p className="text-muted-foreground mb-4">
                    We're still processing this report. Check back soon for the analysis.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Report Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The report you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Button onClick={() => navigate('/dashboard')}>
              Return to Dashboard
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ReportPage;
