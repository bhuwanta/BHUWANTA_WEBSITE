# Bhuwanta CRM - Master Project Specification (Phase 1)

## Objective

Build a production-ready Real Estate CRM for **Bhuwanta Projects**.

This is **not** just a WhatsApp bot. It is a CRM platform where WhatsApp
is the first customer communication channel.

------------------------------------------------------------------------

# Phase 1 Goals

-   Capture leads automatically from WhatsApp
-   Store leads in Supabase
-   Manage Areas & Projects from Sanity CMS
-   Allow customers to browse projects
-   Allow customers to request callbacks
-   Provide a secure internal CRM dashboard
-   No AI in Phase 1
-   No n8n
-   No Trigger.dev

------------------------------------------------------------------------

# Technology Stack

  Component        Technology
  ---------------- ----------------------------------------------------
  Frontend         Next.js (App Router)
  Backend          Next.js API Routes
  Database         Supabase PostgreSQL
  Authentication   Supabase Auth
  CMS              Sanity CMS
  Storage          Sanity Assets (future: Supabase Storage if needed)
  WhatsApp         Meta WhatsApp Cloud API
  Hosting          Vercel
  UI               Tailwind CSS + shadcn/ui
  Language         TypeScript

------------------------------------------------------------------------

# Product Vision

The system consists of two applications.

## Public Application

-   Website
-   WhatsApp entry point
-   Customer chatbot

## Private CRM

Accessible only after authentication.

Roles:

-   Admin
-   Sales Manager
-   Sales Executive

Only authenticated users can access CRM pages.

------------------------------------------------------------------------

# Lead Sources

-   Website
-   Instagram
-   Facebook
-   YouTube
-   Google Ads
-   QR Codes
-   Direct WhatsApp

Store lead source whenever possible.

------------------------------------------------------------------------

# WhatsApp Flow

Customer clicks WhatsApp.

Prefilled message:

> Hi Bhuwanta, I would like to know more.

Customer presses Send.

Webhook should:

1.  Verify webhook
2.  Check lead exists
3.  Create lead if new
4.  Store incoming message
5.  Read conversation state
6.  Continue conversation
7.  Send response
8.  Store outgoing message

------------------------------------------------------------------------

# Conversation Engine

The chatbot is a navigation system, not a simple Q&A bot.

Flow:

Welcome

↓

Select Area

↓

Select Project

↓

Choose

-   Location
-   Brochure
-   Layout
-   Request Callback

Navigation available everywhere:

-   Back
-   Main Menu
-   Change Area
-   Change Project
-   End Conversation

The customer must never be forced to restart the entire chat.

------------------------------------------------------------------------

# Conversation State

Store in Supabase.

Example states:

-   INIT
-   MAIN_MENU
-   AREA_SELECTION
-   PROJECT_SELECTION
-   PROJECT_MENU
-   VIEW_LOCATION
-   VIEW_LAYOUT
-   VIEW_BROCHURE
-   CALLBACK_REQUESTED
-   COMPLETED

Resume from the saved state if the customer returns later.

------------------------------------------------------------------------

# Sanity CMS Responsibilities

Business Content only.

Manage:

-   Areas
-   Projects
-   Brochures
-   Layouts
-   Pricing
-   Google Maps Links
-   Images
-   FAQs
-   Welcome Messages

No hardcoded content.

Any update in Sanity should immediately reflect in the chatbot.

------------------------------------------------------------------------

# Supabase Responsibilities

Operational CRM data only.

Suggested tables:

-   users
-   roles
-   leads
-   conversations
-   messages
-   callbacks
-   appointments
-   activities
-   settings

------------------------------------------------------------------------

# Dashboard

Protected using Supabase Auth.

Modules:

-   Dashboard
-   Leads
-   Areas
-   Projects
-   Brochures
-   Layouts
-   Pricing
-   Callbacks
-   Appointments
-   Sales Team
-   Reports
-   Analytics
-   Settings
-   User Management

------------------------------------------------------------------------

# Dashboard Insights

Display:

-   Today's Leads
-   Weekly Leads
-   Monthly Leads
-   Lead Sources
-   Area-wise Leads
-   Project-wise Leads
-   Pending Callbacks
-   Scheduled Appointments
-   Closed Leads
-   Conversion Rate
-   Recent Conversations
-   Recent Activities

------------------------------------------------------------------------

# CRUD Requirements

Areas

-   Create
-   Edit
-   Delete
-   Activate
-   Deactivate

Projects

-   Create
-   Edit
-   Delete
-   Activate
-   Deactivate
-   Upload Brochure
-   Upload Layout
-   Upload Images
-   Update Pricing

No code changes should ever be required.

------------------------------------------------------------------------

# Business Logic

Separate services.

services/

-   lead.service.ts
-   conversation.service.ts
-   project.service.ts
-   sanity.service.ts
-   whatsapp.service.ts
-   callback.service.ts

Avoid putting business logic inside API routes.

------------------------------------------------------------------------

# Folder Structure

``` text
src/
  app/
  components/
  services/
  lib/
  chatbot/
  hooks/
  types/
  utils/
```

------------------------------------------------------------------------

# Security

-   Supabase Auth
-   Role Based Access Control
-   Protect all dashboard routes
-   Protect all APIs
-   Use Row Level Security

------------------------------------------------------------------------

# Future Phase (Not Now)

Future integrations should not require architecture changes.

-   AI Chat
-   Lead Scoring
-   Intent Detection
-   Conversation Summary
-   Analytics Expansion
-   Appointment Automation

------------------------------------------------------------------------

# Deliverables

Generate:

1.  Production architecture
2.  Folder structure
3.  Database schema
4.  Sanity schema
5.  API design
6.  Dashboard architecture
7.  Authentication flow
8.  Role system
9.  Conversation engine
10. State management
11. CRUD architecture
12. Security architecture
13. UI architecture
14. Production-ready implementation

------------------------------------------------------------------------

# Important Development Rules

-   No hardcoded business data.
-   All projects and areas must come from Sanity CMS.
-   All customer data must be stored in Supabase.
-   CRM must be accessible only to authenticated users.
-   Code should be modular, scalable, typed, reusable, and
    production-ready.
