import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiRequest } from '@/lib/queryClient';

export default function AdminSetup() {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [secret, setSecret] = useState('');

  const bootstrapAdminMutation = useMutation({
    mutationFn: async (secret: string) => {
      const response = await apiRequest('POST', '/api/bootstrap-admin', { secret });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success!",
        description: data.message,
      });
      // Reload the page to refresh user data
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Admin Setup</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Please log in first to set up admin access.</p>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="w-full"
            >
              Log In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-gray-600 mb-4">
              Welcome, {user?.firstName}! To access the admin portal, enter the bootstrap secret:
            </p>
            <div className="space-y-4">
              <div>
                <Label>Bootstrap Secret</Label>
                <Input
                  type="password"
                  placeholder="Enter bootstrap secret"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Use: <code className="bg-gray-100 px-1 rounded">jgl-admin-bootstrap-2024</code>
                </p>
              </div>
              
              <Button 
                onClick={() => bootstrapAdminMutation.mutate(secret)}
                disabled={!secret || bootstrapAdminMutation.isPending}
                className="w-full"
              >
                {bootstrapAdminMutation.isPending ? 'Setting up...' : 'Become Admin'}
              </Button>
            </div>
          </div>

          {user?.role === 'admin' && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-green-800 font-medium">You already have admin access!</p>
              <Button 
                onClick={() => window.location.href = '/admin-dashboard'}
                className="mt-2 w-full"
              >
                Go to Admin Dashboard
              </Button>
            </div>
          )}

          <div className="mt-6">
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