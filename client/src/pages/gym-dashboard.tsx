import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { apiRequest } from '@/lib/queryClient';
import { isUnauthorizedError } from '@/lib/authUtils';

export default function GymDashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch gym data
  const { data: profile } = useQuery({
    queryKey: ['/api/profile'],
    enabled: isAuthenticated && user?.role === 'gym_admin',
  });

  const { data: gymnasts, isLoading: gymnastLoading } = useQuery({
    queryKey: ['/api/gyms', profile?.gyms?.[0]?.id, 'gymnasts'],
    enabled: !!profile?.gyms?.[0]?.id,
  });

  const { data: events } = useQuery({
    queryKey: ['/api/events'],
    enabled: isAuthenticated,
  });

  // Mutations
  const approveGymnastMutation = useMutation({
    mutationFn: async ({ id, approved }: { id: string; approved: boolean }) => {
      await apiRequest('PATCH', `/api/gymnasts/${id}/approve`, { approved });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gyms'] });
      toast({
        title: "Gymnast Updated",
        description: "Gymnast approval status updated successfully.",
      });
    },
  });

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
    
    if (!isLoading && user && user.role !== 'gym_admin') {
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

  const currentGym = profile?.gyms?.[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Gym Dashboard</h1>
                <p className="text-gray-600">Welcome back, {user.firstName}</p>
                {currentGym && (
                  <p className="text-sm text-gray-500">{currentGym.name}</p>
                )}
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
          
          {/* Team Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-users text-jgl-teal mr-2"></i>
                Team Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Manage your gymnasts, coaches, and team roster.</p>
              <Button className="w-full bg-jgl-teal hover:bg-jgl-light-teal">
                Manage Team
              </Button>
            </CardContent>
          </Card>

          {/* Event Hosting */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-calendar-plus text-jgl-magenta mr-2"></i>
                Event Hosting
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Create and manage events hosted by your gym.</p>
              <Button className="w-full bg-jgl-magenta hover:bg-pink-600">
                Host Event
              </Button>
            </CardContent>
          </Card>

          {/* Payment & Membership */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-credit-card text-green-600 mr-2"></i>
                Membership Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">View payment history and membership details.</p>
              <Button variant="outline" className="w-full">
                View Details
              </Button>
            </CardContent>
          </Card>

          {/* Documents & Resources */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-file-alt text-blue-600 mr-2"></i>
                Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Access JGL handbook and hosting guidelines.</p>
              <Button variant="outline" className="w-full">
                View Documents
              </Button>
            </CardContent>
          </Card>

          {/* Event Registration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-clipboard-check text-orange-600 mr-2"></i>
                Event Registration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Register your gymnasts for upcoming events.</p>
              <Button variant="outline" className="w-full">
                Register for Events
              </Button>
            </CardContent>
          </Card>

          {/* Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-chart-bar text-purple-600 mr-2"></i>
                Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">View team performance and participation stats.</p>
              <Button variant="outline" className="w-full">
                View Analytics
              </Button>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
