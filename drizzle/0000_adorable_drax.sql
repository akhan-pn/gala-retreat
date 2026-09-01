CREATE TABLE "enquiries" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(120) NOT NULL,
	"phone" varchar(32) NOT NULL,
	"email" varchar(200),
	"event_type" varchar(60),
	"event_date" varchar(20),
	"guests" integer,
	"message" text,
	"source" varchar(60),
	"referrer" text,
	"status" varchar(20) DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pageviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"path" varchar(200) NOT NULL,
	"visitor_id" varchar(64) NOT NULL,
	"source" varchar(60) DEFAULT 'direct' NOT NULL,
	"referrer" text,
	"device" varchar(20),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "enquiries_created_at_idx" ON "enquiries" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "pageviews_created_at_idx" ON "pageviews" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "pageviews_visitor_idx" ON "pageviews" USING btree ("visitor_id");