import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.target as HTMLFormElement);
    const contactData = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      subject: formData.get('subject'),
      message: formData.get('message'),
    };

    try {
      await apiRequest('POST', '/api/contact', contactData);
      toast({
        title: "Message Sent",
        description: "Thank you for your message. We'll get back to you soon!",
      });
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      toast({
        title: "Failed to Send",
        description: "There was an error sending your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-black text-gray-900 mb-4">Get in Touch</h2>
              <div className="w-20 h-1 bg-jgl-magenta rounded-full"></div>
            </div>
            
            <p className="text-lg text-gray-600 leading-relaxed">
              Have questions about joining the JGL or need support with your account? We're here to help our gymnastics community.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-jgl-teal bg-opacity-10 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-envelope text-jgl-teal"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Email Us</h3>
                  <p className="text-gray-600">info@jglgymnastics.com</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-jgl-magenta bg-opacity-10 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-phone text-jgl-magenta"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Call Us</h3>
                  <p className="text-gray-600">(555) 123-4567</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-jgl-teal bg-opacity-10 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-map-marker-alt text-jgl-teal"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Service Area</h3>
                  <p className="text-gray-600">Lakewood, Brooklyn, Edison, Monsey, Miami, Passaic, Baltimore, 5 Towns</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-gray-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
                    First Name
                  </Label>
                  <Input 
                    type="text" 
                    id="firstName"
                    name="firstName"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-jgl-teal focus:border-transparent transition-colors duration-200" 
                    placeholder="Your first name"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
                    Last Name
                  </Label>
                  <Input 
                    type="text" 
                    id="lastName"
                    name="lastName"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-jgl-teal focus:border-transparent transition-colors duration-200" 
                    placeholder="Your last name"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </Label>
                <Input 
                  type="email" 
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-jgl-teal focus:border-transparent transition-colors duration-200" 
                  placeholder="your@email.com"
                />
              </div>
              
              <div>
                <Label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                  Subject
                </Label>
                <Select name="subject" required>
                  <SelectTrigger className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-jgl-teal focus:border-transparent transition-colors duration-200">
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Inquiry</SelectItem>
                    <SelectItem value="gym">Gym Membership</SelectItem>
                    <SelectItem value="gymnast">Gymnast Registration</SelectItem>
                    <SelectItem value="event">Event Information</SelectItem>
                    <SelectItem value="support">Technical Support</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                  Message
                </Label>
                <Textarea 
                  id="message"
                  name="message"
                  required
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-jgl-teal focus:border-transparent transition-colors duration-200" 
                  placeholder="How can we help you?"
                />
              </div>
              
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-jgl-magenta hover:bg-pink-600 text-white py-4 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane mr-2"></i>
                    Send Message
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
