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
import { Progress } from '@/components/ui/progress';
import { apiRequest } from '@/lib/queryClient';
import { isUnauthorizedError } from '@/lib/authUtils';

export default function GymnastDashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch gymnast data
  const { data: profile } = useQuery({
    queryKey: ['/api/profile'],
    enabled: isAuthenticated && user?.role === 'gymnast',
  });

  const { data: challenges } = useQuery({
    queryKey: ['/api/challenges', profile?.gymnast?.level],
    enabled: !!profile?.gymnast?.level,
  });

  const { data: events } = useQuery({
    queryKey: ['/api/events'],
    enabled: isAuthenticated,
  });

  const { data: leaderboard } = useQuery({
    queryKey: ['/api/leaderboard', 'individual', profile?.gymnast?.level],
    enabled: !!profile?.gymnast?.level,
  });

  const { data: rewards } = useQuery({
    queryKey: ['/api/rewards'],
    enabled: isAuthenticated,
  });

  // Mutations
  const registerForEventMutation = useMutation({
    mutationFn: async ({ eventId, sessionIds }: { eventId: string; sessionIds: string[] }) => {
      await apiRequest('POST', `/api/events/${eventId}/register`, {
        gymnastId: profile?.gymnast?.id,
        sessionIds,
      });
    },
    onSuccess: () => {
      toast({
        title: "Registration Successful",
        description: "You have been registered for the event.",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
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

  const gymnast = profile?.gymnast;
  const myRank = leaderboard?.findIndex((g: any) => g.id === gymnast?.id) + 1 || 0;
  const availableChallenges = challenges?.filter((c: any) => c.active && c.targetLevel === gymnast?.level) || [];
  const upcomingEvents = events?.filter((e: any) => e.approved && new Date(e.startDate) > new Date()) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Gymnast Portal</h1>
                <p className="text-gray-600">Welcome, {gymnast?.firstName} {gymnast?.lastName}!</p>
                {gymnast && (
                  <p className="text-sm text-gray-500">Level {gymnast.level} • {gymnast.points} Points</p>
                )}
              </div>
              <Button 
                onClick={() => window.location.href = '/api/logout'}
                variant="outline"
              >
                <i className="fas fa-sign-out-alt mr-2"></i>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Status */}
        {gymnast && (
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>My Profile</span>
                  <div className="flex space-x-2">
                    <Badge variant={gymnast.approved ? "default" : "secondary"}>
                      {gymnast.approved ? "Approved" : "Pending Coach Approval"}
                    </Badge>
                    {myRank > 0 && (
                      <Badge variant="outline">
                        Rank #{myRank}
                      </Badge>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-jgl-teal rounded-full flex items-center justify-center mx-auto mb-2">
                      <i className="fas fa-user text-2xl text-white"></i>
                    </div>
                    <h3 className="font-semibold">Level {gymnast.level}</h3>
                    <p className="text-sm text-gray-600">Current Level</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-jgl-magenta rounded-full flex items-center justify-center mx-auto mb-2">
                      <i className="fas fa-star text-2xl text-white"></i>
                    </div>
                    <h3 className="font-semibold">{gymnast.points}</h3>
                    <p className="text-sm text-gray-600">Total Points</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <i className="fas fa-trophy text-2xl text-white"></i>
                    </div>
                    <h3 className="font-semibold">#{myRank || '--'}</h3>
                    <p className="text-sm text-gray-600">League Rank</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <i className="fas fa-calendar text-2xl text-white"></i>
                    </div>
                    <h3 className="font-semibold">{upcomingEvents.length}</h3>
                    <p className="text-sm text-gray-600">Available Events</p>
                  </div>
                </div>

                {!gymnast.approved && (
                  <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center">
                      <i className="fas fa-clock text-yellow-600 mr-2"></i>
                      <div>
                        <h4 className="font-semibold text-yellow-900">Waiting for Coach Approval</h4>
                        <p className="text-yellow-700 text-sm">
                          Your registration is pending approval from your coach. You'll be able to participate in events and challenges once approved.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="challenges" className="space-y-6">
          <TabsList>
            <TabsTrigger value="challenges">Challenges</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="rewards">Rewards</TabsTrigger>
          </TabsList>

          <TabsContent value="challenges">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Active Challenges */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <i className="fas fa-star mr-2 text-yellow-500"></i>
                    Level {gymnast?.level} Challenges
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {gymnast?.approved ? (
                    availableChallenges.length > 0 ? (
                      <div className="space-y-4">
                        {availableChallenges.map((challenge: any) => (
                          <div key={challenge.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold">{challenge.name}</h4>
                              <Badge>{challenge.pointReward} points</Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{challenge.description}</p>
                            <div className="flex items-center justify-between">
                              <div className="text-sm text-gray-500">
                                <i className="fas fa-trophy mr-1"></i>
                                Reward: {challenge.pointReward} points
                              </div>
                              <Button size="sm" variant="outline">
                                Mark Complete
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <i className="fas fa-star text-4xl mb-4"></i>
                        <p>No challenges available for your level yet.</p>
                      </div>
                    )
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <i className="fas fa-lock text-4xl mb-4"></i>
                      <p>Challenges will be available after coach approval.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Progress Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <i className="fas fa-chart-line mr-2 text-jgl-teal"></i>
                    My Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Points to Next Level</span>
                        <span className="text-sm text-gray-600">{gymnast?.points || 0} / 1000</span>
                      </div>
                      <Progress value={((gymnast?.points || 0) / 1000) * 100} className="h-2" />
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Recent Achievements</h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3 p-2 bg-green-50 rounded">
                          <i className="fas fa-medal text-green-600"></i>
                          <span className="text-sm">Perfect Vault Challenge (+50 points)</span>
                        </div>
                        <div className="flex items-center space-x-3 p-2 bg-blue-50 rounded">
                          <i className="fas fa-star text-blue-600"></i>
                          <span className="text-sm">Beam Routine Mastery (+75 points)</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Next Goals</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Complete 3 more challenges</li>
                        <li>• Participate in upcoming meet</li>
                        <li>• Earn 200 more points</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="events">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <i className="fas fa-calendar mr-2 text-jgl-magenta"></i>
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                {gymnast?.approved ? (
                  upcomingEvents.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingEvents.map((event: any) => (
                        <div key={event.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{event.name}</h4>
                            <Badge variant="outline">{event.type}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{event.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="text-sm">
                              <p><i className="fas fa-calendar mr-1"></i> {new Date(event.startDate).toLocaleDateString()}</p>
                              <p><i className="fas fa-map-marker-alt mr-1"></i> {event.location}</p>
                              <p><i className="fas fa-dollar-sign mr-1"></i> ${event.registrationFee}</p>
                            </div>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button>Register</Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Register for {event.name}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label>Registration Fee</Label>
                                    <p className="text-2xl font-bold">${event.registrationFee}</p>
                                  </div>
                                  <div>
                                    <Label>Sessions (select all that apply)</Label>
                                    <div className="space-y-2 mt-2">
                                      <label className="flex items-center space-x-2">
                                        <input type="checkbox" />
                                        <span>Morning Session (9:00 AM - 12:00 PM)</span>
                                      </label>
                                      <label className="flex items-center space-x-2">
                                        <input type="checkbox" />
                                        <span>Afternoon Session (1:00 PM - 4:00 PM)</span>
                                      </label>
                                    </div>
                                  </div>
                                  <Button 
                                    className="w-full"
                                    onClick={() => registerForEventMutation.mutate({ 
                                      eventId: event.id, 
                                      sessionIds: ['morning', 'afternoon'] 
                                    })}
                                  >
                                    Complete Registration ($100)
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <i className="fas fa-calendar text-4xl mb-4"></i>
                      <p>No upcoming events available.</p>
                    </div>
                  )
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <i className="fas fa-lock text-4xl mb-4"></i>
                    <p>Event registration will be available after coach approval.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leaderboard">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <i className="fas fa-trophy mr-2 text-yellow-500"></i>
                  Level {gymnast?.level} Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                {leaderboard && leaderboard.length > 0 ? (
                  <div className="space-y-3">
                    {leaderboard.slice(0, 10).map((leaderGymnast: any, index: number) => (
                      <div 
                        key={leaderGymnast.id} 
                        className={`flex items-center space-x-4 p-3 rounded-lg border ${
                          leaderGymnast.id === gymnast?.id ? 'bg-jgl-teal/10 border-jgl-teal' : ''
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                          index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-gray-300'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-medium ${leaderGymnast.id === gymnast?.id ? 'text-jgl-teal' : ''}`}>
                            {leaderGymnast.firstName} {leaderGymnast.lastName}
                            {leaderGymnast.id === gymnast?.id && <span className="ml-2 text-sm">(You)</span>}
                          </h4>
                          <p className="text-sm text-gray-600">Level {leaderGymnast.level}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">{leaderGymnast.points}</p>
                          <p className="text-sm text-gray-600">points</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <i className="fas fa-trophy text-4xl mb-4"></i>
                    <p>Leaderboard will be available soon.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rewards">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span><i className="fas fa-gift mr-2 text-jgl-magenta"></i> Rewards Store</span>
                  <div className="text-sm text-gray-600">
                    Available Points: <span className="font-bold text-jgl-teal">{gymnast?.points || 0}</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {rewards && rewards.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {rewards.map((reward: any) => (
                      <div key={reward.id} className="border rounded-lg p-4">
                        <div className="text-center mb-3">
                          <i className="fas fa-gift text-3xl text-jgl-magenta mb-2"></i>
                          <h4 className="font-semibold">{reward.name}</h4>
                          <p className="text-sm text-gray-600">{reward.description}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-lg font-bold text-jgl-teal">
                            {reward.pointsCost} points
                          </div>
                          <Button 
                            size="sm"
                            disabled={(gymnast?.points || 0) < reward.pointsCost}
                            variant={((gymnast?.points || 0) >= reward.pointsCost) ? "default" : "outline"}
                          >
                            {((gymnast?.points || 0) >= reward.pointsCost) ? "Redeem" : "Need More Points"}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <i className="fas fa-gift text-4xl mb-4"></i>
                    <p>Rewards coming soon!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}