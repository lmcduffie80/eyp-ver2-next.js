-- CRM Database Schema for Client Management Platform
-- This schema supports inquiry management, contracts, payments, and client portal

-- ============================================================================
-- 1. CLIENT INQUIRIES
-- ============================================================================
CREATE TABLE IF NOT EXISTS client_inquiries (
  id SERIAL PRIMARY KEY,
  inquiry_number VARCHAR(50) UNIQUE NOT NULL,
  
  -- Client Information
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255) NOT NULL,
  client_phone VARCHAR(50),
  client_company VARCHAR(255),
  
  -- Event Details
  event_type VARCHAR(100),
  event_date DATE,
  event_location TEXT,
  guest_count INTEGER,
  
  -- Service Requests
  services_requested TEXT[],
  budget_range VARCHAR(50),
  message TEXT,
  
  -- Status & Assignment
  status VARCHAR(50) DEFAULT 'new',
  assigned_to INTEGER REFERENCES users(id),
  priority VARCHAR(20) DEFAULT 'normal',
  
  -- Source Tracking
  referral_source VARCHAR(100),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_contacted_at TIMESTAMP,
  
  -- Search
  search_vector tsvector
);

CREATE INDEX IF NOT EXISTS idx_inquiries_status ON client_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_email ON client_inquiries(client_email);
CREATE INDEX IF NOT EXISTS idx_inquiries_date ON client_inquiries(event_date);
CREATE INDEX IF NOT EXISTS idx_inquiries_search ON client_inquiries USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_inquiries_assigned ON client_inquiries(assigned_to);
CREATE INDEX IF NOT EXISTS idx_inquiries_created ON client_inquiries(created_at DESC);

-- ============================================================================
-- 2. CLIENTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS clients (
  id SERIAL PRIMARY KEY,
  client_number VARCHAR(50) UNIQUE NOT NULL,
  
  -- Created from inquiry
  inquiry_id INTEGER REFERENCES client_inquiries(id),
  
  -- Client Information
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255) UNIQUE NOT NULL,
  client_phone VARCHAR(50),
  client_company VARCHAR(255),
  
  -- Portal Access
  portal_password VARCHAR(255),
  portal_activated BOOLEAN DEFAULT FALSE,
  portal_activation_token VARCHAR(255),
  portal_last_login TIMESTAMP,
  
  -- Preferences
  preferred_contact_method VARCHAR(20),
  timezone VARCHAR(50) DEFAULT 'America/New_York',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(client_email);
CREATE INDEX IF NOT EXISTS idx_clients_activation_token ON clients(portal_activation_token);
CREATE INDEX IF NOT EXISTS idx_clients_inquiry ON clients(inquiry_id);

-- ============================================================================
-- 3. PROJECTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  project_number VARCHAR(50) UNIQUE NOT NULL,
  
  -- Relationships
  client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
  inquiry_id INTEGER REFERENCES client_inquiries(id),
  assigned_to INTEGER REFERENCES users(id),
  
  -- Project Details
  project_name VARCHAR(255) NOT NULL,
  event_type VARCHAR(100),
  event_date DATE,
  event_location TEXT,
  guest_count INTEGER,
  services TEXT[],
  
  -- Stage Management
  stage VARCHAR(50) DEFAULT 'inquiry',
  stage_updated_at TIMESTAMP,
  
  -- Financial
  total_amount DECIMAL(10, 2) DEFAULT 0,
  deposit_amount DECIMAL(10, 2) DEFAULT 0,
  deposit_paid BOOLEAN DEFAULT FALSE,
  deposit_paid_at TIMESTAMP,
  final_payment_amount DECIMAL(10, 2) DEFAULT 0,
  final_payment_paid BOOLEAN DEFAULT FALSE,
  final_payment_paid_at TIMESTAMP,
  
  -- Contract
  contract_id INTEGER,
  contract_signed BOOLEAN DEFAULT FALSE,
  contract_signed_at TIMESTAMP,
  
  -- Status
  is_archived BOOLEAN DEFAULT FALSE,
  archived_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_projects_client ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_stage ON projects(stage);
