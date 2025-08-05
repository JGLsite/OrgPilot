import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { insertRegistrationRequestSchema } from "@shared/schema";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, UserPlus, Star } from "lucide-react";

const registrationSchema = insertRegistrationRequestSchema.extend({
  confirmParentEmail: z.string().email("Please enter a valid email address").optional(),
}).refine((data) => {
  if (data.parentEmail && data.confirmParentEmail) {
    return data.parentEmail === data.confirmParentEmail;
  }
  return true;
}, {
  message: "Parent email addresses must match",
  path: ["confirmParentEmail"],
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

export default function GymnastRegistration() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedGymName, setSelectedGymName] = useState("");
  const { toast } = useToast();

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      birthDate: "",
      level: "3",
      type: "team",
      parentFirstName: "",
      parentLastName: "",
      parentEmail: "",
      confirmParentEmail: "",
      parentPhone: "",
      emergencyContact: "",
      emergencyPhone: "",
      medicalInfo: "",
    },
  });

  // Fetch available gyms that allow self-registration
  const { data: gyms = [], isLoading: gymsLoading } = useQuery<any[]>({
    queryKey: ["/api/gyms"],
  });

  const availableGyms = gyms.filter((gym: any) => gym.approved && gym.allowSelfRegistration);

  const registrationMutation = useMutation({
    mutationFn: async (data: RegistrationFormData) => {
      const { confirmParentEmail, ...registrationData } = data;
      return apiRequest("POST", "/api/registration-requests", registrationData);
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: "Registration Submitted!",
        description: "Your registration request has been sent to the coaching staff for review.",
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "There was an error submitting your registration. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RegistrationFormData) => {
    registrationMutation.mutate(data);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-teal-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center">
            <CardHeader className="pb-6">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl text-green-600 dark:text-green-400">
                Registration Submitted!
              </CardTitle>
              <CardDescription className="text-lg">
                Thank you for your interest in joining the Jewish Gymnastics League
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300">
                Your registration request has been sent to the coaching staff at{" "}
                <span className="font-semibold text-purple-600 dark:text-purple-400">
                  {selectedGymName}
                </span>{" "}
                for review.
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  What happens next?
                </h3>
                <ul className="text-left text-blue-700 dark:text-blue-300 space-y-1 text-sm">
                  <li>• Your coaches will review your registration details</li>
                  <li>• You'll receive an email notification with their decision</li>
                  <li>• If approved, you'll get login instructions for your dashboard</li>
                  <li>• You can then register for events and participate in challenges</li>
                </ul>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Questions? Contact your gym directly or reach out to JGL support.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-teal-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full mr-3">
              <UserPlus className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Join the Jewish Gymnastics League
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Ready to be part of something special? Register today and become part of our
            amazing gymnastics community where Jewish values meet athletic excellence.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="h-5 w-5 text-yellow-500 mr-2" />
              Gymnast Registration Form
            </CardTitle>
            <CardDescription>
              Complete this form to request registration with a JGL gym. Your coaches will review and approve your request.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Gym Selection */}
                <FormField
                  control={form.control}
                  name="gymId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Your Gym *</FormLabel>
                      <Select
                        disabled={gymsLoading}
                        onValueChange={(value) => {
                          field.onChange(value);
                          const gym = availableGyms.find((g: any) => g.id === value);
                          setSelectedGymName(gym?.name || "");
                        }}
                        defaultValue={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose your gym" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableGyms.map((gym: any) => (
                            <SelectItem key={gym.id} value={gym.id}>
                              {gym.name} - {gym.city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {availableGyms.length === 0 && !gymsLoading && (
                        <p className="text-sm text-amber-600 dark:text-amber-400">
                          No gyms are currently accepting self-registrations. Please contact your gym directly.
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Gymnast Information */}
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter first name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter last name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gymnast Email (Optional)</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="gymnast@example.com" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="birthDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Birth Date *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Competition Level *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pre-team">Pre-Team</SelectItem>
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gymnast Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value || "team"}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="team">Team (Full Competition)</SelectItem>
                            <SelectItem value="pre-team">Pre-Team (Fun Meet Only)</SelectItem>
                            <SelectItem value="non-team">Non-Team (Challenges Only)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Parent Information */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Parent/Guardian Information</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="parentFirstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Parent First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter parent first name" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="parentLastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Parent Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter parent last name" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="parentEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Parent Email *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="parent@example.com" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="confirmParentEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Parent Email *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Confirm parent email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="parentPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parent Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="(555) 123-4567" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Emergency Contact */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Emergency Contact</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="emergencyContact"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Emergency Contact Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Full name" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="emergencyPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Emergency Contact Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="(555) 123-4567" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Medical Information */}
                <FormField
                  control={form.control}
                  name="medicalInfo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medical Information (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Any allergies, medical conditions, or special considerations the coaches should know about..."
                          className="min-h-[100px]"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end pt-6">
                  <Button 
                    type="submit" 
                    disabled={registrationMutation.isPending || availableGyms.length === 0}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-2"
                  >
                    {registrationMutation.isPending ? "Submitting..." : "Submit Registration"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}