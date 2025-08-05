import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiRequest } from '@/lib/queryClient';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState("dashboard");

  // Stats queries with proper typing
  const { data: gyms = [] } = useQuery<any[]>({
    queryKey: ['/api/gyms'],
    retry: false,
  });

  const { data: events = [] } = useQuery<any[]>({
    queryKey: ['/api/events'],
    retry: false,
  });

  const { data: users = [] } = useQuery<any[]>({
    queryKey: ['/api/users'],
    retry: false,
  });

  const { data: gymnasts = [] } = useQuery<any[]>({
    queryKey: ['/api/gymnasts'],
    retry: false,
  });

  const { data: emailTemplates = [] } = useQuery<any[]>({
    queryKey: ['/api/email-templates'],
    retry: false,
  });

  const { data: emailHistory = [] } = useQuery<any[]>({
    queryKey: ['/api/emails/history'],
    retry: false,
  });

  const { data: revenue = { total: 28450, growth: 12 } } = useQuery({
    queryKey: ['/api/revenue'],
    retry: false,
  });

  // Calculate stats
  const totalGyms = gyms.length;
  const activeGymnasts = users.filter(u => u.role === 'gymnast').length;
  const upcomingEvents = events.filter(e => new Date(e.date) > new Date()).length;
  const pendingGyms = gyms.filter(g => g.status === 'pending').length;

  // Sidebar Component
  const Sidebar = () => (
    <div className="w-64 bg-white shadow-lg h-screen flex flex-col">
      <div className="p-6 border-b">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">JGL</span>
          </div>
          <div>
            <h1 className="font-bold text-lg">JGL Platform</h1>
            <p className="text-sm text-gray-500">League Admin</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <div className="space-y-2">
          <SidebarItem 
            icon="📊" 
            label="Dashboard" 
            active={selectedTab === "dashboard"}
            onClick={() => setSelectedTab("dashboard")}
          />
          <SidebarItem 
            icon="🏢" 
            label="Gym Management" 
            active={selectedTab === "gyms"}
            onClick={() => setSelectedTab("gyms")}
          />
          <SidebarItem 
            icon="👥" 
            label="Members" 
            active={selectedTab === "members"}
            onClick={() => setSelectedTab("members")}
          />
          <SidebarItem 
            icon="🤸" 
            label="Gymnasts" 
            active={selectedTab === "gymnasts"}
            onClick={() => setSelectedTab("gymnasts")}
          />
          <SidebarItem 
            icon="✉️" 
            label="Email System" 
            active={selectedTab === "emails"}
            onClick={() => setSelectedTab("emails")}
          />
          <SidebarItem 
            icon="📅" 
            label="Events" 
            active={selectedTab === "events"}
            onClick={() => setSelectedTab("events")}
          />
          <SidebarItem 
            icon="🏆" 
            label="Scores" 
            active={selectedTab === "scores"}
            onClick={() => setSelectedTab("scores")}
          />
          <SidebarItem 
            icon="🎯" 
            label="Challenges" 
            active={selectedTab === "challenges"}
            onClick={() => setSelectedTab("challenges")}
          />
          <SidebarItem 
            icon="🎁" 
            label="Rewards Store" 
            active={selectedTab === "rewards"}
            onClick={() => setSelectedTab("rewards")}
          />
          <SidebarItem 
            icon="💬" 
            label="Communications" 
            active={selectedTab === "communications"}
            onClick={() => setSelectedTab("communications")}
          />
          <SidebarItem 
            icon="📈" 
            label="Reports" 
            active={selectedTab === "reports"}
            onClick={() => setSelectedTab("reports")}
          />
          <SidebarItem 
            icon="⚙️" 
            label="Settings" 
            active={selectedTab === "settings"}
            onClick={() => setSelectedTab("settings")}
          />
        </div>
      </nav>

      <div className="p-4 border-t">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium">LA</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-gray-500">admin@jgl.com</p>
          </div>
        </div>
      </div>
    </div>
  );

  const SidebarItem = ({ icon, label, active, onClick }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
        active 
          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
          : 'text-gray-700 hover:bg-gray-50'
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  );

  // Main Dashboard Content
  const DashboardContent = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, League!</h1>
        <p className="text-gray-600">Here's what's happening in your JGL dashboard today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Gyms"
          value={totalGyms.toString()}
          change="+2 this month"
          icon="🏢"
          color="blue"
        />
        <StatsCard
          title="Active Gymnasts"
          value={activeGymnasts.toString()}
          change="+18 this month"
          icon="🤸"
          color="green"
        />
        <StatsCard
          title="Upcoming Events"
          value={upcomingEvents.toString()}
          change=""
          icon="📅"
          color="purple"
        />
        <StatsCard
          title="Total Revenue"
          value={`$${revenue.total.toLocaleString()}`}
          change={`+${revenue.growth}% vs last month`}
          icon="💰"
          color="yellow"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ActivityItem
              icon="✅"
              title="New gym approved"
              subtitle="Olympic Dreams Gym - Chicago"
              time="2 hours ago"
              color="green"
            />
            <ActivityItem
              icon="📅"
              title="Event registration opened"
              subtitle="Spring Classic 2024"
              time="5 hours ago"
              color="blue"
            />
            <ActivityItem
              icon="⏳"
              title="Gym membership payment pending"
              subtitle="Elite Gymnastics Academy"
              time="1 day ago"
              color="yellow"
            />
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setSelectedTab("gyms")}
            >
              👥 Review Pending Gyms
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setSelectedTab("events")}
            >
              📅 Create New Event
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setSelectedTab("scores")}
            >
              🏆 Upload Scores
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setSelectedTab("communications")}
            >
              💬 Send Notification
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const StatsCard = ({ title, value, change, icon, color }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {change && (
              <p className="text-sm text-green-600 font-medium">{change}</p>
            )}
          </div>
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-${color}-100`}>
            <span className="text-2xl">{icon}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ActivityItem = ({ icon, title, subtitle, time, color }) => (
    <div className="flex items-start space-x-3">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-${color}-100 flex-shrink-0`}>
        <span className="text-sm">{icon}</span>
      </div>
      <div className="flex-1">
        <p className="font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-600">{subtitle}</p>
      </div>
      <span className="text-xs text-gray-500">{time}</span>
    </div>
  );

  // Communications Tab
  const CommunicationsContent = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Communications</h2>
        <p className="text-gray-600">Send notifications and manage automated reminders</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Send Notification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Recipients</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="coaches">All Coaches</SelectItem>
                  <SelectItem value="gymnasts">All Gymnasts</SelectItem>
                  <SelectItem value="gym_admins">Gym Admins</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Subject</Label>
              <Input placeholder="Notification subject" />
            </div>
            <div>
              <Label>Message</Label>
              <Textarea placeholder="Your message..." rows={4} />
            </div>
            <Button className="w-full">Send Notification</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Automated Reminders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium">Registration Opening</p>
                  <p className="text-sm text-gray-600">Reminds coaches 7 days before</p>
                </div>
                <Badge variant="secondary">Active</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium">Registration Closing</p>
                  <p className="text-sm text-gray-600">Reminds coaches 3 days before</p>
                </div>
                <Badge variant="secondary">Active</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div>
                  <p className="font-medium">Challenge Completion</p>
                  <p className="text-sm text-gray-600">Weekly reminder to gymnasts</p>
                </div>
                <Badge variant="secondary">Active</Badge>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              + Add New Reminder
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Reports Tab
  const ReportsContent = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
        <p className="text-gray-600">Export data and view detailed analytics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Data Export</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              📊 Export Membership Data
            </Button>
            <Button variant="outline" className="w-full justify-start">
              🎫 Export Registration Data
            </Button>
            <Button variant="outline" className="w-full justify-start">
              💰 Export Financial Reports
            </Button>
            <Button variant="outline" className="w-full justify-start">
              📈 Export Engagement Analytics
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Total Members</span>
              <span className="font-bold">{users.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Active Gyms</span>
              <span className="font-bold">{gyms.filter(g => g.status === 'approved').length}</span>
            </div>
            <div className="flex justify-between">
              <span>Events This Month</span>
              <span className="font-bold">{events.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Revenue This Month</span>
              <span className="font-bold">${revenue.total.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Database</span>
                <Badge className="bg-green-100 text-green-800">Healthy</Badge>
              </div>
              <div className="flex justify-between">
                <span>Email Service</span>
                <Badge className="bg-green-100 text-green-800">Operational</Badge>
              </div>
              <div className="flex justify-between">
                <span>Payment Processing</span>
                <Badge className="bg-green-100 text-green-800">Online</Badge>
              </div>
              <div className="flex justify-between">
                <span>Storage</span>
                <Badge className="bg-yellow-100 text-yellow-800">85% Used</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Settings Tab
  const SettingsContent = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
        <p className="text-gray-600">Configure platform-wide settings and permissions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Registration Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Gym Registration Open</span>
              <Button variant="outline" size="sm">Toggle</Button>
            </div>
            <div className="flex items-center justify-between">
              <span>Event Registration Open</span>
              <Button variant="outline" size="sm">Toggle</Button>
            </div>
            <div className="flex items-center justify-between">
              <span>Auto-approve Gyms</span>
              <Button variant="outline" size="sm">Disabled</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Gym Membership Fee</Label>
              <Input value="$150.00" />
            </div>
            <div>
              <Label>Event Registration Fee</Label>
              <Input value="$100.00" />
            </div>
            <div>
              <Label>Late Registration Fee</Label>
              <Input value="$25.00" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notification Templates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              ✉️ Edit Welcome Email
            </Button>
            <Button variant="outline" className="w-full justify-start">
              📅 Edit Event Reminder
            </Button>
            <Button variant="outline" className="w-full justify-start">
              🏆 Edit Challenge Notification
            </Button>
            <Button variant="outline" className="w-full justify-start">
              💰 Edit Payment Reminder
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Permissions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Coaches can create events</span>
                <Badge className="bg-green-100 text-green-800">Enabled</Badge>
              </div>
              <div className="flex justify-between">
                <span>Gymnasts can see scores</span>
                <Badge className="bg-green-100 text-green-800">Enabled</Badge>
              </div>
              <div className="flex justify-between">
                <span>Public leaderboards</span>
                <Badge className="bg-red-100 text-red-800">Disabled</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Gymnast Management Content
  const GymnastManagementContent = () => {
    const [selectedGymnast, setSelectedGymnast] = useState<any>(null);
    
    const updateGymnastStatus = useMutation({
      mutationFn: async ({ id, status }: { id: string; status: string }) => {
        const response = await apiRequest('PATCH', `/api/gymnasts/${id}/status`, { status });
        return response.json();
      },
      onSuccess: () => {
        toast({ title: "Success", description: "Gymnast status updated successfully" });
        queryClient.invalidateQueries({ queryKey: ['/api/gymnasts'] });
      },
    });

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gymnast Management</h2>
            <p className="text-gray-600">Manage all gymnasts across the league</p>
          </div>
          <Button onClick={() => setSelectedGymnast({})}>+ Add New Gymnast</Button>
        </div>

        {/* Gymnast Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{gymnasts.length}</div>
              <div className="text-sm text-gray-600">Total Gymnasts</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {gymnasts.filter(g => g.status === 'approved').length}
              </div>
              <div className="text-sm text-gray-600">Approved</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {gymnasts.filter(g => g.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {new Set(gymnasts.map(g => g.gym)).size}
              </div>
              <div className="text-sm text-gray-600">Gyms</div>
            </CardContent>
          </Card>
        </div>

        {/* Gymnast List */}
        <Card>
          <CardHeader>
            <CardTitle>All Gymnasts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {gymnasts.map((gymnast) => (
                <div key={gymnast.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <h3 className="font-semibold">{gymnast.firstName} {gymnast.lastName}</h3>
                        <p className="text-sm text-gray-600">
                          Age {gymnast.age} • {gymnast.level} • {gymnast.gym}
                        </p>
                        <p className="text-xs text-gray-500">Coach: {gymnast.coach}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={gymnast.status === 'approved' ? 'default' : 'secondary'}>
                          {gymnast.status}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">{gymnast.parentEmail}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedGymnast(gymnast)}
                    >
                      View Details
                    </Button>
                    {gymnast.status === 'pending' && (
                      <Button 
                        size="sm"
                        onClick={() => updateGymnastStatus.mutate({ id: gymnast.id, status: 'approved' })}
                      >
                        Approve
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Gymnast Detail Modal */}
        {selectedGymnast && (
          <Dialog open={!!selectedGymnast} onOpenChange={() => setSelectedGymnast(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {selectedGymnast.id ? 'Gymnast Details' : 'Add New Gymnast'}
                </DialogTitle>
                <DialogDescription>
                  {selectedGymnast.id ? 'View and manage gymnast information' : 'Add a new gymnast to the league'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {selectedGymnast.id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>First Name</Label>
                        <Input value={selectedGymnast.firstName} readOnly />
                      </div>
                      <div>
                        <Label>Last Name</Label>
                        <Input value={selectedGymnast.lastName} readOnly />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Age</Label>
                        <Input value={selectedGymnast.age} readOnly />
                      </div>
                      <div>
                        <Label>Level</Label>
                        <Input value={selectedGymnast.level} readOnly />
                      </div>
                    </div>
                    <div>
                      <Label>Gym</Label>
                      <Input value={selectedGymnast.gym} readOnly />
                    </div>
                    <div>
                      <Label>Coach</Label>
                      <Input value={selectedGymnast.coach} readOnly />
                    </div>
                    <div>
                      <Label>Parent Email</Label>
                      <Input value={selectedGymnast.parentEmail} readOnly />
                    </div>
                    <div>
                      <Label>Events</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedGymnast.events?.map((event, index) => (
                          <Badge key={index} variant="outline">{event}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>First Name</Label>
                        <Input placeholder="Enter first name" />
                      </div>
                      <div>
                        <Label>Last Name</Label>
                        <Input placeholder="Enter last name" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Age</Label>
                        <Input type="number" placeholder="Age" />
                      </div>
                      <div>
                        <Label>Level</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="level1">Level 1</SelectItem>
                            <SelectItem value="level2">Level 2</SelectItem>
                            <SelectItem value="level3">Level 3</SelectItem>
                            <SelectItem value="level4">Level 4</SelectItem>
                            <SelectItem value="level5">Level 5</SelectItem>
                            <SelectItem value="level6">Level 6</SelectItem>
                            <SelectItem value="level7">Level 7</SelectItem>
                            <SelectItem value="level8">Level 8</SelectItem>
                            <SelectItem value="level9">Level 9</SelectItem>
                            <SelectItem value="level10">Level 10</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label>Gym</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gym" />
                        </SelectTrigger>
                        <SelectContent>
                          {gyms.map((gym) => (
                            <SelectItem key={gym.id} value={gym.id}>{gym.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Parent Email</Label>
                      <Input type="email" placeholder="parent@example.com" />
                    </div>
                    <Button className="w-full">Add Gymnast</Button>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    );
  };

  // Email System Content
  const EmailSystemContent = () => {
    const [emailForm, setEmailForm] = useState({
      to: '',
      subject: '',
      message: '',
      template: ''
    });
    const [activeEmailTab, setActiveEmailTab] = useState('compose');

    const sendEmailMutation = useMutation({
      mutationFn: async (emailData: any) => {
        const response = await apiRequest('POST', '/api/emails/send', emailData);
        return response.json();
      },
      onSuccess: (data: any) => {
        toast({ 
          title: "Email Sent!", 
          description: `Successfully sent to ${data.recipientCount} recipients` 
        });
        setEmailForm({ to: '', subject: '', message: '', template: '' });
        queryClient.invalidateQueries({ queryKey: ['/api/emails/history'] });
      },
    });

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Email System</h2>
          <p className="text-gray-600">Create, send, and manage email communications</p>
        </div>

        <Tabs value={activeEmailTab} onValueChange={setActiveEmailTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="compose">Compose</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
          </TabsList>

          <TabsContent value="compose">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Compose Email</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Recipients</Label>
                    <Select value={emailForm.to} onValueChange={(value) => setEmailForm({...emailForm, to: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select recipients" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all_users">All Users</SelectItem>
                        <SelectItem value="all_coaches">All Coaches</SelectItem>
                        <SelectItem value="all_gymnasts">All Gymnasts (Parents)</SelectItem>
                        <SelectItem value="all_gym_admins">All Gym Admins</SelectItem>
                        <SelectItem value="pending_gymnasts">Pending Gymnasts</SelectItem>
                        <SelectItem value="approved_gymnasts">Approved Gymnasts</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Template (Optional)</Label>
                    <Select value={emailForm.template} onValueChange={(value) => {
                      const template = emailTemplates.find(t => t.id === value);
                      if (template) {
                        setEmailForm({
                          ...emailForm, 
                          template: value,
                          subject: template.subject,
                          message: template.content
                        });
                      }
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose template" />
                      </SelectTrigger>
                      <SelectContent>
                        {emailTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Subject</Label>
                    <Input 
                      value={emailForm.subject}
                      onChange={(e) => setEmailForm({...emailForm, subject: e.target.value})}
                      placeholder="Email subject"
                    />
                  </div>
                  <div>
                    <Label>Message</Label>
                    <Textarea 
                      value={emailForm.message}
                      onChange={(e) => setEmailForm({...emailForm, message: e.target.value})}
                      placeholder="Your message..."
                      rows={8}
                    />
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={() => sendEmailMutation.mutate(emailForm)}
                    disabled={!emailForm.to || !emailForm.subject || !emailForm.message}
                  >
                    {sendEmailMutation.isPending ? 'Sending...' : 'Send Email'}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Email Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg p-4 space-y-2">
                    <div><strong>To:</strong> {emailForm.to || 'Select recipients'}</div>
                    <div><strong>Subject:</strong> {emailForm.subject || 'Enter subject'}</div>
                    <Separator />
                    <div className="whitespace-pre-wrap">
                      {emailForm.message || 'Enter your message...'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="templates">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Email Templates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {emailTemplates.map((template) => (
                      <div key={template.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{template.name}</h4>
                          <p className="text-sm text-gray-600">{template.subject}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">Edit</Button>
                          <Button size="sm" variant="outline">Use</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Create Template</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Template Name</Label>
                    <Input placeholder="Template name" />
                  </div>
                  <div>
                    <Label>Subject</Label>
                    <Input placeholder="Email subject" />
                  </div>
                  <div>
                    <Label>Content</Label>
                    <Textarea placeholder="Template content..." rows={6} />
                  </div>
                  <Button className="w-full">Save Template</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Email History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {emailHistory.map((email) => (
                    <div key={email.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{email.subject}</h4>
                        <p className="text-sm text-gray-600">
                          To: {Array.isArray(email.recipients) ? email.recipients.join(', ') : email.recipients}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(email.sentAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={email.status === 'delivered' ? 'default' : 'secondary'}>
                          {email.status}
                        </Badge>
                        {email.template && (
                          <p className="text-xs text-gray-500 mt-1">Template: {email.template}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="automation">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Active Automations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium">Welcome Email</p>
                      <p className="text-sm text-gray-600">Sent when new users register</p>
                    </div>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium">Event Reminders</p>
                      <p className="text-sm text-gray-600">Sent 7 days before events</p>
                    </div>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div>
                      <p className="font-medium">Payment Reminders</p>
                      <p className="text-sm text-gray-600">Sent when payments are overdue</p>
                    </div>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Create Automation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Trigger</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select trigger" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user_registration">User Registration</SelectItem>
                        <SelectItem value="event_registration">Event Registration</SelectItem>
                        <SelectItem value="payment_due">Payment Due</SelectItem>
                        <SelectItem value="event_reminder">Event Reminder</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Template</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent>
                        {emailTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Delay (Optional)</Label>
                    <Input placeholder="e.g., 7 days, 2 hours" />
                  </div>
                  <Button className="w-full">Create Automation</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  // Gym Management Content
  const GymManagementContent = () => {
    const [selectedGym, setSelectedGym] = useState<any>(null);
    const [showAddGym, setShowAddGym] = useState(false);
    const [newGymForm, setNewGymForm] = useState({
      // Team administrator info
      adminFirstName: '',
      adminLastName: '',
      adminEmail: '',
      
      // Team/gym info
      teamName: '',
      city: '',
      website: '',
      
      // Optional additional details
      phone: '',
      address: '',
      state: '',
      zipCode: '',
      establishedYear: '',
      facilitySize: ''
    });

    const addGymMutation = useMutation({
      mutationFn: async (gymData: any) => {
        const response = await apiRequest('POST', '/api/gyms', gymData);
        return response.json();
      },
      onSuccess: () => {
        toast({ title: "Success", description: "Team registration submitted successfully" });
        setShowAddGym(false);
        setNewGymForm({
          adminFirstName: '', adminLastName: '', adminEmail: '',
          teamName: '', city: '', website: '',
          phone: '', address: '', state: '', zipCode: '', establishedYear: '', facilitySize: ''
        });
        queryClient.invalidateQueries({ queryKey: ['/api/gyms'] });
      },
    });

    const updateGymMutation = useMutation({
      mutationFn: async ({ id, data }: { id: string; data: any }) => {
        const response = await apiRequest('PATCH', `/api/gyms/${id}`, data);
        return response.json();
      },
      onSuccess: () => {
        toast({ title: "Success", description: "Gym updated successfully" });
        queryClient.invalidateQueries({ queryKey: ['/api/gyms'] });
      },
    });

    const deleteGymMutation = useMutation({
      mutationFn: async (id: string) => {
        const response = await apiRequest('DELETE', `/api/gyms/${id}`);
        return response.json();
      },
      onSuccess: () => {
        toast({ title: "Success", description: "Gym deleted successfully" });
        setSelectedGym(null);
        queryClient.invalidateQueries({ queryKey: ['/api/gyms'] });
      },
    });

    const handleApproveGym = (gymId: string) => {
      updateGymMutation.mutate({ id: gymId, data: { status: 'approved' } });
    };

    const handleRejectGym = (gymId: string) => {
      updateGymMutation.mutate({ id: gymId, data: { status: 'rejected' } });
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Team Management</h2>
            <p className="text-gray-600">Manage all teams and gyms in the league</p>
          </div>
          <Button onClick={() => setShowAddGym(true)}>+ Register New Team</Button>
        </div>

        {/* Gym Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{gyms.length}</div>
              <div className="text-sm text-gray-600">Total Gyms</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {gyms.filter((g: any) => g.status === 'approved').length}
              </div>
              <div className="text-sm text-gray-600">Approved</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {gyms.filter((g: any) => g.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {gyms.reduce((total: number, g: any) => total + (g.activeGymnasts || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Total Gymnasts</div>
            </CardContent>
          </Card>
        </div>

        {/* Gym List */}
        <Card>
          <CardHeader>
            <CardTitle>All Gyms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {gyms.map((gym: any) => (
                <div key={gym.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <h3 className="font-semibold">{gym.name}</h3>
                        <p className="text-sm text-gray-600">
                          {gym.city}, {gym.state} • {gym.activeCoaches || 0} coaches • {gym.activeGymnasts || 0} gymnasts
                        </p>
                        <p className="text-xs text-gray-500">{gym.email}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={gym.status === 'approved' ? 'default' : gym.status === 'pending' ? 'secondary' : 'destructive'}>
                          {gym.status}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">Est. {gym.establishedYear}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedGym(gym)}
                    >
                      View Details
                    </Button>
                    {gym.status === 'pending' && (
                      <>
                        <Button 
                          size="sm"
                          onClick={() => handleApproveGym(gym.id)}
                        >
                          Approve
                        </Button>
                        <Button 
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRejectGym(gym.id)}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Add Gym Modal */}
        {showAddGym && (
          <Dialog open={showAddGym} onOpenChange={setShowAddGym}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Register New Team/Gym</DialogTitle>
                <DialogDescription>Enter team administrator and gym details for registration</DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                {/* Team Administrator Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Team Administrator Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>First Name *</Label>
                      <Input 
                        value={newGymForm.adminFirstName}
                        onChange={(e) => setNewGymForm({...newGymForm, adminFirstName: e.target.value})}
                        placeholder="Administrator first name"
                      />
                    </div>
                    <div>
                      <Label>Last Name *</Label>
                      <Input 
                        value={newGymForm.adminLastName}
                        onChange={(e) => setNewGymForm({...newGymForm, adminLastName: e.target.value})}
                        placeholder="Administrator last name"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Email Address *</Label>
                    <Input 
                      type="email"
                      value={newGymForm.adminEmail}
                      onChange={(e) => setNewGymForm({...newGymForm, adminEmail: e.target.value})}
                      placeholder="admin@teamname.com"
                    />
                  </div>
                </div>

                {/* Team/Gym Information Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Team Information</h3>
                  <div>
                    <Label>Team Name *</Label>
                    <Input 
                      value={newGymForm.teamName}
                      onChange={(e) => setNewGymForm({...newGymForm, teamName: e.target.value})}
                      placeholder="Enter team/gym name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>City *</Label>
                      <Input 
                        value={newGymForm.city}
                        onChange={(e) => setNewGymForm({...newGymForm, city: e.target.value})}
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <Label>Website (Optional)</Label>
                      <Input 
                        value={newGymForm.website}
                        onChange={(e) => setNewGymForm({...newGymForm, website: e.target.value})}
                        placeholder="www.teamname.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Optional Additional Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Additional Information (Optional)</h3>
                  <div>
                    <Label>Full Address</Label>
                    <Input 
                      value={newGymForm.address}
                      onChange={(e) => setNewGymForm({...newGymForm, address: e.target.value})}
                      placeholder="Street address"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>State</Label>
                      <Input 
                        value={newGymForm.state}
                        onChange={(e) => setNewGymForm({...newGymForm, state: e.target.value})}
                        placeholder="State"
                      />
                    </div>
                    <div>
                      <Label>Zip Code</Label>
                      <Input 
                        value={newGymForm.zipCode}
                        onChange={(e) => setNewGymForm({...newGymForm, zipCode: e.target.value})}
                        placeholder="12345"
                      />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input 
                        value={newGymForm.phone}
                        onChange={(e) => setNewGymForm({...newGymForm, phone: e.target.value})}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Established Year</Label>
                      <Input 
                        value={newGymForm.establishedYear}
                        onChange={(e) => setNewGymForm({...newGymForm, establishedYear: e.target.value})}
                        placeholder="2020"
                      />
                    </div>
                    <div>
                      <Label>Facility Size</Label>
                      <Input 
                        value={newGymForm.facilitySize}
                        onChange={(e) => setNewGymForm({...newGymForm, facilitySize: e.target.value})}
                        placeholder="10,000 sq ft"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button 
                    className="flex-1" 
                    onClick={() => addGymMutation.mutate(newGymForm)}
                    disabled={!newGymForm.adminFirstName || !newGymForm.adminLastName || !newGymForm.adminEmail || !newGymForm.teamName || !newGymForm.city}
                  >
                    {addGymMutation.isPending ? 'Registering...' : 'Register Team'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddGym(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Gym Detail Modal */}
        {selectedGym && (
          <Dialog open={!!selectedGym} onOpenChange={() => setSelectedGym(null)}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>{selectedGym.name}</DialogTitle>
                <DialogDescription>Gym details and management</DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="font-semibold">Contact Information</Label>
                      <div className="mt-2 space-y-2">
                        <p><strong>Email:</strong> {selectedGym.email}</p>
                        <p><strong>Phone:</strong> {selectedGym.phone}</p>
                        <p><strong>Website:</strong> {selectedGym.website}</p>
                      </div>
                    </div>
                    <div>
                      <Label className="font-semibold">Address</Label>
                      <div className="mt-2">
                        <p>{selectedGym.address}</p>
                        <p>{selectedGym.city}, {selectedGym.state} {selectedGym.zipCode}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="font-semibold">Facility Information</Label>
                      <div className="mt-2 space-y-2">
                        <p><strong>Established:</strong> {selectedGym.establishedYear}</p>
                        <p><strong>Facility Size:</strong> {selectedGym.facilitySize}</p>
                        <p><strong>Status:</strong> 
                          <Badge className="ml-2" variant={selectedGym.status === 'approved' ? 'default' : 'secondary'}>
                            {selectedGym.status}
                          </Badge>
                        </p>
                      </div>
                    </div>
                    <div>
                      <Label className="font-semibold">Current Stats</Label>
                      <div className="mt-2 space-y-2">
                        <p><strong>Active Coaches:</strong> {selectedGym.activeCoaches}</p>
                        <p><strong>Active Gymnasts:</strong> {selectedGym.activeGymnasts}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                  <div className="space-x-2">
                    {selectedGym.status === 'pending' && (
                      <>
                        <Button onClick={() => handleApproveGym(selectedGym.id)}>
                          Approve Gym
                        </Button>
                        <Button variant="destructive" onClick={() => handleRejectGym(selectedGym.id)}>
                          Reject Gym
                        </Button>
                      </>
                    )}
                  </div>
                  <Button 
                    variant="destructive" 
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this gym? This action cannot be undone.')) {
                        deleteGymMutation.mutate(selectedGym.id);
                      }
                    }}
                  >
                    Delete Gym
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    );
  };

  // Content renderer
  const renderContent = () => {
    switch (selectedTab) {
      case "dashboard":
        return <DashboardContent />;
      case "gymnasts":
        return <GymnastManagementContent />;
      case "emails":
        return <EmailSystemContent />;
      case "communications":
        return <CommunicationsContent />;
      case "reports":
        return <ReportsContent />;
      case "settings":
        return <SettingsContent />;
      case "gyms":
        return <GymManagementContent />;
      case "members":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Member Management</h2>
            <div className="grid gap-4">
              {users.map((user) => (
                <Card key={user.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-bold">{user.firstName} {user.lastName}</h3>
                        <p className="text-gray-600">{user.email}</p>
                      </div>
                      <Badge>{user.role}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      case "events":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Event Management</h2>
              <Button>Create New Event</Button>
            </div>
            <div className="grid gap-4">
              {events.map((event) => (
                <Card key={event.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-bold">{event.name}</h3>
                        <p className="text-gray-600">{event.date} • {event.location}</p>
                      </div>
                      <Badge variant={event.status === 'approved' ? 'default' : 'secondary'}>
                        {event.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      default:
        return (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">Feature Coming Soon</h3>
            <p className="text-gray-600">This section is under development.</p>
          </div>
        );
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold text-red-600 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-4">You need admin privileges to access this dashboard.</p>
            <Button onClick={() => window.location.href = '/demo-login'}>
              Go to Demo Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}