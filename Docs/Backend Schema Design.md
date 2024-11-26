Backend Schema Design Document

This document outlines the database schema design for the Subscription Tracking Web Application. The schema is designed to be implemented using Supabase, which provides a PostgreSQL database along with additional backend services. The schema includes all necessary tables, their fields, data types, constraints, and relationships to support the application’s functionality.

Overview

The database schema consists of the following main entities:
	1.	Users
	2.	Subscriptions
	3.	Categories (Optional for future enhancement)
	4.	Notifications
	5.	Settings

Each entity corresponds to a table in the database, with relationships defined between them to ensure data integrity and support efficient queries.

Entity Relationship Diagram (ERD)

Below is a simplified representation of the relationships between the tables:

┌──────────┐         ┌──────────────┐
│  Users   │         │ Subscriptions│
└────┬─────┘         └──────┬───────┘
     │                        │
     │                        │
     │                        │
     │                        │
     │                   ┌────▼─────┐
     │                   │Categories│
     │                   └──────────┘
     │                        │
     │                        │
     │                   ┌────▼──────┐
     │                   │Notifications│
     │                   └─────────────┘
     │                        │
     │                   ┌────▼─────┐
     │                   │ Settings │
     │                   └──────────┘

Tables and Schemas

1. Users Table

Although we’re using Clerk for authentication, we need to store user-specific data in our database for relationships and data management. Clerk provides user IDs that we can use as foreign keys.

Table: users

Column	Data Type	Constraints	Description
id	uuid	primary key, default uuid_generate_v4()	Unique identifier for each user
clerk_id	text	not null, unique	User ID provided by Clerk
email	text	not null, unique	User’s email address
name	text		User’s display name
created_at	timestamp	not null, default now()	Timestamp when the user was created
updated_at	timestamp	not null, default now()	Timestamp when the user was last updated

Notes:
	•	The clerk_id is the unique identifier from Clerk, which we’ll use to associate data with authenticated users.
	•	We store minimal user information for privacy and compliance.

SQL Schema:

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id text NOT NULL UNIQUE,
  email text NOT NULL UNIQUE,
  name text,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

2. Subscriptions Table

This table stores the subscription details added by each user.

Table: subscriptions

Column	Data Type	Constraints	Description
id	uuid	primary key, default uuid_generate_v4()	Unique identifier for each subscription
user_id	uuid	not null, foreign key references users(id)	References the user who owns the subscription
service_name	text	not null	Name of the subscription service
cost	numeric(10,2)	not null	Cost of the subscription
currency	text	not null, default 'USD'	Currency code (e.g., USD, BRL)
billing_frequency	text	not null	Billing frequency (e.g., monthly, yearly)
next_billing_date	date	not null	Next billing date
category	text		Category of the subscription (e.g., Entertainment)
notes	text		Additional notes
created_at	timestamp	not null, default now()	Timestamp when the subscription was created
updated_at	timestamp	not null, default now()	Timestamp when the subscription was last updated

Notes:
	•	user_id establishes a relationship with the users table.
	•	currency allows support for multiple currencies.
	•	billing_frequency can be standardized using an ENUM type in PostgreSQL.

SQL Schema:

CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_name text NOT NULL,
  cost numeric(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  billing_frequency text NOT NULL,
  next_billing_date date NOT NULL,
  category text,
  notes text,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

3. Categories Table (Optional)

If we plan to allow users to categorize their subscriptions, we can have a separate categories table.

Table: categories

Column	Data Type	Constraints	Description
id	uuid	primary key, default uuid_generate_v4()	Unique identifier for each category
user_id	uuid	not null, foreign key references users(id)	References the user who owns the category
name	text	not null	Name of the category
created_at	timestamp	not null, default now()	Timestamp when the category was created
updated_at	timestamp	not null, default now()	Timestamp when the category was updated

Notes:
	•	Categories are user-specific.
	•	Alternatively, categories can be a predefined list, but user-specific categories offer more flexibility.

SQL Schema:

CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now(),
  UNIQUE (user_id, name)
);

Modifications to subscriptions table:
	•	Change the category column to category_id and reference the categories table.

ALTER TABLE subscriptions
ADD COLUMN category_id uuid REFERENCES categories(id);

-- Remove the old `category` column if it exists
ALTER TABLE subscriptions
DROP COLUMN IF EXISTS category;

4. Notifications Table

This table stores the notification preferences and history for each user.

Table: notifications

Column	Data Type	Constraints	Description
id	uuid	primary key, default uuid_generate_v4()	Unique identifier for each notification
user_id	uuid	not null, foreign key references users(id)	References the user who owns the notification
subscription_id	uuid	not null, foreign key references subscriptions(id)	References the related subscription
notification_date	timestamp	not null	When the notification was or will be sent
type	text	not null	Type of notification (e.g., email, in-app)
status	text	not null, default 'pending'	Status of the notification (e.g., pending, sent)
created_at	timestamp	not null, default now()	Timestamp when the notification was created

Notes:
	•	This table can store both scheduled notifications and notification history.
	•	The status field helps track whether a notification has been sent.

SQL Schema:

CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id uuid NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  notification_date timestamp NOT NULL,
  type text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp NOT NULL DEFAULT now()
);

5. Settings Table

Stores user-specific settings, such as notification preferences and locale settings.

Table: settings

