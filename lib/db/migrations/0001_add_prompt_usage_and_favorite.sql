ALTER TABLE "legalprompt"
  ADD COLUMN "usageCount" integer DEFAULT 0 NOT NULL,
  ADD COLUMN "isFavorite" boolean DEFAULT false NOT NULL;
