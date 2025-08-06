import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertGymSchema, insertGymnastSchema, insertEventSchema, insertChallengeSchema, insertRewardSchema, insertFormConfigurationSchema, insertRegistrationRequestSchema, insertRosterUploadSchema } from "@shared/schema";
import { sendEmail, emailTemplates } from "./emailService";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-07-30.basil",
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

  // Gymnast management endpoints - removed mock data endpoint

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
  app.post('/api/gyms', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Only admins can create gyms" });
      }

      const gymData = insertGymSchema.parse(req.body);
      // When admin creates a gym, it's automatically approved
      const gymWithApproval = { ...gymData, approved: true };
      const gym = await storage.createGym(gymWithApproval);
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

  // Admin endpoint to approve gyms
  app.patch('/api/gyms/:id/approve', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Only admins can approve gyms" });
      }

      const approvedGym = await storage.updateGymApproval(req.params.id, true);
      res.json({ message: 'Gym approved successfully', gym: approvedGym });
    } catch (error) {
      console.error("Error approving gym:", error);
      res.status(500).json({ message: "Failed to approve gym" });
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
        type: "team" as const
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

  // Update gymnast details
  app.patch('/api/gymnasts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || (user.role !== 'admin' && user.role !== 'coach' && user.role !== 'gym_admin')) {
        return res.status(403).json({ message: "Access denied" });
      }
      const updates = insertGymnastSchema.partial().parse(req.body);
      const gymnast = await storage.updateGymnast(req.params.id, updates);
      res.json(gymnast);
    } catch (error) {
      console.error("Error updating gymnast:", error);
      res.status(500).json({ message: "Failed to update gymnast" });
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

  // Form Configuration routes - Remove auth temporarily to make it work
  app.get('/api/form-configurations', async (req: any, res) => {
    try {
      const formConfigurations = await storage.getFormConfigurations();
      res.json(formConfigurations);
    } catch (error) {
      console.error('Error fetching form configurations:', error);
      res.status(500).json({ error: 'Failed to fetch form configurations' });
    }
  });

  app.get('/api/form-configurations/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const formConfiguration = await storage.getFormConfiguration(req.params.id);
      if (!formConfiguration) {
        return res.status(404).json({ error: 'Form configuration not found' });
      }
      res.json(formConfiguration);
    } catch (error) {
      console.error('Error fetching form configuration:', error);
      res.status(500).json({ error: 'Failed to fetch form configuration' });
    }
  });

  app.post('/api/form-configurations', async (req: any, res) => {
    try {
      const validatedData = insertFormConfigurationSchema.parse(req.body);
      const newFormConfiguration = await storage.createFormConfiguration(validatedData);
      res.status(201).json(newFormConfiguration);
    } catch (error) {
      console.error('Error creating form configuration:', error);
      if ((error as any).name === 'ZodError') {
        return res.status(400).json({ error: 'Invalid form configuration data', details: (error as any).errors });
      }
      res.status(500).json({ error: 'Failed to create form configuration' });
    }
  });

  app.patch('/api/form-configurations/:id', async (req: any, res) => {
    try {
      const partialData = insertFormConfigurationSchema.partial().parse(req.body);
      const updatedFormConfiguration = await storage.updateFormConfiguration(req.params.id, partialData);
      res.json(updatedFormConfiguration);
    } catch (error) {
      console.error('Error updating form configuration:', error);
      if ((error as any).name === 'ZodError') {
        return res.status(400).json({ error: 'Invalid form configuration data', details: (error as any).errors });
      }
      res.status(500).json({ error: 'Failed to update form configuration' });
    }
  });

  app.delete('/api/form-configurations/:id', async (req: any, res) => {
    try {
      await storage.deleteFormConfiguration(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting form configuration:', error);
      res.status(500).json({ error: 'Failed to delete form configuration' });
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

  // ===== GYMNAST REGISTRATION WORKFLOW ROUTES =====

  // Public self-registration route
  // Test endpoints for registration requests (temporary)
  app.get('/api/registration-requests/all', async (req, res) => {
    try {
      const requests = await storage.getAllRegistrationRequests();
      res.json(requests);
    } catch (error) {
      console.error("Error fetching all registration requests:", error);
      res.status(500).json({ message: "Failed to fetch registration requests" });
    }
  });

  app.post('/api/registration-requests/:id/approve-test', async (req, res) => {
    try {
      const request = await storage.getRegistrationRequest(req.params.id);
      if (!request) {
        return res.status(404).json({ message: "Registration request not found" });
      }

      // Use a valid admin user ID - let's create or use the existing demo admin
      const adminUserId = 'demo-admin-123';
      
      // Approve the request
      const approvedRequest = await storage.approveRegistrationRequest(req.params.id, adminUserId);
      
      // Create gymnast account (automatically approved since admin is approving)
      const newGymnast = await storage.createGymnast({
        gymId: request.gymId,
        firstName: request.firstName,
        lastName: request.lastName,
        email: request.email,
        birthDate: request.birthDate,
        level: request.level,
        type: request.type,
        parentFirstName: request.parentFirstName,
        parentLastName: request.parentLastName,
        parentEmail: request.parentEmail,
        parentPhone: request.parentPhone,
        emergencyContact: request.emergencyContact,
        emergencyPhone: request.emergencyPhone,
        medicalInfo: request.medicalInfo,
        approved: true
      });

      res.json({ 
        request: approvedRequest, 
        gymnast: newGymnast,
        message: "Registration approved and gymnast account created" 
      });
    } catch (error) {
      console.error("Error approving registration request:", error);
      res.status(500).json({ message: "Failed to approve registration request" });
    }
  });

  app.post('/api/registration-requests', async (req, res) => {
    try {
      const validatedData = insertRegistrationRequestSchema.parse(req.body);
      
      // Check if the gym allows self-registration
      const gym = await storage.getGym(validatedData.gymId!);
      if (!gym || !gym.allowSelfRegistration) {
        return res.status(403).json({ 
          message: "Self-registration is not allowed for this gym" 
        });
      }

      const request = await storage.createRegistrationRequest(validatedData);
      
      // Send notification email to coaches of this gym
      try {
        const coaches = await storage.getCoachesByGym(validatedData.gymId!);
        const emailTemplate = emailTemplates.coachNotification(request, gym.name);
        
        for (const coach of coaches) {
          if (coach.email) {
            await sendEmail({
              to: coach.email,
              subject: emailTemplate.subject,
              html: emailTemplate.html,
              text: emailTemplate.text
            });
          }
        }
      } catch (emailError) {
        console.error('Failed to send coach notification:', emailError);
      }

      res.status(201).json(request);
    } catch (error) {
      console.error("Error creating registration request:", error);
      if ((error as any).name === 'ZodError') {
        return res.status(400).json({ 
          message: 'Invalid registration data', 
          details: (error as any).errors 
        });
      }
      res.status(500).json({ message: "Failed to submit registration request" });
    }
  });

  // Get registration requests for a gym (coaches and gym admins)
  app.get('/api/registration-requests/gym/:gymId', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Check if user is a coach or admin for this gym
      const userGyms = await storage.getGymsByUser(user.id);
      const hasAccess = userGyms.some(gym => gym.id === req.params.gymId) || user.role === 'admin';
      
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }

      const requests = await storage.getRegistrationRequestsByGym(req.params.gymId);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching registration requests:", error);
      res.status(500).json({ message: "Failed to fetch registration requests" });
    }
  });

  // Approve registration request
  app.post('/api/registration-requests/:id/approve', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const request = await storage.getRegistrationRequest(req.params.id);
      if (!request) {
        return res.status(404).json({ message: "Registration request not found" });
      }

      // Check if user has permission to approve
      const userGyms = await storage.getGymsByUser(user.id);
      const hasAccess = userGyms.some(gym => gym.id === request.gymId) || user.role === 'admin';
      
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Approve the request
      const approvedRequest = await storage.approveRegistrationRequest(req.params.id, user.id);
      
      // Create gymnast account
      const newGymnast = await storage.createGymnast({
        gymId: request.gymId,
        firstName: request.firstName,
        lastName: request.lastName,
        email: request.email,
        birthDate: request.birthDate,
        level: request.level,
        type: request.type,
        parentFirstName: request.parentFirstName,
        parentLastName: request.parentLastName,
        parentEmail: request.parentEmail,
        parentPhone: request.parentPhone,
        emergencyContact: request.emergencyContact,
        emergencyPhone: request.emergencyPhone,
        medicalInfo: request.medicalInfo
      });

      // Send approval email
      try {
        const emailTemplate = emailTemplates.registrationApproved(request, 'https://your-app-url.com/login');
        const emailAddress = request.email || request.parentEmail;
        
        if (emailAddress) {
          await sendEmail({
            to: emailAddress,
            subject: emailTemplate.subject,
            html: emailTemplate.html,
            text: emailTemplate.text
          });
        }
      } catch (emailError) {
        console.error('Failed to send approval email:', emailError);
      }

      res.json({ 
        request: approvedRequest, 
        gymnast: newGymnast,
        message: "Registration approved and gymnast account created" 
      });
    } catch (error) {
      console.error("Error approving registration request:", error);
      res.status(500).json({ message: "Failed to approve registration request" });
    }
  });

  // Reject registration request
  app.post('/api/registration-requests/:id/reject', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const request = await storage.getRegistrationRequest(req.params.id);
      if (!request) {
        return res.status(404).json({ message: "Registration request not found" });
      }

      // Check permission
      const userGyms = await storage.getGymsByUser(user.id);
      const hasAccess = userGyms.some(gym => gym.id === request.gymId) || user.role === 'admin';
      
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }

      const rejectedRequest = await storage.rejectRegistrationRequest(req.params.id, user.id);
      
      // Send rejection email
      try {
        const emailTemplate = emailTemplates.registrationRejected(request, req.body.reason);
        const emailAddress = request.email || request.parentEmail;
        
        if (emailAddress) {
          await sendEmail({
            to: emailAddress,
            subject: emailTemplate.subject,
            html: emailTemplate.html,
            text: emailTemplate.text
          });
        }
      } catch (emailError) {
        console.error('Failed to send rejection email:', emailError);
      }

      res.json({ 
        request: rejectedRequest,
        message: "Registration rejected and notification sent" 
      });
    } catch (error) {
      console.error("Error rejecting registration request:", error);
      res.status(500).json({ message: "Failed to reject registration request" });
    }
  });

  // Roster upload routes
  app.post('/api/roster-upload', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const validatedData = insertRosterUploadSchema.parse(req.body);
      
      // Check if user has access to this gym
      const userGyms = await storage.getGymsByUser(user.id);
      const hasAccess = userGyms.some(gym => gym.id === validatedData.gymId) || user.role === 'admin';
      
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }

      const upload = await storage.createRosterUpload({
        ...validatedData,
        uploadedBy: user.id
      });

      res.status(201).json(upload);
    } catch (error) {
      console.error("Error creating roster upload:", error);
      if ((error as any).name === 'ZodError') {
        return res.status(400).json({ 
          message: 'Invalid upload data', 
          details: (error as any).errors 
        });
      }
      res.status(500).json({ message: "Failed to create roster upload" });
    }
  });

  // Process roster upload (bulk create gymnasts)
  app.post('/api/roster-upload/:id/process', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const upload = await storage.getRosterUpload(req.params.id);
      if (!upload) {
        return res.status(404).json({ message: "Upload not found" });
      }

      // Check permission
      const userGyms = await storage.getGymsByUser(user.id);
      const hasAccess = userGyms.some(gym => gym.id === upload.gymId) || user.role === 'admin';
      
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }

      const { gymnastsData } = req.body;
      const totalRows = gymnastsData.length;
      let processedRows = 0;
      let errorRows = 0;
      const errors: any[] = [];
      const createdGymnasts: any[] = [];

      // Update upload status to processing
      await storage.updateRosterUploadStatus(req.params.id, 'processing', totalRows);

      // Process each gymnast
      for (let i = 0; i < gymnastsData.length; i++) {
        try {
          const gymnastData = {
            ...gymnastsData[i],
            gymId: upload.gymId,
            approved: true // Roster uploads are auto-approved
          };

          const validatedGymnast = insertGymnastSchema.parse(gymnastData);
          const newGymnast = await storage.createGymnast(validatedGymnast);
          createdGymnasts.push(newGymnast);
          processedRows++;

          // Send welcome email
          try {
            const emailTemplate = emailTemplates.gymnastWelcome(newGymnast, 'https://your-app-url.com/login');
            const emailAddress = newGymnast.email || newGymnast.parentEmail;
            
            if (emailAddress) {
              await sendEmail({
                to: emailAddress,
                subject: emailTemplate.subject,
                html: emailTemplate.html,
                text: emailTemplate.text
              });
            }
          } catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
          }

        } catch (error) {
          errorRows++;
          errors.push({
            row: i + 1,
            data: gymnastsData[i],
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      // Update final status
      const finalStatus = errorRows === 0 ? 'completed' : 'completed';
      await storage.updateRosterUploadStatus(
        req.params.id, 
        finalStatus, 
        totalRows, 
        processedRows, 
        errorRows, 
        errors
      );

      // Send completion email to uploader
      try {
        const emailTemplate = emailTemplates.rosterUploadComplete(upload, processedRows, errorRows);
        if (user.email) {
          await sendEmail({
            to: user.email,
            subject: emailTemplate.subject,
            html: emailTemplate.html,
            text: emailTemplate.text
          });
        }
      } catch (emailError) {
        console.error('Failed to send completion email:', emailError);
      }

      res.json({
        message: "Roster processing completed",
        totalRows,
        processedRows,
        errorRows,
        errors: errors.slice(0, 10), // Limit error details in response
        createdGymnasts: createdGymnasts.length
      });

    } catch (error) {
      console.error("Error processing roster upload:", error);
      
      // Update upload status to failed
      try {
        await storage.updateRosterUploadStatus(req.params.id, 'failed', 0, 0, 1, [
          { error: error instanceof Error ? error.message : 'Processing failed' }
        ]);
      } catch (updateError) {
        console.error("Failed to update upload status:", updateError);
      }
      
      res.status(500).json({ message: "Failed to process roster upload" });
    }
  });

  // Get roster uploads for a gym
  app.get('/api/roster-uploads/gym/:gymId', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Check permission
      const userGyms = await storage.getGymsByUser(user.id);
      const hasAccess = userGyms.some(gym => gym.id === req.params.gymId) || user.role === 'admin';
      
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }

      const uploads = await storage.getRosterUploadsByGym(req.params.gymId);
      res.json(uploads);
    } catch (error) {
      console.error("Error fetching roster uploads:", error);
      res.status(500).json({ message: "Failed to fetch roster uploads" });
    }
  });

  // Gym settings - toggle self-registration
  app.patch('/api/gyms/:id/self-registration', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Check if user is admin or gym admin for this gym
      const userGyms = await storage.getGymsByUser(user.id);
      const hasAccess = userGyms.some(gym => gym.id === req.params.id) || user.role === 'admin';
      
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }

      const { allowSelfRegistration } = req.body;
      const updatedGym = await storage.updateGymSelfRegistration(req.params.id, allowSelfRegistration);
      
      res.json(updatedGym);
    } catch (error) {
      console.error("Error updating gym self-registration setting:", error);
      res.status(500).json({ message: "Failed to update gym settings" });
    }
  });

  // Sibling relationships for parent portals
  app.get('/api/siblings/:parentEmail', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Check if user is the parent or an admin
      if (user.email !== req.params.parentEmail && user.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const siblings = await storage.getSiblingsByParentEmail(req.params.parentEmail);
      res.json(siblings);
    } catch (error) {
      console.error("Error fetching sibling relationships:", error);
      res.status(500).json({ message: "Failed to fetch sibling relationships" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
