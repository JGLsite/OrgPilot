import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function JoinUs() {
  const [isGymDialogOpen, setIsGymDialogOpen] = useState(false);
  const [isGymnastDialogOpen, setIsGymnastDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleGymRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const gymData = {
      name: formData.get('teamName'),
      city: formData.get('city'),
      adminFirstName: formData.get('adminFirstName'),
      adminLastName: formData.get('adminLastName'),
      email: formData.get('email'),
      website: formData.get('website') || undefined,
    };

    try {
      await apiRequest('POST', '/api/gyms', gymData);
      toast({
        title: "Registration Submitted",
        description: "Your gym registration has been submitted for approval. You'll receive an email confirmation once approved.",
      });
      setIsGymDialogOpen(false);
    } catch (error) {
      toast({
        title: "Registration Failed", 
        description: "There was an error submitting your registration. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleGymnastRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is logged in
    window.location.href = '/api/login';
  };

  return (
    <section id="join" className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-gray-900 mb-4">Join the JGL Family</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Whether you're a gym looking to join our league or a gymnast ready to compete, we have a place for you
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Gym Registration */}
          <Card className="rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300">
            <div className="h-48 bg-gradient-to-br from-jgl-teal to-jgl-light-teal flex items-center justify-center">
              <div className="text-white text-center">
                <i className="fas fa-building text-5xl mb-2"></i>
                <p className="text-lg font-semibold">Modern Gymnastics Facility</p>
              </div>
            </div>
            
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-jgl-teal rounded-full flex items-center justify-center">
                  <i className="fas fa-building text-white text-xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Gym Membership</h3>
              </div>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                Register your gymnastics center to become part of our inter-city league. Gain access to competitions, coaching resources, and a supportive community.
              </p>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center space-x-3">
                  <i className="fas fa-check-circle text-jgl-teal"></i>
                  <span className="text-gray-700">Access to all JGL competitions</span>
                </li>
                <li className="flex items-center space-x-3">
                  <i className="fas fa-check-circle text-jgl-teal"></i>
                  <span className="text-gray-700">Coach dashboard and management tools</span>
                </li>
                <li className="flex items-center space-x-3">
                  <i className="fas fa-check-circle text-jgl-teal"></i>
                  <span className="text-gray-700">Event hosting opportunities</span>
                </li>
                <li className="flex items-center space-x-3">
                  <i className="fas fa-check-circle text-jgl-teal"></i>
                  <span className="text-gray-700">Networking with other gyms</span>
                </li>
              </ul>
              
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-3xl font-black text-jgl-teal">$150</span>
                  <span className="text-gray-600">/year</span>
                </div>
                <div className="text-sm text-gray-500">*Admin approval required</div>
              </div>
              
              <Dialog open={isGymDialogOpen} onOpenChange={setIsGymDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full bg-jgl-teal hover:bg-jgl-light-teal text-white py-4 rounded-full font-semibold transition-all duration-200 transform hover:scale-105">
                    Register Your Gym
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Gym Registration</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleGymRegistration} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="adminFirstName">Admin First Name</Label>
                        <Input id="adminFirstName" name="adminFirstName" required />
                      </div>
                      <div>
                        <Label htmlFor="adminLastName">Admin Last Name</Label>
                        <Input id="adminLastName" name="adminLastName" required />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="teamName">Team Name</Label>
                      <Input id="teamName" name="teamName" required />
                    </div>
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input id="city" name="city" required />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input type="email" id="email" name="email" required />
                    </div>
                    <div>
                      <Label htmlFor="website">Website (Optional)</Label>
                      <Input type="url" id="website" name="website" />
                    </div>
                    <Button type="submit" className="w-full bg-jgl-teal hover:bg-jgl-light-teal">
                      Submit Registration
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Gymnast Registration */}
          <Card className="rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300">
            <div className="h-48 bg-gradient-to-br from-jgl-magenta to-jgl-pink flex items-center justify-center">
              <div className="text-white text-center">
                <i className="fas fa-medal text-5xl mb-2"></i>
                <p className="text-lg font-semibold">Young Gymnast Competing</p>
              </div>
            </div>
            
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-jgl-magenta rounded-full flex items-center justify-center">
                  <i className="fas fa-user text-white text-xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Gymnast Membership</h3>
              </div>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                Join as an individual gymnast to compete in JGL events, participate in challenges, and connect with gymnasts from other cities.
              </p>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center space-x-3">
                  <i className="fas fa-check-circle text-jgl-magenta"></i>
                  <span className="text-gray-700">Event registration and competition</span>
                </li>
                <li className="flex items-center space-x-3">
                  <i className="fas fa-check-circle text-jgl-magenta"></i>
                  <span className="text-gray-700">Personal dashboard and score tracking</span>
                </li>
                <li className="flex items-center space-x-3">
                  <i className="fas fa-check-circle text-jgl-magenta"></i>
                  <span className="text-gray-700">Gamified challenges and rewards</span>
                </li>
                <li className="flex items-center space-x-3">
                  <i className="fas fa-check-circle text-jgl-magenta"></i>
                  <span className="text-gray-700">Community leaderboards</span>
                </li>
              </ul>
              
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-3xl font-black text-jgl-magenta">Free</span>
                  <span className="text-gray-600">*</span>
                </div>
                <div className="text-sm text-gray-500">*Coach approval required</div>
              </div>
              
              <Button 
                onClick={handleGymnastRegistration}
                className="w-full bg-jgl-magenta hover:bg-pink-600 text-white py-4 rounded-full font-semibold transition-all duration-200 transform hover:scale-105"
              >
                Join as Gymnast
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Registration Process */}
        <div className="mt-16 bg-white rounded-2xl p-8 border border-gray-200">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-jgl-teal bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-clipboard-check text-jgl-teal text-2xl"></i>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">1. Apply</h3>
              <p className="text-gray-600 text-sm">Submit your registration form with all required information</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-jgl-magenta bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-user-check text-jgl-magenta text-2xl"></i>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">2. Approval</h3>
              <p className="text-gray-600 text-sm">Wait for admin/coach approval and email confirmation</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-jgl-teal bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-rocket text-jgl-teal text-2xl"></i>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">3. Get Started</h3>
              <p className="text-gray-600 text-sm">Access your dashboard and start participating in events</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
