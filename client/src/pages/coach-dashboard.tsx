import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { apiRequest } from '@/lib/queryClient';
import { isUnauthorizedError } from '@/lib/authUtils';
import { RegistrationRequestsManager } from '@/components/RegistrationRequestsManager';
import { RosterUploader } from '@/components/RosterUploader';

export default function CoachDashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth() as any;
  const queryClient = useQueryClient();
  const [editingGymnast, setEditingGymnast] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', level: '' });
  const [challengeDialogOpen, setChallengeDialogOpen] = useState(false);
  const [challengeForm, setChallengeForm] = useState({ title: '', level: '', points: '', description: '' });

  // Fetch coach data
  const { data: profile } = useQuery<any>({
    queryKey: ['/api/profile'],
    enabled: isAuthenticated && user?.role === 'coach',
  });

  const { data: gymnasts } = useQuery<any>({
    queryKey: ['/api/gyms', profile?.gyms?.[0]?.id, 'gymnasts'],
    enabled: !!profile?.gyms?.[0]?.id,
  });

  const { data: challenges } = useQuery<any>({
    queryKey: ['/api/challenges'],
    enabled: isAuthenticated,
  });

  const { data: leaderboard } = useQuery<any>({
    queryKey: ['/api/leaderboard', 'individual'],
    enabled: isAuthenticated,
  });

  const { data: events } = useQuery<any>({
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
        title: "Error",
        description: error.message,
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
      toast({
        title: "Challenge Created",
        description: "New challenge has been created successfully.",
      });
      setChallengeDialogOpen(false);
      setChallengeForm({ title: '', level: '', points: '', description: '' });
    },
  });

  const updateGymnastMutation = useMutation({
    mutationFn: async ({ id, data }: any) => {
      await apiRequest('PATCH', `/api/gymnasts/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gyms'] });
      toast({
        title: "Gymnast Updated",
        description: "Gymnast details updated successfully.",
      });
      setEditingGymnast(null);
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
        title: "Error",
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

  const currentGym = profile?.gyms?.[0];
  const approvedGymnasts = gymnasts?.filter((g: any) => g.approved) || [];
  const pendingGymnasts = gymnasts?.filter((g: any) => !g.approved) || [];
  const upcomingEvents = events?.filter((e: any) => new Date(e.date) > new Date()) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Coach Dashboard</h1>
                <p className="text-gray-600">Welcome back, Coach {user.firstName}</p>
                {currentGym && (
                  <p className="text-sm text-gray-500">{currentGym.name}</p>
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
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-jgl-teal rounded-full flex items-center justify-center mr-3">
                  <i className="fas fa-users text-white"></i>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Gymnasts</p>
                  <p className="text-2xl font-bold">{gymnasts?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-jgl-magenta rounded-full flex items-center justify-center mr-3">
                  <i className="fas fa-user-check text-white"></i>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold">{approvedGymnasts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center mr-3">
                  <i className="fas fa-clock text-white"></i>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold">{pendingGymnasts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-3">
                  <i className="fas fa-trophy text-white"></i>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Challenges</p>
                  <p className="text-2xl font-bold">{challenges?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="gymnasts" className="space-y-6">
          <TabsList>
            <TabsTrigger value="gymnasts">Gymnasts</TabsTrigger>
            <TabsTrigger value="registrations">Registration Requests</TabsTrigger>
            <TabsTrigger value="roster">Roster Upload</TabsTrigger>
            <TabsTrigger value="challenges">Challenges</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="gymnasts">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pending Approvals */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <i className="fas fa-user-clock mr-2 text-yellow-500"></i>
                    Pending Approvals ({pendingGymnasts.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {pendingGymnasts.length > 0 ? (
                    <div className="space-y-3">
                      {pendingGymnasts.map((gymnast: any) => (
                        <div key={gymnast.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{gymnast.firstName} {gymnast.lastName}</h4>
                            <p className="text-sm text-gray-600">Level {gymnast.level}</p>
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              size="sm"
                              onClick={() => approveGymnastMutation.mutate({ id: gymnast.id, approved: true })}
                              disabled={approveGymnastMutation.isPending}
                            >
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => approveGymnastMutation.mutate({ id: gymnast.id, approved: false })}
                            >
                              Deny
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <i className="fas fa-check-circle text-4xl mb-2"></i>
                      <p>No pending approvals</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Approved Gymnasts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <i className="fas fa-users mr-2 text-jgl-teal"></i>
                    Active Gymnasts ({approvedGymnasts.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {approvedGymnasts.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {approvedGymnasts.map((gymnast: any) => (
                        <div key={gymnast.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-jgl-teal rounded-full flex items-center justify-center">
                              <i className="fas fa-user text-white text-sm"></i>
                            </div>
                            <div>
                              <h4 className="font-medium">{gymnast.firstName} {gymnast.lastName}</h4>
                              <p className="text-sm text-gray-600">Level {gymnast.level} • {gymnast.points} points</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="default">Active</Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingGymnast(gymnast);
                                setEditForm({
                                  firstName: gymnast.firstName,
                                  lastName: gymnast.lastName,
                                  level: gymnast.level,
                                });
                              }}
                            >
                              Edit
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <i className="fas fa-users text-4xl mb-2"></i>
                      <p>No active gymnasts yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="registrations">
            {currentGym && (
              <RegistrationRequestsManager 
                gymId={currentGym.id} 
                gymName={currentGym.name} 
              />
            )}
          </TabsContent>

          <TabsContent value="roster">
            {currentGym && (
              <RosterUploader 
                gymId={currentGym.id} 
                gymName={currentGym.name} 
              />
            )}
          </TabsContent>

          <TabsContent value="challenges">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Skill Challenges</span>
                  <Dialog open={challengeDialogOpen} onOpenChange={setChallengeDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <i className="fas fa-plus mr-2"></i>
                        Create Challenge
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Create New Challenge</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Challenge Name</Label>
                          <Input
                            value={challengeForm.title}
                            onChange={(e) => setChallengeForm({ ...challengeForm, title: e.target.value })}
                            placeholder="Perfect Back Handspring"
                          />
                        </div>
                        <div>
                          <Label>Target Level</Label>
                          <Select
                            value={challengeForm.level}
                            onValueChange={(value) => setChallengeForm({ ...challengeForm, level: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="3">Level 3</SelectItem>
                              <SelectItem value="4">Level 4</SelectItem>
                              <SelectItem value="5">Level 5</SelectItem>
                              <SelectItem value="6">Level 6</SelectItem>
                              <SelectItem value="7">Level 7</SelectItem>
                              <SelectItem value="8">Level 8</SelectItem>
                              <SelectItem value="9">Level 9</SelectItem>
                              <SelectItem value="10">Level 10</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Point Reward</Label>
                          <Input
                            type="number"
                            value={challengeForm.points}
                            onChange={(e) => setChallengeForm({ ...challengeForm, points: e.target.value })}
                            placeholder="50"
                          />
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Textarea
                            value={challengeForm.description}
                            onChange={(e) => setChallengeForm({ ...challengeForm, description: e.target.value })}
                            placeholder="Complete 5 consecutive back handsprings with perfect form..."
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setChallengeDialogOpen(false)}>Cancel</Button>
                        <Button
                          onClick={() =>
                            createChallengeMutation.mutate({
                              title: challengeForm.title,
                              description: challengeForm.description,
                              points: parseInt(challengeForm.points),
                              levels: challengeForm.level ? [challengeForm.level] : [],
                              fromGymId: currentGym?.id,
                            })
                          }
                          disabled={createChallengeMutation.isPending}
                        >
                          Create Challenge
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {challenges && challenges.length > 0 ? (
                  <div className="space-y-4">
                    {challenges.map((challenge: any) => (
                      <div key={challenge.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{challenge.title}</h4>
                          <div className="flex items-center space-x-2">
                            {challenge.levels && challenge.levels.length > 0 && (
                              <Badge variant="outline">Level {challenge.levels.join(', ')}</Badge>
                            )}
                            <Badge>{challenge.points} points</Badge>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{challenge.description}</p>
                        {challenge.isCoachChallenge && (
                          <div className="mt-2">
                            <Badge variant="secondary">Your Challenge</Badge>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <i className="fas fa-star text-4xl mb-4"></i>
                    <p>No challenges created yet.</p>
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
                  Gymnast Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                {leaderboard && leaderboard.length > 0 ? (
                  <div className="space-y-3">
                    {leaderboard.slice(0, 10).map((gymnast: any, index: number) => (
                      <div key={gymnast.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                          index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-gray-300'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{gymnast.firstName} {gymnast.lastName}</h4>
                          <p className="text-sm text-gray-600">Level {gymnast.level}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">{gymnast.points}</p>
                          <p className="text-sm text-gray-600">points</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <i className="fas fa-trophy text-4xl mb-4"></i>
                    <p>No leaderboard data available yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="events">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <i className="fas fa-calendar-alt mr-2 text-jgl-teal"></i>
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingEvents.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingEvents.map((event: any) => (
                      <div key={event.id} className="p-3 border rounded-lg">
                        <h4 className="font-semibold">{event.name}</h4>
                        <p className="text-sm text-gray-600">{new Date(event.date).toLocaleDateString()} • {event.location}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <i className="fas fa-calendar-times text-4xl mb-4"></i>
                    <p>No upcoming events</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Progress Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <i className="fas fa-chart-line text-4xl mb-4"></i>
                  <p>Progress tracking and reporting features coming soon.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={!!editingGymnast} onOpenChange={(open) => { if (!open) setEditingGymnast(null); }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Gymnast</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>First Name</Label>
                <Input
                  value={editForm.firstName}
                  onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input
                  value={editForm.lastName}
                  onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                />
              </div>
              <div>
                <Label>Level</Label>
                <Select value={editForm.level} onValueChange={(value) => setEditForm({ ...editForm, level: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {['3','4','5','6','7','8','9','10'].map(level => (
                      <SelectItem key={level} value={level}>Level {level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingGymnast(null)}>Cancel</Button>
              <Button
                onClick={() => updateGymnastMutation.mutate({ id: editingGymnast.id, data: editForm })}
                disabled={updateGymnastMutation.isPending}
              >
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}