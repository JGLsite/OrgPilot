import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';

export default function DemoLogin() {
  const { toast } = useToast();

  const demoLoginMutation = useMutation({
    mutationFn: async (role: string) => {
      const response = await apiRequest('POST', '/api/demo-login', { role });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Demo Login Successful!",
        description: `Logged in as ${data.user.firstName} ${data.user.lastName} (${data.user.role})`,
      });
      
      // Redirect based on role
      setTimeout(() => {
        switch (data.user.role) {
          case 'admin':
            window.location.href = '/admin-dashboard';
            break;
          case 'gym_admin':
            window.location.href = '/gym-dashboard';
            break;
          case 'coach':
            window.location.href = '/coach-dashboard';
            break;
          case 'gymnast':
            window.location.href = '/gymnast-dashboard';
            break;
          default:
            window.location.href = '/';
        }
      }, 1000);
    },
    onError: (error: Error) => {
      toast({
        title: "Demo Login Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">JGL Demo Login</CardTitle>
          <p className="text-center text-gray-600">Choose a role to test the platform</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <Button 
              onClick={() => demoLoginMutation.mutate('admin')}
              disabled={demoLoginMutation.isPending}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              <i className="fas fa-crown mr-2"></i>
              League Admin
            </Button>
            
            <Button 
              onClick={() => demoLoginMutation.mutate('gym_admin')}
              disabled={demoLoginMutation.isPending}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <i className="fas fa-building mr-2"></i>
              Gym Admin
            </Button>
            
            <Button 
              onClick={() => demoLoginMutation.mutate('coach')}
              disabled={demoLoginMutation.isPending}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <i className="fas fa-whistle mr-2"></i>
              Coach
            </Button>
            
            <Button 
              onClick={() => demoLoginMutation.mutate('gymnast')}
              disabled={demoLoginMutation.isPending}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              <i className="fas fa-medal mr-2"></i>
              Gymnast Portal
            </Button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">Demo Features:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Full role-based dashboard access</li>
              <li>• Gym registration and approval workflow</li>
              <li>• Event management system</li>
              <li>• Challenge and rewards system</li>
              <li>• Real-time analytics and reporting</li>
            </ul>
          </div>

          <div className="text-center">
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/'}
              className="w-full"
            >
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}