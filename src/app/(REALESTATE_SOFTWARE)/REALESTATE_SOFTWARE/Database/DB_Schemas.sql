-- Real Estate Software Database Schema
-- Run these queries in your Supabase SQL Editor

-- ==========================================
-- DANGER: DROP EXISTING SCHEMA
-- ==========================================
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.sales_payouts CASCADE;
DROP TABLE IF EXISTS public.inventory_plots CASCADE;
DROP TABLE IF EXISTS public.wings CASCADE;
DROP TABLE IF EXISTS public.developer_mandates CASCADE;
DROP TABLE IF EXISTS public.system_settings CASCADE;
DROP TABLE IF EXISTS public.realestate_users CASCADE;

DROP TABLE IF EXISTS public.S_audit_logs CASCADE;
DROP TABLE IF EXISTS public.S_sales_payouts CASCADE;
DROP TABLE IF EXISTS public.S_inventory_plots CASCADE;
DROP TABLE IF EXISTS public.S_wings CASCADE;
DROP TABLE IF EXISTS public.S_developer_mandates CASCADE;
DROP TABLE IF EXISTS public.S_system_settings CASCADE;
DROP TABLE IF EXISTS public.S_modules CASCADE;
DROP TABLE IF EXISTS public.S_wing_agents CASCADE;
DROP TABLE IF EXISTS public.S_realestate_users CASCADE;

DROP TYPE IF EXISTS public.realestate_role CASCADE;
DROP TYPE IF EXISTS public.plot_status CASCADE;
DROP TYPE IF EXISTS public.payout_status CASCADE;

DROP SEQUENCE IF EXISTS public.bhuwanta_id_seq CASCADE;
-- ==========================================
-- 1. Create enum type for roles
CREATE TYPE public.realestate_role AS ENUM ('it', 'partner', 'wing_leader', 'agent', 'customer');

-- 2. Create sequence for Bhuwanta ID
CREATE SEQUENCE IF NOT EXISTS public.bhuwanta_id_seq START 1;

-- 3. Create user profiles/roles table
CREATE TABLE public.S_realestate_users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    bhuwanta_id VARCHAR(20) UNIQUE,
    phone VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(100),
    role public.realestate_role NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Setup Row Level Security (RLS)
ALTER TABLE public.S_realestate_users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" 
    ON public.S_realestate_users FOR SELECT 
    USING (auth.uid() = id);

-- Policy: Only admins/superusers can insert/update roles (or add specific logic later)
-- Example placeholder policy
CREATE POLICY "Admins can insert profiles" 
    ON public.S_realestate_users FOR INSERT 
    WITH CHECK (auth.role() = 'service_role');

-- 5. Create triggers for modified time and auto-id
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_S_realestate_users_modtime
    BEFORE UPDATE ON public.S_realestate_users
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE OR REPLACE FUNCTION generate_bhuwanta_id()
RETURNS TRIGGER AS $$
BEGIN
    -- LPAD pads the sequence number with zeros to ensure it's at least 5 digits long
    NEW.bhuwanta_id := 'BHUWANTA-' || LPAD(nextval('public.bhuwanta_id_seq')::text, 5, '0');
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER assign_bhuwanta_id
    BEFORE INSERT ON public.S_realestate_users
    FOR EACH ROW
    EXECUTE FUNCTION generate_bhuwanta_id();

-- Add more tables below as the software expands...

-- 5. System Settings Table (Managed by IT)
CREATE TABLE public.S_system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    master_equity_split DECIMAL(5,2) DEFAULT 0.00,
    kill_switch_active BOOLEAN DEFAULT false,
    updated_by UUID REFERENCES public.S_realestate_users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Developer Mandates Table
CREATE TABLE public.S_developer_mandates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    developer_name VARCHAR(255) NOT NULL,
    mandate_percentage DECIMAL(5,2) NOT NULL,
    dossier_url TEXT,
    layout_map_url TEXT,
    created_by UUID REFERENCES public.S_realestate_users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Wings Table
