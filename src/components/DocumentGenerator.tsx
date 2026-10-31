import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Printer, 
  Share2, 
  Download, 
  CheckCircle2, 
  Zap, 
  Building2, 
  Phone, 
  MapPin, 
  Receipt, 
  Clock,
  Sparkles,
  Loader2,
  Mail,
  AlertCircle,
  X
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';
import { MotorJob, WorkshopSettings } from '../types';
import { formatCurrency, formatDate, generateWhatsAppLink } from '../utils/formatters';

interface DocumentGeneratorProps {
  jobs: MotorJob[];
  selectedJob?: MotorJob | null;
  settings: WorkshopSettings;
}

export type DocumentType = 'invoice' | 'challan' | 'bill';

export const DocumentGenerator: React.FC<DocumentGeneratorProps> = ({
  jobs,
  selectedJob: initialJob,
  settings,
}) => {
  const [docType, setDocType] = useState<DocumentType>('invoice');
  const [selectedJobId, setSelectedJobId] = useState<string>(initialJob?.id || (jobs[0]?.id || ''));
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isEmailingPdf, setIsEmailingPdf] = useState(false);
  const [statusNotice, setStatusNotice] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const documentRef = useRef<HTMLDivElement>(null);

  // Active job
  const job = jobs.find(j => j.id === selectedJobId) || jobs[0];

  const handlePrint = () => {
    window.print();
  };

  // Reusable PDF generator using html2canvas-pro (oklch compliant) + jsPDF
  const generatePdfDocument = async (): Promise<{ pdf: jsPDF; fileName: string; file: File } | null> => {
    if (!documentRef.current || !job) return null;
    const element = documentRef.current;

    // Capture the element as high-resolution canvas
    const canvas = await html2canvas(element, {
      scale: 2, // 2x for sharp retina text
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
    const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm
    const margin = 8; // 8mm margin
    const printableWidth = pdfWidth - (margin * 2);
    const printableHeight = (canvas.height * printableWidth) / canvas.width;

    if (printableHeight <= pdfHeight - (margin * 2)) {
      // Fits comfortably in a single A4 page
      pdf.addImage(imgData, 'PNG', margin, margin, printableWidth, printableHeight);
    } else {
      // Multi-page handling if content exceeds one page
      let heightLeft = printableHeight;
      let position = margin;

      pdf.addImage(imgData, 'PNG', margin, position, printableWidth, printableHeight);
      heightLeft -= (pdfHeight - margin * 2);

      while (heightLeft > 0) {
        position = heightLeft - printableHeight + margin;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', margin, position, printableWidth, printableHeight);
        heightLeft -= (pdfHeight - margin * 2);
      }
    }

    const cleanClientName = (job.clientName || 'Client').replace(/[^a-zA-Z0-9]/g, '_');
    const cleanShop = settings.shopName.replace(/[^a-zA-Z0-9]/g, '_');
    const docPrefix = docType === 'invoice' ? 'TaxInvoice' : docType === 'challan' ? 'DeliveryChallan' : 'CashBill';
    const fileName = `${cleanShop}_${docPrefix}_${job.jobNumber}_${cleanClientName}.pdf`;

    const blob = pdf.output('blob');
    const file = new File([blob], fileName, { type: 'application/pdf' });

    return { pdf, fileName, file };
  };

  const handleDownloadPdf = async () => {
    if (!job) return;
    setIsGeneratingPdf(true);
    setStatusNotice(null);

    try {
      const result = await generatePdfDocument();
      if (!result) return;

      result.pdf.save(result.fileName);
      setStatusNotice({
        type: 'success',
        message: `PDF saved successfully as "${result.fileName}".`
      });
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      setStatusNotice({
        type: 'error',
        message: 'Unable to render PDF directly. You can use "Print Document (A4)" and select "Save as PDF" from your browser print preview.'
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleEmailPdf = async () => {
    if (!job) return;
    setIsEmailingPdf(true);
    setStatusNotice(null);

    try {
      const result = await generatePdfDocument();
      if (!result) return;

      // Automatically download the generated PDF so client has it locally
      result.pdf.save(result.fileName);

      const docTitle = docType === 'invoice' ? 'Tax Invoice' : docType === 'challan' ? 'Delivery Challan' : 'Cash Bill';
      const docNum = docType === 'invoice' ? `INV-${job.jobNumber}` : docType === 'challan' ? `CHL-${job.jobNumber}` : `BILL-${job.jobNumber}`;
      const subject = `${settings.shopName} - ${docTitle} ${docNum} for ${job.motorSpec.hp} HP ${job.motorSpec.brand} Motor`;
      const body = `Dear ${job.clientName},\n\nPlease find attached your official ${docTitle} (${docNum}) from ${settings.shopName}.\n\nService Details:\n- Job Reference: ${job.jobNumber}\n- Motor: ${job.motorSpec.hp} HP ${job.motorSpec.brand} (${job.motorSpec.phase}, ${job.motorSpec.rpm} RPM)\n- Total Amount: Rs. ${job.billing.totalPayable}\n- Advance Paid: Rs. ${job.billing.advancePaid}\n- Balance Payable: Rs. ${job.billing.balanceDue}\n\nBank Payment Details:\n- Bank: ${settings.bankName}\n- Account Number: ${settings.bankAccountNumber}\n- IFSC Code: ${settings.bankIfsc}\n- UPI: ${settings.upiId || 'N/A'}\n\nIf you have any questions, please contact us at ${settings.phone}.\n\nThank you for choosing ${settings.shopName}!\n${settings.proprietor}`;

      // If Web Share API with file support is available, share directly with attachment
      let sharedViaNative = false;
      if (navigator.canShare && navigator.canShare({ files: [result.file] })) {
        try {
          await navigator.share({
            files: [result.file],
            title: subject,
            text: body,
          });
          sharedViaNative = true;
          setStatusNotice({
            type: 'success',
            message: `Document prepared and shared via your system mail dialog with ${result.fileName} attached!`
          });
        } catch {
          // If user closes or cancels the share sheet, fallback to mailto
          sharedViaNative = false;
        }
      }

      if (!sharedViaNative) {
        // Open user's default email client
        const recipient = job.clientEmail || '';
        const mailtoUrl = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
        // Use an anchor tag click to avoid popup blocker
        const mailLink = document.createElement('a');
        mailLink.href = mailtoUrl;
        document.body.appendChild(mailLink);
        mailLink.click();
        document.body.removeChild(mailLink);

        setStatusNotice({
          type: 'success',
          message: `Generated "${result.fileName}" & opened your email client! The PDF has been downloaded to your machine so you can drag-and-drop or attach it immediately.`
        });
      }
    } catch (error) {
      console.error('Failed to prepare document for email:', error);
      setStatusNotice({
        type: 'error',
        message: 'Could not generate PDF for email. Please try downloading as PDF or printing directly.'
      });
    } finally {
      setIsEmailingPdf(false);
    }
  };

  if (!job) {
    return (
      <div className="p-12 text-center text-slate-400 text-xs bg-slate-900 rounded-2xl border border-slate-800">
        No motor jobs available to generate documents. Please add a motor job first.
      </div>
    );
  }

  const { windingSpecs } = job.motorSpec;
  const { costBreakdown, billing } = job;

  // WhatsApp text for client
  const docTitle = docType === 'invoice' ? 'Tax Invoice' : docType === 'challan' ? 'Delivery Challan' : 'Cash Bill';
  const docNumber = docType === 'invoice' ? `INV-${job.jobNumber}` : docType === 'challan' ? `CHL-${job.jobNumber}` : `BILL-${job.jobNumber}`;
  
  const whatsappMsg = `*${settings.shopName}* - ${docTitle}\nDoc No: *${docNumber}*\nDate: ${formatDate(new Date().toISOString())}\nClient: ${job.clientName} ${job.companyName ? `(${job.companyName})` : ''}\nMotor: ${job.motorSpec.hp} HP ${job.motorSpec.brand} (${job.motorSpec.phase})\nTotal Amount: ₹${billing.totalPayable}\nAdvance Paid: ₹${billing.advancePaid}\nBalance Due: *₹${billing.balanceDue}*\nThank you for choosing ${settings.shopName}! Contact: ${settings.phone}`;
  const whatsappUrl = generateWhatsAppLink(job.clientPhone, whatsappMsg);

  return (
    <div className="space-y-5 pb-16 text-slate-100">
      
      {/* Top Controller Bar (Hidden during print) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Invoices, Challans & Bills Creation Section
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Official document generator for <strong className="text-amber-400">{settings.shopName}</strong>. Save PDF, Email, Print or share on WhatsApp.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf || isEmailingPdf}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              title="Download high-resolution PDF"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-950" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-slate-950" />
                  <span>Save as PDF</span>
                </>
              )}
            </button>

            <button
              onClick={handleEmailPdf}
              disabled={isGeneratingPdf || isEmailingPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              title="Generate PDF and open email client"
            >
              {isEmailingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Preparing Email...</span>
                </>
              ) : (
                <>
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email PDF</span>
                </>
              )}
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share on WhatsApp</span>
            </a>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>Print Document (A4)</span>
            </button>
          </div>
        </div>

        {/* Notification Banner */}
        {statusNotice && (
          <div className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${
            statusNotice.type === 'success' 
              ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-200' 
              : statusNotice.type === 'error'
              ? 'bg-rose-950/60 border-rose-800/80 text-rose-200'
              : 'bg-blue-950/60 border-blue-800/80 text-blue-200'
          }`}>
            <div className="flex items-center gap-2">
              {statusNotice.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{statusNotice.message}</span>
            </div>
            <button 
              onClick={() => setStatusNotice(null)}
              className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Selection Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800">
          
          {/* Document Type Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-300">Document Format:</span>
            <div className="inline-flex rounded-xl p-1 bg-slate-950 border border-slate-800 text-xs font-semibold">
              <button
                onClick={() => setDocType('invoice')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  docType === 'invoice' ? 'bg-slate-800 text-white shadow-xs font-bold border border-slate-700' : 'text-slate-400 hover:text-white'
                }`}
              >
                Tax Invoice (GST)
              </button>
              <button
                onClick={() => setDocType('challan')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  docType === 'challan' ? 'bg-slate-800 text-white shadow-xs font-bold border border-slate-700' : 'text-slate-400 hover:text-white'
                }`}
              >
                Delivery Challan
              </button>
              <button
                onClick={() => setDocType('bill')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  docType === 'bill' ? 'bg-slate-800 text-white shadow-xs font-bold border border-slate-700' : 'text-slate-400 hover:text-white'
                }`}
              >
                Cash Bill / Retail Memo
              </button>
            </div>
          </div>

          {/* Job Card Picker */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-300">Select Motor Job:</span>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="text-xs border border-slate-700 rounded-lg px-3 py-1.5 bg-slate-950 font-medium text-slate-200 focus:border-amber-500 focus:outline-hidden"
            >
              {jobs.map(j => (
                <option key={j.id} value={j.id}>
                  {j.jobNumber} — {j.clientName} ({j.motorSpec.hp} HP {j.motorSpec.brand})
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* PRINTABLE A4 DOCUMENT SHEET (Clean white paper canvas for authentic printing and high-res export) */}
      <div 
        ref={documentRef}
        className="printable-document bg-white border border-slate-300 rounded-2xl shadow-xl p-8 sm:p-10 max-w-4xl mx-auto text-slate-900 space-y-6"
      >
        
        {/* DOCUMENT HEADER */}
        <div className="border-b-2 border-slate-900 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            
            {/* Workshop Branding */}
            <div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center border border-slate-300 flex-shrink-0 bg-slate-950">
                  <img 
                    src="/assets/aistudio/image_d8d9f2b3.png" 
                    alt="Shree Gayatri electricals logo" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-slate-950 uppercase">
                    {settings.shopName}
                  </h1>
                  <p className="text-xs font-semibold text-slate-700">
                    {settings.tagline}
                  </p>
                </div>
              </div>

              <div className="text-xs text-slate-600 mt-2 space-y-0.5">
                <p>{settings.address}, {settings.city} - {settings.pincode}, {settings.state}</p>
                <p>
                  <span>Proprietor: <strong>{settings.proprietor}</strong></span> • 
                  <span> Phone: <strong>{settings.phone}</strong> {settings.alternatePhone ? `/ ${settings.alternatePhone}` : ''}</span>
                </p>
                {settings.gstin && (
                  <p className="font-mono font-bold text-slate-900">
                    GSTIN: {settings.gstin}
                  </p>
                )}
              </div>
            </div>

            {/* Document Title & Reference Number */}
            <div className="text-left sm:text-right self-start">
              <span className="inline-block px-3 py-1 rounded bg-slate-900 text-white text-xs font-black uppercase tracking-wider mb-2">
                {docType === 'invoice' ? 'TAX INVOICE' : docType === 'challan' ? 'DELIVERY CHALLAN' : 'CASH BILL / MEMO'}
              </span>
              <div className="text-xs space-y-1">
                <div>
                  <span className="text-slate-500">Doc No: </span>
                  <strong className="font-mono text-sm text-slate-950">{docNumber}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Date: </span>
                  <strong className="font-mono">{formatDate(new Date().toISOString())}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Job Card Ref: </span>
                  <strong className="font-mono">{job.jobNumber}</strong>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* CLIENT DETAILS BOX */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Billed / Delivered To:
            </span>
            <h3 className="font-bold text-sm text-slate-950">{job.clientName}</h3>
            {job.companyName && (
              <p className="font-semibold text-slate-800">{job.companyName}</p>
            )}
            <p className="text-slate-600 mt-0.5">{job.clientAddress}</p>
            <p className="text-slate-700 mt-1">
              Phone: <strong>{job.clientPhone}</strong>
              {job.clientEmail && (
                <span> • Email: <strong>{job.clientEmail}</strong></span>
              )}
            </p>
          </div>

          <div className="sm:text-right space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Motor Technical Identification:
            </span>
            <p className="font-bold text-slate-950 text-sm">
              {job.motorSpec.hp} HP {job.motorSpec.brand} ({job.motorSpec.phase})
            </p>
            <p className="text-slate-700">
              Speed: <strong>{job.motorSpec.rpm} RPM</strong> • Poles: <strong>{job.motorSpec.poles}P</strong> • Volts: <strong>{job.motorSpec.voltage}V</strong>
            </p>
            <p className="text-slate-700">
              Coil Turns: <strong className="font-mono">{windingSpecs.turnsPerCoil}</strong> • Gauge: <strong className="font-mono text-amber-900">{windingSpecs.wireGaugeSWG}</strong>
            </p>
            <p className="text-slate-700">
              Connection: <strong className="font-mono">{windingSpecs.connection}</strong> • Coils: <strong className="font-mono">{windingSpecs.totalCoils || '-'}</strong>
            </p>
          </div>
        </div>

        {/* ITEMIZED TABLE FOR INVOICE / BILL */}
        {(docType === 'invoice' || docType === 'bill') && (
          <div className="space-y-3">
            <table className="w-full text-left text-xs border border-slate-300 border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 uppercase text-[10px] tracking-wider border-b border-slate-300 font-bold">
                  <th className="py-2.5 px-3 border-r border-slate-300 w-12 text-center">Sr.</th>
                  <th className="py-2.5 px-3 border-r border-slate-300">Description of Electrical Service & Parts</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 w-24 text-center">HSN/SAC</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 w-20 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right w-28">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="py-2.5 px-3 border-r border-slate-200 text-center font-mono">1</td>
                  <td className="py-2.5 px-3 border-r border-slate-200">
                    <span className="font-bold text-slate-950 block">Complete Motor Stator Rewinding & Overhaul</span>
                    <span className="text-[11px] text-slate-600">
                      Electrolytic Grade-1 copper wire winding, Class F insulation, slot papering, baking & dipping in Dr. Beck varnish
                    </span>
                  </td>
                  <td className="py-2.5 px-3 border-r border-slate-200 text-center font-mono text-[11px]">998719</td>
                  <td className="py-2.5 px-3 border-r border-slate-200 text-center">1 Job</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                    {formatCurrency(billing.finalBillAmount - (costBreakdown.bearingsCost > 0 ? 1200 : 0) - (costBreakdown.capacitorCost > 0 ? 350 : 0))}
                  </td>
                </tr>

                {costBreakdown.bearingsCost > 0 && (
                  <tr>
                    <td className="py-2.5 px-3 border-r border-slate-200 text-center font-mono">2</td>
                    <td className="py-2.5 px-3 border-r border-slate-200">
                      <span className="font-bold text-slate-950 block">High-Speed Deep Groove Bearings Replacement</span>
                      <span className="text-[11px] text-slate-600">
                        Front: {windingSpecs.bearingFront || 'SKF/NBC'} & Rear: {windingSpecs.bearingRear || 'SKF/NBC'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-200 text-center font-mono text-[11px]">848210</td>
                    <td className="py-2.5 px-3 border-r border-slate-200 text-center">1 Set</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(1200)}
                    </td>
                  </tr>
                )}

                {costBreakdown.capacitorCost > 0 && (
                  <tr>
                    <td className="py-2.5 px-3 border-r border-slate-200 text-center font-mono">3</td>
                    <td className="py-2.5 px-3 border-r border-slate-200">
                      <span className="font-bold text-slate-950 block">Heavy Duty Motor Run Capacitor</span>
                      <span className="text-[11px] text-slate-600">{windingSpecs.runCapacitorMfd || '40 MFD 440V'}</span>
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-200 text-center font-mono text-[11px]">853225</td>
                    <td className="py-2.5 px-3 border-r border-slate-200 text-center">1 No.</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(350)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Calculations & Totals */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 pt-2">
              
              {/* Left: Bank / Payment Info */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1 sm:w-1/2">
                <span className="font-bold uppercase tracking-wider text-slate-700 block text-[10px]">
                  Bank & UPI Payment Details:
                </span>
                <p>Bank: <strong>{settings.bankName}</strong></p>
                <p>A/C No: <strong className="font-mono">{settings.bankAccountNumber}</strong></p>
                <p>IFSC Code: <strong className="font-mono">{settings.bankIfsc}</strong></p>
                {settings.upiId && (
                  <p>UPI ID: <strong className="font-mono text-blue-700">{settings.upiId}</strong></p>
                )}
              </div>

              {/* Right: Subtotal, Advance, Balance */}
              <div className="sm:w-1/2 space-y-1.5 text-xs text-right">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-600">Subtotal:</span>
                  <span className="font-bold font-mono">{formatCurrency(billing.finalBillAmount)}</span>
                </div>

                {billing.discount > 0 && (
                  <div className="flex justify-between py-1 border-b border-slate-200 text-rose-600">
                    <span>Discount:</span>
                    <span className="font-mono font-bold">- {formatCurrency(billing.discount)}</span>
                  </div>
                )}

                {billing.gstApplicable && (
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-600">GST ({billing.gstRate}%):</span>
                    <span className="font-mono font-bold">{formatCurrency(billing.gstAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between py-1.5 border-b-2 border-slate-900 text-sm font-extrabold text-slate-950">
                  <span>Grand Total:</span>
                  <span className="font-mono">{formatCurrency(billing.totalPayable)}</span>
                </div>

                <div className="flex justify-between py-1 text-slate-700">
                  <span>Advance Received:</span>
                  <span className="font-mono font-bold text-emerald-700">{formatCurrency(billing.advancePaid)}</span>
                </div>

                <div className="flex justify-between py-1.5 bg-slate-100 px-2 rounded-lg font-bold text-slate-950">
                  <span className="text-rose-700">Balance Due (Payable):</span>
                  <span className="font-mono text-base text-rose-700">{formatCurrency(billing.balanceDue)}</span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* DELIVERY CHALLAN SPECIFIC FORMAT */}
        {docType === 'challan' && (
          <div className="space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-3">
              <h4 className="font-bold uppercase tracking-wider text-slate-800 border-b pb-1">
                Motor Rewinding & Overhaul Report
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-slate-500 block">Stator Slots:</span>
                  <span className="font-bold">{windingSpecs.slotCount} Slots</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Total Coils Wound:</span>
                  <span className="font-bold">{windingSpecs.totalCoils || '-'} Coils</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Coil Turns:</span>
                  <span className="font-bold font-mono">{windingSpecs.turnsPerCoil}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Wire Gauge (SWG):</span>
                  <span className="font-bold font-mono text-amber-900">{windingSpecs.wireGaugeSWG}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Connection Type:</span>
                  <span className="font-bold">{windingSpecs.connection}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Copper Wire Spent:</span>
                  <span className="font-bold">{windingSpecs.copperWeightKg} kg</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Front Bearing:</span>
                  <span className="font-bold font-mono">{windingSpecs.bearingFront || 'Replaced'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Rear Bearing:</span>
                  <span className="font-bold font-mono">{windingSpecs.bearingRear || 'Replaced'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">No-Load Test Amps:</span>
                  <span className="font-bold font-mono">{windingSpecs.noLoadAmps ? `${windingSpecs.noLoadAmps} Amps` : 'Verified'}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-1">
              <span className="font-bold text-slate-800 block">Work Carried Out:</span>
              <p className="text-slate-700">
                Complete stripping of burnt coil, chemical core cleaning, Class F slot insulation, dual layer coil rewinding, terminal soldering, vacuum varnish impregnation and heat chamber baking for 5 hours. Motor assembled with dynamic rotor alignment and tested under electrical load.
              </p>
            </div>
          </div>
        )}

        {/* TERMS & SIGNATURE BOX */}
        <div className="pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          
          {/* Terms & Conditions */}
          <div>
            <span className="font-bold uppercase tracking-wider text-slate-700 block mb-1 text-[10px]">
              Terms & Conditions:
            </span>
            <ul className="list-disc pl-4 text-[11px] text-slate-600 space-y-0.5">
              {settings.termsAndConditions.map((term, i) => (
                <li key={i}>{term}</li>
              ))}
            </ul>
          </div>

          {/* Signature Lines */}
          <div className="flex justify-between items-end pt-8 sm:pt-12 text-center text-xs">
            <div>
              <div className="w-32 border-b border-slate-400 mb-1"></div>
              <span className="text-slate-600 text-[11px]">Receiver's Signature</span>
            </div>

            <div>
              <div className="w-40 border-b border-slate-900 mb-1"></div>
              <span className="font-bold text-slate-950 block">For, {settings.shopName}</span>
              <span className="text-[10px] text-slate-500">Authorized Signatory</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
