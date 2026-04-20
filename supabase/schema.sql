-- ============================================
-- BHUWANTA REAL ESTATE PLATFORM
-- Supabase Database Schema
-- ============================================

-- ===================
-- LEADS TABLE
-- ===================
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  property_interest TEXT,
  source_page TEXT DEFAULT 'contact',
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'closed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert leads" ON leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can view leads" ON leads FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update leads" ON leads FOR UPDATE USING (auth.role() = 'authenticated');

-- ===================
-- MEDIA IMAGES TABLE
-- ===================
CREATE TABLE IF NOT EXISTS media_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  alt_text TEXT,
  page_assignment TEXT CHECK (page_assignment IN ('home', 'about', 'gallery', 'projects')),
  category TEXT,
  sort_order INT DEFAULT 0,
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE media_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view media images" ON media_images FOR SELECT USING (true);
CREATE POLICY "Authenticated users manage media images" ON media_images FOR ALL USING (auth.role() = 'authenticated');

-- ===================
-- MEDIA VIDEOS TABLE
-- ===================
CREATE TABLE IF NOT EXISTS media_videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL CHECK (platform IN ('youtube', 'vimeo')),
  video_id TEXT NOT NULL,
  title TEXT,
  page_assignment TEXT CHECK (page_assignment IN ('home', 'about', 'gallery', 'projects')),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE media_videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view media videos" ON media_videos FOR SELECT USING (true);
CREATE POLICY "Authenticated users manage media videos" ON media_videos FOR ALL USING (auth.role() = 'authenticated');

-- ===================
-- JOB LISTINGS TABLE
-- ===================
CREATE TABLE IF NOT EXISTS job_listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  department TEXT,
  location TEXT NOT NULL,
  employment_type TEXT DEFAULT 'full-time' CHECK (employment_type IN ('full-time', 'part-time', 'contract', 'internship')),
  salary_min INT,
  salary_max INT,
  description TEXT NOT NULL,
  requirements TEXT[] DEFAULT '{}',
  apply_url TEXT,
  is_active BOOLEAN DEFAULT true,
  posted_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE job_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active jobs" ON job_listings FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated users manage jobs" ON job_listings FOR ALL USING (auth.role() = 'authenticated');

