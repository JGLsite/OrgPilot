import {
  users,
  gyms,
  gymnasts,
  events,
  eventSessions,
  eventRegistrations,
  scores,
  challenges,
  challengeCompletions,
  rewards,
  rewardRedemptions,
  spectatorTickets,
  gymCoaches,
  gymEventEstimates,
  type User,
  type UpsertUser,
  type Gym,
  type InsertGym,
  type Gymnast,
  type InsertGymnast,
  type Event,
  type InsertEvent,
  type Challenge,
  type InsertChallenge,
  type Reward,
  type InsertReward,
  type Score,
  type EventSession,
  type EventRegistration,
  type SpectatorTicket,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  
  // Gym operations
  createGym(gym: InsertGym): Promise<Gym>;
  getGym(id: string): Promise<Gym | undefined>;
  getGyms(): Promise<Gym[]>;
  deleteGym(id: string): Promise<void>;
  updateGymApproval(id: string, approved: boolean): Promise<Gym>;
  updateGymPayment(id: string, paid: boolean): Promise<Gym>;
  getGymByEmail(email: string): Promise<Gym | undefined>;
  
  // Gymnast operations
  createGymnast(gymnast: InsertGymnast): Promise<Gymnast>;
  getGymnast(id: string): Promise<Gymnast | undefined>;
  getGymnastsByGym(gymId: string): Promise<Gymnast[]>;
  updateGymnastApproval(id: string, approved: boolean): Promise<Gymnast>;
  updateGymnastPoints(id: string, points: number): Promise<Gymnast>;
  
  // Event operations
  createEvent(event: InsertEvent): Promise<Event>;
  getEvent(id: string): Promise<Event | undefined>;
  getEvents(): Promise<Event[]>;
  updateEventApproval(id: string, approved: boolean): Promise<Event>;
  
  // Challenge operations
  createChallenge(challenge: InsertChallenge): Promise<Challenge>;
  getChallenges(): Promise<Challenge[]>;
  getActiveChallengesForLevel(level: string): Promise<Challenge[]>;
  
  // Reward operations
  createReward(reward: InsertReward): Promise<Reward>;
  getActiveRewards(): Promise<Reward[]>;
  
  // Coach operations
  addCoachToGym(gymId: string, userId: string, isAdmin: boolean): Promise<void>;
  getCoachesByGym(gymId: string): Promise<User[]>;
  
  // Score operations
  getScoresByGymnast(gymnastId: string): Promise<Score[]>;
  
  // Additional operations for profile and registration
  getGymsByUser(userId: string): Promise<Gym[]>;
  getGymnastByUserId(userId: string): Promise<Gymnast | undefined>;
  createEventRegistration(registration: any): Promise<EventRegistration>;
  getLeaderboard(type: string, level?: string, gymId?: string): Promise<any[]>;
  
  // Other operations as needed
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // Check if creating a new user (no existing user with this email)
    if (userData.email) {
      const existingUser = await this.getUserByEmail(userData.email);
      if (!existingUser) {
        // Check if this email is already used by a gym admin
        const existingGym = await this.getGymByEmail(userData.email);
        if (existingGym) {
          throw new Error(`This email is already registered as a gym admin. Please use a different email or contact support.`);
        }
      }
    }
    
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.email,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserRole(userId: string, role: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ role: role as any, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  // Gym operations
  async createGym(gym: InsertGym): Promise<Gym> {
    // Check if a gym with this email already exists
    const existingGym = await this.getGymByEmail(gym.email);
    if (existingGym) {
      throw new Error(`A gym admin account with email ${gym.email} already exists`);
    }
    
    // Check if a user with this email already exists
    const existingUser = await this.getUserByEmail(gym.email);
    if (existingUser) {
      throw new Error(`An account with email ${gym.email} already exists`);
    }
    
    const [newGym] = await db.insert(gyms).values(gym).returning();
    return newGym;
  }

  async getGym(id: string): Promise<Gym | undefined> {
    const [gym] = await db.select().from(gyms).where(eq(gyms.id, id));
    return gym;
  }

  async getGyms(): Promise<Gym[]> {
    return db.select().from(gyms).orderBy(asc(gyms.name));
  }

  async updateGymApproval(id: string, approved: boolean): Promise<Gym> {
    const [gym] = await db
      .update(gyms)
      .set({ approved, updatedAt: new Date() })
      .where(eq(gyms.id, id))
      .returning();
    return gym;
  }

  async updateGymPayment(id: string, paid: boolean): Promise<Gym> {
    const [gym] = await db
      .update(gyms)
      .set({ membershipPaid: paid, updatedAt: new Date() })
      .where(eq(gyms.id, id))
      .returning();
    return gym;
  }

  async deleteGym(id: string): Promise<void> {
    await db.delete(gyms).where(eq(gyms.id, id));
  }

  async getGymByEmail(email: string): Promise<Gym | undefined> {
    const [gym] = await db.select().from(gyms).where(eq(gyms.email, email));
    return gym;
  }

  // Gymnast operations
  async createGymnast(gymnast: InsertGymnast): Promise<Gymnast> {
    // If gymnast has a userId, check if that user already has a gymnast account
    if (gymnast.userId) {
      const existingGymnast = await this.getGymnastByUserId(gymnast.userId);
      if (existingGymnast) {
        throw new Error(`This user already has a gymnast account`);
      }
      
      // Get the user to check their email
      const user = await this.getUser(gymnast.userId);
      if (user?.email) {
        // Check if any gym admin has this email
        const existingGym = await this.getGymByEmail(user.email);
        if (existingGym) {
          throw new Error(`An account with email ${user.email} is already registered as a gym admin`);
        }
      }
    }
    
    const [newGymnast] = await db.insert(gymnasts).values(gymnast).returning();
    return newGymnast;
  }

  async getGymnast(id: string): Promise<Gymnast | undefined> {
    const [gymnast] = await db.select().from(gymnasts).where(eq(gymnasts.id, id));
    return gymnast;
  }

  async getGymnastsByGym(gymId: string): Promise<Gymnast[]> {
    return db.select().from(gymnasts).where(eq(gymnasts.gymId, gymId)).orderBy(asc(gymnasts.lastName));
  }

  async updateGymnastApproval(id: string, approved: boolean): Promise<Gymnast> {
    const [gymnast] = await db
      .update(gymnasts)
      .set({ approved, updatedAt: new Date() })
      .where(eq(gymnasts.id, id))
      .returning();
    return gymnast;
  }

  async updateGymnastPoints(id: string, points: number): Promise<Gymnast> {
    const [gymnast] = await db
      .update(gymnasts)
      .set({ points, updatedAt: new Date() })
      .where(eq(gymnasts.id, id))
      .returning();
    return gymnast;
  }

  // Event operations
  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db.insert(events).values(event).returning();
    return newEvent;
  }

  async getEvent(id: string): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event;
  }

  async getEvents(): Promise<Event[]> {
    return db.select().from(events).orderBy(desc(events.date));
  }

  async updateEventApproval(id: string, approved: boolean): Promise<Event> {
    const [event] = await db
      .update(events)
      .set({ approved, updatedAt: new Date() })
      .where(eq(events.id, id))
      .returning();
    return event;
  }

  // Challenge operations
  async createChallenge(challenge: InsertChallenge): Promise<Challenge> {
    const [newChallenge] = await db.insert(challenges).values(challenge).returning();
    return newChallenge;
  }

  async getChallenges(): Promise<Challenge[]> {
    return db.select().from(challenges).orderBy(desc(challenges.createdAt));
  }

  async getActiveChallengesForLevel(level: string): Promise<Challenge[]> {
    return db.select().from(challenges)
      .where(eq(challenges.active, true))
      .orderBy(desc(challenges.createdAt));
  }

  // Reward operations
  async createReward(reward: InsertReward): Promise<Reward> {
    const [newReward] = await db.insert(rewards).values(reward).returning();
    return newReward;
  }

  async getActiveRewards(): Promise<Reward[]> {
    return db.select().from(rewards)
      .where(eq(rewards.active, true))
      .orderBy(asc(rewards.pointsCost));
  }

  // Coach operations
  async addCoachToGym(gymId: string, userId: string, isAdmin: boolean): Promise<void> {
    await db.insert(gymCoaches).values({ gymId, userId, isAdmin });
  }

  async getCoachesByGym(gymId: string): Promise<User[]> {
    const coaches = await db
      .select({ 
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        role: users.role,
        stripeCustomerId: users.stripeCustomerId,
        stripeSubscriptionId: users.stripeSubscriptionId,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt
      })
      .from(gymCoaches)
      .innerJoin(users, eq(gymCoaches.userId, users.id))
      .where(eq(gymCoaches.gymId, gymId));
    
    return coaches;
  }

  // Score operations
  async getScoresByGymnast(gymnastId: string): Promise<Score[]> {
    return db.select().from(scores).where(eq(scores.gymnastId, gymnastId)).orderBy(desc(scores.createdAt));
  }

  // Additional operations for profile and registration
  async getGymsByUser(userId: string): Promise<Gym[]> {
    const userGyms = await db
      .select({
        id: gyms.id,
        name: gyms.name,
        city: gyms.city,
        email: gyms.email,
        adminFirstName: gyms.adminFirstName,
        adminLastName: gyms.adminLastName,
        website: gyms.website,
        approved: gyms.approved,
        membershipPaid: gyms.membershipPaid,
        allowSelfRegistration: gyms.allowSelfRegistration,
        createdAt: gyms.createdAt,
        updatedAt: gyms.updatedAt
      })
      .from(gymCoaches)
      .innerJoin(gyms, eq(gymCoaches.gymId, gyms.id))
      .where(eq(gymCoaches.userId, userId));
    
    return userGyms;
  }

  async getGymnastByUserId(userId: string): Promise<Gymnast | undefined> {
    const [gymnast] = await db.select().from(gymnasts).where(eq(gymnasts.userId, userId));
    return gymnast;
  }

  async createEventRegistration(registration: any): Promise<EventRegistration> {
    const [newRegistration] = await db.insert(eventRegistrations).values(registration).returning();
    return newRegistration;
  }

  async getLeaderboard(type: string, level?: string, gymId?: string): Promise<any[]> {
    // For simplicity, return top gymnasts by points
    let query = db.select({
      id: gymnasts.id,
      firstName: gymnasts.firstName,
      lastName: gymnasts.lastName,
      level: gymnasts.level,
      points: gymnasts.points,
      gymId: gymnasts.gymId
    }).from(gymnasts);

    const conditions = [];
    if (level) {
      conditions.push(eq(gymnasts.level, level as any));
    }
    
    if (gymId) {
      conditions.push(eq(gymnasts.gymId, gymId));
    }

    if (conditions.length > 0) {
      query = query.where(conditions.length === 1 ? conditions[0] : and(...conditions));
    }

    return query.orderBy(desc(gymnasts.points)).limit(50);
  }
}


export const storage = new DatabaseStorage();
