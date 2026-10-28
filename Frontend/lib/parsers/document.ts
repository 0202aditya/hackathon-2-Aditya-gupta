import { extractText } from 'unpdf';
import mammoth from 'mammoth';

export interface ParseResult {
  text: string;
  pageCount?: number;
  wordCount: number;
}

/**
 * In-memory document parser supporting PDF, DOCX, and plain text.
 * Never persists raw files to disk to preserve user confidentiality.
 */
export async function parseDocument(fileBuffer: Buffer | Uint8Array, fileName: string): Promise<ParseResult> {
  const extension = fileName.split('.').pop()?.toLowerCase();

  let text = '';
  let pageCount: number | undefined;

  if (extension === 'pdf') {
    const uint8 = fileBuffer instanceof Uint8Array ? fileBuffer : new Uint8Array(fileBuffer);
    const result = await extractText(uint8);
    pageCount = result.totalPages;
    if (Array.isArray(result.text)) {
      text = result.text.join('\n\n');
    } else {
      text = String(result.text || '');
    }
  } else if (extension === 'docx') {
    const buffer = Buffer.isBuffer(fileBuffer) ? fileBuffer : Buffer.from(fileBuffer);
    const result = await mammoth.extractRawText({ buffer });
    text = result.value;
  } else if (extension === 'txt' || extension === 'md') {
    const buffer = Buffer.isBuffer(fileBuffer) ? fileBuffer : Buffer.from(fileBuffer);
    text = buffer.toString('utf-8');
  } else {
    throw new Error(`Unsupported file type: .${extension}. Please upload a PDF, DOCX, or TXT file.`);
  }

  const cleaned = text.trim();
  if (!cleaned || cleaned.length < 50) {
    throw new Error('The uploaded document appears to be empty or unreadable. Please check the file.');
  }

  const wordCount = cleaned.split(/\s+/).filter(Boolean).length;

  return {
    text: cleaned,
    pageCount,
    wordCount,
  };
}

/**
 * PII redaction utility to mask sensitive customer/contractor personal data
 * before sending to AI if user opted in.
 */
export function redactPII(text: string): string {
  let redacted = text;

  // Mask Email addresses
  redacted = redacted.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED_EMAIL]');

  // Mask Phone numbers (US & international variations)
  redacted = redacted.replace(/(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/g, '[REDACTED_PHONE]');

  // Mask SSN / Aadhaar / national ID numbers
  redacted = redacted.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[REDACTED_SSN]');
  redacted = redacted.replace(/\b\d{4}\s\d{4}\s\d{4}\b/g, '[REDACTED_ID]');

  // Mask Credit Card numbers (13-19 digits with dashes or spaces)
  redacted = redacted.replace(/\b(?:\d{4}[ -]?){3}(?:\d{4}|\d{1,3})\b/g, '[REDACTED_CARD]');

  return redacted;
}