CREATE TABLE public.S_wings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wing_leader_id UUID REFERENCES public.S_realestate_users(id) NOT NULL,
    wing_budget_percentage DECIMAL(5,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7.5. Wing Agents Mapping
CREATE TABLE public.S_wing_agents (
    wing_id UUID REFERENCES public.S_wings(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES public.S_realestate_users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (wing_id, agent_id)
);

-- 8. Inventory / Plots Table
CREATE TYPE public.plot_status AS ENUM ('available', 'token_paid', 'fully_paid', 'registered');

CREATE TABLE public.S_inventory_plots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.S_projects(id) ON DELETE CASCADE,
    plot_number VARCHAR(50) NOT NULL,
    size_sqft DECIMAL(10,2) NOT NULL,
    dimensions VARCHAR(100),
    facing VARCHAR(50),
    total_price DECIMAL(15,2) NOT NULL,
    min_token_advance DECIMAL(15,2) NOT NULL,
    assigned_wing_id UUID REFERENCES public.S_wings(id),
    commission_override DECIMAL(5,2),
    status public.plot_status DEFAULT 'available',
    registration_completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Sales & Payouts Table
CREATE TYPE public.payout_status AS ENUM ('pending', 'processing', 'completed', 'failed');

CREATE TABLE public.S_sales_payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plot_id UUID REFERENCES public.S_inventory_plots(id) NOT NULL,
    agent_id UUID REFERENCES public.S_realestate_users(id) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    payout_status public.payout_status DEFAULT 'pending',
    razorpay_tx_id VARCHAR(255),
    scheduled_for TIMESTAMP WITH TIME ZONE,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Audit Logs Table
CREATE TABLE public.S_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES public.S_realestate_users(id) NOT NULL,
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Modules Configuration Table
CREATE TABLE public.S_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_key VARCHAR(100) UNIQUE NOT NULL,
    module_name VARCHAR(100) NOT NULL,
    description TEXT,
    enabled_roles JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- AREAS AND PROJECTS (Many-to-Many)
-- ==========================================
DROP TABLE IF EXISTS public.S_project_areas CASCADE;
DROP TABLE IF EXISTS public.S_projects CASCADE;
DROP TABLE IF EXISTS public.S_areas CASCADE;

-- 11. Areas Table
CREATE TABLE public.S_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    created_by UUID REFERENCES public.S_realestate_users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 12. Projects Table
CREATE TABLE public.S_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    location VARCHAR(255),
    google_maps_url TEXT,
    created_by UUID REFERENCES public.S_realestate_users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 13. Project <-> Area Mapping (Many-to-Many)
CREATE TABLE public.S_project_areas (
    project_id UUID REFERENCES public.S_projects(id) ON DELETE CASCADE,
    area_id UUID REFERENCES public.S_areas(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (project_id, area_id)
);

-- 14. Project Documents (Brochures, Layouts, etc)
CREATE TABLE public.s_project_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.s_projects(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL, -- 'brochure', 'layout', 'linkdocument'
    file_url TEXT NOT NULL,
    file_name VARCHAR(255),
    created_by UUID REFERENCES public.s_realestate_users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- WING LEADER STATS VIEW
-- ==========================================
DROP VIEW IF EXISTS public.v_wing_leader_stats CASCADE;

CREATE VIEW public.v_wing_leader_stats AS
SELECT 
    w.id AS wing_id,
    w.wing_leader_id,
    u.full_name AS wing_leader_name,
    w.wing_budget_percentage,
    p.project_id,
    proj.name AS project_name,
    COUNT(p.id) AS total_plots,
    SUM(p.total_price) AS total_value,
    (SUM(p.total_price) * (w.wing_budget_percentage / 100)) AS total_budget
FROM public.s_wings w
JOIN public.s_realestate_users u ON w.wing_leader_id = u.id
JOIN public.s_inventory_plots p ON p.assigned_wing_id = w.id
JOIN public.s_projects proj ON p.project_id = proj.id
GROUP BY 
    w.id,
    w.wing_leader_id,
    u.full_name,
    w.wing_budget_percentage,
    p.project_id,
    proj.name;
