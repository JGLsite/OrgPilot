import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiRequest } from '@/lib/queryClient';
import { isUnauthorizedError } from '@/lib/authUtils';

export default function AdminDashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const queryClient = useQueryClient();
  const [isCreateChallengeOpen, setIsCreateChallengeOpen] = useState(false);
  const [isCreateRewardOpen, setIsCreateRewardOpen] = useState(false);

  // Fetch admin data
  const { data: gyms, isLoading: gymsLoading } = useQuery({
    queryKey: ['/api/gyms'],
    enabled: isAuthenticated && user?.role === 'admin',
  });

  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ['/api/events'],
    enabled: isAuthenticated,
  });

  const { data: challenges } = useQuery({
    queryKey: ['/api/challenges'],
    enabled: isAuthenticated,
  });

  const { data: rewards } = useQuery({
    queryKey: ['/api/rewards'],
    enabled: isAuthenticated,
  });

  // Mutations
  const approveGymMutation = useMutation({
    mutationFn: async ({ id, approved }: { id: string; approved: boolean }) => {
      await apiRequest('PATCH', `/api/gyms/${id}/approve`, { approved });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gyms'] });
      toast({
        title: "Gym Updated",
        description: "Gym approval status has been updated successfully.",
      });
    },
    onError: (error) => {
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
        title: "Error",
        description: "Failed to update gym approval status.",
        variant: "destructive",
      });
    },
  });

  const approveEventMutation = useMutation({
    mutationFn: async ({ id, approved }: { id: string; approved: boolean }) => {
      await apiRequest('PATCH', `/api/events/${id}/approve`, { approved });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      toast({
        title: "Event Updated",
        description: "Event approval status has been updated successfully.",
      });
    },
    onError: (error) => {
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
        title: "Error",
        description: "Failed to update event approval status.",
        variant: "destructive",
      });
    },
  });

  const createChallengeMutation = useMutation({
    mutationFn: async (challengeData: any) => {
      await apiRequest('POST', '/api/challenges', challengeData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/challenges'] });
      setIsCreateChallengeOpen(false);
      toast({
        title: "Challenge Created",
        description: "New challenge has been created successfully.",
      });
    },
    onError: (error) => {
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
        title: "Error",
        description: "Failed to create challenge.",
        variant: "destructive",
      });
    },
  });

  const createRewardMutation = useMutation({
    mutationFn: async (rewardData: any) => {
      await apiRequest('POST', '/api/rewards', rewardData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/rewards'] });
      setIsCreateRewardOpen(false);
      toast({
        title: "Reward Created",
        description: "New reward has been added to the store.",
      });
    },
    onError: (error) => {
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
        title: "Error",
        description: "Failed to create reward.",
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
    
    if (!isLoading && user && user.role !== 'admin') {
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

  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const challengeData = {
      title: formData.get('title'),
      description: formData.get('description'),
      points: parseInt(formData.get('points') as string),
      levels: (formData.get('levels') as string).split(',').map(l => l.trim()),
      active: true,
    };

    createChallengeMutation.mutate(challengeData);
  };

  const handleCreateReward = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const rewardData = {
      name: formData.get('name'),
      description: formData.get('description'),
      pointsCost: parseInt(formData.get('pointsCost') as string),
      imageUrl: formData.get('imageUrl') || undefined,
      active: true,
    };

    createRewardMutation.mutate(rewardData);
  };

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
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-gray-300">League Administration Panel</p>
              </div>
              <Button 
                onClick={() => window.location.href = '/api/logout'}
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-gray-900"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-jgl-teal bg-opacity-10 rounded-full flex items-center justify-center">
                  <i className="fas fa-building text-jgl-teal text-xl"></i>
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{gyms?.length || 0}</div>
                  <div className="text-sm text-gray-600">Total Gyms</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-jgl-magenta bg-opacity-10 rounded-full flex items-center justify-center">
                  <i className="fas fa-calendar text-jgl-magenta text-xl"></i>
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{events?.length || 0}</div>
                  <div className="text-sm text-gray-600">Total Events</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-trophy text-blue-600 text-xl"></i>
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{challenges?.length || 0}</div>
                  <div className="text-sm text-gray-600">Active Challenges</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-gift text-green-600 text-xl"></i>
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{rewards?.length || 0}</div>
                  <div className="text-sm text-gray-600">Store Items</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="gyms" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="gyms">Gym Management</TabsTrigger>
            <TabsTrigger value="events">Event Management</TabsTrigger>
            <TabsTrigger value="challenges">Challenges</TabsTrigger>
            <TabsTrigger value="rewards">Rewards Store</TabsTrigger>
          </TabsList>

          {/* Gym Management */}
          <TabsContent value="gyms" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <i className="fas fa-building text-jgl-teal mr-2"></i>
                  Gym Approval Queue
                </CardTitle>
              </CardHeader>
              <CardContent>
                {gymsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                  </div>
                ) : gyms && gyms.length > 0 ? (
                  <div className="space-y-4">
                    {gyms.map((gym: any) => (
                      <div key={gym.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h3 className="font-semibold text-gray-900">{gym.name}</h3>
                          <p className="text-sm text-gray-600">{gym.city} • {gym.email}</p>
                          <p className="text-sm text-gray-600">Admin: {gym.adminFirstName} {gym.adminLastName}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {gym.approved ? (
                            <Badge className="bg-green-100 text-green-800">Approved</Badge>
                          ) : (
                            <Badge variant="outline">Pending</Badge>
                          )}
                          {!gym.approved && (
                            <Button
                              size="sm"
                              onClick={() => approveGymMutation.mutate({ id: gym.id, approved: true })}
                              disabled={approveGymMutation.isPending}
                              className="bg-jgl-teal hover:bg-jgl-light-teal"
                            >
                              Approve
                            </Button>
                          )}
                          {gym.approved && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => approveGymMutation.mutate({ id: gym.id, approved: false })}
                              disabled={approveGymMutation.isPending}
                            >
                              Revoke
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No gyms to review
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Event Management */}
          <TabsContent value="events" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <i className="fas fa-calendar text-jgl-magenta mr-2"></i>
                  Event Approval Queue
                </CardTitle>
              </CardHeader>
              <CardContent>
                {eventsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                  </div>
                ) : events && events.length > 0 ? (
                  <div className="space-y-4">
                    {events.map((event: any) => (
                      <div key={event.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h3 className="font-semibold text-gray-900">{event.name}</h3>
                          <p className="text-sm text-gray-600">{event.date} • {event.location}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {event.approved ? (
                            <Badge className="bg-green-100 text-green-800">Approved</Badge>
                          ) : (
                            <Badge variant="outline">Pending</Badge>
                          )}
                          {!event.approved && (
                            <Button
                              size="sm"
                              onClick={() => approveEventMutation.mutate({ id: event.id, approved: true })}
                              disabled={approveEventMutation.isPending}
                              className="bg-jgl-magenta hover:bg-pink-600"
                            >
                              Approve
                            </Button>
                          )}
                          {event.approved && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => approveEventMutation.mutate({ id: event.id, approved: false })}
                              disabled={approveEventMutation.isPending}
                            >
                              Revoke
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No events to review
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Challenges */}
          <TabsContent value="challenges" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <i className="fas fa-trophy text-blue-600 mr-2"></i>
                    Challenge Management
                  </div>
                  <Dialog open={isCreateChallengeOpen} onOpenChange={setIsCreateChallengeOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <i className="fas fa-plus mr-2"></i>
                        Create Challenge
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Challenge</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleCreateChallenge} className="space-y-4">
                        <div>
                          <Label htmlFor="title">Challenge Title</Label>
                          <Input id="title" name="title" required />
                        </div>
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea id="description" name="description" required />
                        </div>
                        <div>
                          <Label htmlFor="points">Points Reward</Label>
                          <Input type="number" id="points" name="points" required />
                        </div>
                        <div>
                          <Label htmlFor="levels">Levels (comma separated)</Label>
                          <Input id="levels" name="levels" placeholder="3,4,5" required />
                        </div>
                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                          Create Challenge
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {challenges && challenges.length > 0 ? (
                  <div className="space-y-4">
                    {challenges.map((challenge: any) => (
                      <div key={challenge.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h3 className="font-semibold text-gray-900">{challenge.title}</h3>
                          <p className="text-sm text-gray-600">{challenge.description}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant="outline">{challenge.points} points</Badge>
                            {challenge.isCoachChallenge && (
                              <Badge className="bg-blue-100 text-blue-800">Coach Challenge</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {challenge.active ? (
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                          ) : (
                            <Badge variant="outline">Inactive</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No challenges created yet
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rewards Store */}
          <TabsContent value="rewards" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <i className="fas fa-gift text-green-600 mr-2"></i>
                    Rewards Store Management
                  </div>
                  <Dialog open={isCreateRewardOpen} onOpenChange={setIsCreateRewardOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-green-600 hover:bg-green-700">
                        <i className="fas fa-plus mr-2"></i>
                        Add Reward
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Reward</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleCreateReward} className="space-y-4">
                        <div>
                          <Label htmlFor="name">Reward Name</Label>
                          <Input id="name" name="name" required />
                        </div>
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea id="description" name="description" />
                        </div>
                        <div>
                          <Label htmlFor="pointsCost">Points Cost</Label>
                          <Input type="number" id="pointsCost" name="pointsCost" required />
                        </div>
                        <div>
                          <Label htmlFor="imageUrl">Image URL (optional)</Label>
                          <Input type="url" id="imageUrl" name="imageUrl" />
                        </div>
                        <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                          Add Reward
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {rewards && rewards.length > 0 ? (
                  <div className="space-y-4">
                    {rewards.map((reward: any) => (
                      <div key={reward.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h3 className="font-semibold text-gray-900">{reward.name}</h3>
                          <p className="text-sm text-gray-600">{reward.description}</p>
                          <Badge variant="outline" className="mt-2">{reward.pointsCost} points</Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          {reward.active ? (
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                          ) : (
                            <Badge variant="outline">Inactive</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No rewards in store yet
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
