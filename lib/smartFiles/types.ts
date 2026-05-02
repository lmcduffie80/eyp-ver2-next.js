// ─── Smart Files – shared TypeScript types ────────────────────────────────────
// Used by both API routes and client components.

// ─── Enums / union literals ──────────────────────────────────────────────────

export type SfFileStatus = 'draft' | 'sent' | 'partial' | 'completed' | 'cancelled';

export type SfPageType =
  | 'cover'
  | 'pricing'
  | 'questionnaire'
  | 'contract'
  | 'invoice'
  | 'payment';

export type SfFieldType = 'text' | 'date' | 'email' | 'phone' | 'currency' | 'select';

export type SfSignerRole = 'provider' | 'client';
export type SfSignatureStatus = 'pending' | 'signed';

export type SfPaymentStatus = 'pending' | 'paid' | 'overdue' | 'refunded';

export type SfActorType = 'admin' | 'client' | 'system';

// ─── Block types (discriminated union) ───────────────────────────────────────

export type SfBlockType =
  | 'heading'
  | 'text'
  | 'package_card'
  | 'field_token'
  | 'question'
  | 'signature_block'
  | 'invoice_line'
  | 'payment_schedule'
  | 'image'
  | 'spacer'
  | 'divider'
  | 'company_header';

export interface HeadingBlockContent {
  text: string;
  level: 1 | 2 | 3;
  align?: 'left' | 'center' | 'right';
}

export interface TextBlockContent {
  html: string;
  align?: 'left' | 'center' | 'right';
}

export interface PackageCardContent {
  name: string;
  price: number;
  billingPeriod?: 'one_time' | 'weekly' | 'monthly';
  description: string;
  features: string[];
  note?: string;
}

export interface FieldTokenBlockContent {
  fieldKey: string;
  label: string;
  fieldType: SfFieldType;
  required?: boolean;
}

export interface QuestionBlockContent {
  questionKey: string;
  label: string;
  inputType: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio';
  options?: string[];
  required?: boolean;
  hint?: string;
}

export interface SignatureBlockContent {
  role: SfSignerRole;
  label: string;
  signerName?: string;
  signerEmail?: string;
}

export interface InvoiceLineBlockContent {
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
  note?: string;
}

export interface PaymentScheduleBlockContent {
  schedule: Array<{
    label: string;
    amountCents: number;
    dueDays: number;
  }>;
}

export interface ImageBlockContent {
  url: string;
  alt?: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
}

export interface SpacerBlockContent {
  height: number;
}

export interface DividerBlockContent {
  style?: 'solid' | 'dashed' | 'dotted';
  color?: string;
}

export interface CompanyHeaderBlockContent {
  logoUrl?: string;
  companyName: string;
  tagline?: string;
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
  align?: 'left' | 'center' | 'right';
}

export type SfBlockContent =
  | HeadingBlockContent
  | TextBlockContent
  | PackageCardContent
  | FieldTokenBlockContent
  | QuestionBlockContent
  | SignatureBlockContent
  | InvoiceLineBlockContent
  | PaymentScheduleBlockContent
  | ImageBlockContent
  | SpacerBlockContent
  | DividerBlockContent
  | CompanyHeaderBlockContent;

// ─── Core entities ────────────────────────────────────────────────────────────

export interface SfTheme {
  primaryColor: string;
  accentColor: string;
  bodyFont: string;
  headingFont: string;
  logoUrl?: string;
  backgroundColor?: string;
}

export const SF_DEFAULT_THEME: SfTheme = {
  primaryColor: '#1a1a1a',
  accentColor: '#3b82f6',
  bodyFont: 'Inter',
  headingFont: 'Inter',
  backgroundColor: '#ffffff',
};

