CREATE TABLE "visitors" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(120) NOT NULL,
	"phone" varchar(32) NOT NULL,
	"email" varchar(200),
	"captured_on" varchar(200),
	"source" varchar(60),
	"referrer" text,
	"device" varchar(20),
	"city" varchar(80),
	"country" varchar(2),
	"visitor_id" varchar(64),
	"contact_consent" boolean DEFAULT false NOT NULL,
	"consent_at" timestamp with time zone,
	"consent_text" text,
	"status" varchar(20) DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pageviews" ADD COLUMN "city" varchar(80);--> statement-breakpoint
ALTER TABLE "pageviews" ADD COLUMN "country" varchar(2);--> statement-breakpoint
CREATE INDEX "visitors_created_at_idx" ON "visitors" USING btree ("created_at");