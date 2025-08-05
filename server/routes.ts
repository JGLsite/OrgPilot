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
      
      // Find first user and make them admin
      const users = await storage.getAllUsers();
      if (users.length === 0) {
        return res.status(400).json({ message: "No users found. Please log in first." });
      }
      
      const firstUser = users[0];
      if (firstUser.role === 'admin') {
        return res.json({ message: "Admin already exists", user: firstUser });
      }
      
      const adminUser = await storage.updateUserRole(firstUser.id, 'admin');
      res.json({ message: "Admin role assigned", user: adminUser });
    } catch (error) {
      console.error("Error bootstrapping admin:", error);
      res.status(500).json({ message: "Failed to bootstrap admin" });
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
      res.status(400).json({ message: "Failed to create gym" });
    }
  });

  // Get gyms (admin only)
  app.get('/api/gyms', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }
      const gyms = await storage.getGyms();
      res.json(gyms);
    } catch (error) {
      console.error("Error fetching gyms:", error);
      res.status(500).json({ message: "Failed to fetch gyms" });
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
      const gymnastData = insertGymnastSchema.parse(req.body);
      const gymnast = await storage.createGymnast({
        ...gymnastData,
        userId: req.user.claims.sub
      });
      res.status(201).json(gymnast);
    } catch (error) {
      console.error("Error creating gymnast:", error);
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

  // Get leaderboard
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
