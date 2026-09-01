CREATE TABLE "experiment_exposures" (
	"id" serial PRIMARY KEY NOT NULL,
	"experiment_key" varchar(40) NOT NULL,
	"variant" varchar(40) NOT NULL,
	"visitor_id" varchar(64) NOT NULL,
	"path" varchar(200),
	"device" varchar(20),
	"dirty" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "experiment_goals" (
	"id" serial PRIMARY KEY NOT NULL,
	"goal" varchar(40) NOT NULL,
	"visitor_id" varchar(64) NOT NULL,
	"path" varchar(200),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "page_engagement" (
	"id" serial PRIMARY KEY NOT NULL,
	"view_id" varchar(36) NOT NULL,
	"visitor_id" varchar(64) NOT NULL,
	"path" varchar(200) NOT NULL,
	"device" varchar(20),
	"max_scroll_pct" integer DEFAULT 0 NOT NULL,
	"active_ms" integer DEFAULT 0 NOT NULL,
	"rage_clicks" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"dedupe_key" varchar(120) NOT NULL,
	"view_id" varchar(36) NOT NULL,
	"path" varchar(200) NOT NULL,
	"kind" varchar(16) NOT NULL,
	"name" varchar(60) NOT NULL,
	"value" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "experiment_exposures_visitor_idx" ON "experiment_exposures" USING btree ("experiment_key","visitor_id");--> statement-breakpoint
CREATE INDEX "experiment_exposures_key_created_at_idx" ON "experiment_exposures" USING btree ("experiment_key","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "experiment_goals_visitor_idx" ON "experiment_goals" USING btree ("goal","visitor_id");--> statement-breakpoint
CREATE INDEX "experiment_goals_created_at_idx" ON "experiment_goals" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "page_engagement_view_id_idx" ON "page_engagement" USING btree ("view_id");--> statement-breakpoint
CREATE INDEX "page_engagement_created_at_idx" ON "page_engagement" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "page_engagement_path_idx" ON "page_engagement" USING btree ("path","created_at");--> statement-breakpoint
CREATE INDEX "page_engagement_visitor_idx" ON "page_engagement" USING btree ("visitor_id");--> statement-breakpoint
CREATE UNIQUE INDEX "site_events_dedupe_key_idx" ON "site_events" USING btree ("dedupe_key");--> statement-breakpoint
CREATE INDEX "site_events_created_at_idx" ON "site_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "site_events_kind_name_idx" ON "site_events" USING btree ("kind","name","created_at");--> statement-breakpoint
CREATE INDEX "site_events_path_idx" ON "site_events" USING btree ("path","created_at");--> statement-breakpoint
CREATE INDEX "site_events_view_idx" ON "site_events" USING btree ("view_id");