import { sql } from 'drizzle-orm';
import {
  boolean,
  date,
  decimal,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User roles enum
export const userRoleEnum = pgEnum("user_role", ["admin", "gym_admin", "coach", "gymnast", "spectator"]);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: userRoleEnum("role").default("spectator"),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Gyms table
export const gyms = pgTable("gyms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  city: varchar("city").notNull(),
  adminFirstName: varchar("admin_first_name").notNull(),
  adminLastName: varchar("admin_last_name").notNull(),
  email: varchar("email").notNull(),
  website: varchar("website"),
  approved: boolean("approved").default(false),
  membershipPaid: boolean("membership_paid").default(false),
  allowSelfRegistration: boolean("allow_self_registration").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Gym coaches (many-to-many relationship)
export const gymCoaches = pgTable("gym_coaches", {
  gymId: varchar("gym_id").references(() => gyms.id),
  userId: varchar("user_id").references(() => users.id),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Gymnast levels enum
export const gymnastLevelEnum = pgEnum("gymnast_level", ["pre-team", "3", "4", "5", "6", "7", "8", "9", "10"]);

// Gymnast types enum
export const gymnastTypeEnum = pgEnum("gymnast_type", ["team", "pre-team", "non-team"]);

// Gymnasts table
export const gymnasts = pgTable("gymnasts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  gymId: varchar("gym_id").references(() => gyms.id),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  email: varchar("email"),
  birthDate: date("birth_date").notNull(),
  level: gymnastLevelEnum("level").notNull(),
  type: gymnastTypeEnum("type").default("team"),
  parentFirstName: varchar("parent_first_name"),
  parentLastName: varchar("parent_last_name"),
  parentEmail: varchar("parent_email"),
  parentPhone: varchar("parent_phone"),
  emergencyContact: varchar("emergency_contact"),
  emergencyPhone: varchar("emergency_phone"),
  medicalInfo: text("medical_info"),
  approved: boolean("approved").default(false),
  points: integer("points").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Events table
export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  hostGymId: varchar("host_gym_id").references(() => gyms.id),
  name: varchar("name").notNull(),
  date: date("date").notNull(),
  location: varchar("location").notNull(),
  registrationOpenDate: date("registration_open_date").notNull(),
  registrationCloseDate: date("registration_close_date").notNull(),
  estimateDeadline: date("estimate_deadline").notNull(),
  spectatorTicketPrice: decimal("spectator_ticket_price", { precision: 10, scale: 2 }),
  approved: boolean("approved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Event sessions table
export const eventSessions = pgTable("event_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").references(() => events.id),
  name: varchar("name").notNull(),
  time: varchar("time").notNull(),
  levels: text("levels").array(), // Array of levels for this session
  maxSpectators: integer("max_spectators"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Event registrations table
export const eventRegistrations = pgTable("event_registrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").references(() => events.id),
  gymnasId: varchar("gymnast_id").references(() => gymnasts.id),
  sessionId: varchar("session_id").references(() => eventSessions.id),
  approved: boolean("approved").default(false),
  paid: boolean("paid").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Spectator tickets table
export const spectatorTickets = pgTable("spectator_tickets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").references(() => events.id),
  sessionId: varchar("session_id").references(() => eventSessions.id),
  buyerEmail: varchar("buyer_email").notNull(),
  buyerName: varchar("buyer_name").notNull(),
  quantity: integer("quantity").notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }),
  paid: boolean("paid").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Scores table
export const scores = pgTable("scores", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  gymnastId: varchar("gymnast_id").references(() => gymnasts.id),
  eventId: varchar("event_id").references(() => events.id),
  vault: decimal("vault", { precision: 5, scale: 3 }),
  bars: decimal("bars", { precision: 5, scale: 3 }),
  beam: decimal("beam", { precision: 5, scale: 3 }),
  floor: decimal("floor", { precision: 5, scale: 3 }),
  allAround: decimal("all_around", { precision: 6, scale: 3 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Challenges table
export const challenges = pgTable("challenges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  points: integer("points").notNull(),
  levels: text("levels").array(), // Array of levels this challenge is for
  createdBy: varchar("created_by").references(() => users.id),
  isCoachChallenge: boolean("is_coach_challenge").default(false),
  fromGymId: varchar("from_gym_id").references(() => gyms.id),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Challenge completions table
export const challengeCompletions = pgTable("challenge_completions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  challengeId: varchar("challenge_id").references(() => challenges.id),
  gymnastId: varchar("gymnast_id").references(() => gymnasts.id),
  completedAt: timestamp("completed_at").defaultNow(),
});

// Rewards store table
export const rewards = pgTable("rewards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  pointsCost: integer("points_cost").notNull(),
  imageUrl: varchar("image_url"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Reward redemptions table
export const rewardRedemptions = pgTable("reward_redemptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  rewardId: varchar("reward_id").references(() => rewards.id),
  gymnastId: varchar("gymnast_id").references(() => gymnasts.id),
  pointsSpent: integer("points_spent").notNull(),
  status: varchar("status").default("pending"), // pending, fulfilled, cancelled
  redeemedAt: timestamp("redeemed_at").defaultNow(),
});

// Gym estimates for events
export const gymEventEstimates = pgTable("gym_event_estimates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").references(() => events.id),
  gymId: varchar("gym_id").references(() => gyms.id),
  estimates: jsonb("estimates"), // JSON object with level counts
  submittedAt: timestamp("submitted_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
  role: true,
});

export const insertGymSchema = createInsertSchema(gyms).omit({
  id: true,
  approved: true,
  membershipPaid: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGymnastSchema = createInsertSchema(gymnasts).omit({
  id: true,
  approved: true,
  points: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  approved: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChallengeSchema = createInsertSchema(challenges).omit({
  id: true,
  createdAt: true,
});

export const insertRewardSchema = createInsertSchema(rewards).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertGym = z.infer<typeof insertGymSchema>;
export type Gym = typeof gyms.$inferSelect;
export type InsertGymnast = z.infer<typeof insertGymnastSchema>;
export type Gymnast = typeof gymnasts.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;
export type Challenge = typeof challenges.$inferSelect;
export type InsertReward = z.infer<typeof insertRewardSchema>;
export type Reward = typeof rewards.$inferSelect;
export type Score = typeof scores.$inferSelect;
export type EventSession = typeof eventSessions.$inferSelect;
export type EventRegistration = typeof eventRegistrations.$inferSelect;
export type SpectatorTicket = typeof spectatorTickets.$inferSelect;
export type ChallengeCompletion = typeof challengeCompletions.$inferSelect;
export type RewardRedemption = typeof rewardRedemptions.$inferSelect;