CREATE INDEX IF NOT EXISTS idx_projects_date ON projects(event_date);
CREATE INDEX IF NOT EXISTS idx_projects_assigned ON projects(assigned_to);
CREATE INDEX IF NOT EXISTS idx_projects_archived ON projects(is_archived);

-- ============================================================================
-- 4. CONTRACT TEMPLATES
-- ============================================================================
CREATE TABLE IF NOT EXISTS contract_templates (
  id SERIAL PRIMARY KEY,
  template_name VARCHAR(255) NOT NULL,
  service_type VARCHAR(100),
  
  -- Template Content
  template_content TEXT NOT NULL,
  variables JSONB DEFAULT '[]',
  
  -- Settings
  is_active BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,
  
  -- Created By
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_templates_service ON contract_templates(service_type);
CREATE INDEX IF NOT EXISTS idx_templates_active ON contract_templates(is_active);

-- ============================================================================
-- 5. CONTRACTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS contracts (
  id SERIAL PRIMARY KEY,
  contract_number VARCHAR(50) UNIQUE NOT NULL,
  
  -- Relationships
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
  template_id INTEGER REFERENCES contract_templates(id),
  
  -- Contract Content
  contract_title VARCHAR(255) NOT NULL,
  contract_content TEXT NOT NULL,
  contract_pdf_url TEXT,
  
  -- Status
  status VARCHAR(50) DEFAULT 'draft',
  sent_at TIMESTAMP,
  viewed_at TIMESTAMP,
  signed_at TIMESTAMP,
  expires_at TIMESTAMP,
  
  -- Signature Data
  client_signature_data TEXT,
  client_signed_name VARCHAR(255),
  client_signed_date TIMESTAMP,
  client_ip_address VARCHAR(45),
  
  -- Admin Signature
  admin_signature_data TEXT,
  admin_signed_by INTEGER REFERENCES users(id),
  admin_signed_at TIMESTAMP,
  
  -- Version Control
  version INTEGER DEFAULT 1,
  previous_version_id INTEGER REFERENCES contracts(id),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_contracts_project ON contracts(project_id);
CREATE INDEX IF NOT EXISTS idx_contracts_client ON contracts(client_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);

-- ============================================================================
-- 6. INVOICES
-- ============================================================================
CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  
  -- Relationships
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
  
  -- Invoice Details
  invoice_title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Financial
  subtotal DECIMAL(10, 2) NOT NULL,
  tax_rate DECIMAL(5, 2) DEFAULT 0,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  
  -- Line Items
  line_items JSONB DEFAULT '[]',
  
  -- Payment
  payment_status VARCHAR(50) DEFAULT 'unpaid',
  amount_paid DECIMAL(10, 2) DEFAULT 0,
  payment_method VARCHAR(50),
  stripe_payment_intent_id VARCHAR(255),
  
  -- Dates
  invoice_date DATE NOT NULL,
  due_date DATE,
  paid_at TIMESTAMP,
  
  -- PDF
  invoice_pdf_url TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_invoices_project ON invoices(project_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(payment_status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);

-- ============================================================================
-- 7. PAYMENTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  payment_number VARCHAR(50) UNIQUE NOT NULL,
  
  -- Relationships
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
  invoice_id INTEGER REFERENCES invoices(id),
  
  -- Payment Details
  amount DECIMAL(10, 2) NOT NULL,
  payment_type VARCHAR(50),
  payment_method VARCHAR(50),
  
  -- Stripe Integration
  stripe_payment_intent_id VARCHAR(255) UNIQUE,
  stripe_charge_id VARCHAR(255),
  stripe_customer_id VARCHAR(255),
  stripe_status VARCHAR(50),
  
  -- Transaction Details
  transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reference_number VARCHAR(100),
  notes TEXT,
  
  -- Receipt
  receipt_url TEXT,
  receipt_sent BOOLEAN DEFAULT FALSE,
  receipt_sent_at TIMESTAMP,
  
  -- Status
  status VARCHAR(50) DEFAULT 'completed',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payments_project ON payments(project_id);
CREATE INDEX IF NOT EXISTS idx_payments_client ON payments(client_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_intent ON payments(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(transaction_date);

-- ============================================================================
-- 8. MEETING NOTES
-- ============================================================================
CREATE TABLE IF NOT EXISTS meeting_notes (
  id SERIAL PRIMARY KEY,
  
  -- Relationships
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
  created_by INTEGER REFERENCES users(id),
  
  -- Meeting Details
  meeting_title VARCHAR(255) NOT NULL,
  meeting_date TIMESTAMP,
  meeting_type VARCHAR(50),
  attendees TEXT[],
  
  -- Notes Content
  notes TEXT NOT NULL,
  action_items JSONB DEFAULT '[]',
  
  -- Visibility
  visible_to_client BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notes_project ON meeting_notes(project_id);
CREATE INDEX IF NOT EXISTS idx_notes_client ON meeting_notes(client_id);
CREATE INDEX IF NOT EXISTS idx_notes_date ON meeting_notes(meeting_date);

-- ============================================================================
-- 9. EMAIL LOGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS email_logs (
  id SERIAL PRIMARY KEY,
  
  -- Relationships
  project_id INTEGER REFERENCES projects(id),
  client_id INTEGER REFERENCES clients(id),
  
  -- Email Details
  email_type VARCHAR(100),
  recipient_email VARCHAR(255) NOT NULL,
  recipient_name VARCHAR(255),
  subject VARCHAR(500),
  
  -- Content
  email_body TEXT,
  
  -- Status
  status VARCHAR(50) DEFAULT 'sent',
  provider VARCHAR(50),
  provider_message_id VARCHAR(255),
  error_message TEXT,
  
  -- Tracking
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  
  -- Timestamps
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_email_logs_client ON email_logs(client_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_project ON email_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_type ON email_logs(email_type);

-- ============================================================================
-- 10. CLIENT FILES
-- ============================================================================
CREATE TABLE IF NOT EXISTS client_files (
  id SERIAL PRIMARY KEY,
  
  -- Relationships
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
  uploaded_by INTEGER REFERENCES users(id),
  
  -- File Details
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(100),
  file_size BIGINT,
  file_url TEXT NOT NULL,
  
  -- Categorization
  file_category VARCHAR(100),
  description TEXT,
  
  -- Visibility
  visible_to_client BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_files_project ON client_files(project_id);
CREATE INDEX IF NOT EXISTS idx_files_client ON client_files(client_id);

-- ============================================================================
-- SEQUENCE FUNCTIONS FOR AUTO-INCREMENT IDs
-- ============================================================================

-- Function to generate inquiry numbers
CREATE OR REPLACE FUNCTION generate_inquiry_number()
RETURNS TRIGGER AS $$
DECLARE
  year_suffix VARCHAR(4);
  next_num INTEGER;
BEGIN
  year_suffix := TO_CHAR(CURRENT_DATE, 'YYYY');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(inquiry_number FROM 10) AS INTEGER)), 0) + 1
  INTO next_num
  FROM client_inquiries
  WHERE inquiry_number LIKE 'INQ-' || year_suffix || '-%';
  
  NEW.inquiry_number := 'INQ-' || year_suffix || '-' || LPAD(next_num::TEXT, 3, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_inquiry_number
BEFORE INSERT ON client_inquiries
FOR EACH ROW
WHEN (NEW.inquiry_number IS NULL OR NEW.inquiry_number = '')
EXECUTE FUNCTION generate_inquiry_number();

-- Function to generate client numbers
CREATE OR REPLACE FUNCTION generate_client_number()
RETURNS TRIGGER AS $$
DECLARE
  year_suffix VARCHAR(4);
  next_num INTEGER;
BEGIN
  year_suffix := TO_CHAR(CURRENT_DATE, 'YYYY');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(client_number FROM 9) AS INTEGER)), 0) + 1
  INTO next_num
  FROM clients
  WHERE client_number LIKE 'CL-' || year_suffix || '-%';
  
  NEW.client_number := 'CL-' || year_suffix || '-' || LPAD(next_num::TEXT, 3, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_client_number
BEFORE INSERT ON clients
FOR EACH ROW
WHEN (NEW.client_number IS NULL OR NEW.client_number = '')
EXECUTE FUNCTION generate_client_number();

-- Function to generate project numbers
CREATE OR REPLACE FUNCTION generate_project_number()
RETURNS TRIGGER AS $$
DECLARE
  year_suffix VARCHAR(4);
  next_num INTEGER;
BEGIN
  year_suffix := TO_CHAR(CURRENT_DATE, 'YYYY');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(project_number FROM 10) AS INTEGER)), 0) + 1
  INTO next_num
  FROM projects
  WHERE project_number LIKE 'PRJ-' || year_suffix || '-%';
  
  NEW.project_number := 'PRJ-' || year_suffix || '-' || LPAD(next_num::TEXT, 3, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_project_number
BEFORE INSERT ON projects
FOR EACH ROW
WHEN (NEW.project_number IS NULL OR NEW.project_number = '')
EXECUTE FUNCTION generate_project_number();

-- Function to generate contract numbers
CREATE OR REPLACE FUNCTION generate_contract_number()
RETURNS TRIGGER AS $$
DECLARE
  year_suffix VARCHAR(4);
  next_num INTEGER;
BEGIN
  year_suffix := TO_CHAR(CURRENT_DATE, 'YYYY');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(contract_number FROM 10) AS INTEGER)), 0) + 1
  INTO next_num
  FROM contracts
  WHERE contract_number LIKE 'CNT-' || year_suffix || '-%';
  
  NEW.contract_number := 'CNT-' || year_suffix || '-' || LPAD(next_num::TEXT, 3, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_contract_number
BEFORE INSERT ON contracts
FOR EACH ROW
WHEN (NEW.contract_number IS NULL OR NEW.contract_number = '')
EXECUTE FUNCTION generate_contract_number();

-- Function to generate invoice numbers
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
  year_suffix VARCHAR(4);
  next_num INTEGER;
BEGIN
  year_suffix := TO_CHAR(CURRENT_DATE, 'YYYY');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 10) AS INTEGER)), 0) + 1
  INTO next_num
  FROM invoices
  WHERE invoice_number LIKE 'INV-' || year_suffix || '-%';
  
  NEW.invoice_number := 'INV-' || year_suffix || '-' || LPAD(next_num::TEXT, 3, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_invoice_number
BEFORE INSERT ON invoices
FOR EACH ROW
WHEN (NEW.invoice_number IS NULL OR NEW.invoice_number = '')
EXECUTE FUNCTION generate_invoice_number();

-- Function to generate payment numbers
CREATE OR REPLACE FUNCTION generate_payment_number()
RETURNS TRIGGER AS $$
DECLARE
  year_suffix VARCHAR(4);
  next_num INTEGER;
BEGIN
  year_suffix := TO_CHAR(CURRENT_DATE, 'YYYY');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(payment_number FROM 10) AS INTEGER)), 0) + 1
  INTO next_num
  FROM payments
  WHERE payment_number LIKE 'PAY-' || year_suffix || '-%';
  
  NEW.payment_number := 'PAY-' || year_suffix || '-' || LPAD(next_num::TEXT, 3, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_payment_number
BEFORE INSERT ON payments
FOR EACH ROW
WHEN (NEW.payment_number IS NULL OR NEW.payment_number = '')
EXECUTE FUNCTION generate_payment_number();

-- ============================================================================
-- UPDATE TIMESTAMP TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_inquiries_updated_at
BEFORE UPDATE ON client_inquiries
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_update_clients_updated_at
BEFORE UPDATE ON clients
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_update_projects_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_update_templates_updated_at
BEFORE UPDATE ON contract_templates
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_update_contracts_updated_at
BEFORE UPDATE ON contracts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_update_invoices_updated_at
BEFORE UPDATE ON invoices
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_update_payments_updated_at
BEFORE UPDATE ON payments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_update_notes_updated_at
BEFORE UPDATE ON meeting_notes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
