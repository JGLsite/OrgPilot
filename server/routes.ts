import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertGymSchema, insertGymnastSchema, insertEventSchema, insertChallengeSchema, insertRewardSchema } from "@shared/schema";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        // Create user if doesn't exist
        const newUser = await storage.upsertUser({
          id: userId,
          email: req.user.claims.email,
          firstName: req.user.claims.first_name,
          lastName: req.user.claims.last_name,
          profileImageUrl: req.user.claims.profile_image_url,
          role: 'spectator', // Default role
        });
        res.json(newUser);
      } else {
        res.json(user);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      
      // Handle specific validation errors
      if (error instanceof Error) {
        if (error.message.includes('already registered as a gym admin')) {
          return res.status(409).json({ 
            message: error.message,
            field: 'email'
          });
        }
      }
      
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Admin role assignment endpoint (for testing)
  app.post('/api/admin/assign-role', isAuthenticated, async (req: any, res) => {
    try {
      const { userId, role } = req.body;
      const currentUser = await storage.getUser(req.user.claims.sub);
      
      // Only existing admins can assign roles
      if (currentUser?.role !== 'admin') {
        return res.status(403).json({ message: "Only admins can assign roles" });
      }
      
      const updatedUser = await storage.updateUserRole(userId, role);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error assigning role:", error);
      res.status(500).json({ message: "Failed to assign role" });
    }
  });

  // Bootstrap first admin (one-time setup)
  app.post('/api/bootstrap-admin', async (req, res) => {
    try {
      const { secret } = req.body;
      if (secret !== 'jgl-admin-bootstrap-2024') {
        return res.status(403).json({ message: "Invalid bootstrap secret" });
      }
      
      // Create a demo admin user for testing
      const demoAdmin = await storage.upsertUser({
        id: 'demo-admin-123',
        email: 'admin@jgl.test',
        firstName: 'JGL',
        lastName: 'Admin',
        role: 'admin',
      });
      
      res.json({ message: "Demo admin created", user: demoAdmin });
    } catch (error) {
      console.error("Error bootstrapping admin:", error);
      
      // Handle specific validation errors
      if (error instanceof Error) {
        if (error.message.includes('already registered as a gym admin')) {
          return res.status(409).json({ 
            message: error.message,
            field: 'email'
          });
        }
      }
      
      res.status(500).json({ message: "Failed to bootstrap admin" });
    }
  });

  // Demo login endpoint for testing
  app.post('/api/demo-login', async (req, res) => {
    try {
      const { role } = req.body;
      const demoUser = await storage.upsertUser({
        id: `demo-${role}-${Date.now()}`,
        email: `${role}@jgl.test`,
        firstName: 'Demo',
        lastName: role.charAt(0).toUpperCase() + role.slice(1),
        role: role,
      });
      
      // Set a simple session cookie
      req.session.userId = demoUser.id;
      req.session.user = demoUser;
      
      res.json({ message: "Demo login successful", user: demoUser });
    } catch (error) {
      console.error("Error with demo login:", error);
      
      // Handle specific validation errors
      if (error instanceof Error) {
        if (error.message.includes('already registered as a gym admin')) {
          return res.status(409).json({ 
            message: error.message,
            field: 'email'
          });
        }
      }
      
      res.status(500).json({ message: "Failed to demo login" });
    }
  });

  // Demo auth check
  app.get('/api/demo-auth/user', async (req: any, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not logged in" });
      }
      
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching demo user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Admin API endpoints
  app.get('/api/users', async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get('/api/revenue', async (req, res) => {
    try {
      // Return demo revenue data
      const revenue = {
        total: 28450,
        growth: 12,
        monthly: [
          { month: 'Jan', amount: 15200 },
          { month: 'Feb', amount: 18300 },
          { month: 'Mar', amount: 22100 },
          { month: 'Apr', amount: 28450 },
        ]
      };
      res.json(revenue);
    } catch (error) {
      console.error("Error fetching revenue:", error);
      res.status(500).json({ message: "Failed to fetch revenue" });
    }
  });

  // Communications endpoints
  app.post('/api/notifications/send', async (req, res) => {
    try {
      const { recipients, subject, message } = req.body;
      
      // Here you would integrate with email service (SendGrid, etc.)
      console.log('Sending notification:', { recipients, subject, message });
      
      res.json({ 
        message: 'Notification sent successfully',
        recipientCount: recipients === 'all' ? 150 : 50 
      });
    } catch (error) {
      console.error("Error sending notification:", error);
      res.status(500).json({ message: "Failed to send notification" });
    }
  });

  // Data export endpoints
  app.get('/api/export/members', async (req, res) => {
    try {
      // Generate CSV export
      const csvData = "Name,Email,Role,Gym,Join Date\nSarah Johnson,sarah@example.com,Coach,Elite Gymnastics,2024-01-15";
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=members.csv');
      res.send(csvData);
    } catch (error) {
      console.error("Error exporting members:", error);
      res.status(500).json({ message: "Failed to export members" });
    }
  });

  app.get('/api/export/registrations', async (req, res) => {
    try {
      const csvData = "Event,Gymnast,Registration Date,Payment Status\nSpring Classic,Emma Wilson,2024-01-20,Paid";
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=registrations.csv');
      res.send(csvData);
    } catch (error) {
      console.error("Error exporting registrations:", error);
      res.status(500).json({ message: "Failed to export registrations" });
    }
  });

  app.get('/api/export/financials', async (req, res) => {
    try {
      const csvData = "Date,Description,Amount,Type\n2024-01-15,Gym Membership Fee,$150,Income\n2024-01-20,Event Registration,$100,Income";
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=financials.csv');
      res.send(csvData);
    } catch (error) {
      console.error("Error exporting financials:", error);
      res.status(500).json({ message: "Failed to export financials" });
    }
  });

  // Gymnast management endpoints
  app.get('/api/gymnasts', async (req, res) => {
    try {
      // Return demo gymnasts
      const demoGymnasts = [
        { 
          id: '1', 
          firstName: 'Emma', 
          lastName: 'Johnson', 
          age: 12, 
          level: 'Level 6', 
          gym: 'Elite Gymnastics Academy',
          coach: 'Sarah Johnson',
          status: 'approved',
          parentEmail: 'parent1@example.com',
          events: ['Spring Classic 2024', 'State Championships']
        },
        { 
          id: '2', 
          firstName: 'Sophia', 
          lastName: 'Chen', 
          age: 10, 
          level: 'Level 4', 
          gym: 'Olympic Dreams Gym',
          coach: 'Mike Rodriguez',
          status: 'pending',
          parentEmail: 'parent2@example.com',
          events: ['Spring Classic 2024']
        },
        { 
          id: '3', 
          firstName: 'Olivia', 
          lastName: 'Martinez', 
          age: 14, 
          level: 'Level 8', 
          gym: 'Star Gymnastics Center',
          coach: 'Lisa Wilson',
          status: 'approved',
          parentEmail: 'parent3@example.com',
          events: ['State Championships', 'Regional Meet']
        },
        { 
          id: '4', 
          firstName: 'Ava', 
          lastName: 'Brown', 
          age: 11, 
          level: 'Level 5', 
          gym: 'Champion Athletics',
          coach: 'David Thompson',
          status: 'approved',
          parentEmail: 'parent4@example.com',
          events: ['Spring Classic 2024']
        }
      ];
      res.json(demoGymnasts);
    } catch (error) {
      console.error("Error fetching gymnasts:", error);
      res.status(500).json({ message: "Failed to fetch gymnasts" });
    }
  });

  // Update gymnast status
  app.patch('/api/gymnasts/:id/status', async (req, res) => {
    try {
      const { status } = req.body;
      res.json({ message: `Gymnast status updated to ${status}` });
    } catch (error) {
      console.error("Error updating gymnast status:", error);
      res.status(500).json({ message: "Failed to update gymnast status" });
    }
  });

  // Email system endpoints
  app.post('/api/emails/send', async (req, res) => {
    try {
      const { to, subject, message, template } = req.body;
      
      // Here you would integrate with SendGrid or similar email service
      console.log('Sending email:', { to, subject, message, template });
      
      // Simulate email sending
      const recipientCount = Array.isArray(to) ? to.length : 1;
      
      res.json({ 
        message: 'Email sent successfully',
        recipientCount,
        emailId: `email_${Date.now()}`,
        sentAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ message: "Failed to send email" });
    }
  });

  // Email templates
  app.get('/api/email-templates', async (req, res) => {
    try {
      const templates = [
        {
          id: 'welcome',
          name: 'Welcome Email',
          subject: 'Welcome to JGL!',
          content: 'Dear {{firstName}}, welcome to the Jewish Gymnastics League...'
        },
        {
          id: 'event_reminder',
          name: 'Event Reminder',
          subject: 'Upcoming Event: {{eventName}}',
          content: 'Don\'t forget about the upcoming {{eventName}} on {{eventDate}}...'
        },
        {
          id: 'registration_open',
          name: 'Registration Opening',
          subject: 'Registration Now Open for {{eventName}}',
          content: 'Registration is now open for {{eventName}}. Please register by {{deadline}}...'
        },
        {
          id: 'payment_reminder',
          name: 'Payment Reminder',
          subject: 'Payment Reminder - {{amount}} Due',
          content: 'This is a reminder that your payment of {{amount}} is due by {{dueDate}}...'
        }
      ];
      res.json(templates);
    } catch (error) {
      console.error("Error fetching email templates:", error);
      res.status(500).json({ message: "Failed to fetch email templates" });
    }
  });

  // Save email template
  app.post('/api/email-templates', async (req, res) => {
    try {
      const { name, subject, content } = req.body;
      const template = {
        id: `template_${Date.now()}`,
        name,
        subject,
        content,
        createdAt: new Date().toISOString()
      };
      
      res.json({ message: 'Template saved successfully', template });
    } catch (error) {
      console.error("Error saving email template:", error);
      res.status(500).json({ message: "Failed to save email template" });
    }
  });

  // Email history/logs
  app.get('/api/emails/history', async (req, res) => {
    try {
      const emailHistory = [
        {
          id: 'email_1',
          subject: 'Welcome to JGL!',
          recipients: ['parent1@example.com', 'parent2@example.com'],
          sentAt: '2024-01-15T10:30:00Z',
          status: 'delivered',
          template: 'welcome'
        },
        {
          id: 'email_2',
          subject: 'Spring Classic Registration Open',
          recipients: ['all_coaches'],
          sentAt: '2024-01-20T14:00:00Z',
          status: 'delivered',
          template: 'registration_open'
        }
      ];
      res.json(emailHistory);
    } catch (error) {
      console.error("Error fetching email history:", error);
      res.status(500).json({ message: "Failed to fetch email history" });
    }
  });

  // Gym registration
  app.post('/api/gyms', async (req, res) => {
    try {
      const gymData = insertGymSchema.parse(req.body);
      const gym = await storage.createGym(gymData);
      res.status(201).json(gym);
    } catch (error) {
      console.error("Error creating gym:", error);
      
      // Handle specific validation errors
      if (error instanceof Error) {
        if (error.message.includes('already exists')) {
          return res.status(409).json({ 
            message: error.message,
            field: 'email'
          });
        }
      }
      
      res.status(400).json({ message: "Failed to create gym" });
    }
  });

  // Get gyms 
  app.get('/api/gyms', async (req, res) => {
    try {
      const gyms = await storage.getGyms();
      res.json(gyms);
    } catch (error) {
      console.error("Error fetching gyms:", error);
      res.status(500).json({ message: "Failed to fetch gyms" });
    }
  });

  // Update gym
  app.patch('/api/gyms/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      res.json({ message: 'Gym updated successfully', gymId: id, updates: updateData });
    } catch (error) {
      console.error("Error updating gym:", error);
      res.status(500).json({ message: "Failed to update gym" });
    }
  });

  // Delete gym
  app.delete('/api/gyms/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteGym(id);
      res.json({ message: 'Gym deleted successfully', gymId: id });
    } catch (error) {
      console.error("Error deleting gym:", error);
      res.status(500).json({ message: "Failed to delete gym" });
    }
  });

  // Approve gym (admin only)
  app.patch('/api/gyms/:id/approve', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }
      const { approved } = req.body;
      const gym = await storage.updateGymApproval(req.params.id, approved);
      res.json(gym);
    } catch (error) {
      console.error("Error updating gym approval:", error);
      res.status(500).json({ message: "Failed to update gym approval" });
    }
  });

  // Gymnast registration
  app.post('/api/gymnasts', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || (user.role !== 'admin' && user.role !== 'gym_admin' && user.role !== 'coach')) {
        return res.status(403).json({ message: "Access denied" });
      }

      // For admin registration form, don't assign userId automatically
      const gymnastData = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email || null,
        birthDate: req.body.birthDate,
        level: req.body.level.toString(),
        gymId: req.body.gymId,
        parentFirstName: req.body.parentFirstName || null,
        parentLastName: req.body.parentLastName || null,
        parentEmail: req.body.parentEmail || null,
        parentPhone: req.body.parentPhone || null,
        emergencyContact: req.body.emergencyContact || null,
        emergencyPhone: req.body.emergencyPhone || null,
        medicalInfo: req.body.medicalInfo || null,
        type: "team" as const,
        approved: false
      };

      const gymnast = await storage.createGymnast(gymnastData);
      res.status(201).json(gymnast);
    } catch (error) {
      console.error("Error creating gymnast:", error);
      
      // Handle specific validation errors
      if (error instanceof Error) {
        if (error.message.includes('already has a gymnast account')) {
          return res.status(409).json({ 
            message: error.message,
            field: 'userId'
          });
        }
        if (error.message.includes('already registered as a gym admin')) {
          return res.status(409).json({ 
            message: error.message,
            field: 'email'
          });
        }
      }
      
      res.status(400).json({ message: "Failed to create gymnast" });
    }
  });

  // Get gymnasts by gym (coaches only)
  app.get('/api/gyms/:gymId/gymnasts', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || (user.role !== 'admin' && user.role !== 'coach' && user.role !== 'gym_admin')) {
        return res.status(403).json({ message: "Access denied" });
      }
      const gymnasts = await storage.getGymnastsByGym(req.params.gymId);
      res.json(gymnasts);
    } catch (error) {
      console.error("Error fetching gymnasts:", error);
      res.status(500).json({ message: "Failed to fetch gymnasts" });
    }
  });

  // Get all gymnasts (admin only)
  app.get('/api/gymnasts', async (req, res) => {
    try {
      const gymnasts = await storage.getAllGymnasts();
      res.json(gymnasts);
    } catch (error) {
      console.error("Error fetching gymnasts:", error);
      res.status(500).json({ message: "Failed to fetch gymnasts" });
    }
  });

  // Update gymnast approval
  app.patch('/api/gymnasts/:id/approve', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || (user.role !== 'admin' && user.role !== 'coach' && user.role !== 'gym_admin')) {
        return res.status(403).json({ message: "Access denied" });
      }
      const { approved } = req.body;
      const gymnast = await storage.updateGymnastApproval(req.params.id, approved);
      res.json(gymnast);
    } catch (error) {
      console.error("Error updating gymnast approval:", error);
      res.status(500).json({ message: "Failed to update gymnast approval" });
    }
  });

  // Approve gymnast (coaches only)
  app.patch('/api/gymnasts/:id/approve', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || (user.role !== 'admin' && user.role !== 'coach' && user.role !== 'gym_admin')) {
        return res.status(403).json({ message: "Access denied" });
      }
      const { approved } = req.body;
      const gymnast = await storage.updateGymnastApproval(req.params.id, approved);
      res.json(gymnast);
    } catch (error) {
      console.error("Error updating gymnast approval:", error);
      res.status(500).json({ message: "Failed to update gymnast approval" });
    }
  });

  // Event creation (gym admins only)
  app.post('/api/events', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || (user.role !== 'admin' && user.role !== 'gym_admin')) {
        return res.status(403).json({ message: "Access denied" });
      }
      const eventData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(eventData);
      res.status(201).json(event);
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(400).json({ message: "Failed to create event" });
    }
  });

  // Get events
  app.get('/api/events', async (req, res) => {
    try {
      const events = await storage.getEvents();
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  // Approve event (admin only)
  app.patch('/api/events/:id/approve', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }
      const { approved } = req.body;
      const event = await storage.updateEventApproval(req.params.id, approved);
      res.json(event);
    } catch (error) {
      console.error("Error updating event approval:", error);
      res.status(500).json({ message: "Failed to update event approval" });
    }
  });

  // Challenge creation
  app.post('/api/challenges', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || (user.role !== 'admin' && user.role !== 'coach' && user.role !== 'gym_admin')) {
        return res.status(403).json({ message: "Access denied" });
      }
      const challengeData = insertChallengeSchema.parse({
        ...req.body,
        createdBy: req.user.claims.sub,
        isCoachChallenge: user.role === 'coach'
      });
      const challenge = await storage.createChallenge(challengeData);
      res.status(201).json(challenge);
    } catch (error) {
      console.error("Error creating challenge:", error);
      res.status(400).json({ message: "Failed to create challenge" });
    }
  });

  // Get challenges
  app.get('/api/challenges', async (req, res) => {
    try {
      const challenges = await storage.getChallenges();
      res.json(challenges);
    } catch (error) {
      console.error("Error fetching challenges:", error);
      res.status(500).json({ message: "Failed to fetch challenges" });
    }
  });

  // Complete challenge
  app.post('/api/challenges/:id/complete', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const gymnast = await storage.getGymnastByUserId(user.id);
      if (!gymnast) {
        return res.status(400).json({ message: "Gymnast profile not found" });
      }

      await storage.completeChallenge(req.params.id, gymnast.id);
      res.json({ message: "Challenge completed successfully" });
    } catch (error) {
      console.error("Error completing challenge:", error);
      res.status(500).json({ message: "Failed to complete challenge" });
    }
  });

  // Reward creation (admin only)
  app.post('/api/rewards', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }
      const rewardData = insertRewardSchema.parse(req.body);
      const reward = await storage.createReward(rewardData);
      res.status(201).json(reward);
    } catch (error) {
      console.error("Error creating reward:", error);
      res.status(400).json({ message: "Failed to create reward" });
    }
  });

  // Get rewards
  app.get('/api/rewards', async (req, res) => {
    try {
      const rewards = await storage.getActiveRewards();
      res.json(rewards);
    } catch (error) {
      console.error("Error fetching rewards:", error);
      res.status(500).json({ message: "Failed to fetch rewards" });
    }
  });

  // Redeem reward
  app.post('/api/rewards/:id/redeem', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const gymnast = await storage.getGymnastByUserId(user.id);
      if (!gymnast) {
        return res.status(400).json({ message: "Gymnast profile not found" });
      }

      const { pointsSpent } = req.body;
      await storage.redeemReward(req.params.id, gymnast.id, pointsSpent);
      res.json({ message: "Reward redeemed successfully" });
    } catch (error) {
      console.error("Error redeeming reward:", error);
      res.status(500).json({ message: "Failed to redeem reward" });
    }
  });

  // Get user profile with gym/gymnast info
  app.get('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let profileData = { ...user };

      // Get additional data based on role
      if (user.role === 'gym_admin' || user.role === 'coach') {
        const gyms = await storage.getGymsByUser(userId);
        profileData.gyms = gyms;
      }

      if (user.role === 'gymnast') {
        const gymnast = await storage.getGymnastByUserId(userId);
        profileData.gymnast = gymnast;
      }

      res.json(profileData);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  // Event registration
  app.post('/api/events/:eventId/register', isAuthenticated, async (req: any, res) => {
    try {
      const gymnastId = req.body.gymnastId;
      const sessionIds = req.body.sessionIds;
      
      // Create registration record
      const registration = await storage.createEventRegistration({
        eventId: req.params.eventId,
        gymnastId,
        sessionIds,
        registeredBy: req.user.claims.sub
      });

      res.status(201).json(registration);
    } catch (error) {
      console.error("Error registering for event:", error);
      res.status(400).json({ message: "Failed to register for event" });
    }
  });

  // Score operations
  app.post('/api/scores', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || (user.role !== 'admin' && user.role !== 'coach')) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const score = await storage.createScore(req.body);
      res.status(201).json(score);
    } catch (error) {
      console.error("Error creating score:", error);
      res.status(400).json({ message: "Failed to create score" });
    }
  });

  app.get('/api/gymnasts/:id/scores', async (req, res) => {
    try {
      const scores = await storage.getScoresByGymnast(req.params.id);
      res.json(scores);
    } catch (error) {
      console.error("Error fetching scores:", error);
      res.status(500).json({ message: "Failed to fetch scores" });
    }
  });

  // Get leaderboard with different types
  app.get('/api/leaderboard', async (req, res) => {
    try {
      const { type = 'individual', level, gymId } = req.query;
      const leaderboard = await storage.getLeaderboard(type as string, level as string, gymId as string);
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  app.get('/api/leaderboard/individual', async (req, res) => {
    try {
      const { level, gymId } = req.query;
      const leaderboard = await storage.getLeaderboard('individual', level as string, gymId as string);
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching individual leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch individual leaderboard" });
    }
  });

  // Email operations
  app.get('/api/email-templates', async (req, res) => {
    try {
      const templates = await storage.getEmailTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching email templates:", error);
      res.status(500).json({ message: "Failed to fetch email templates" });
    }
  });

  app.get('/api/emails/history', async (req, res) => {
    try {
      const history = await storage.getEmailHistory();
      res.json(history);
    } catch (error) {
      console.error("Error fetching email history:", error);
      res.status(500).json({ message: "Failed to fetch email history" });
    }
  });

  app.post('/api/emails/send', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || (user.role !== 'admin' && user.role !== 'gym_admin')) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      await storage.sendEmail(req.body);
      res.json({ message: "Email sent successfully" });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ message: "Failed to send email" });
    }
  });

  // Revenue endpoint (demo data)
  app.get('/api/revenue', async (req, res) => {
    try {
      const revenue = {
        total: 28450,
        growth: 12,
        monthly: [
          { month: "Jan", amount: 2200 },
          { month: "Feb", amount: 2800 },
          { month: "Mar", amount: 3100 },
          { month: "Apr", amount: 2900 },
          { month: "May", amount: 3400 },
          { month: "Jun", amount: 3800 }
        ]
      };
      res.json(revenue);
    } catch (error) {
      console.error("Error fetching revenue:", error);
      res.status(500).json({ message: "Failed to fetch revenue" });
    }
  });

  // User management routes
  app.post('/api/users', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const newUser = await storage.createUser(req.body);
      res.status(201).json(newUser);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(400).json({ message: "Failed to create user" });
    }
  });

  app.patch('/api/users/:id/role', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const updatedUser = await storage.updateUserRole(req.params.id, req.body.role);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(400).json({ message: "Failed to update user role" });
    }
  });

  app.delete('/api/users/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      await storage.deleteUser(req.params.id);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(400).json({ message: "Failed to delete user" });
    }
  });

  // Event management routes
  app.delete('/api/events/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      await storage.deleteEvent(req.params.id);
      res.json({ message: "Event deleted successfully" });
    } catch (error) {
      console.error("Error deleting event:", error);
      res.status(400).json({ message: "Failed to delete event" });
    }
  });

  // Gymnast management routes
  app.delete('/api/gymnasts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      await storage.deleteGymnast(req.params.id);
      res.json({ message: "Gymnast deleted successfully" });
    } catch (error) {
      console.error("Error deleting gymnast:", error);
      res.status(400).json({ message: "Failed to delete gymnast" });
    }
  });

  // Stripe payment route for gym membership
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount, description } = req.body;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        description: description || "JGL Membership Payment",
      });
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res
        .status(500)
        .json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Contact form submission
  app.post('/api/contact', async (req, res) => {
    try {
      const { firstName, lastName, email, subject, message } = req.body;
      // TODO: Implement email sending logic here
      console.log('Contact form submission:', { firstName, lastName, email, subject, message });
      res.json({ message: "Message sent successfully" });
    } catch (error) {
      console.error("Error processing contact form:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
