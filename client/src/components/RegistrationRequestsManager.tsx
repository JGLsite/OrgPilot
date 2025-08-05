import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, XCircle, Clock, User, Calendar, Mail, Phone, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

interface RegistrationRequestsManagerProps {
  gymId: string;
  gymName: string;
}

export function RegistrationRequestsManager({ gymId, gymName }: RegistrationRequestsManagerProps) {
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["/api/registration-requests/gym", gymId],
  });

  const pendingRequests = requests.filter((req: any) => req.status === 'pending');
  const processedRequests = requests.filter((req: any) => req.status !== 'pending');

  const approveMutation = useMutation({
    mutationFn: async (requestId: string) => {
      return apiRequest("POST", `/api/registration-requests/${requestId}/approve`);
    },
    onSuccess: async (response) => {
      const data = await response.json();
      queryClient.invalidateQueries({ queryKey: ["/api/registration-requests/gym", gymId] });
      queryClient.invalidateQueries({ queryKey: ["/api/gymnasts"] });
      setIsApproveDialogOpen(false);
      setSelectedRequest(null);
      toast({
        title: "Registration Approved!",
        description: `${data.gymnast.firstName} ${data.gymnast.lastName} has been added to your gym and will receive a welcome email.`,
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Approval Failed",
        description: error.message || "Failed to approve registration",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ requestId, reason }: { requestId: string; reason?: string }) => {
      return apiRequest("POST", `/api/registration-requests/${requestId}/reject`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/registration-requests/gym", gymId] });
      setIsRejectDialogOpen(false);
      setSelectedRequest(null);
      setRejectReason("");
      toast({
        title: "Registration Rejected",
        description: "The applicant has been notified of the decision.",
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Rejection Failed",
        description: error.message || "Failed to reject registration",
        variant: "destructive",
      });
    },
  });

  const handleApprove = (request: any) => {
    setSelectedRequest(request);
    setIsApproveDialogOpen(true);
  };

  const handleReject = (request: any) => {
    setSelectedRequest(request);
    setIsRejectDialogOpen(true);
  };

  const confirmApprove = () => {
    if (selectedRequest) {
      approveMutation.mutate(selectedRequest.id);
    }
  };

  const confirmReject = () => {
    if (selectedRequest) {
      rejectMutation.mutate({ 
        requestId: selectedRequest.id, 
        reason: rejectReason.trim() || undefined 
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-300"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-600 border-green-300"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-600 border-red-300"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      'team': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'pre-team': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'non-team': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    };
    
    return (
      <Badge className={colors[type as keyof typeof colors] || colors['team']}>
        {type === 'pre-team' ? 'Pre-Team' : type === 'non-team' ? 'Non-Team' : 'Team'}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Registration Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading registration requests...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2 text-yellow-500" />
            Pending Requests ({pendingRequests.length})
          </CardTitle>
          <CardDescription>
            New registration requests requiring your review
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingRequests.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No pending registration requests at this time.
            </p>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request: any) => (
                <Card key={request.id} className="border-l-4 border-l-yellow-400">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold">
                            {request.firstName} {request.lastName}
                          </h3>
                          {getTypeBadge(request.type)}
                          <Badge variant="outline">Level {request.level}</Badge>
                          {getStatusBadge(request.status)}
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div className="space-y-2">
                            <div className="flex items-center text-gray-600 dark:text-gray-300">
                              <Calendar className="h-4 w-4 mr-2" />
                              Born: {format(new Date(request.birthDate), 'MMM dd, yyyy')}
                            </div>
                            {request.email && (
                              <div className="flex items-center text-gray-600 dark:text-gray-300">
                                <Mail className="h-4 w-4 mr-2" />
                                {request.email}
                              </div>
                            )}
                            {request.parentEmail && (
                              <div className="flex items-center text-gray-600 dark:text-gray-300">
                                <User className="h-4 w-4 mr-2" />
                                Parent: {request.parentFirstName} {request.parentLastName}
                              </div>
                            )}
                            {request.parentEmail && (
                              <div className="flex items-center text-gray-600 dark:text-gray-300">
                                <Mail className="h-4 w-4 mr-2" />
                                {request.parentEmail}
                              </div>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            {request.parentPhone && (
                              <div className="flex items-center text-gray-600 dark:text-gray-300">
                                <Phone className="h-4 w-4 mr-2" />
                                {request.parentPhone}
                              </div>
                            )}
                            {request.emergencyContact && (
                              <div className="flex items-center text-gray-600 dark:text-gray-300">
                                <AlertTriangle className="h-4 w-4 mr-2" />
                                Emergency: {request.emergencyContact}
                              </div>
                            )}
                            <div className="text-xs text-gray-500">
                              Submitted: {format(new Date(request.createdAt), 'MMM dd, yyyy h:mm a')}
                            </div>
                          </div>
                        </div>

                        {request.medicalInfo && (
                          <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                            <p className="text-sm">
                              <strong>Medical Info:</strong> {request.medicalInfo}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(request)}
                          disabled={approveMutation.isPending}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(request)}
                          disabled={rejectMutation.isPending}
                          className="border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Processed Requests */}
      {processedRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recently Processed ({processedRequests.length})</CardTitle>
            <CardDescription>
              Registration requests you've already reviewed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {processedRequests.slice(0, 5).map((request: any) => (
                <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="font-medium">
                      {request.firstName} {request.lastName}
                    </span>
                    {getTypeBadge(request.type)}
                    <Badge variant="outline">Level {request.level}</Badge>
                    {getStatusBadge(request.status)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {request.reviewedAt && format(new Date(request.reviewedAt), 'MMM dd, yyyy')}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Approve Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Registration</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve {selectedRequest?.firstName} {selectedRequest?.lastName}'s registration?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              This will:
            </p>
            <ul className="text-sm text-gray-600 dark:text-gray-300 mt-2 space-y-1 list-disc list-inside">
              <li>Create a gymnast account for {selectedRequest?.firstName}</li>
              <li>Send them a welcome email with login instructions</li>
              <li>Allow them to register for events and participate in challenges</li>
            </ul>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmApprove}
              disabled={approveMutation.isPending}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {approveMutation.isPending ? "Approving..." : "Approve Registration"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Registration</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject {selectedRequest?.firstName} {selectedRequest?.lastName}'s registration?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              The applicant will receive an email notification about this decision.
            </p>
            <div>
              <label className="text-sm font-medium">Reason (Optional)</label>
              <Textarea
                placeholder="Provide a reason for rejection (will be included in the email)..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmReject}
              disabled={rejectMutation.isPending}
              variant="destructive"
            >
              {rejectMutation.isPending ? "Rejecting..." : "Reject Registration"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}