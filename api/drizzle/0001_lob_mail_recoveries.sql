CREATE TABLE IF NOT EXISTS "lob_mail_recoveries" (
  "source_lob_id" text PRIMARY KEY NOT NULL,
  "source_record_id" varchar(24) NOT NULL,
  "check_id" varchar(24) NOT NULL,
  "owner_id" varchar(24) NOT NULL,
  "owner_type" text NOT NULL,
  "status" text DEFAULT 'Prepared' NOT NULL,
  "pdf_key" text NOT NULL,
  "pdf_sha256" text NOT NULL,
  "check_fingerprint" text NOT NULL,
  "snapshot" jsonb NOT NULL,
  "prepared_by" varchar(24) NOT NULL,
  "prepared_at" timestamp DEFAULT now() NOT NULL,
  "submitted_at" timestamp,
  "replacement_lob_id" text,
  "failure" text
);
