-- ============================================
-- WHATSAPP CHATBOT SCHEMA
-- Tables for tracking conversation states and messages
-- ============================================

-- ===================
-- CONVERSATIONS TABLE
-- ===================
-- Tracks the active state of a user's interaction with the WhatsApp bot.
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL UNIQUE, -- The WhatsApp number of the customer
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL, -- Link to the actual lead record
  state TEXT DEFAULT 'INIT', -- Chatbot state (e.g., INIT, MAIN_MENU, PROJECT_MENU, etc.)
  context_project TEXT, -- The specific project they inquired about via deep link
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for quick lookups by phone number (since webhook checks this constantly)
CREATE INDEX IF NOT EXISTS idx_conversations_phone ON conversations(phone_number);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can view conversations" ON conversations;
CREATE POLICY "Authenticated users can view conversations" ON conversations FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Authenticated users can manage conversations" ON conversations;
CREATE POLICY "Authenticated users can manage conversations" ON conversations FOR ALL USING (auth.role() = 'authenticated');

-- ===================
-- MESSAGES TABLE
-- ===================
-- Logs all incoming and outgoing messages for context and analytics.
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')), -- 'inbound' = from customer, 'outbound' = from bot
  content TEXT NOT NULL, -- The text message content
  whatsapp_message_id TEXT, -- Meta's unique ID for the message (useful for deduplication)
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index to quickly load message history for a specific conversation
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can view messages" ON messages;
CREATE POLICY "Authenticated users can view messages" ON messages FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Authenticated users can manage messages" ON messages;
CREATE POLICY "Authenticated users can manage messages" ON messages FOR ALL USING (auth.role() = 'authenticated');
