// PDF generation for Smart Files using @react-pdf/renderer
// Generates a summary PDF at full execution and returns the S3 URL.

import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import type { SmartFileDetail } from './types';

const s3 = new S3Client({
  region: process.env.AWS_REGION ?? 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
  },
});

const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontFamily: 'Helvetica',
    fontSize: 11,
    color: '#1a1a1a',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 24,
    borderBottom: '1pt solid #e5e7eb',
    paddingBottom: 12,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: '#6b7280',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 6,
    color: '#374151',
    borderBottom: '0.5pt solid #e5e7eb',
    paddingBottom: 4,
  },
  row: {
    flexDirection: 'row' as const,
    marginBottom: 4,
    flexWrap: 'wrap' as const,
  },
  label: {
    width: '35%',
    color: '#6b7280',
    fontSize: 10,
  },
  value: {
    width: '65%',
    fontSize: 10,
  },
  tableHeader: {
    flexDirection: 'row' as const,
    backgroundColor: '#f9fafb',
    padding: '6 8',
    borderBottom: '0.5pt solid #e5e7eb',
  },
  tableRow: {
    flexDirection: 'row' as const,
    padding: '5 8',
    borderBottom: '0.5pt solid #f3f4f6',
  },
  tableCol1: { width: '50%', fontSize: 10 },
  tableCol2: { width: '17%', fontSize: 10, textAlign: 'right' as const },
  tableCol3: { width: '17%', fontSize: 10, textAlign: 'right' as const },
  tableCol4: { width: '16%', fontSize: 10, textAlign: 'right' as const, fontFamily: 'Helvetica-Bold' },
  sigBox: {
    border: '1pt solid #e5e7eb',
    borderRadius: 4,
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#f9fafb',
  },
  sigName: {
    fontSize: 13,
    fontFamily: 'Helvetica-BoldOblique',
    marginBottom: 4,
  },
  sigMeta: {
    fontSize: 8,
    color: '#9ca3af',
  },
  footer: {
    position: 'absolute' as const,
    bottom: 32,
    left: 48,
    right: 48,
    textAlign: 'center' as const,
    fontSize: 8,
    color: '#9ca3af',
    borderTop: '0.5pt solid #e5e7eb',
    paddingTop: 8,
  },
});

// ─── React-PDF Document component ────────────────────────────────────────────

