CREATE TABLE "legalprompt" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"prompt" text NOT NULL,
	"category" varchar(100),
	"systemMessage" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "legalprompt_name_unique" UNIQUE("name")
);