-- ===================
-- SEO GLOBAL TABLE
-- ===================
CREATE TABLE IF NOT EXISTS seo_global (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_name TEXT DEFAULT 'Bhuwanta',
  title_template TEXT DEFAULT '{page_title} | Bhuwanta',
  default_description TEXT DEFAULT 'Premium real estate solutions by Bhuwanta.',
  default_og_image TEXT,
  twitter_card_type TEXT DEFAULT 'summary_large_image',
  google_verification TEXT,
  bing_verification TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE seo_global ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view seo global" ON seo_global FOR SELECT USING (true);
CREATE POLICY "Authenticated users manage seo global" ON seo_global FOR ALL USING (auth.role() = 'authenticated');

-- Insert default row
INSERT INTO seo_global (site_name, title_template, default_description) 
VALUES ('Bhuwanta', '{page_title} | Bhuwanta', 'Premium real estate solutions by Bhuwanta. Discover luxury properties, residential projects, and commercial spaces.')
ON CONFLICT DO NOTHING;

-- ===================
-- SEO SETTINGS (PER-PAGE) TABLE
-- ===================
CREATE TABLE IF NOT EXISTS seo_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_slug TEXT UNIQUE NOT NULL,
  meta_title TEXT,
  meta_description TEXT,
  og_image TEXT,
  canonical_url TEXT,
  noindex BOOLEAN DEFAULT false,
  focus_keyword TEXT,
  secondary_keywords TEXT,
  hreflang JSONB,
  sitemap_priority NUMERIC(2,1) DEFAULT 0.5,
  sitemap_changefreq TEXT DEFAULT 'weekly',
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE seo_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view seo settings" ON seo_settings FOR SELECT USING (true);
CREATE POLICY "Authenticated users manage seo settings" ON seo_settings FOR ALL USING (auth.role() = 'authenticated');

-- Insert default entries for all pages
INSERT INTO seo_settings (page_slug, sitemap_priority, sitemap_changefreq) VALUES
  ('home', 1.0, 'daily'),
  ('about', 0.8, 'monthly'),
  ('gallery', 0.7, 'weekly'),
  ('projects', 0.9, 'weekly'),
  ('blog', 0.8, 'daily'),
  ('careers', 0.6, 'weekly'),
  ('contact', 0.5, 'monthly')
ON CONFLICT (page_slug) DO NOTHING;

-- ===================
-- FAQ ENTRIES TABLE (AEO)
-- ===================
CREATE TABLE IF NOT EXISTS faq_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_slug TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE faq_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view faq entries" ON faq_entries FOR SELECT USING (true);
CREATE POLICY "Authenticated users manage faq entries" ON faq_entries FOR ALL USING (auth.role() = 'authenticated');

-- ===================
-- LOCAL BUSINESS TABLE (GEO)
-- ===================
CREATE TABLE IF NOT EXISTS local_business (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_name TEXT DEFAULT 'Bhuwanta',
  business_type TEXT DEFAULT 'RealEstateAgent',
  street_address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'IN',
  phone TEXT,
  email TEXT,
  website TEXT,
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  price_range TEXT,
  logo_url TEXT,
  opening_hours JSONB DEFAULT '[]',
  service_areas TEXT[] DEFAULT '{}',
  social_profiles JSONB DEFAULT '{}',
  same_as_links TEXT[] DEFAULT '{}',
  founding_year INT,
  founders TEXT[] DEFAULT '{}',
  awards TEXT[] DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE local_business ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view local business" ON local_business FOR SELECT USING (true);
CREATE POLICY "Authenticated users manage local business" ON local_business FOR ALL USING (auth.role() = 'authenticated');

-- Insert default row
INSERT INTO local_business (business_name, business_type) VALUES ('Bhuwanta', 'RealEstateAgent')
ON CONFLICT DO NOTHING;

-- ===================
-- ENTITY MARKUP TABLE
-- ===================
CREATE TABLE IF NOT EXISTS entity_markup (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'Organization',
  name TEXT NOT NULL,
  same_as_links TEXT[] DEFAULT '{}',
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE entity_markup ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view entity markup" ON entity_markup FOR SELECT USING (true);
CREATE POLICY "Authenticated users manage entity markup" ON entity_markup FOR ALL USING (auth.role() = 'authenticated');

-- ===================
-- SITE CONFIG TABLE
-- ===================
CREATE TABLE IF NOT EXISTS site_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ga_id TEXT,
  fb_pixel_id TEXT,
  gtm_id TEXT,
  resend_sender TEXT,
  sentry_dsn TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view site config" ON site_config FOR SELECT USING (true);
CREATE POLICY "Authenticated users manage site config" ON site_config FOR ALL USING (auth.role() = 'authenticated');

INSERT INTO site_config DEFAULT VALUES ON CONFLICT DO NOTHING;

-- ===================
-- EMAIL TEMPLATES TABLE
-- ===================
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  type TEXT DEFAULT 'general' CHECK (type IN ('lead_ack', 'agent_notify', 'newsletter', 'drip', 'general')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users manage email templates" ON email_templates FOR ALL USING (auth.role() = 'authenticated');

-- ===================
-- EMAIL CAMPAIGNS TABLE
-- ===================
CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES email_templates(id),
  subject TEXT NOT NULL,
  recipients JSONB DEFAULT '[]',
  sent_at TIMESTAMPTZ DEFAULT now(),
  opens INT DEFAULT 0,
  clicks INT DEFAULT 0,
  status TEXT DEFAULT 'sent'
);

ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users manage email campaigns" ON email_campaigns FOR ALL USING (auth.role() = 'authenticated');

-- ===================
-- DRIP SEQUENCES TABLE
-- ===================
CREATE TABLE IF NOT EXISTS drip_sequences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  steps JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE drip_sequences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users manage drip sequences" ON drip_sequences FOR ALL USING (auth.role() = 'authenticated');

-- ===================
-- STORAGE BUCKET
-- ===================
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true)
ON CONFLICT DO NOTHING;

CREATE POLICY "Public can view media files" ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "Authenticated users can upload media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'media' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete media" ON storage.objects FOR DELETE USING (bucket_id = 'media' AND auth.role() = 'authenticated');
