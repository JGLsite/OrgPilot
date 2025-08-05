import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileSpreadsheet, CheckCircle, XCircle, Clock, Users, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

interface RosterUploaderProps {
  gymId: string;
  gymName: string;
}

export function RosterUploader({ gymId, gymName }: RosterUploaderProps) {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [selectedUpload, setSelectedUpload] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch roster uploads for this gym
  const { data: uploads = [], isLoading } = useQuery({
    queryKey: ["/api/roster-uploads/gym", gymId],
  });

  const createUploadMutation = useMutation({
    mutationFn: async (uploadData: any) => {
      return apiRequest("/api/roster-upload", {
        method: "POST",
        body: uploadData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roster-uploads/gym", gymId] });
      setCsvFile(null);
      setCsvData([]);
      toast({
        title: "Upload Created",
        description: "Your roster upload has been prepared. Review and process when ready.",
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to create roster upload",
        variant: "destructive",
      });
    },
  });

  const processUploadMutation = useMutation({
    mutationFn: async ({ uploadId, gymnastsData }: { uploadId: string; gymnastsData: any[] }) => {
      return apiRequest(`/api/roster-upload/${uploadId}/process`, {
        method: "POST",
        body: { gymnastsData },
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/roster-uploads/gym", gymId] });
      queryClient.invalidateQueries({ queryKey: ["/api/gymnasts"] });
      setIsProcessing(false);
      setIsPreviewOpen(false);
      setSelectedUpload(null);
      toast({
        title: "Roster Processed!",
        description: `Successfully processed ${data.processedRows} gymnasts. ${data.errorRows > 0 ? `${data.errorRows} had errors.` : ''}`,
        variant: "default",
      });
    },
    onError: (error: any) => {
      setIsProcessing(false);
      toast({
        title: "Processing Failed",
        description: error.message || "Failed to process roster upload",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
      
      // Parse CSV file
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        const data = lines.slice(1)
          .filter(line => line.trim())
          .map(line => {
            const values = line.split(',').map(v => v.trim());
            const row: any = {};
            headers.forEach((header, index) => {
              row[header] = values[index] || '';
            });
            return row;
          });
        
        setCsvData(data);
      };
      reader.readAsText(file);
    } else {
      toast({
        title: "Invalid File",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
    }
  };

  const handleCreateUpload = () => {
    if (!csvFile || csvData.length === 0) {
      toast({
        title: "No Data",
        description: "Please upload a CSV file with gymnast data",
        variant: "destructive",
      });
      return;
    }

    createUploadMutation.mutate({
      gymId,
      filename: csvFile.name,
      totalRows: csvData.length,
      description: `Roster upload from ${csvFile.name}`,
    });
  };

  const handlePreviewUpload = (upload: any) => {
    setSelectedUpload(upload);
    setIsPreviewOpen(true);
  };

  const handleProcessUpload = () => {
    if (!selectedUpload || csvData.length === 0) return;
    
    setIsProcessing(true);
    processUploadMutation.mutate({
      uploadId: selectedUpload.id,
      gymnastsData: csvData,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-300"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'processing':
        return <Badge variant="outline" className="text-blue-600 border-blue-300"><Clock className="h-3 w-3 mr-1" />Processing</Badge>;
      case 'completed':
        return <Badge variant="outline" className="text-green-600 border-green-300"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'failed':
        return <Badge variant="outline" className="text-red-600 border-red-300"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const requiredFields = [
    'firstName', 'lastName', 'email', 'birthDate', 'level', 'type',
    'parentFirstName', 'parentLastName', 'parentEmail', 'parentPhone'
  ];

  const csvHeaders = csvData.length > 0 ? Object.keys(csvData[0]) : [];
  const missingFields = requiredFields.filter(field => !csvHeaders.includes(field));

  return (
    <div className="space-y-6">
      {/* Upload New Roster */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="h-5 w-5 mr-2 text-blue-500" />
            Upload Gymnast Roster
          </CardTitle>
          <CardDescription>
            Upload a CSV file with gymnast information to bulk register gymnasts for {gymName}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <FileSpreadsheet className="h-4 w-4" />
            <AlertDescription>
              CSV should include: firstName, lastName, email, birthDate, level, type, parentFirstName, parentLastName, parentEmail, parentPhone
            </AlertDescription>
          </Alert>

          <div>
            <Label htmlFor="csvFile">Select CSV File</Label>
            <Input
              id="csvFile"
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="mt-1"
            />
          </div>

          {csvFile && csvData.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">
                  {csvFile.name} - {csvData.length} rows
                </span>
              </div>

              {missingFields.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Missing required fields: {missingFields.join(', ')}. Processing may fail for incomplete records.
                  </AlertDescription>
                </Alert>
              )}

              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <p className="text-sm font-medium mb-2">Preview (first 3 rows):</p>
                <div className="text-xs font-mono space-y-1">
                  {csvData.slice(0, 3).map((row, index) => (
                    <div key={index} className="truncate">
                      {Object.entries(row).map(([key, value]) => (
                        <span key={key} className="mr-4">
                          {key}: {String(value)}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleCreateUpload}
                disabled={createUploadMutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {createUploadMutation.isPending ? "Creating Upload..." : "Create Upload Record"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Uploads */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2 text-purple-500" />
            Roster Upload History
          </CardTitle>
          <CardDescription>
            Previous roster uploads for {gymName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading upload history...</p>
          ) : uploads.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No roster uploads yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {uploads.map((upload: any) => (
                <Card key={upload.id} className="border-l-4 border-l-blue-400">
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <h4 className="font-medium">{upload.filename}</h4>
                          {getStatusBadge(upload.status)}
                        </div>
                        
                        <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                          <p>Total Rows: {upload.totalRows}</p>
                          {upload.processedRows !== null && (
                            <p>Processed: {upload.processedRows} | Errors: {upload.errorRows || 0}</p>
                          )}
                          <p>Uploaded: {format(new Date(upload.createdAt), 'MMM dd, yyyy h:mm a')}</p>
                          {upload.description && <p>Description: {upload.description}</p>}
                        </div>

                        {upload.errors && upload.errors.length > 0 && (
                          <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-sm">
                            <p className="font-medium text-red-800 dark:text-red-200">
                              Processing Errors ({upload.errors.length}):
                            </p>
                            <ul className="text-red-700 dark:text-red-300 mt-1 space-y-1">
                              {upload.errors.slice(0, 3).map((error: any, index: number) => (
                                <li key={index}>Row {error.row}: {error.error}</li>
                              ))}
                              {upload.errors.length > 3 && (
                                <li>... and {upload.errors.length - 3} more errors</li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        {upload.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => handlePreviewUpload(upload)}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                          >
                            Process
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Process Upload Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Process Roster Upload</DialogTitle>
            <DialogDescription>
              Review the gymnast data before processing. This will create gymnast accounts and send welcome emails.
            </DialogDescription>
          </DialogHeader>
          
          {selectedUpload && csvData.length > 0 && (
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Upload Summary</h4>
                <ul className="text-sm space-y-1">
                  <li>File: {selectedUpload.filename}</li>
                  <li>Total Gymnasts: {csvData.length}</li>
                  <li>Gym: {gymName}</li>
                </ul>
              </div>

              {missingFields.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Warning: Missing required fields ({missingFields.join(', ')}). Some records may fail to process.
                  </AlertDescription>
                </Alert>
              )}

              <div className="border rounded-lg">
                <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b">
                  <h4 className="font-medium">Gymnast Data Preview</h4>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-gray-100 dark:bg-gray-700">
                      <tr>
                        {csvHeaders.map(header => (
                          <th key={header} className="px-2 py-1 text-left font-medium">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {csvData.slice(0, 10).map((row, index) => (
                        <tr key={index} className="border-t">
                          {csvHeaders.map(header => (
                            <td key={header} className="px-2 py-1 truncate max-w-32">
                              {String(row[header] || '')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {csvData.length > 10 && (
                    <div className="px-4 py-2 text-sm text-gray-500 border-t">
                      ... and {csvData.length - 10} more rows
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleProcessUpload}
              disabled={isProcessing || missingFields.length > 0}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isProcessing ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Process Roster
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}