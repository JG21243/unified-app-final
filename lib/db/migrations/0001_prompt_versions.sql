DO $$ BEGIN
    CREATE TYPE "prompt_status" AS ENUM ('draft', 'review', 'published');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "legalprompt"
    ADD COLUMN IF NOT EXISTS "status" "prompt_status" NOT NULL DEFAULT 'draft',
    ADD COLUMN IF NOT EXISTS "owner" varchar(255) NOT NULL DEFAULT 'unassigned',
    ADD COLUMN IF NOT EXISTS "lastReviewedAt" timestamp,
    ADD COLUMN IF NOT EXISTS "latestVersion" integer NOT NULL DEFAULT 1,
    ADD COLUMN IF NOT EXISTS "publishedVersion" integer NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS "prompt_versions" (
    "id" serial PRIMARY KEY NOT NULL,
    "promptId" integer NOT NULL REFERENCES "legalprompt"("id") ON DELETE CASCADE,
    "versionNumber" integer NOT NULL,
    "prompt" text NOT NULL,
    "systemMessage" text,
    "status" "prompt_status" NOT NULL DEFAULT 'draft',
    "createdBy" varchar(255) NOT NULL DEFAULT 'unknown',
    "diffSummary" text,
    "reviewedBy" varchar(255),
    "reviewedAt" timestamp,
    "createdAt" timestamp NOT NULL DEFAULT now(),
    CONSTRAINT "prompt_versions_promptId_versionNumber_unique" UNIQUE ("promptId", "versionNumber")
);

CREATE TABLE IF NOT EXISTS "prompt_usage_logs" (
    "id" serial PRIMARY KEY NOT NULL,
    "promptId" integer NOT NULL REFERENCES "legalprompt"("id") ON DELETE CASCADE,
    "versionNumber" integer,
    "result" varchar(50) NOT NULL DEFAULT 'success',
    "details" text,
    "createdAt" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "prompt_versions_prompt_idx" ON "prompt_versions" ("promptId");
CREATE INDEX IF NOT EXISTS "prompt_usage_logs_prompt_idx" ON "prompt_usage_logs" ("promptId");
