# Email Report Trigger Implementation

## Goal

Add an "Email" button in the CRM Leads dashboard. Clicking this button will allow the user to select one of the standard report timings (Morning, Mid-Day, Afternoon, or Evening) and immediately trigger an email containing the generated lead PDF reports to their inbox.

## Proposed Changes

### 1. New API Route `src/app/api/crm/send-report/route.ts`

- **[NEW] `src/app/api/crm/send-report/route.ts`**
  - Create a `POST` endpoint that accepts a payload: `{ reportType: 'morning' | 'midday' | 'afternoon' | 'evening' }`.
  - Reuse the report generation logic from `src/app/api/cron/leads-report/route.ts`.
  - Instead of relying on the current clock time (`getUTCHours()`), it will force the time boundaries based on the requested `reportType`.
  - It will generate the PDFs (and Excel files) for that specific block and send them via Resend to `info@bhuwanta.com` (or the `RESEND_FROM_EMAIL`).

### 2. CRM Leads UI `src/app/(crm)/crm/leads/LeadsClient.tsx`

- **[MODIFY] `src/app/(crm)/crm/leads/LeadsClient.tsx`**
  - Add state for managing the email report dropdown/modal (`isEmailModalOpen`, `selectedReportType`, `isSendingReport`).
  - 
  - Add an "Email" button next to the "Export CSV" button.
  - Implement a simple modal/dropdown that lists the 4 timings:
    - Morning Report (6 PM Yesterday - 9 AM Today)
    - Mid-Day Report (9 AM - 12 PM)
    - Afternoon Report (12 PM - 3 PM)
    - Evening Report (6 PM)
  - Add a "Send" button inside the modal that triggers a fetch call to `/api/crm/send-report`.
  - Show loading states and a success/error message upon completion.

## User Review Required

No major architectural changes, just adding a manual trigger for the existing automated report generation. The emails will be sent to `info@bhuwanta.com` (the same destination as the automated cron jobs).

## Verification Plan

- **Automated Tests:** N/A
- **Manual Verification:** I will start the local server and verify the UI rendering of the button and modal. I will instruct you to test the button in your production or local environment to verify the email is successfully delivered.
