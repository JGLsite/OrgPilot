import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  
  // State for member management
  const [showAddMember, setShowAddMember] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [memberForm, setMemberForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'gymnast'
  });

  // Stats queries with proper typing
  const { data: gyms = [], isLoading: gymsLoading } = useQuery<any[]>({
    queryKey: ['/api/gyms'],
    retry: false,
  });

  const { data: events = [], isLoading: eventsLoading } = useQuery<any[]>({
    queryKey: ['/api/events'],
    retry: false,
  });

  const { data: users = [], isLoading: usersLoading } = useQuery<any[]>({
    queryKey: ['/api/users'],
    retry: false,
  });

  const { data: gymnasts = [], isLoading: gymnastsLoading } = useQuery<any[]>({
    queryKey: ['/api/gymnasts'],
    retry: false,
  });

  const { data: emailTemplates = [], isLoading: templatesLoading } = useQuery<any[]>({
    queryKey: ['/api/email-templates'],
    retry: false,
  });

  const { data: emailHistory = [], isLoading: historyLoading } = useQuery<any[]>({
    queryKey: ['/api/emails/history'],
    retry: false,
  });

  const { data: revenue = { total: 28450, growth: 12 }, isLoading: revenueLoading } = useQuery({
    queryKey: ['/api/revenue'],
    retry: false,
  });

  const { data: challenges = [], isLoading: challengesLoading } = useQuery<any[]>({
    queryKey: ['/api/challenges'],
    retry: false,
  });

  const { data: rewards = [], isLoading: rewardsLoading } = useQuery<any[]>({
    queryKey: ['/api/rewards'],
    retry: false,
  });

  // Add registration requests query
  const { data: registrationRequests = [], isLoading: requestsLoading } = useQuery<any[]>({
    queryKey: ['/api/registration-requests/all'],
    retry: false,
  });



  // Mutations for various operations
  const approveGymMutation = useMutation({
    mutationFn: async ({ id, approved }: { id: string; approved: boolean }) => {
      return apiRequest('PATCH', `/api/gyms/${id}/approve`, { approved });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gyms'] });
      toast({ title: "Gym approval updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to update gym approval", variant: "destructive" });
    }
  });

  const approveGymnastMutation = useMutation({
    mutationFn: async ({ id, approved }: { id: string; approved: boolean }) => {
      return apiRequest('PATCH', `/api/gymnasts/${id}/approve`, { approved });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gymnasts'] });
      toast({ title: "Gymnast approval updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to update gymnast approval", variant: "destructive" });
    }
  });

  // Member management mutations
  const createMemberMutation = useMutation({
    mutationFn: async (memberData: any) => {
      return apiRequest('POST', '/api/users', memberData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({ title: "Member created successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to create member", variant: "destructive" });
    }
  });

  const updateMemberMutation = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      return apiRequest('PATCH', `/api/users/${id}/role`, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({ title: "Member role updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to update member role", variant: "destructive" });
    }
  });

  const deleteMemberMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('DELETE', `/api/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({ title: "Member deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to delete member", variant: "destructive" });
    }
  });

  const createEventMutation = useMutation({
    mutationFn: async (eventData: any) => {
      return apiRequest('POST', '/api/events', eventData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      toast({ title: "Event created successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to create event", variant: "destructive" });
    }
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('DELETE', `/api/events/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      toast({ title: "Event deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to delete event", variant: "destructive" });
    }
  });

  const createGymnastMutation = useMutation({
    mutationFn: async (gymnastData: any) => {
      return apiRequest('POST', '/api/gymnasts', gymnastData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gymnasts'] });
      toast({ title: "Gymnast created successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to create gymnast", variant: "destructive" });
    }
  });

  const deleteGymnastMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('DELETE', `/api/gymnasts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gymnasts'] });
      toast({ title: "Gymnast deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to delete gymnast", variant: "destructive" });
    }
  });

  const createChallengeMutation = useMutation({
    mutationFn: async (challengeData: any) => {
      return apiRequest('POST', '/api/challenges', challengeData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/challenges'] });
      toast({ title: "Challenge created successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to create challenge", variant: "destructive" });
    }
  });

  const createRewardMutation = useMutation({
    mutationFn: async (rewardData: any) => {
      return apiRequest('POST', '/api/rewards', rewardData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/rewards'] });
      toast({ title: "Reward created successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to create reward", variant: "destructive" });
    }
  });

  const sendEmailMutation = useMutation({
    mutationFn: async (emailData: any) => {
      return apiRequest('POST', '/api/emails/send', emailData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/emails/history'] });
      toast({ title: "Email sent successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to send email", variant: "destructive" });
    }
  });

  // Calculate stats
  const totalGyms = gyms.length;
  const activeGymnasts = gymnasts.length;
  const upcomingEvents = events.filter(e => new Date(e.date) > new Date()).length;
  const pendingGyms = gyms.filter(g => !g.approved).length;
  const pendingGymnasts = gymnasts.filter(g => !g.approved).length;
  const activeUsers = users.length;
  const activeChallenges = challenges.filter(c => c.active).length;

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
            icon="📝" 
            label="Registration Requests" 
            active={selectedTab === "registrations"}
            onClick={() => setSelectedTab("registrations")}
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
            icon="📝" 
            label="Form Builder" 
            active={selectedTab === "forms"}
            onClick={() => setSelectedTab("forms")}
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
  // Form Builder Content
  const FormBuilderContent = () => {
    const [selectedForm, setSelectedForm] = useState<any>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formConfigs, setFormConfigs] = useState([]);
    const [currentForm, setCurrentForm] = useState({
      name: '',
      description: '',
      formType: 'gymnast_registration',
      fields: [],
      validationRules: {},
      isActive: true,
      isDefault: false
    });

    // Available field types
    const fieldTypes = [
      { value: 'text', label: 'Text Input', icon: '📝' },
      { value: 'email', label: 'Email', icon: '📧' },
      { value: 'phone', label: 'Phone Number', icon: '📞' },
      { value: 'date', label: 'Date', icon: '📅' },
      { value: 'select', label: 'Dropdown', icon: '📋' },
      { value: 'multiselect', label: 'Multi-Select', icon: '☑️' },
      { value: 'textarea', label: 'Text Area', icon: '📄' },
      { value: 'number', label: 'Number', icon: '🔢' },
      { value: 'checkbox', label: 'Checkbox', icon: '✅' },
      { value: 'radio', label: 'Radio Buttons', icon: '🔘' },
      { value: 'file', label: 'File Upload', icon: '📎' }
    ];

    const formTypes = [
      { value: 'gymnast_registration', label: 'Gymnast Registration' },
      { value: 'event_registration', label: 'Event Registration' },
      { value: 'gym_application', label: 'Gym Application' },
      { value: 'coach_application', label: 'Coach Application' },
      { value: 'spectator_registration', label: 'Spectator Registration' }
    ];

    // Query form configurations
    const { data: formConfigurations = [], isLoading: formsLoading } = useQuery<any[]>({
      queryKey: ['/api/form-configurations'],
      retry: false,
    });

    // Mutations for form management
    const createFormMutation = useMutation({
      mutationFn: async (formData: any) => {
        return apiRequest('POST', '/api/form-configurations', formData);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/form-configurations'] });
        toast({ title: "Form created successfully" });
        setShowCreateForm(false);
        setCurrentForm({
          name: '', description: '', formType: 'gymnast_registration',
          fields: [], validationRules: {}, isActive: true, isDefault: false
        });
      },
      onError: (error) => {
        toast({ title: "Error", description: "Failed to create form", variant: "destructive" });
      }
    });

    const updateFormMutation = useMutation({
      mutationFn: async ({ id, data }: { id: string; data: any }) => {
        return apiRequest('PATCH', `/api/form-configurations/${id}`, data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/form-configurations'] });
        toast({ title: "Form updated successfully" });
      },
      onError: (error) => {
        toast({ title: "Error", description: "Failed to update form", variant: "destructive" });
      }
    });

    const deleteFormMutation = useMutation({
      mutationFn: async (id: string) => {
        return apiRequest('DELETE', `/api/form-configurations/${id}`);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/form-configurations'] });
        toast({ title: "Form deleted successfully" });
      },
      onError: (error) => {
        toast({ title: "Error", description: "Failed to delete form", variant: "destructive" });
      }
    });

    const addField = () => {
      const newField = {
        id: `field_${Date.now()}`,
        type: 'text',
        label: 'New Field',
        placeholder: '',
        required: false,
        options: [],
        validation: {},
        order: currentForm.fields.length
      };
      setCurrentForm({
        ...currentForm,
        fields: [...currentForm.fields, newField]
      });
    };

    const updateField = (fieldId: string, updates: any) => {
      setCurrentForm({
        ...currentForm,
        fields: currentForm.fields.map(field => 
          field.id === fieldId ? { ...field, ...updates } : field
        )
      });
    };

    const removeField = (fieldId: string) => {
      setCurrentForm({
        ...currentForm,
        fields: currentForm.fields.filter(field => field.id !== fieldId)
      });
    };

    const moveField = (fieldId: string, direction: 'up' | 'down') => {
      const fields = [...currentForm.fields];
      const index = fields.findIndex(f => f.id === fieldId);
      if (index === -1) return;
      
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= fields.length) return;
      
      [fields[index], fields[newIndex]] = [fields[newIndex], fields[index]];
      
      setCurrentForm({
        ...currentForm,
        fields: fields.map((field, idx) => ({ ...field, order: idx }))
      });
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Form Builder</h2>
            <p className="text-gray-600">Create and customize registration forms for your league</p>
          </div>
          <Button onClick={() => setShowCreateForm(true)}>+ Create New Form</Button>
        </div>

        {/* Form Configuration List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Form Templates</CardTitle>
                <CardDescription>Manage your form configurations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {formConfigurations.map((form) => (
                    <div
                      key={form.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedForm?.id === form.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedForm(form)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{form.name}</h4>
                          <p className="text-sm text-gray-600">{form.formType.replace('_', ' ')}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {form.isDefault && (
                            <Badge variant="secondary">Default</Badge>
                          )}
                          {form.isActive ? (
                            <Badge variant="default">Active</Badge>
                          ) : (
                            <Badge variant="outline">Inactive</Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{form.fields?.length || 0} fields</p>
                    </div>
                  ))}
                  
                  {formConfigurations.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>No forms created yet</p>
                      <Button className="mt-2" onClick={() => setShowCreateForm(true)}>
                        Create First Form
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Form Preview/Editor */}
          <div className="lg:col-span-2">
            {selectedForm ? (
              <FormEditor form={selectedForm} />
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">📝</span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Form to Edit</h3>
                    <p className="text-gray-600">Choose a form from the list to view and edit its configuration</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Create Form Modal */}
        {showCreateForm && (
          <FormBuilderModal 
            isOpen={showCreateForm}
            onClose={() => setShowCreateForm(false)}
            onSave={(formData) => createFormMutation.mutate(formData)}
          />
        )}
      </div>
    );
  };

  // Form Editor Component
  const FormEditor = ({ form }: { form: any }) => {
    const [editingForm, setEditingForm] = useState(form);
    const [previewMode, setPreviewMode] = useState(false);

    const saveFormMutation = useMutation({
      mutationFn: async (formData: any) => {
        return apiRequest('PATCH', `/api/form-configurations/${form.id}`, formData);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/form-configurations'] });
        toast({ title: "Form updated successfully" });
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to update form", variant: "destructive" });
      }
    });

    const handleSave = () => {
      saveFormMutation.mutate(editingForm);
    };

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{editingForm.name}</CardTitle>
              <CardDescription>{editingForm.description}</CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setPreviewMode(!previewMode)}
              >
                {previewMode ? 'Edit' : 'Preview'}
              </Button>
              <Button onClick={handleSave} disabled={saveFormMutation.isPending}>
                {saveFormMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {previewMode ? (
            <FormPreview form={editingForm} />
          ) : (
            <FormFieldEditor form={editingForm} onChange={setEditingForm} />
          )}
        </CardContent>
      </Card>
    );
  };

  // Form Builder Modal Component
  const FormBuilderModal = ({ isOpen, onClose, onSave }: { isOpen: boolean; onClose: () => void; onSave: (data: any) => void }) => {
    const [formData, setFormData] = useState({
      name: '',
      description: '',
      formType: 'gymnast_registration',
      fields: [],
      validationRules: {},
      isActive: true,
      isDefault: false
    });

    const handleSave = () => {
      if (!formData.name) {
        toast({ title: "Error", description: "Form name is required", variant: "destructive" });
        return;
      }
      onSave(formData);
    };

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Form</DialogTitle>
            <DialogDescription>
              Set up basic information for your new form
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="formName">Form Name</Label>
              <Input
                id="formName"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., Standard Gymnast Registration"
              />
            </div>
            <div>
              <Label htmlFor="formDescription">Description</Label>
              <Textarea
                id="formDescription"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Brief description of this form..."
              />
            </div>
            <div>
              <Label htmlFor="formType">Form Type</Label>
              <Select value={formData.formType} onValueChange={(value) => setFormData({...formData, formType: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gymnast_registration">Gymnast Registration</SelectItem>
                  <SelectItem value="event_registration">Event Registration</SelectItem>
                  <SelectItem value="gym_application">Gym Application</SelectItem>
                  <SelectItem value="coach_application">Coach Application</SelectItem>
                  <SelectItem value="spectator_registration">Spectator Registration</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({...formData, isDefault: e.target.checked})}
                />
                <Label htmlFor="isDefault">Set as Default</Label>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave}>Create Form</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // Form Preview Component
  const FormPreview = ({ form }: { form: any }) => (
    <div className="border rounded-lg p-6 bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">Form Preview</h3>
      <div className="space-y-4 bg-white p-6 rounded border">
        {form.fields?.map((field: any) => (
          <div key={field.id}>
            <Label>{field.label} {field.required && <span className="text-red-500">*</span>}</Label>
            {field.type === 'text' && <Input placeholder={field.placeholder} disabled />}
            {field.type === 'email' && <Input type="email" placeholder={field.placeholder} disabled />}
            {field.type === 'textarea' && <Textarea placeholder={field.placeholder} disabled />}
            {field.type === 'select' && (
              <Select disabled>
                <SelectTrigger>
                  <SelectValue placeholder={field.placeholder || 'Select option'} />
                </SelectTrigger>
              </Select>
            )}
          </div>
        ))}
        {(!form.fields || form.fields.length === 0) && (
          <p className="text-gray-500 text-center py-8">No fields added yet</p>
        )}
      </div>
    </div>
  );

  // Form Field Editor Component  
  const FormFieldEditor = ({ form, onChange }: { form: any; onChange: (form: any) => void }) => {
    const addField = () => {
      const newField = {
        id: `field_${Date.now()}`,
        type: 'text',
        label: 'New Field',
        placeholder: '',
        required: false,
        options: [],
        validation: {},
        order: form.fields?.length || 0
      };
      onChange({
        ...form,
        fields: [...(form.fields || []), newField]
      });
    };

    const updateField = (fieldId: string, updates: any) => {
      onChange({
        ...form,
        fields: form.fields?.map((field: any) => 
          field.id === fieldId ? { ...field, ...updates } : field
        ) || []
      });
    };

    const removeField = (fieldId: string) => {
      onChange({
        ...form,
        fields: form.fields?.filter((field: any) => field.id !== fieldId) || []
      });
    };

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="font-medium">Form Fields</h4>
          <Button size="sm" onClick={addField}>+ Add Field</Button>
        </div>
        <div className="space-y-3">
          {form.fields?.map((field: any, index: number) => (
            <div key={field.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">#{index + 1}</span>
                  <Input
                    value={field.label}
                    onChange={(e) => updateField(field.id, { label: e.target.value })}
                    className="font-medium"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" onClick={() => removeField(field.id)}>
                    🗑️
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Field Type</Label>
                  <Select value={field.type} onValueChange={(value) => updateField(field.id, { type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="textarea">Text Area</SelectItem>
                      <SelectItem value="select">Dropdown</SelectItem>
                      <SelectItem value="checkbox">Checkbox</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Placeholder</Label>
                  <Input 
                    value={field.placeholder || ''} 
                    onChange={(e) => updateField(field.id, { placeholder: e.target.value })} 
                  />
                </div>
                <div className="flex items-center space-x-4 pt-6">
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      checked={field.required || false}
                      onChange={(e) => updateField(field.id, { required: e.target.checked })}
                    />
                    <Label>Required</Label>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {(!form.fields || form.fields.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              <p>No fields added yet</p>
              <Button className="mt-2" onClick={addField}>Add First Field</Button>
            </div>
          )}
        </div>
      </div>
    );
  };

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
    const [showRegistrationForm, setShowRegistrationForm] = useState(false);

    // Helper function to get gym name from gymId
    const getGymName = (gymId: string) => {
      const gym = gyms.find(g => g.id === gymId);
      return gym ? `${gym.name} (${gym.city})` : 'Unknown Gym';
    };
    const [registrationForm, setRegistrationForm] = useState({
      firstName: '',
      lastName: '',
      email: '',
      parentEmail: '',
      birthDate: '',
      level: '',
      gymId: '',
      parentFirstName: '',
      parentLastName: '',
      parentPhone: '',
      medicalInfo: '',
      emergencyContact: '',
      emergencyPhone: ''
    });
    
    const updateGymnastStatus = useMutation({
      mutationFn: async ({ id, approved }: { id: string; approved: boolean }) => {
        const response = await apiRequest('PATCH', `/api/gymnasts/${id}/approve`, { approved });
        return response.json();
      },
      onSuccess: () => {
        toast({ title: "Success", description: "Gymnast approval updated successfully" });
        queryClient.invalidateQueries({ queryKey: ['/api/gymnasts'] });
      },
    });

    const registerGymnastMutation = useMutation({
      mutationFn: async (formData: any) => {
        const response = await apiRequest('POST', '/api/gymnasts', formData);
        return response.json();
      },
      onSuccess: () => {
        toast({ title: "Success", description: "Gymnast registered successfully" });
        setShowRegistrationForm(false);
        setRegistrationForm({
          firstName: '', lastName: '', email: '', parentEmail: '', birthDate: '',
          level: '', gymId: '', parentFirstName: '', parentLastName: '', parentPhone: '',
          medicalInfo: '', emergencyContact: '', emergencyPhone: ''
        });
        queryClient.invalidateQueries({ queryKey: ['/api/gymnasts'] });
      },
      onError: (error: any) => {
        toast({ 
          title: "Error", 
          description: error.message || "Failed to register gymnast", 
          variant: "destructive" 
        });
      }
    });

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gymnast Management</h2>
            <p className="text-gray-600">Manage all gymnasts across the league</p>
          </div>
          <Button onClick={() => setShowRegistrationForm(true)}>+ Register New Gymnast</Button>
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
                {gymnasts.filter(g => g.approved === true).length}
              </div>
              <div className="text-sm text-gray-600">Approved</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {gymnasts.filter(g => g.approved === false).length}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {new Set(gymnasts.map(g => g.gymId)).size}
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
                          Level {gymnast.level} • Type: {gymnast.type} • Birth: {new Date(gymnast.birthDate).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          Gym: {getGymName(gymnast.gymId)} • Parent: {gymnast.parentFirstName} {gymnast.parentLastName}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="mb-1">
                          <Badge variant={gymnast.approved ? 'default' : 'secondary'}>
                            {gymnast.approved ? 'approved' : 'pending'}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500">{gymnast.parentEmail}</p>
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
                    {!gymnast.approved && (
                      <Button 
                        size="sm"
                        onClick={() => updateGymnastStatus.mutate({ id: gymnast.id, approved: true })}
                      >
                        Approve
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this gymnast?')) {
                          deleteGymnastMutation.mutate(gymnast.id);
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Gymnast Registration Form Modal */}
        {showRegistrationForm && (
          <Dialog open={showRegistrationForm} onOpenChange={() => setShowRegistrationForm(false)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Gymnast Registration Form</DialogTitle>
                <DialogDescription>
                  Complete registration form for a new gymnast
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                {/* Gymnast Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Gymnast Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={registrationForm.firstName}
                        onChange={(e) => setRegistrationForm({...registrationForm, firstName: e.target.value})}
                        placeholder="Enter first name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={registrationForm.lastName}
                        onChange={(e) => setRegistrationForm({...registrationForm, lastName: e.target.value})}
                        placeholder="Enter last name"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Gymnast Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={registrationForm.email}
                        onChange={(e) => setRegistrationForm({...registrationForm, email: e.target.value})}
                        placeholder="gymnast@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="birthDate">Birth Date *</Label>
                      <Input
                        id="birthDate"
                        type="date"
                        value={registrationForm.birthDate}
                        onChange={(e) => setRegistrationForm({...registrationForm, birthDate: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="level">Competition Level *</Label>
                      <Select 
                        value={registrationForm.level} 
                        onValueChange={(value) => setRegistrationForm({...registrationForm, level: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Level 1</SelectItem>
                          <SelectItem value="2">Level 2</SelectItem>
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
                      <Label htmlFor="gym">Associated Gym *</Label>
                      <Select 
                        value={registrationForm.gymId} 
                        onValueChange={(value) => setRegistrationForm({...registrationForm, gymId: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select gym" />
                        </SelectTrigger>
                        <SelectContent>
                          {gyms.filter(gym => gym.status === 'approved').map((gym) => (
                            <SelectItem key={gym.id} value={gym.id}>
                              {gym.name} - {gym.city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Parent/Guardian Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Parent/Guardian Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="parentFirstName">Parent/Guardian First Name *</Label>
                      <Input
                        id="parentFirstName"
                        value={registrationForm.parentFirstName}
                        onChange={(e) => setRegistrationForm({...registrationForm, parentFirstName: e.target.value})}
                        placeholder="Enter parent first name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="parentLastName">Parent/Guardian Last Name *</Label>
                      <Input
                        id="parentLastName"
                        value={registrationForm.parentLastName}
                        onChange={(e) => setRegistrationForm({...registrationForm, parentLastName: e.target.value})}
                        placeholder="Enter parent last name"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="parentEmail">Parent/Guardian Email *</Label>
                      <Input
                        id="parentEmail"
                        type="email"
                        value={registrationForm.parentEmail}
                        onChange={(e) => setRegistrationForm({...registrationForm, parentEmail: e.target.value})}
                        placeholder="parent@example.com"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="parentPhone">Parent/Guardian Phone *</Label>
                      <Input
                        id="parentPhone"
                        type="tel"
                        value={registrationForm.parentPhone}
                        onChange={(e) => setRegistrationForm({...registrationForm, parentPhone: e.target.value})}
                        placeholder="(555) 123-4567"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Emergency Contact</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="emergencyContact">Emergency Contact Name *</Label>
                      <Input
                        id="emergencyContact"
                        value={registrationForm.emergencyContact}
                        onChange={(e) => setRegistrationForm({...registrationForm, emergencyContact: e.target.value})}
                        placeholder="Emergency contact full name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="emergencyPhone">Emergency Contact Phone *</Label>
                      <Input
                        id="emergencyPhone"
                        type="tel"
                        value={registrationForm.emergencyPhone}
                        onChange={(e) => setRegistrationForm({...registrationForm, emergencyPhone: e.target.value})}
                        placeholder="(555) 987-6543"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Medical Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Medical Information</h3>
                  <div>
                    <Label htmlFor="medicalInfo">Medical Conditions, Allergies, or Special Instructions</Label>
                    <Textarea
                      id="medicalInfo"
                      value={registrationForm.medicalInfo}
                      onChange={(e) => setRegistrationForm({...registrationForm, medicalInfo: e.target.value})}
                      placeholder="Please list any medical conditions, allergies, medications, or special instructions..."
                      rows={4}
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowRegistrationForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      // Validate required fields
                      if (!registrationForm.firstName || !registrationForm.lastName || 
                          !registrationForm.birthDate || !registrationForm.level || 
                          !registrationForm.gymId || !registrationForm.parentFirstName || 
                          !registrationForm.parentLastName || !registrationForm.parentEmail || 
                          !registrationForm.parentPhone || !registrationForm.emergencyContact || 
                          !registrationForm.emergencyPhone) {
                        toast({
                          title: "Validation Error",
                          description: "Please fill in all required fields",
                          variant: "destructive"
                        });
                        return;
                      }

                      registerGymnastMutation.mutate(registrationForm);
                    }}
                    disabled={registerGymnastMutation.isPending}
                  >
                    {registerGymnastMutation.isPending ? 'Registering...' : 'Register Gymnast'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Gymnast Detail Modal */}
        {selectedGymnast && (
          <Dialog open={!!selectedGymnast} onOpenChange={() => setSelectedGymnast(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Gymnast Details</DialogTitle>
                <DialogDescription>
                  View and manage gymnast information
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
                        <Label>Birth Date</Label>
                        <Input value={new Date(selectedGymnast.birthDate).toLocaleDateString()} readOnly />
                      </div>
                      <div>
                        <Label>Level</Label>
                        <Input value={selectedGymnast.level} readOnly />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Type</Label>
                        <Input value={selectedGymnast.type} readOnly />
                      </div>
                      <div>
                        <Label>Status</Label>
                        <Input value={selectedGymnast.approved ? 'Approved' : 'Pending'} readOnly />
                      </div>
                    </div>
                    <div>
                      <Label>Gym</Label>
                      <Input value={getGymName(selectedGymnast.gymId)} readOnly />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Parent Name</Label>
                        <Input value={`${selectedGymnast.parentFirstName} ${selectedGymnast.parentLastName}`} readOnly />
                      </div>
                      <div>
                        <Label>Parent Email</Label>
                        <Input value={selectedGymnast.parentEmail} readOnly />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Parent Phone</Label>
                        <Input value={selectedGymnast.parentPhone || 'Not provided'} readOnly />
                      </div>
                      <div>
                        <Label>Points</Label>
                        <Input value={selectedGymnast.points || 0} readOnly />
                      </div>
                    </div>
                    {selectedGymnast.emergencyContact && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Emergency Contact</Label>
                          <Input value={selectedGymnast.emergencyContact} readOnly />
                        </div>
                        <div>
                          <Label>Emergency Phone</Label>
                          <Input value={selectedGymnast.emergencyPhone || 'Not provided'} readOnly />
                        </div>
                      </div>
                    )}
                    {selectedGymnast.medicalInfo && (
                      <div>
                        <Label>Medical Information</Label>
                        <textarea 
                          className="w-full p-2 border rounded min-h-[100px] resize-none bg-gray-50" 
                          value={selectedGymnast.medicalInfo} 
                          readOnly 
                        />
                      </div>
                    )}
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
      website: ''
    });

    const addGymMutation = useMutation({
      mutationFn: async (formData: any) => {
        // Map frontend form fields to backend schema fields
        const gymData = {
          name: formData.teamName,
          city: formData.city,
          adminFirstName: formData.adminFirstName,
          adminLastName: formData.adminLastName,
          email: formData.adminEmail,
          website: formData.website || null
        };
        const response = await apiRequest('POST', '/api/gyms', gymData);
        return response.json();
      },
      onSuccess: () => {
        toast({ title: "Success", description: "Team registration submitted successfully" });
        setShowAddGym(false);
        setNewGymForm({
          adminFirstName: '', adminLastName: '', adminEmail: '',
          teamName: '', city: '', website: ''
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
                        {selectedGym.website && <p><strong>Website:</strong> {selectedGym.website}</p>}
                      </div>
                    </div>
                    <div>
                      <Label className="font-semibold">Location</Label>
                      <div className="mt-2">
                        <p><strong>City:</strong> {selectedGym.city}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="font-semibold">Team Information</Label>
                      <div className="mt-2 space-y-2">
                        <p><strong>Admin:</strong> {selectedGym.adminFirstName} {selectedGym.adminLastName}</p>
                        <p><strong>Status:</strong> 
                          <Badge className="ml-2" variant={selectedGym.approved ? 'default' : 'secondary'}>
                            {selectedGym.approved ? 'Approved' : 'Pending'}
                          </Badge>
                        </p>
                        <p><strong>Membership:</strong> 
                          <Badge className="ml-2" variant={selectedGym.membershipPaid ? 'default' : 'destructive'}>
                            {selectedGym.membershipPaid ? 'Paid' : 'Unpaid'}
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

  // Registration Requests Content
  const RegistrationRequestsContent = () => {
    const approveRequestMutation = useMutation({
      mutationFn: async (requestId: string) => {
        return apiRequest("POST", `/api/registration-requests/${requestId}/approve-test`);
      },
      onSuccess: async (response) => {
        const data = await response.json();
        queryClient.invalidateQueries({ queryKey: ["/api/registration-requests/all"] });
        queryClient.invalidateQueries({ queryKey: ["/api/gymnasts"] });
        toast({
          title: "Registration Approved!",
          description: `${data.gymnast.firstName} ${data.gymnast.lastName} has been added to the gym and will receive a welcome email.`,
          variant: "default",
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: "Failed to approve registration request",
          variant: "destructive",
        });
      }
    });

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Registration Requests</h2>
          <p className="text-gray-600">Review and approve gymnast registration requests</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pending Requests ({registrationRequests.filter(r => r.status === 'pending').length})</CardTitle>
          </CardHeader>
          <CardContent>
            {registrationRequests.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No registration requests found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {registrationRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-lg">{request.firstName} {request.lastName}</h3>
                          <Badge variant={request.status === 'pending' ? 'secondary' : request.status === 'approved' ? 'default' : 'destructive'}>
                            {request.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                          <div>
                            <span className="font-medium">Email:</span> {request.email || 'Not provided'}
                          </div>
                          <div>
                            <span className="font-medium">Level:</span> {request.level}
                          </div>
                          <div>
                            <span className="font-medium">Type:</span> {request.type}
                          </div>
                          <div>
                            <span className="font-medium">Birth Date:</span> {new Date(request.birthDate).toLocaleDateString()}
                          </div>
                          <div className="col-span-2">
                            <span className="font-medium">Gym:</span> {request.gymName} ({request.gymCity})
                          </div>
                          <div className="col-span-2">
                            <span className="font-medium">Parent:</span> {request.parentFirstName} {request.parentLastName}
                          </div>
                          <div>
                            <span className="font-medium">Parent Email:</span> {request.parentEmail}
                          </div>
                          <div>
                            <span className="font-medium">Parent Phone:</span> {request.parentPhone}
                          </div>
                          <div className="col-span-2">
                            <span className="font-medium">Emergency Contact:</span> {request.emergencyContact} ({request.emergencyPhone})
                          </div>
                          {request.medicalInfo && (
                            <div className="col-span-2">
                              <span className="font-medium">Medical Info:</span> {request.medicalInfo}
                            </div>
                          )}
                          <div>
                            <span className="font-medium">Submitted:</span> {new Date(request.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        {request.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => approveRequestMutation.mutate(request.id)}
                              disabled={approveRequestMutation.isPending}
                            >
                              {approveRequestMutation.isPending ? 'Approving...' : 'Approve'}
                            </Button>
                            <Button size="sm" variant="outline">
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
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
      case "registrations":
        return <RegistrationRequestsContent />;
      case "emails":
        return <EmailSystemContent />;
      case "communications":
        return <CommunicationsContent />;
      case "forms":
        return <FormBuilderContent />;
      case "reports":
        return <ReportsContent />;
      case "settings":
        return <SettingsContent />;
      case "gyms":
        return <GymManagementContent />;
      case "members":
        return <MembersContent />;
      case "challenges":
        return <ChallengesContent />;
      case "rewards":
        return <RewardsContent />;
      case "scores":
        return <ScoresContent />;
      case "events":
        return <EventsContent />;
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



  // Additional content components
  const MembersContent = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Member Management</h2>
          <p className="text-gray-600">Manage all platform users and their roles</p>
        </div>
        <Button onClick={() => {
          const firstName = prompt('First Name:');
          const lastName = prompt('Last Name:');
          const email = prompt('Email:');
          const role = prompt('Role (admin, coach, gym_admin, gymnast, spectator):') || 'gymnast';
          
          if (firstName && lastName && email && ['admin', 'coach', 'gym_admin', 'gymnast', 'spectator'].includes(role)) {
            createMemberMutation.mutate({ firstName, lastName, email, role });
          }
        }}>+ Add Member</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{users.length}</div>
            <div className="text-sm text-gray-600">Total Users</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {users.filter(u => u.role === 'gym_admin').length}
            </div>
            <div className="text-sm text-gray-600">Gym Admins</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {users.filter(u => u.role === 'coach').length}
            </div>
            <div className="text-sm text-gray-600">Coaches</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {users.filter(u => u.role === 'gymnast').length}
            </div>
            <div className="text-sm text-gray-600">Gymnasts</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{user.firstName} {user.lastName}</h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                    {user.role}
                  </Badge>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      const newRole = prompt('Enter new role (admin, coach, gym_admin, gymnast, spectator):');
                      if (newRole && ['admin', 'coach', 'gym_admin', 'gymnast', 'spectator'].includes(newRole)) {
                        updateMemberMutation.mutate({ id: user.id, role: newRole });
                      }
                    }}
                  >
                    Edit Role
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this member?')) {
                        deleteMemberMutation.mutate(user.id);
                      }
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const ChallengesContent = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Challenge Management</h2>
          <p className="text-gray-600">Create and manage skill-based challenges</p>
        </div>
        <Button onClick={() => {}}>+ Create Challenge</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{activeChallenges}</div>
            <div className="text-sm text-gray-600">Active Challenges</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {challenges.filter(c => c.isCoachChallenge).length}
            </div>
            <div className="text-sm text-gray-600">Coach Challenges</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {challenges.filter(c => !c.isCoachChallenge).length}
            </div>
            <div className="text-sm text-gray-600">League Challenges</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Challenges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {challenges.map((challenge) => (
              <div key={challenge.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold">{challenge.title}</h3>
                  <p className="text-sm text-gray-600">{challenge.description}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <Badge variant="outline">{challenge.points} points</Badge>
                    <Badge variant={challenge.isCoachChallenge ? 'secondary' : 'default'}>
                      {challenge.isCoachChallenge ? 'Coach' : 'League'}
                    </Badge>
                    {challenge.levels && (
                      <span className="text-xs text-gray-500">
                        Levels: {challenge.levels.join(', ')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">Edit</Button>
                  <Button size="sm" variant="outline">
                    {challenge.active ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const RewardsContent = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Rewards Store</h2>
          <p className="text-gray-600">Manage prizes and point redemption system</p>
        </div>
        <Button onClick={() => {}}>+ Add Reward</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{rewards.length}</div>
            <div className="text-sm text-gray-600">Available Rewards</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {rewards.filter(r => r.pointsCost <= 100).length}
            </div>
            <div className="text-sm text-gray-600">Low Cost (&le;100 pts)</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {rewards.filter(r => r.pointsCost > 100).length}
            </div>
            <div className="text-sm text-gray-600">High Value (&gt;100 pts)</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reward Catalog</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rewards.map((reward) => (
              <Card key={reward.id}>
                <CardContent className="p-4">
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto flex items-center justify-center">
                      <span className="text-2xl">🎁</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{reward.name}</h3>
                      <p className="text-sm text-gray-600">{reward.description}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{reward.pointsCost} points</Badge>
                      <Badge variant={reward.active ? 'default' : 'secondary'}>
                        {reward.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="flex-1">Edit</Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        {reward.active ? 'Disable' : 'Enable'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const ScoresContent = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Score Management</h2>
          <p className="text-gray-600">Import and manage gymnast competition scores</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">Import Scores</Button>
          <Button>Add Manual Score</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">247</div>
            <div className="text-sm text-gray-600">Total Scores</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">12</div>
            <div className="text-sm text-gray-600">Recent Events</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">5</div>
            <div className="text-sm text-gray-600">Score Outs</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">38.5</div>
            <div className="text-sm text-gray-600">Avg All-Around</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recent" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recent">Recent Scores</TabsTrigger>
          <TabsTrigger value="scoreouts">Score Outs</TabsTrigger>
          <TabsTrigger value="import">Import Data</TabsTrigger>
        </TabsList>

        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle>Recent Competition Scores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Demo score data */}
                {[
                  { gymnast: "Emma Johnson", event: "Spring Classic", vault: 9.2, bars: 8.8, beam: 9.1, floor: 9.3, aa: 36.4 },
                  { gymnast: "Sarah Miller", event: "Spring Classic", vault: 8.9, bars: 9.0, beam: 8.7, floor: 9.2, aa: 35.8 },
                  { gymnast: "Maya Chen", event: "Spring Classic", vault: 9.1, bars: 8.6, beam: 8.9, floor: 9.0, aa: 35.6 }
                ].map((score, index) => (
                  <div key={index} className="grid grid-cols-7 gap-4 p-4 border rounded-lg">
                    <div>
                      <div className="font-semibold">{score.gymnast}</div>
                      <div className="text-sm text-gray-600">{score.event}</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{score.vault}</div>
                      <div className="text-xs text-gray-500">Vault</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{score.bars}</div>
                      <div className="text-xs text-gray-500">Bars</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{score.beam}</div>
                      <div className="text-xs text-gray-500">Beam</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{score.floor}</div>
                      <div className="text-xs text-gray-500">Floor</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-blue-600">{score.aa}</div>
                      <div className="text-xs text-gray-500">All-Around</div>
                    </div>
                    <div className="flex space-x-1">
                      <Button size="sm" variant="outline">Edit</Button>
                      <Button size="sm" variant="outline">Delete</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scoreouts">
          <Card>
            <CardHeader>
              <CardTitle>Gymnasts Who Scored Out</CardTitle>
              <p className="text-sm text-gray-600">
                Gymnasts who achieved scores meeting advancement requirements
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { gymnast: "Anna Rodriguez", level: "Level 4", aa: 37.2, meets: "Spring Classic, Winter Cup", eligible: "Level 5" },
                  { gymnast: "Sofia Kim", level: "Level 6", aa: 36.8, meets: "Regional Championship", eligible: "Level 7" }
                ].map((scoreout, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50">
                    <div>
                      <h3 className="font-semibold">{scoreout.gymnast}</h3>
                      <p className="text-sm text-gray-600">Current: {scoreout.level} → Eligible: {scoreout.eligible}</p>
                      <p className="text-xs text-gray-500">Qualifying AA: {scoreout.aa} at {scoreout.meets}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm">Advance Level</Button>
                      <Button size="sm" variant="outline">Review</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import">
          <Card>
            <CardHeader>
              <CardTitle>Import Score Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Select Event</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose event" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spring-classic">Spring Classic 2024</SelectItem>
                    <SelectItem value="winter-cup">Winter Cup 2024</SelectItem>
                    <SelectItem value="regional">Regional Championship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Upload Score File</Label>
                <Input type="file" accept=".csv,.xlsx" />
                <p className="text-xs text-gray-500 mt-1">
                  Upload CSV or Excel file with gymnast scores
                </p>
              </div>
              <Button className="w-full">Import Scores</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );

  const EventsContent = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Event Management</h2>
          <p className="text-gray-600">Create and manage gymnastics competitions</p>
        </div>
        <Button onClick={() => {
          const name = prompt('Event Name:');
          const date = prompt('Event Date (YYYY-MM-DD):');
          const location = prompt('Location:');
          const description = prompt('Description:');
          
          if (name && date && location) {
            createEventMutation.mutate({ 
              name, 
              date, 
              location, 
              description: description || '', 
              registrationOpen: true 
            });
          }
        }}>+ Create Event</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{events.length}</div>
            <div className="text-sm text-gray-600">Total Events</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{upcomingEvents}</div>
            <div className="text-sm text-gray-600">Upcoming</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {events.filter(e => !e.approved).length}
            </div>
            <div className="text-sm text-gray-600">Pending Approval</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">125</div>
            <div className="text-sm text-gray-600">Total Registrations</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {events.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No events created yet.</p>
                <Button 
                  className="mt-4"
                  onClick={() => {
                    const name = prompt('Event Name:');
                    const date = prompt('Event Date (YYYY-MM-DD):');
                    const location = prompt('Location:');
                    const description = prompt('Description:');
                    
                    if (name && date && location) {
                      createEventMutation.mutate({ 
                        name, 
                        date, 
                        location, 
                        description: description || '', 
                        registrationOpen: true 
                      });
                    }
                  }}
                >Create First Event</Button>
              </div>
            ) : (
              events.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold">{event.name}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(event.date).toLocaleDateString()} • {event.location}
                    </p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-xs text-gray-500">
                        Registration: {new Date(event.registrationOpen).toLocaleDateString()} - {new Date(event.registrationClose).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant={event.approved ? 'default' : 'secondary'}>
                      {event.approved ? 'Approved' : 'Pending'}
                    </Badge>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">View Details</Button>
                      {!event.approved && (
                        <Button size="sm">Approve</Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this event?')) {
                            deleteEventMutation.mutate(event.id);
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

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