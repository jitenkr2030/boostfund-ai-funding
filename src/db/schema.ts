import { sqliteTable, integer, text, uniqueIndex } from 'drizzle-orm/sqlite-core';



// Auth tables for better-auth
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});

// Funding Opportunities
export const fundingOpportunities = sqliteTable("funding_opportunities", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type").notNull(), // 'grant', 'vc', 'angel', 'loan'
  industry: text("industry").notNull(),
  location: text("location").notNull(),
  amountMin: integer("amount_min").notNull(),
  amountMax: integer("amount_max").notNull(),
  currency: text("currency").notNull().default('USD'),
  deadline: integer("deadline", { mode: "timestamp" }).notNull(),
  eligibility: text("eligibility").notNull(),
  description: text("description").notNull(),
  requirements: text("requirements", { mode: "json" }).$type<string[]>(),
  process: text("process", { mode: "json" }).$type<string[]>(),
  url: text("url"),
  score: integer("score").notNull().default(0), // 0-100 AI match score
  isActive: integer("is_active", { mode: "boolean" }).$defaultFn(() => true),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// User saved opportunities
export const userSavedOpportunities = sqliteTable("user_saved_opportunities", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  opportunityId: text("opportunity_id").notNull().references(() => fundingOpportunities.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
}, (table) => ({
  userOpportunityIdx: uniqueIndex("user_opportunity_idx").on(table.userId, table.opportunityId),
}));

// Applications
export const applications = sqliteTable("applications", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  opportunityId: text("opportunity_id").references(() => fundingOpportunities.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  source: text("source").notNull(),
  amountRequested: integer("amount_requested").notNull(),
  status: text("status").notNull().default('draft'), // 'draft', 'submitted', 'under_review', 'approved', 'rejected'
  submissionDate: integer("submission_date", { mode: "timestamp" }),
  deadline: integer("deadline", { mode: "timestamp" }),
  nextAction: text("next_action"),
  insights: text("insights"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Application documents
export const applicationDocuments = sqliteTable("application_documents", {
  id: text("id").primaryKey(),
  applicationId: text("application_id").notNull().references(() => applications.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'pdf', 'docx', 'xls', 'other'
  url: text("url"),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Application history
export const applicationHistory = sqliteTable("application_history", {
  id: text("id").primaryKey(),
  applicationId: text("application_id").notNull().references(() => applications.id, { onDelete: "cascade" }),
  event: text("event").notNull(),
  at: integer("at", { mode: "timestamp" }).notNull(),
  by: text("by"),
});

// Compliance items
export const complianceItems = sqliteTable("compliance_items", {
  id: text("id").primaryKey(),
  applicationId: text("application_id").notNull().references(() => applications.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  done: integer("done", { mode: "boolean" }).$defaultFn(() => false),
});

// Investors
export const investors = sqliteTable("investors", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'vc', 'angel', 'strategic'
  stages: text("stages", { mode: "json" }).$type<string[]>(),
  industries: text("industries", { mode: "json" }).$type<string[]>(),
  geo: text("geo", { mode: "json" }).$type<string[]>(),
  fundingMin: integer("funding_min").notNull(),
  fundingMax: integer("funding_max").notNull(),
  portfolio: text("portfolio", { mode: "json" }).$type<string[]>(),
  email: text("email"),
  linkedin: text("linkedin"),
  website: text("website"),
  matchScore: integer("match_score").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).$defaultFn(() => true),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// User outreach tracking
export const userOutreach = sqliteTable("user_outreach", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  investorId: text("investor_id").notNull().references(() => investors.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // 'message', 'meeting', 'pitch'
  status: text("status").notNull().default('pending'), // 'pending', 'positive', 'neutral', 'negative'
  subject: text("subject"),
  message: text("message"),
  notes: text("notes"),
  scheduledDate: integer("scheduled_date", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Startup profiles
export const startupProfiles = sqliteTable("startup_profiles", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  tagline: text("tagline"),
  stage: text("stage"), // 'pre-seed', 'seed', 'series-a', 'series-b', 'growth', 'private-equity'
  industry: text("industry"),
  region: text("region"), // 'na', 'eu', 'asia', 'latam', 'africa', 'global'
  fundingNeed: text("funding_need"),
  summary: text("summary"),
  website: text("website"),
  isPublic: integer("is_public", { mode: "boolean" }).$defaultFn(() => false),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Events
export const events = sqliteTable("events", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  date: integer("date", { mode: "timestamp" }).notNull(),
  location: text("location").notNull(),
  type: text("type").notNull(), // 'pitch-competition', 'meetup', 'conference'
  industries: text("industries", { mode: "json" }).$type<string[]>(),
  aiRecommended: integer("ai_recommended", { mode: "boolean" }).$defaultFn(() => false),
  imageUrl: text("image_url"),
  description: text("description"),
  websiteUrl: text("website_url"),
  isActive: integer("is_active", { mode: "boolean" }).$defaultFn(() => true),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Analytics data
export const analytics = sqliteTable("analytics", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
  date: integer("date", { mode: "timestamp" }).$defaultFn(() => new Date()),
  totalMatches: integer("total_matches").notNull().default(0),
  applicationsInProgress: integer("applications_in_progress").notNull().default(0),
  successRate: integer("success_rate").notNull().default(0),
  potentialFunding: integer("potential_funding").notNull().default(0),
  outreachCount: integer("outreach_count").notNull().default(0),
  positiveResponses: integer("positive_responses").notNull().default(0),
  readinessScore: integer("readiness_score").notNull().default(0),
});