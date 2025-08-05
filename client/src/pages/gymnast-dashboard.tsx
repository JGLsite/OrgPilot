import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function GymnastDashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

  // Fetch gymnast data
  const { data: challenges } = useQuery({
    queryKey: ['/api/challenges'],
    enabled: isAuthenticated,
  });

  const { data: rewards } = useQuery({
    queryKey: ['/api/rewards'],
    enabled: isAuthenticated,
  });

  const { data: events } = useQuery({
    queryKey: ['/api/events'],
    enabled: isAuthenticated,
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
    
    if (!isLoading && user && user.role !== 'gymnast') {
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
      {/* Header */}
      <div className="bg-gradient-to-r from-jgl-magenta to-jgl-pink text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Gymnast Portal</h1>
                <p className="text-pink-100">Welcome back, {user.firstName}!</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">1,250</div>
                  <div className="text-sm text-pink-100">Points</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">#3</div>
                  <div className="text-sm text-pink-100">Rank</div>
                </div>
                <Button 
                  onClick={() => window.location.href = '/api/logout'}
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-jgl-magenta"
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Current Challenge */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <i className="fas fa-trophy text-jgl-magenta mr-2"></i>
                  Current Challenge
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-r from-jgl-magenta to-jgl-pink p-6 rounded-xl text-white">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">Perfect Your Handstand</h3>
                    <Badge className="bg-white bg-opacity-20 text-white">50 pts</Badge>
                  </div>
                  <p className="mb-4 opacity-90">Hold a handstand for 30 seconds without falling</p>
                  <Progress value={70} className="h-2 mb-2" />
                  <div className="flex justify-between text-sm opacity-80">
                    <span>Progress: 70%</span>
                    <span>7/10 gymnasts completed</span>
                  </div>
                  <Button className="mt-4 bg-white text-jgl-magenta hover:bg-gray-100">
                    Log Progress
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <i className="fas fa-calendar text-jgl-teal mr-2"></i>
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-gray-900">Spring Championship Meet</h3>
                      <p className="text-sm text-gray-600">March 15, 2024 • Brooklyn, NY</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">Level 4</Badge>
                      <Button size="sm" className="bg-jgl-teal hover:bg-jgl-light-teal">
                        Register
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-gray-900">Regional Qualifier</h3>
                      <p className="text-sm text-gray-600">April 12, 2024 • Lakewood, NJ</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-green-100 text-green-800">Registered</Badge>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Scores */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <i className="fas fa-chart-bar text-blue-600 mr-2"></i>
                  Recent Scores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-5 gap-4 p-4 border border-gray-200 rounded-lg">
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Event</div>
                      <div className="font-semibold">Winter Meet</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Vault</div>
                      <div className="font-semibold">8.75</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Bars</div>
                      <div className="font-semibold">9.10</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Beam</div>
                      <div className="font-semibold">8.90</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600">All-Around</div>
                      <div className="font-semibold text-jgl-magenta">35.25</div>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full">
                    View All Scores
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Points & Rewards */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <i className="fas fa-gift text-jgl-magenta mr-2"></i>
                  Rewards Store
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-jgl-magenta">1,250</div>
                  <div className="text-sm text-gray-600">Available Points</div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <div className="font-semibold text-sm">JGL Water Bottle</div>
                      <div className="text-xs text-gray-600">500 points</div>
                    </div>
                    <Button size="sm" disabled className="text-xs">
                      Redeem
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <div className="font-semibold text-sm">JGL T-Shirt</div>
                      <div className="text-xs text-gray-600">800 points</div>
                    </div>
                    <Button size="sm" disabled className="text-xs">
                      Redeem
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <div className="font-semibold text-sm">Gym Bag</div>
                      <div className="text-xs text-gray-600">1,500 points</div>
                    </div>
                    <Button size="sm" variant="outline" className="text-xs">
                      Need 250 more
                    </Button>
                  </div>
                </div>
                
                <Button className="w-full mt-4 bg-jgl-magenta hover:bg-pink-600">
                  Visit Store
                </Button>
              </CardContent>
            </Card>

            {/* Leaderboard */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <i className="fas fa-list-ol text-jgl-teal mr-2"></i>
                  Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs font-bold">1</div>
                      <span className="font-semibold">Sarah L.</span>
                    </div>
                    <span className="text-sm text-gray-600">2,150 pts</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-bold">2</div>
                      <span className="font-semibold">Emma R.</span>
                    </div>
                    <span className="text-sm text-gray-600">1,875 pts</span>
                  </div>
                  
                  <div className="flex items-center justify-between bg-jgl-magenta bg-opacity-10 p-2 rounded">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-jgl-magenta rounded-full flex items-center justify-center text-white text-xs font-bold">3</div>
                      <span className="font-semibold text-jgl-magenta">You</span>
                    </div>
                    <span className="text-sm text-jgl-magenta font-semibold">1,250 pts</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-xs font-bold">4</div>
                      <span className="font-semibold">Maya K.</span>
                    </div>
                    <span className="text-sm text-gray-600">1,100 pts</span>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full mt-4">
                  View Full Leaderboard
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <i className="fas fa-user-edit mr-2"></i>
                    Update Profile
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <i className="fas fa-envelope mr-2"></i>
                    Messages
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <i className="fas fa-question-circle mr-2"></i>
                    Help & Support
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