export interface SmartFile {
  id: number;
  ownerUserId: number;
  title: string;
  status: SfFileStatus;
  theme: SfTheme;
  currentVersion: number;
  isTemplate: boolean;
  clientName?: string;
  clientEmail?: string;
  eventDate?: string;
  notes?: string;
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SfPage {
  id: number;
  fileId: number;
  pageType: SfPageType;
  title: string;
  position: number;
  settings: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface SfBlock {
  id: number;
  pageId: number;
  blockType: SfBlockType;
  content: SfBlockContent;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface SfField {
  id: number;
  fileId: number;
  key: string;
  label: string;
  value: string | null;
  fieldType: SfFieldType;
  required: boolean;
  position: number;
}

export interface SfQuestionnaireAnswer {
  id: number;
  fileId: number;
  questionKey: string;
  answer: unknown;
  updatedAt: string;
}

export interface SfSignature {
  id: number;
  fileId: number;
  signerRole: SfSignerRole;
  signerName: string;
  signerEmail: string;
  status: SfSignatureStatus;
  signaturePngUrl?: string;
  typedName?: string;
  signedAt?: string;
  ip?: string;
  userAgent?: string;
  htmlSnapshotHash?: string;
}

export interface SfInvoiceItem {
  id: number;
  fileId: number;
  description: string;
  qty: number;
  unitPrice: number;
  taxRate: number;
  position: number;
}

export interface SfPaymentSchedule {
  id: number;
  fileId: number;
  label: string;
  amountCents: number;
  dueDate: string;
  status: SfPaymentStatus;
  stripePaymentIntentId?: string;
  paidAt?: string;
}

export interface SfPayment {
  id: number;
  fileId: number;
  scheduleId: number;
  amountCents: number;
  method: string;
  stripeChargeId?: string;
  paidAt: string;
}

export interface SfShareToken {
  id: number;
  fileId: number;
  tokenHash: string;
  recipientEmail: string;
  expiresAt: string;
  lastViewedAt?: string;
  createdAt: string;
}

export interface SfAuditEvent {
  id: number;
  fileId: number;
  actorType: SfActorType;
  actorId?: string;
  event: string;
  payload: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  createdAt: string;
}

export interface SfTemplate {
  id: number;
  name: string;
  sourceFileId: number;
  category?: string;
  theme: SfTheme;
  structure: unknown;
  createdAt: string;
}

export interface SfComment {
  id: number;
  fileId: number;
  blockId?: number;
  authorType: SfActorType;
  authorId: string;
  body: string;
  resolved: boolean;
  createdAt: string;
}

// ─── API request/response shapes ──────────────────────────────────────────────

export interface CreateSmartFileBody {
  title: string;
  clientName?: string;
  clientEmail?: string;
  eventDate?: string;
  notes?: string;
  fromTemplateId?: number;
}

export interface UpdateSmartFileBody {
  title?: string;
  status?: SfFileStatus;
  theme?: Partial<SfTheme>;
  clientName?: string;
  clientEmail?: string;
  eventDate?: string;
  notes?: string;
  pdfUrl?: string;
}

export interface CreatePageBody {
  pageType: SfPageType;
  title?: string;
  position?: number;
  settings?: Record<string, unknown>;
}

export interface UpdatePageBody {
  title?: string;
  position?: number;
  settings?: Record<string, unknown>;
}

export interface CreateBlockBody {
  blockType: SfBlockType;
  content: SfBlockContent;
  position?: number;
}

export interface UpdateBlockBody {
  content?: SfBlockContent;
  position?: number;
}

export interface UpsertFieldBody {
  key: string;
  label: string;
  value?: string;
  fieldType?: SfFieldType;
  required?: boolean;
  position?: number;
}

export interface ReorderItem {
  id: number;
  position: number;
}

// ─── Enriched / joined shapes for the editor ─────────────────────────────────

export interface SfPageWithBlocks extends SfPage {
  blocks: SfBlock[];
}

export interface SmartFileDetail extends SmartFile {
  pages: SfPageWithBlocks[];
  fields: SfField[];
  signatures: SfSignature[];
  invoiceItems: SfInvoiceItem[];
  paymentSchedule: SfPaymentSchedule[];
}
