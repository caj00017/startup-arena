ALTER TYPE "public"."auction_status" ADD VALUE 'paused' BEFORE 'closed';--> statement-breakpoint
ALTER TYPE "public"."battle_status" ADD VALUE 'paused' BEFORE 'ended';