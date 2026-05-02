'use client';

import React from 'react';
import type { SfBlock, SfTheme, SfField } from '@/lib/smartFiles/types';
import HeadingBlock from './HeadingBlock';
import TextBlock from './TextBlock';
import PackageCardBlock from './PackageCardBlock';
import FieldTokenBlock from './FieldTokenBlock';
import QuestionBlock from './QuestionBlock';
import SignatureBlockRenderer from './SignatureBlockRenderer';
import ImageBlock from './ImageBlock';
import SpacerBlock from './SpacerBlock';
import DividerBlock from './DividerBlock';
import CompanyHeaderBlock from './CompanyHeaderBlock';
import InvoiceLineBlock from './InvoiceLineBlock';
import PaymentScheduleBlock from './PaymentScheduleBlockRenderer';

interface BlockRendererProps {
  block: SfBlock;
  theme: SfTheme;
  fields: SfField[];
  mode: 'editor' | 'viewer';
  onFieldChange?: (key: string, value: string) => void;
  selected?: boolean;
  onClick?: () => void;
}

export default function BlockRenderer({
  block,
  theme,
  fields,
  mode,
  onFieldChange,
  selected,
  onClick,
}: BlockRendererProps) {
  const props = { content: block.content as any, theme, fields, mode, onFieldChange };

  const inner = (() => {
    switch (block.blockType) {
      case 'heading':         return <HeadingBlock {...props} />;
      case 'text':            return <TextBlock {...props} />;
      case 'package_card':    return <PackageCardBlock {...props} />;
      case 'field_token':     return <FieldTokenBlock {...props} />;
      case 'question':        return <QuestionBlock {...props} />;
      case 'signature_block': return <SignatureBlockRenderer {...props} />;
      case 'image':           return <ImageBlock {...props} />;
      case 'spacer':          return <SpacerBlock {...props} />;
      case 'divider':         return <DividerBlock {...props} />;
      case 'company_header':  return <CompanyHeaderBlock {...props} />;
      case 'invoice_line':    return <InvoiceLineBlock {...props} />;
      case 'payment_schedule':return <PaymentScheduleBlock {...props} />;
      default:
        return (
          <div className="text-xs text-gray-400 italic p-2 border border-dashed rounded">
            Unknown block type: {block.blockType}
          </div>
        );
    }
  })();

  if (mode === 'viewer') return <div className="mb-4">{inner}</div>;

  return (
    <div
      onClick={onClick}
      className={`group relative mb-2 rounded-lg transition-all ${
        selected
          ? 'ring-2 ring-blue-500 bg-blue-50/30'
          : 'hover:ring-1 hover:ring-gray-300 hover:bg-gray-50/50'
      } cursor-pointer`}
    >
      <div className="absolute -left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-gray-300 text-sm select-none">
        ⠿
      </div>
      {inner}
    </div>
  );
}
