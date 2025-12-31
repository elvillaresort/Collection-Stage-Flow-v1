import jsPDF from 'jspdf';
import { SmallClaimsCaseDetails } from '../types';

/**
 * Utility functions for generating PDF documents from HTML templates
 */

/**
 * Convert HTML content to PDF and trigger download
 * @param html - HTML string content to convert
 * @param filename - Name of the PDF file (without .pdf extension)
 */
/**
 * Convert HTML content to PDF using browser's print functionality
 * This is more reliable than jsPDF's html() method
 * @param html - HTML string content to convert
 * @param filename - Name of the PDF file (for display purposes)
 */
export const htmlToPDF = (html: string, filename: string): void => {
    // Open a new window with the HTML content
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert('Please allow popups to download PDFs');
        return;
    }

    // Write the HTML content with proper styling for legal-size paper
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${filename}</title>
            <style>
                @page {
                    size: legal; /* 8.5 x 14 inches */
                    margin: 0.75in;
                }
                @media print {
                    body {
                        margin: 0;
                        padding: 0;
                    }
                    .no-print {
                        display: none;
                    }
                }
                body {
                    font-family: 'Times New Roman', serif;
                    font-size: 12pt;
                    line-height: 1.6;
                    max-width: 8.5in;
                    margin: 0 auto;
                    padding: 0.75in;
                }
            </style>
        </head>
        <body>
            <div class="no-print" style="position: fixed; top: 10px; right: 10px; background: #4CAF50; color: white; padding: 10px 20px; border-radius: 5px; cursor: pointer; z-index: 1000;" onclick="window.print()">
                📄 Click here or use Ctrl+P to save as PDF
            </div>
            ${html}
            <script>
                // Auto-trigger print dialog after a short delay
                setTimeout(() => {
                    window.print();
                }, 500);
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
};

/**
 * Alternative method: Convert HTML to PDF using simple text extraction
 * This is a fallback for simpler documents
 */
export const htmlToPDFSimple = (html: string, filename: string): void => {
    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'in',
        format: 'legal'
    });

    // Extract text content from HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';

    // Split text into lines and add to PDF
    const lines = pdf.splitTextToSize(textContent, 7.5); // 7.5 inches width (with margins)

    let y = 1; // Start 1 inch from top
    const lineHeight = 0.2;
    const pageHeight = 13; // 14 inches - 1 inch bottom margin

    lines.forEach((line: string) => {
        if (y > pageHeight) {
            pdf.addPage();
            y = 1;
        }
        pdf.text(line, 0.5, y); // 0.5 inch left margin
        y += lineHeight;
    });

    pdf.save(`${filename}.pdf`);
};

/**
 * Download a Blob as a file
 * @param blob - Blob to download
 * @param filename - Name of the file
 */
export const downloadBlob = (blob: Blob, filename: string): void => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

/**
 * Generate a complete filing packet with all required documents
 * @param caseDetails - Case details for document generation
 * @param documents - Array of generated document HTML strings
 * @returns Promise that resolves when download is complete
 */
export const generateFilingPacket = async (
    caseDetails: SmallClaimsCaseDetails,
    documents: { type: string; content: string }[]
): Promise<void> => {
    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'in',
        format: 'legal'
    });

    // Add cover page
    pdf.setFontSize(16);
    pdf.text('SMALL CLAIMS FILING PACKET', 4.25, 2, { align: 'center' });

    pdf.setFontSize(12);
    pdf.text(`Case: ${caseDetails.creditorName} vs. ${caseDetails.debtorName}`, 4.25, 3, { align: 'center' });
    pdf.text(`Reference: ${caseDetails.referenceNumber}`, 4.25, 3.5, { align: 'center' });
    pdf.text(`Court: ${caseDetails.courtBranch}`, 4.25, 4, { align: 'center' });

    pdf.setFontSize(10);
    pdf.text(`Generated: ${new Date().toLocaleDateString('en-PH')}`, 4.25, 5, { align: 'center' });

    // Add table of contents
    pdf.addPage();
    pdf.setFontSize(14);
    pdf.text('TABLE OF CONTENTS', 4.25, 1.5, { align: 'center' });

    pdf.setFontSize(10);
    let tocY = 2.5;
    documents.forEach((doc, index) => {
        pdf.text(`${index + 1}. ${doc.type}`, 1, tocY);
        pdf.text(`Page ${index + 3}`, 7, tocY);
        tocY += 0.3;
    });

    // Add each document
    for (const doc of documents) {
        pdf.addPage();

        // Create temporary container for HTML
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = doc.content;
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.width = '8.5in';
        document.body.appendChild(tempContainer);

        // Add HTML content to PDF
        await new Promise<void>((resolve) => {
            pdf.html(tempContainer, {
                callback: () => {
                    document.body.removeChild(tempContainer);
                    resolve();
                },
                x: 0,
                y: 0,
                width: 8.5,
                windowWidth: 816
            });
        });
    }

    // Download the complete packet
    pdf.save(`Filing_Packet_${caseDetails.referenceNumber}_${Date.now()}.pdf`);
};

/**
 * Print HTML content directly (opens print dialog)
 * @param html - HTML content to print
 */
export const printHTML = (html: string): void => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Document</title>
          <style>
            @page { size: legal; margin: 0.75in; }
            body { margin: 0; padding: 0; }
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    }
};
