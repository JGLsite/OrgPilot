import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function CoachDashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
    
    if (!isLoading && user && user.role !== 'coach') {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, user, toast]);

  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Coach Dashboard</h1>
                <p className="text-gray-600">Welcome back, Coach {user.firstName}</p>
              </div>
              <Button 
                onClick={() => window.location.href = '/api/logout'}
                variant="outline"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Gymnast Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-users text-jgl-teal mr-2"></i>
                My Gymnasts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">View and manage your team roster and gymnast details.</p>
              <Button className="w-full bg-jgl-teal hover:bg-jgl-light-teal">
                Manage Gymnasts
              </Button>
            </CardContent>
          </Card>

          {/* Approval Center */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-clipboard-check text-jgl-magenta mr-2"></i>
                Pending Approvals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Review and approve gymnast registrations and event sign-ups.</p>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-500">3 pending approvals</span>
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">Action Required</span>
              </div>
              <Button className="w-full bg-jgl-magenta hover:bg-pink-600">
                Review Approvals
              </Button>
            </CardContent>
          </Card>

          {/* Event Oversight */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-calendar text-blue-600 mr-2"></i>
                Event Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Monitor event registrations and team participation.</p>
              <Button variant="outline" className="w-full">
                View Events
              </Button>
            </CardContent>
          </Card>

          {/* Progress Tracking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-chart-line text-green-600 mr-2"></i>
                Progress Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Track gymnast scores, level progressions, and achievements.</p>
              <Button variant="outline" className="w-full">
                View Progress
              </Button>
            </CardContent>
          </Card>

          {/* Challenges */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-trophy text-orange-600 mr-2"></i>
                Team Challenges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Create challenges and view team participation in gamified activities.</p>
              <Button variant="outline" className="w-full">
                Manage Challenges
              </Button>
            </CardContent>
          </Card>

          {/* Communication */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-envelope text-purple-600 mr-2"></i>
                Communications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Send messages to gymnasts and their families.</p>
              <Button variant="outline" className="w-full">
                Send Messages
              </Button>
            </CardContent>
          </Card>

        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="flex items-center justify-center">
                  <i className="fas fa-plus mr-2"></i>
                  Add Gymnast
                </Button>
                <Button variant="outline" className="flex items-center justify-center">
                  <i className="fas fa-upload mr-2"></i>
                  Upload Roster
                </Button>
                <Button variant="outline" className="flex items-center justify-center">
                  <i className="fas fa-download mr-2"></i>
                  Export Reports
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
