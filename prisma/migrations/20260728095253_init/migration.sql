-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ANGEL', 'STARTUP', 'ADMIN', 'SCREENER', 'LEADERSHIP');

-- CreateEnum
CREATE TYPE "Region" AS ENUM ('TRIVANDRUM', 'KOCHI', 'CALICUT', 'OTHER');

-- CreateEnum
CREATE TYPE "Stage" AS ENUM ('IDEA', 'MVP', 'EARLY_REVENUE', 'GROWTH');

-- CreateEnum
CREATE TYPE "VisibilityOption" AS ENUM ('EXACT', 'BAND', 'ADMIN_ONLY');

-- CreateEnum
CREATE TYPE "PartnershipType" AS ENUM ('CUSTOMER_INTRO', 'CHANNEL', 'PILOT', 'MENTORING');

-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('PENDING_VERIFICATION', 'ACTIVE', 'REJECTED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "ScreeningState" AS ENUM ('APPLIED', 'IN_SCREENING', 'APPROVED', 'REJECTED', 'ON_HOLD');

-- CreateEnum
CREATE TYPE "IntroductionRequestedBy" AS ENUM ('ANGEL', 'STARTUP', 'ADMIN');

-- CreateEnum
CREATE TYPE "IntroductionState" AS ENUM ('REQUESTED', 'ACCEPTED', 'DECLINED', 'MEETING_HELD', 'PROGRESSING', 'CLOSED');

-- CreateEnum
CREATE TYPE "HelpSoughtType" AS ENUM ('CAPITAL', 'MARKET_ACCESS', 'BOTH');

-- CreateEnum
CREATE TYPE "PartnershipOutcomeType" AS ENUM ('CUSTOMER_INTRO_CONVERTED', 'CHANNEL', 'PILOT', 'OTHER');

-- CreateEnum
CREATE TYPE "RSVPStatus" AS ENUM ('GOING', 'NOT_GOING', 'MAYBE');

-- CreateEnum
CREATE TYPE "ControlledListType" AS ENUM ('SECTOR', 'TECH_DOMAIN', 'INDUSTRY_DOMAIN', 'MARKET_GEOGRAPHY', 'PARTNERSHIP_TYPE', 'HELP_TYPE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "name" TEXT,
    "image" TEXT,
    "role" "Role" NOT NULL DEFAULT 'ANGEL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "members" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "designation" TEXT,
    "linkedIn" TEXT,
    "region" "Region" NOT NULL,
    "referredBy" TEXT,
    "technologyDomains" TEXT[],
    "industryDomains" TEXT[],
    "marketGeographies" TEXT[],
    "expertiseNotes" TEXT,
    "committedAmount" DECIMAL(14,2),
    "ticketSizeMin" DECIMAL(14,2),
    "ticketSizeMax" DECIMAL(14,2),
    "preferredStages" "Stage"[],
    "preferredSectors" TEXT[],
    "clientSegments" TEXT[],
    "partnershipTypes" "PartnershipType"[],
    "amountVisibility" "VisibilityOption" NOT NULL DEFAULT 'BAND',
    "profileCompleteness" INTEGER NOT NULL DEFAULT 0,
    "status" "MemberStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "consentAcceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "startups" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "founders" TEXT[],
    "incorporationStatus" TEXT,
    "region" "Region" NOT NULL,
    "website" TEXT,
    "linkedIn" TEXT,
    "referredBy" TEXT,
    "stage" "Stage" NOT NULL,
    "sector" TEXT NOT NULL,
    "icpSegment" TEXT,
    "icpBuyerPersona" TEXT,
    "icpGeography" TEXT,
    "arrMrrBand" TEXT,
    "customerCount" INTEGER,
    "growthRate" TEXT,
    "notableCustomers" TEXT,
    "lastTractionAt" TIMESTAMP(3),
    "fundingAskAmount" DECIMAL(14,2),
    "instrumentPreference" TEXT,
    "useOfFunds" TEXT,
    "priorFunding" TEXT,
    "helpSought" "HelpSoughtType",
    "helpDetails" TEXT,
    "pitchDeckUrl" TEXT,
    "pitchDeckPublicId" TEXT,
    "pitchDeckUploadedAt" TIMESTAMP(3),
    "currentScreeningState" "ScreeningState" NOT NULL DEFAULT 'APPLIED',
    "isVisibleToAngels" BOOLEAN NOT NULL DEFAULT false,
    "consentAcceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "startups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "screening_records" (
    "id" TEXT NOT NULL,
    "startupId" TEXT NOT NULL,
    "state" "ScreeningState" NOT NULL DEFAULT 'APPLIED',
    "scorecard" JSONB,
    "totalScore" DECIMAL(6,2),
    "screenerId" TEXT,
    "notes" TEXT,
    "rejectionEmailSentAt" TIMESTAMP(3),
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "slaDueAt" TIMESTAMP(3),
    "decidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "screening_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "introductions" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "startupId" TEXT NOT NULL,
    "requestedBy" "IntroductionRequestedBy" NOT NULL,
    "contextNote" TEXT,
    "state" "IntroductionState" NOT NULL DEFAULT 'REQUESTED',
    "facilitatedByAdmin" BOOLEAN NOT NULL DEFAULT true,
    "facilitatedById" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),
    "meetingHeldAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "introductions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investments" (
    "id" TEXT NOT NULL,
    "startupId" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "stage" "Stage" NOT NULL,
    "sourceIntroductionId" TEXT,
    "enteredByAdminId" TEXT NOT NULL,
    "confirmedByStartupAt" TIMESTAMP(3),
    "confirmedByAngelAt" TIMESTAMP(3),
    "isShareable" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "investments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investment_participants" (
    "id" TEXT NOT NULL,
    "investmentId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "amount" DECIMAL(14,2),

    CONSTRAINT "investment_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partnerships" (
    "id" TEXT NOT NULL,
    "startupId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "type" "PartnershipOutcomeType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "sourceIntroductionId" TEXT,
    "enteredByAdminId" TEXT NOT NULL,
    "isShareable" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partnerships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "venue" TEXT NOT NULL,
    "region" "Region",
    "presentingStartupIds" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_rsvps" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "memberId" TEXT,
    "startupId" TEXT,
    "status" "RSVPStatus" NOT NULL DEFAULT 'GOING',
    "respondedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_rsvps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "controlled_lists" (
    "id" TEXT NOT NULL,
    "type" "ControlledListType" NOT NULL,
    "value" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "controlled_lists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE INDEX "verification_tokens_identifier_idx" ON "verification_tokens"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "members_userId_key" ON "members"("userId");

-- CreateIndex
CREATE INDEX "members_region_idx" ON "members"("region");

-- CreateIndex
CREATE INDEX "members_status_idx" ON "members"("status");

-- CreateIndex
CREATE UNIQUE INDEX "startups_userId_key" ON "startups"("userId");

-- CreateIndex
CREATE INDEX "startups_region_idx" ON "startups"("region");

-- CreateIndex
CREATE INDEX "startups_sector_idx" ON "startups"("sector");

-- CreateIndex
CREATE INDEX "startups_stage_idx" ON "startups"("stage");

-- CreateIndex
CREATE INDEX "startups_currentScreeningState_idx" ON "startups"("currentScreeningState");

-- CreateIndex
CREATE INDEX "screening_records_startupId_idx" ON "screening_records"("startupId");

-- CreateIndex
CREATE INDEX "screening_records_state_idx" ON "screening_records"("state");

-- CreateIndex
CREATE INDEX "introductions_memberId_idx" ON "introductions"("memberId");

-- CreateIndex
CREATE INDEX "introductions_startupId_idx" ON "introductions"("startupId");

-- CreateIndex
CREATE INDEX "introductions_state_idx" ON "introductions"("state");

-- CreateIndex
CREATE INDEX "investments_startupId_idx" ON "investments"("startupId");

-- CreateIndex
CREATE INDEX "investments_date_idx" ON "investments"("date");

-- CreateIndex
CREATE UNIQUE INDEX "investment_participants_investmentId_memberId_key" ON "investment_participants"("investmentId", "memberId");

-- CreateIndex
CREATE INDEX "partnerships_startupId_idx" ON "partnerships"("startupId");

-- CreateIndex
CREATE INDEX "partnerships_memberId_idx" ON "partnerships"("memberId");

-- CreateIndex
CREATE INDEX "partnerships_date_idx" ON "partnerships"("date");

-- CreateIndex
CREATE INDEX "events_date_idx" ON "events"("date");

-- CreateIndex
CREATE UNIQUE INDEX "event_rsvps_eventId_memberId_key" ON "event_rsvps"("eventId", "memberId");

-- CreateIndex
CREATE UNIQUE INDEX "event_rsvps_eventId_startupId_key" ON "event_rsvps"("eventId", "startupId");

-- CreateIndex
CREATE INDEX "controlled_lists_type_idx" ON "controlled_lists"("type");

-- CreateIndex
CREATE UNIQUE INDEX "controlled_lists_type_value_key" ON "controlled_lists"("type", "value");

-- CreateIndex
CREATE INDEX "audit_logs_actorId_idx" ON "audit_logs"("actorId");

-- CreateIndex
CREATE INDEX "audit_logs_targetType_targetId_idx" ON "audit_logs"("targetType", "targetId");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "startups" ADD CONSTRAINT "startups_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "screening_records" ADD CONSTRAINT "screening_records_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "startups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "screening_records" ADD CONSTRAINT "screening_records_screenerId_fkey" FOREIGN KEY ("screenerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "introductions" ADD CONSTRAINT "introductions_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "introductions" ADD CONSTRAINT "introductions_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "startups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "introductions" ADD CONSTRAINT "introductions_facilitatedById_fkey" FOREIGN KEY ("facilitatedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investments" ADD CONSTRAINT "investments_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "startups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investments" ADD CONSTRAINT "investments_sourceIntroductionId_fkey" FOREIGN KEY ("sourceIntroductionId") REFERENCES "introductions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investments" ADD CONSTRAINT "investments_enteredByAdminId_fkey" FOREIGN KEY ("enteredByAdminId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investment_participants" ADD CONSTRAINT "investment_participants_investmentId_fkey" FOREIGN KEY ("investmentId") REFERENCES "investments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investment_participants" ADD CONSTRAINT "investment_participants_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partnerships" ADD CONSTRAINT "partnerships_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "startups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partnerships" ADD CONSTRAINT "partnerships_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partnerships" ADD CONSTRAINT "partnerships_sourceIntroductionId_fkey" FOREIGN KEY ("sourceIntroductionId") REFERENCES "introductions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partnerships" ADD CONSTRAINT "partnerships_enteredByAdminId_fkey" FOREIGN KEY ("enteredByAdminId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_rsvps" ADD CONSTRAINT "event_rsvps_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_rsvps" ADD CONSTRAINT "event_rsvps_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_rsvps" ADD CONSTRAINT "event_rsvps_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "startups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
