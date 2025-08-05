import { useState } from 'react';
import { useNavigate } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { insertGymSchema } from '@shared/schema';
import { z } from 'zod';

const formSchema = insertGymSchema.extend({
  confirmTerms: z.boolean().refine((val) => val === true, "You must accept the terms"),
});

type FormData = z.infer<typeof formSchema>;

export default function GymRegistration() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPayment, setShowPayment] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      phone: '',
      email: '',
      website: '',
      description: '',
      estimatedGymnastCount: 0,
      confirmTerms: false,
    },
  });

  const registerGymMutation = useMutation({
    mutationFn: async (data: Omit<FormData, 'confirmTerms'>) => {
      await apiRequest('POST', '/api/gyms', data);
    },
    onSuccess: () => {
      toast({
        title: "Registration Submitted",
        description: "Your gym registration has been submitted for review. You'll receive an approval notification soon.",
      });
      setShowPayment(true);
    },
    onError: (error: Error) => {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    const { confirmTerms, ...gymData } = data;
    registerGymMutation.mutate(gymData);
  };

  if (showPayment) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-green-600">Registration Submitted!</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <i className="fas fa-check text-2xl text-green-600"></i>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-2">What's Next?</h3>
                <p className="text-gray-600 mb-4">
                  Your application is under review by the JGL administration team. 
                  Once approved, you'll need to complete the $150 annual membership payment.
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Membership Benefits Include:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>✓ Access to league-wide competitions</li>
                  <li>✓ Coach certification programs</li>
                  <li>✓ Gymnast development tracking</li>
                  <li>✓ Community networking events</li>
                  <li>✓ Equipment rental discounts</li>
                </ul>
              </div>

              <Button onClick={() => navigate('/')} className="w-full">
                Return to Homepage
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Join the Jewish Gymnastics League</h1>
          <p className="text-xl text-gray-600">
            Register your gym to become part of our growing community
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Gym Registration Form</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">Gym Name *</Label>
                  <Input
                    id="name"
                    {...form.register('name')}
                    className="mt-1"
                    placeholder="Elite Gymnastics Academy"
                  />
                  {form.formState.errors.name && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.name.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    {...form.register('phone')}
                    className="mt-1"
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...form.register('email')}
                    className="mt-1"
                    placeholder="info@yourgymy.com"
                  />
                </div>

                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    {...form.register('website')}
                    className="mt-1"
                    placeholder="https://yourgyy.com"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  {...form.register('address')}
                  className="mt-1"
                  placeholder="123 Main Street"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    {...form.register('city')}
                    className="mt-1"
                    placeholder="Brooklyn"
                  />
                </div>

                <div>
                  <Label htmlFor="state">State *</Label>
                  <Select onValueChange={(value) => form.setValue('state', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NY">New York</SelectItem>
                      <SelectItem value="NJ">New Jersey</SelectItem>
                      <SelectItem value="FL">Florida</SelectItem>
                      <SelectItem value="CA">California</SelectItem>
                      <SelectItem value="IL">Illinois</SelectItem>
                      <SelectItem value="TX">Texas</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="zipCode">ZIP Code *</Label>
                  <Input
                    id="zipCode"
                    {...form.register('zipCode')}
                    className="mt-1"
                    placeholder="11201"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="estimatedGymnastCount">Estimated Number of Competitive Gymnasts</Label>
                <Input
                  id="estimatedGymnastCount"
                  type="number"
                  {...form.register('estimatedGymnastCount', { valueAsNumber: true })}
                  className="mt-1"
                  placeholder="25"
                />
              </div>

              <div>
                <Label htmlFor="description">About Your Gym</Label>
                <Textarea
                  id="description"
                  {...form.register('description')}
                  className="mt-1"
                  rows={4}
                  placeholder="Tell us about your gym, coaching philosophy, and experience with competitive gymnastics..."
                />
              </div>

              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-4">Membership Information</h3>
                <div className="space-y-2 text-sm text-blue-800">
                  <p>• Annual membership fee: $150</p>
                  <p>• Includes access to all league competitions and resources</p>
                  <p>• Payment due upon approval of your application</p>
                  <p>• Coach certification programs available</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="confirmTerms"
                  {...form.register('confirmTerms')}
                  className="rounded"
                />
                <Label htmlFor="confirmTerms" className="text-sm">
                  I agree to the JGL terms of service and membership requirements *
                </Label>
              </div>
              {form.formState.errors.confirmTerms && (
                <p className="text-red-500 text-sm">{form.formState.errors.confirmTerms.message}</p>
              )}

              <Button
                type="submit"
                className="w-full bg-jgl-magenta hover:bg-pink-600"
                disabled={registerGymMutation.isPending}
              >
                {registerGymMutation.isPending ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Submitting Application...
                  </>
                ) : (
                  'Submit Gym Registration'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}