function ContractPDF({ file }: { file: SmartFileDetail }) {
  const invoiceTotal = file.invoiceItems.reduce((s, i) => s + i.qty * i.unitPrice, 0);
  const providerSig = file.signatures.find((s) => s.signerRole === 'provider');
  const clientSig = file.signatures.find((s) => s.signerRole === 'client');

  return React.createElement(Document, { title: file.title },
    React.createElement(Page, { size: 'LETTER', style: styles.page },
      // Header
      React.createElement(View, { style: styles.header },
        React.createElement(Text, { style: styles.title }, file.title),
        React.createElement(Text, { style: styles.subtitle },
          `Generated ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} · Externally Yours Productions, LLC`
        )
      ),

      // Client info
      React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, 'Client Information'),
        file.clientName && React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.label }, 'Client Name'),
          React.createElement(Text, { style: styles.value }, file.clientName)
        ),
        file.clientEmail && React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.label }, 'Client Email'),
          React.createElement(Text, { style: styles.value }, file.clientEmail)
        ),
        file.eventDate && React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.label }, 'Event Date'),
          React.createElement(Text, { style: styles.value }, new Date(file.eventDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }))
        ),
      ),

      // Fields
      file.fields.length > 0 && React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, 'Contract Details'),
        ...file.fields.map((f) =>
          React.createElement(View, { key: f.id, style: styles.row },
            React.createElement(Text, { style: styles.label }, f.label),
            React.createElement(Text, { style: styles.value }, f.value ?? '—')
          )
        )
      ),

      // Invoice
      file.invoiceItems.length > 0 && React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, 'Invoice'),
        React.createElement(View, { style: styles.tableHeader },
          React.createElement(Text, { style: styles.tableCol1 }, 'Service'),
          React.createElement(Text, { style: styles.tableCol2 }, 'Qty'),
          React.createElement(Text, { style: styles.tableCol3 }, 'Unit Price'),
          React.createElement(Text, { style: styles.tableCol4 }, 'Total'),
        ),
        ...file.invoiceItems.map((item) =>
          React.createElement(View, { key: item.id, style: styles.tableRow },
            React.createElement(Text, { style: styles.tableCol1 }, item.description),
            React.createElement(Text, { style: styles.tableCol2 }, String(item.qty)),
            React.createElement(Text, { style: styles.tableCol3 }, `$${item.unitPrice.toFixed(2)}`),
            React.createElement(Text, { style: styles.tableCol4 }, `$${(item.qty * item.unitPrice).toFixed(2)}`),
          )
        ),
        React.createElement(View, { style: { ...styles.tableRow, backgroundColor: '#f9fafb' } },
          React.createElement(Text, { style: { ...styles.tableCol1, fontFamily: 'Helvetica-Bold' } }, 'Total'),
          React.createElement(Text, { style: styles.tableCol2 }, ''),
          React.createElement(Text, { style: styles.tableCol3 }, ''),
          React.createElement(Text, { style: styles.tableCol4 }, `$${invoiceTotal.toFixed(2)}`),
        )
      ),

      // Payment schedule
      file.paymentSchedule.length > 0 && React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, 'Payment Schedule'),
        ...file.paymentSchedule.map((s) =>
          React.createElement(View, { key: s.id, style: styles.row },
            React.createElement(Text, { style: styles.label }, s.label),
            React.createElement(Text, { style: styles.value },
              `$${(s.amountCents / 100).toFixed(2)} — Due ${new Date(s.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} — ${s.status}`
            )
          )
        )
      ),

      // Signatures
      React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, 'Electronic Signatures'),
        providerSig && React.createElement(View, { style: styles.sigBox },
          React.createElement(Text, { style: { fontSize: 9, color: '#6b7280', marginBottom: 3 } }, 'Provider — Externally Yours Productions, LLC'),
          React.createElement(Text, { style: styles.sigName }, providerSig.typedName ?? providerSig.signerName),
          React.createElement(Text, { style: styles.sigMeta },
            providerSig.signedAt
              ? `Signed ${new Date(providerSig.signedAt).toLocaleString('en-US')} · ${providerSig.signerEmail}`
              : 'Pending signature'
          )
        ),
        clientSig && React.createElement(View, { style: styles.sigBox },
          React.createElement(Text, { style: { fontSize: 9, color: '#6b7280', marginBottom: 3 } }, 'Client'),
          React.createElement(Text, { style: styles.sigName }, clientSig.typedName ?? clientSig.signerName),
          React.createElement(Text, { style: styles.sigMeta },
            clientSig.signedAt
              ? `Signed ${new Date(clientSig.signedAt).toLocaleString('en-US')} · ${clientSig.signerEmail}`
              : 'Pending signature'
          ),
          clientSig.ip && React.createElement(Text, { style: { ...styles.sigMeta, marginTop: 2 } },
            `IP: ${clientSig.ip}` + (clientSig.htmlSnapshotHash ? ` · Hash: ${clientSig.htmlSnapshotHash.slice(0, 16)}…` : '')
          )
        )
      ),

      // Footer
      React.createElement(View, { style: styles.footer, fixed: true },
        React.createElement(Text, {},
          'Externally Yours Productions, LLC · 181 Cedar Ridge Rd, Tifton, GA 31794 · (229) 326-5408 · lee@externallyyyoursproductions.com'
        )
      )
    )
  );
}

// ─── Generate + upload to S3 ──────────────────────────────────────────────────

export async function generateAndUploadPdf(file: SmartFileDetail): Promise<string> {
  const doc = React.createElement(ContractPDF, { file });
  const buffer = await renderToBuffer(doc as any);

  const bucket = process.env.AWS_S3_BUCKET ?? '';
  const key = `smart-files/pdfs/sf-${file.id}-${Date.now()}.pdf`;

  await s3.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: 'application/pdf',
    ContentDisposition: `attachment; filename="Contract-${file.id}.pdf"`,
  }));

  const region = process.env.AWS_REGION ?? 'us-east-1';
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}
