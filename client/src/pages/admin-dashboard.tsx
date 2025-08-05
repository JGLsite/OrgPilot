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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiRequest } from '@/lib/queryClient';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState("dashboard");

  // Stats queries
  const { data: gyms = [] } = useQuery({
    queryKey: ['/api/gyms'],
    retry: false,
  });

  const { data: events = [] } = useQuery({
    queryKey: ['/api/events'],
    retry: false,
  });

  const { data: users = [] } = useQuery({
    queryKey: ['/api/users'],
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

  // Content renderer
  const renderContent = () => {
    switch (selectedTab) {
      case "dashboard":
        return <DashboardContent />;
      case "communications":
        return <CommunicationsContent />;
      case "reports":
        return <ReportsContent />;
      case "settings":
        return <SettingsContent />;
      case "gyms":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Gym Management</h2>
            <div className="grid gap-4">
              {gyms.map((gym) => (
                <Card key={gym.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-bold">{gym.name}</h3>
                        <p className="text-gray-600">{gym.city}, {gym.state}</p>
                      </div>
                      <Badge variant={gym.status === 'approved' ? 'default' : 'secondary'}>
                        {gym.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
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