Column	Data Type	Constraints	Description
user_id	uuid	primary key, foreign key references users(id)	References the user (one-to-one relationship)
language	text	not null, default 'en-US'	User’s preferred language
currency	text	not null, default 'USD'	User’s preferred currency
notification_lead_time	integer	not null, default 3	Days before renewal to send notifications
created_at	timestamp	not null, default now()	Timestamp when the settings were created
updated_at	timestamp	not null, default now()	Timestamp when the settings were last updated

Notes:
	•	Since each user has one set of settings, user_id serves as the primary key.
	•	notification_lead_time allows users to customize how many days in advance they receive notifications.

SQL Schema:

CREATE TABLE settings (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  language text NOT NULL DEFAULT 'en-US',
  currency text NOT NULL DEFAULT 'USD',
  notification_lead_time integer NOT NULL DEFAULT 3,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

Additional Considerations

Timestamps and Triggers

To automatically update the updated_at column whenever a row is modified, we can use PostgreSQL triggers.

SQL Trigger Function:

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

Applying the Trigger to Tables:

CREATE TRIGGER update_user_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_subscription_updated_at
BEFORE UPDATE ON subscriptions
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_settings_updated_at
BEFORE UPDATE ON settings
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- Apply to other tables as needed

Enum Types for Standardization

To standardize certain fields, we can use PostgreSQL ENUM types.

Billing Frequency ENUM:

CREATE TYPE billing_frequency AS ENUM ('daily', 'weekly', 'monthly', 'quarterly', 'yearly');

Modify the subscriptions table:

ALTER TABLE subscriptions
ALTER COLUMN billing_frequency TYPE billing_frequency USING billing_frequency::billing_frequency;

Notification Type ENUM:

CREATE TYPE notification_type AS ENUM ('email', 'in-app', 'sms');

ALTER TABLE notifications
ALTER COLUMN type TYPE notification_type USING type::notification_type;

Storage Buckets

If we plan to allow users to upload files, such as receipts or invoices, we’ll need to set up storage buckets in Supabase.

Storage: subscription_files

	•	Description: Stores user-uploaded files related to their subscriptions.
	•	Structure:
	•	Bucket: subscription-files
	•	Folders per user: Each user has a folder identified by their user_id.
	•	Files: Stored within the user’s folder.

Notes:
	•	Access control rules should ensure that users can only access their own files.
	•	For the MVP, we might exclude file uploads and add this feature later.

Integration with Clerk Authentication

Since we’re using Clerk for authentication, it’s important to understand how to link Clerk’s user management with our database.
	•	Clerk Webhooks: We can set up webhooks to listen for events like user creation and update our users table accordingly.
	•	User ID Mapping: Clerk provides a unique identifier (clerk_id) for each user. We’ll store this in our users table to link authenticated users with their data.

Sample SQL Script to Create All Tables

For convenience, here’s a combined SQL script to create all the tables and types:

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE billing_frequency AS ENUM ('daily', 'weekly', 'monthly', 'quarterly', 'yearly');
CREATE TYPE notification_type AS ENUM ('email', 'in-app', 'sms');
CREATE TYPE notification_status AS ENUM ('pending', 'sent');

-- Create users table
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id text NOT NULL UNIQUE,
  email text NOT NULL UNIQUE,
  name text,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

-- Create settings table
CREATE TABLE settings (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  language text NOT NULL DEFAULT 'en-US',
  currency text NOT NULL DEFAULT 'USD',
  notification_lead_time integer NOT NULL DEFAULT 3,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

-- Create categories table
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now(),
  UNIQUE (user_id, name)
);

-- Create subscriptions table
CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_name text NOT NULL,
  cost numeric(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  billing_frequency billing_frequency NOT NULL,
  next_billing_date date NOT NULL,
  category_id uuid REFERENCES categories(id),
  notes text,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id uuid NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  notification_date timestamp NOT NULL,
  type notification_type NOT NULL,
  status notification_status NOT NULL DEFAULT 'pending',
  created_at timestamp NOT NULL DEFAULT now()
);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_user_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_subscription_updated_at
BEFORE UPDATE ON subscriptions
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_settings_updated_at
BEFORE UPDATE ON settings
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_category_updated_at
BEFORE UPDATE ON categories
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

Potential Future Enhancements

	•	Password Reset Tokens: If we manage passwords (though Clerk handles this), we might need a table for password reset tokens.
	•	Third-Party Integrations: Tables to store tokens or data from integrated services (e.g., calendar sync).
	•	Audit Logs: For compliance, we might add tables to log user actions.

Conclusion

This backend schema design provides a solid foundation for the subscription tracking application. It supports all the core functionalities required for the MVP and is structured to allow for future enhancements without significant refactoring.

By implementing this schema in Supabase, we leverage the power of PostgreSQL with the convenience of a managed backend service. The use of UUIDs ensures unique identifiers across distributed systems, and the relationships between tables enforce data integrity.

This detailed schema should enable efficient development and seamless integration with the frontend, allowing us to create, read, update, and delete data as needed for the application’s features.

Next Steps

	•	Implement the SQL Schema: Run the provided SQL script in Supabase to create the tables.
	•	Configure Supabase Policies: Set up Row Level Security (RLS) policies to ensure users can only access their own data.
	•	Integrate with Frontend: Use Supabase client libraries to interact with the database from the Next.js application.
	•	Set Up Webhooks (if necessary): To synchronize Clerk authentication events with our database.

References

	•	Supabase Documentation: https://supabase.com/docs
	•	PostgreSQL Documentation: https://www.postgresql.org/docs/
	•	Clerk Documentation: https://clerk.dev/docs

Is there anything you’d like to add or modify in this backend schema design? Let me know if you have any questions or need further clarification on any aspect.