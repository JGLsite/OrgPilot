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
  formConfigurations,
  registrationRequests,
  siblingRelationships,
  rosterUploads,
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
  type FormConfiguration,
  type InsertFormConfiguration,
  type RegistrationRequest,
  type InsertRegistrationRequest,
  type SiblingRelationship,
  type InsertSiblingRelationship,
  type RosterUpload,
  type InsertRosterUpload,
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
  getAllUsers(): Promise<User[]>;
  updateUserRole(userId: string, role: string): Promise<User>;
  
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
  getAllGymnasts(): Promise<Gymnast[]>;
  updateGymnastApproval(id: string, approved: boolean): Promise<Gymnast>;
  updateGymnastPoints(id: string, points: number): Promise<Gymnast>;
  
  // Event operations
  createEvent(event: InsertEvent): Promise<Event>;
  getEvent(id: string): Promise<Event | undefined>;
  getEvents(): Promise<Event[]>;
  updateEventApproval(id: string, approved: boolean): Promise<Event>;
  createEventSession(session: any): Promise<EventSession>;
  getEventSessions(eventId: string): Promise<EventSession[]>;
  
  // Challenge operations
  createChallenge(challenge: InsertChallenge): Promise<Challenge>;
  getChallenges(): Promise<Challenge[]>;
  getActiveChallengesForLevel(level: string): Promise<Challenge[]>;
  completeChallenge(challengeId: string, gymnastId: string): Promise<void>;
  
  // Reward operations
  createReward(reward: InsertReward): Promise<Reward>;
  getActiveRewards(): Promise<Reward[]>;
  redeemReward(rewardId: string, gymnastId: string, pointsSpent: number): Promise<void>;
  
  // Coach operations
  addCoachToGym(gymId: string, userId: string, isAdmin: boolean): Promise<void>;
  getCoachesByGym(gymId: string): Promise<User[]>;
  
  // Score operations
  getScoresByGymnast(gymnastId: string): Promise<Score[]>;
  createScore(score: any): Promise<Score>;
  
  // Email operations
  getEmailTemplates(): Promise<any[]>;
  getEmailHistory(): Promise<any[]>;
  sendEmail(emailData: any): Promise<void>;
  
  // Additional operations for profile and registration
  getGymsByUser(userId: string): Promise<Gym[]>;
  getGymnastByUserId(userId: string): Promise<Gymnast | undefined>;
  createEventRegistration(registration: any): Promise<EventRegistration>;
  getLeaderboard(type: string, level?: string, gymId?: string): Promise<any[]>;
  
  // Form configuration operations
  createFormConfiguration(formConfig: InsertFormConfiguration): Promise<FormConfiguration>;
  getFormConfigurations(): Promise<FormConfiguration[]>;
  getFormConfiguration(id: string): Promise<FormConfiguration | undefined>;
  updateFormConfiguration(id: string, updates: Partial<InsertFormConfiguration>): Promise<FormConfiguration>;
  deleteFormConfiguration(id: string): Promise<void>;

  // Registration request operations
  createRegistrationRequest(request: InsertRegistrationRequest): Promise<RegistrationRequest>;
  getRegistrationRequestsByGym(gymId: string): Promise<RegistrationRequest[]>;
  getPendingRegistrationRequests(): Promise<RegistrationRequest[]>;
  getRegistrationRequest(id: string): Promise<RegistrationRequest | undefined>;
  approveRegistrationRequest(id: string, reviewedBy: string): Promise<RegistrationRequest>;
  rejectRegistrationRequest(id: string, reviewedBy: string): Promise<RegistrationRequest>;
  deleteRegistrationRequest(id: string): Promise<void>;

  // Sibling relationship operations
  createSiblingRelationship(relationship: InsertSiblingRelationship): Promise<SiblingRelationship>;
  getSiblingsByParentEmail(parentEmail: string): Promise<SiblingRelationship[]>;
  deleteSiblingRelationship(id: string): Promise<void>;

  // Roster upload operations
  createRosterUpload(upload: InsertRosterUpload): Promise<RosterUpload>;
  getRosterUploadsByGym(gymId: string): Promise<RosterUpload[]>;
  getRosterUpload(id: string): Promise<RosterUpload | undefined>;
  updateRosterUploadStatus(id: string, status: string, totalRows?: number, processedRows?: number, errorRows?: number, errors?: any[]): Promise<RosterUpload>;

  // Gym settings operations
  updateGymSelfRegistration(gymId: string, allowSelfRegistration: boolean): Promise<Gym>;

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
    const validRoles = ['admin', 'gym_admin', 'coach', 'gymnast', 'spectator'] as const;
    const roleValue = validRoles.includes(role as any) ? role as any : 'spectator';
    
    const [user] = await db
      .update(users)
      .set({ role: roleValue, updatedAt: new Date() })
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

  async getAllGymnasts(): Promise<Gymnast[]> {
    return db.select().from(gymnasts).orderBy(asc(gymnasts.lastName));
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



  async deleteUser(userId: string): Promise<void> {
    await db.delete(users).where(eq(users.id, userId));
  }

  async deleteEvent(eventId: string): Promise<void> {
    await db.delete(events).where(eq(events.id, eventId));
  }

  async deleteGymnast(gymnastId: string): Promise<void> {
    await db.delete(gymnasts).where(eq(gymnasts.id, gymnastId));
  }

  // Form Configuration operations
  async createFormConfiguration(formConfig: InsertFormConfiguration): Promise<FormConfiguration> {
    const [newFormConfig] = await db.insert(formConfigurations).values(formConfig).returning();
    return newFormConfig;
  }

  async getFormConfigurations(): Promise<FormConfiguration[]> {
    return db.select().from(formConfigurations).orderBy(asc(formConfigurations.createdAt));
  }

  async getFormConfiguration(id: string): Promise<FormConfiguration | undefined> {
    const [formConfig] = await db.select().from(formConfigurations).where(eq(formConfigurations.id, id));
    return formConfig;
  }

  async updateFormConfiguration(id: string, updates: Partial<InsertFormConfiguration>): Promise<FormConfiguration> {
    const [formConfig] = await db
      .update(formConfigurations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(formConfigurations.id, id))
      .returning();
    return formConfig;
  }

  async deleteFormConfiguration(id: string): Promise<void> {
    await db.delete(formConfigurations).where(eq(formConfigurations.id, id));
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

  async createEventSession(session: any): Promise<EventSession> {
    const [newSession] = await db.insert(eventSessions).values(session).returning();
    return newSession;
  }

  async getEventSessions(eventId: string): Promise<EventSession[]> {
    return db.select().from(eventSessions).where(eq(eventSessions.eventId, eventId));
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

  async completeChallenge(challengeId: string, gymnastId: string): Promise<void> {
    await db.insert(challengeCompletions).values({ challengeId, gymnastId });
    
    // Award points to gymnast
    const [challenge] = await db.select().from(challenges).where(eq(challenges.id, challengeId));
    if (challenge) {
      const [gymnast] = await db.select().from(gymnasts).where(eq(gymnasts.id, gymnastId));
      if (gymnast) {
        await db.update(gymnasts)
          .set({ points: (gymnast.points || 0) + challenge.points })
          .where(eq(gymnasts.id, gymnastId));
      }
    }
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

  async redeemReward(rewardId: string, gymnastId: string, pointsSpent: number): Promise<void> {
    await db.insert(rewardRedemptions).values({ rewardId, gymnastId, pointsSpent });
    
    // Deduct points from gymnast
    const [gymnast] = await db.select().from(gymnasts).where(eq(gymnasts.id, gymnastId));
    if (gymnast) {
      await db.update(gymnasts)
        .set({ points: Math.max(0, (gymnast.points || 0) - pointsSpent) })
        .where(eq(gymnasts.id, gymnastId));
    }
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

  async createScore(score: any): Promise<Score> {
    const [newScore] = await db.insert(scores).values(score).returning();
    return newScore;
  }

  // Email operations
  async getEmailTemplates(): Promise<any[]> {
    // Return demo email templates for now
    return [
      {
        id: "welcome",
        name: "Welcome Email",
        subject: "Welcome to JGL!",
        content: "Welcome to the Jewish Gymnastics League...",
        active: true
      },
      {
        id: "event_reminder",
        name: "Event Reminder",
        subject: "Upcoming Event Reminder",
        content: "Don't forget about the upcoming event...",
        active: true
      }
    ];
  }

  async getEmailHistory(): Promise<any[]> {
    // Return demo email history for now
    return [
      {
        id: "email_1",
        subject: "Welcome to JGL!",
        recipients: ["parent1@example.com", "parent2@example.com"],
        sentAt: "2024-01-15T10:30:00Z",
        status: "delivered",
        template: "welcome"
      },
      {
        id: "email_2",
        subject: "Spring Classic Registration Open",
        recipients: ["all_coaches"],
        sentAt: "2024-01-20T14:00:00Z",
        status: "delivered",
        template: "registration_open"
      }
    ];
  }

  async sendEmail(emailData: any): Promise<void> {
    // TODO: Implement actual email sending with SendGrid
    console.log('Email sent:', emailData);
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

    const results = await query.orderBy(desc(gymnasts.points)).limit(50);
    return results;
  }

  // Registration request operations
  async createRegistrationRequest(request: InsertRegistrationRequest): Promise<RegistrationRequest> {
    const [newRequest] = await db.insert(registrationRequests).values(request).returning();
    return newRequest;
  }

  async getRegistrationRequestsByGym(gymId: string): Promise<RegistrationRequest[]> {
    return db.select().from(registrationRequests)
      .where(eq(registrationRequests.gymId, gymId))
      .orderBy(desc(registrationRequests.createdAt));
  }

  async getPendingRegistrationRequests(): Promise<RegistrationRequest[]> {
    return db.select().from(registrationRequests)
      .where(eq(registrationRequests.status, 'pending'))
      .orderBy(desc(registrationRequests.createdAt));
  }

  async getAllRegistrationRequests(): Promise<any[]> {
    return db.select({
      id: registrationRequests.id,
      gymId: registrationRequests.gymId,
      gymName: gyms.name,
      gymCity: gyms.city,
      firstName: registrationRequests.firstName,
      lastName: registrationRequests.lastName,
      email: registrationRequests.email,
      birthDate: registrationRequests.birthDate,
      level: registrationRequests.level,
      type: registrationRequests.type,
      parentFirstName: registrationRequests.parentFirstName,
      parentLastName: registrationRequests.parentLastName,
      parentEmail: registrationRequests.parentEmail,
      parentPhone: registrationRequests.parentPhone,
      emergencyContact: registrationRequests.emergencyContact,
      emergencyPhone: registrationRequests.emergencyPhone,
      medicalInfo: registrationRequests.medicalInfo,
      status: registrationRequests.status,
      reviewedBy: registrationRequests.reviewedBy,
      reviewedAt: registrationRequests.reviewedAt,
      createdAt: registrationRequests.createdAt,
      updatedAt: registrationRequests.updatedAt
    })
    .from(registrationRequests)
    .leftJoin(gyms, eq(registrationRequests.gymId, gyms.id))
    .orderBy(desc(registrationRequests.createdAt));
  }

  async getRegistrationRequest(id: string): Promise<RegistrationRequest | undefined> {
    const [request] = await db.select().from(registrationRequests).where(eq(registrationRequests.id, id));
    return request;
  }

  async approveRegistrationRequest(id: string, reviewedBy: string): Promise<RegistrationRequest> {
    const [request] = await db
      .update(registrationRequests)
      .set({ 
        status: 'approved', 
        reviewedBy, 
        reviewedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(registrationRequests.id, id))
      .returning();
    return request;
  }

  async rejectRegistrationRequest(id: string, reviewedBy: string): Promise<RegistrationRequest> {
    const [request] = await db
      .update(registrationRequests)
      .set({ 
        status: 'rejected', 
        reviewedBy, 
        reviewedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(registrationRequests.id, id))
      .returning();
    return request;
  }

  async deleteRegistrationRequest(id: string): Promise<void> {
    await db.delete(registrationRequests).where(eq(registrationRequests.id, id));
  }

  // Sibling relationship operations
  async createSiblingRelationship(relationship: InsertSiblingRelationship): Promise<SiblingRelationship> {
    const [newRelationship] = await db.insert(siblingRelationships).values(relationship).returning();
    return newRelationship;
  }

  async getSiblingsByParentEmail(parentEmail: string): Promise<SiblingRelationship[]> {
    return db.select().from(siblingRelationships)
      .where(eq(siblingRelationships.parentEmail, parentEmail))
      .orderBy(asc(siblingRelationships.createdAt));
  }

  async deleteSiblingRelationship(id: string): Promise<void> {
    await db.delete(siblingRelationships).where(eq(siblingRelationships.id, id));
  }

  // Roster upload operations
  async createRosterUpload(upload: InsertRosterUpload): Promise<RosterUpload> {
    const [newUpload] = await db.insert(rosterUploads).values(upload).returning();
    return newUpload;
  }

  async getRosterUploadsByGym(gymId: string): Promise<RosterUpload[]> {
    return db.select().from(rosterUploads)
      .where(eq(rosterUploads.gymId, gymId))
      .orderBy(desc(rosterUploads.createdAt));
  }

  async getRosterUpload(id: string): Promise<RosterUpload | undefined> {
    const [upload] = await db.select().from(rosterUploads).where(eq(rosterUploads.id, id));
    return upload;
  }

  async updateRosterUploadStatus(
    id: string, 
    status: string, 
    totalRows?: number, 
    processedRows?: number, 
    errorRows?: number, 
    errors?: any[]
  ): Promise<RosterUpload> {
    const updateData: any = { 
      status, 
      updatedAt: new Date() 
    };
    
    if (totalRows !== undefined) updateData.totalRows = totalRows;
    if (processedRows !== undefined) updateData.processedRows = processedRows;
    if (errorRows !== undefined) updateData.errorRows = errorRows;
    if (errors !== undefined) updateData.errors = errors;
    if (status === 'completed' || status === 'failed') updateData.completedAt = new Date();

    const [upload] = await db
      .update(rosterUploads)
      .set(updateData)
      .where(eq(rosterUploads.id, id))
      .returning();
    return upload;
  }

  // Gym settings operations
  async updateGymSelfRegistration(gymId: string, allowSelfRegistration: boolean): Promise<Gym> {
    const [gym] = await db
      .update(gyms)
      .set({ allowSelfRegistration, updatedAt: new Date() })
      .where(eq(gyms.id, gymId))
      .returning();
    return gym;
  }
}


export const storage = new DatabaseStorage();
