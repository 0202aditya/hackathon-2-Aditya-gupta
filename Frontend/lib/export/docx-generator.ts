import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  Packer,
} from 'docx';

export interface ExportClauseItem {
  title: string;
  originalText: string;
  suggestedRedline?: string;
  editedRedline?: string;
  explanation?: string;
  decision?: string;
  riskLevel?: string;
}

export interface ExportMissingProtection {
  title: string;
  description: string;
  suggestedClause: string;
  severity?: string;
}

export interface ExportDocxOptions {
  contractTitle: string;
  overallScore: number;
  overallRisk: string;
  summary: string;
  clauses: ExportClauseItem[];
  missingProtections?: ExportMissingProtection[];
}

export async function generateRedlineDocx(options: ExportDocxOptions): Promise<Blob> {
  const { contractTitle, overallScore, overallRisk, summary, clauses, missingProtections } = options;

  const docChildren: (Paragraph | Table)[] = [];

  // Title
  docChildren.push(
    new Paragraph({
      text: contractTitle,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.LEFT,
      spacing: { after: 120 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: 'Contract Auto-Redline: Proposed Contractor Amendments',
          italics: true,
          color: '4B5563',
          size: 22,
        }),
      ],
      spacing: { after: 300 },
    })
  );

  // Summary Metadata Table
  const metaTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 30, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ children: [new TextRun({ text: 'Review Date:', bold: true })] })],
          }),
          new TableCell({
            width: { size: 70, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ text: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) })],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: 'Safety Rating:', bold: true })] })],
          }),
          new TableCell({
            children: [new Paragraph({ text: `${overallScore}/100 (${overallRisk.toUpperCase()} RISK)` })],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: 'Executive Summary:', bold: true })] })],
          }),
          new TableCell({
            children: [new Paragraph({ text: summary })],
          }),
        ],
      }),
    ],
  });

  docChildren.push(metaTable);
  docChildren.push(
    new Paragraph({
      text: '',
      spacing: { after: 400 },
    })
  );

  // Section 1: Proposed Clause Amendments
  docChildren.push(
    new Paragraph({
      text: '1. Proposed Clause Revisions',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: 'The following revisions represent balanced, protective contractor amendments. Strikethrough text represents proposed deletions from the original draft; bold green text represents proposed replacement language.',
          italics: true,
          size: 20,
          color: '6B7280',
        }),
      ],
      spacing: { after: 300 },
    })
  );

  clauses.forEach((c, index) => {
    const replacementText = c.editedRedline || c.suggestedRedline;

    docChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${index + 1}. ${c.title} `,
            bold: true,
            size: 24,
          }),
          new TextRun({
            text: `[${(c.riskLevel || 'medium').toUpperCase()} RISK]`,
            bold: true,
            size: 20,
            color: c.riskLevel === 'high' ? 'EF4444' : c.riskLevel === 'medium' ? 'F59E0B' : '10B981',
          }),
        ],
        spacing: { before: 240, after: 120 },
      })
    );

    if (c.explanation) {
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({ text: 'Commercial Impact: ', bold: true, size: 20, color: '374151' }),
            new TextRun({ text: c.explanation, size: 20, color: '4B5563' }),
          ],
          spacing: { after: 120 },
        })
      );
    }

    // Original Text (Strikethrough / Red)
    docChildren.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'Original Draft: ', bold: true, size: 20, color: 'DC2626' }),
          new TextRun({
            text: `"${c.originalText}"`,
            strike: true,
            color: '991B1B',
            size: 20,
          }),
        ],
        spacing: { after: 120 },
      })
    );

    // Proposed Replacement (Bold / Green)
    if (replacementText) {
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({ text: 'Proposed Redline: ', bold: true, size: 20, color: '059669' }),
            new TextRun({
              text: `"${replacementText}"`,
              bold: true,
              color: '065F46',
              size: 20,
            }),
          ],
          spacing: { after: 240 },
        })
      );
    }
  });

  // Section 2: Missing Protections
  if (missingProtections && missingProtections.length > 0) {
    docChildren.push(
      new Paragraph({
        text: '2. Recommended Missing Provisions',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: 'The original agreement omitted several standard contractor safeguards. We propose adding the following clauses:',
            italics: true,
            size: 20,
            color: '6B7280',
          }),
        ],
        spacing: { after: 240 },
      })
    );

    missingProtections.forEach((item, idx) => {
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${idx + 1}. ${item.title}: `, bold: true, size: 22 }),
            new TextRun({ text: item.description, size: 20, color: '4B5563' }),
          ],
          spacing: { before: 160, after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: 'Suggested Clause: ', bold: true, size: 20, color: '2563EB' }),
            new TextRun({ text: `"${item.suggestedClause}"`, italics: true, size: 20, color: '1E3A8A' }),
          ],
          spacing: { after: 200 },
        })
      );
    });
  }

  // Legal Disclaimer Footer
  docChildren.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'Notice: This document was prepared with Contract Auto-Redline for negotiation purposes. It constitutes commercial contracting guidance and does not replace formal legal counsel.',
          italics: true,
          size: 18,
          color: '9CA3AF',
        }),
      ],
      spacing: { before: 600, after: 200 },
      alignment: AlignmentType.CENTER,
    })
  );

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: docChildren,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  return blob;
}
