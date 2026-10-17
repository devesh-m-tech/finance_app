import { Injectable } from '@nestjs/common';

@Injectable()
export class PdfService {
  /**
   * Generates formatted printable HTML document ready for PDF streaming.
   */
  generateReceiptHtml(data: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 24px; color: #1F2937; }
          .header { text-align: center; border-bottom: 2px solid #FFC107; padding-bottom: 12px; margin-bottom: 20px; }
          .title { font-size: 20px; font-weight: bold; margin: 0; }
          .sub { font-size: 13px; color: #6B7280; }
          .table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 14px; }
          .table th, .table td { padding: 8px 12px; text-align: left; }
          .total { background: #FFF3CD; font-weight: bold; font-size: 16px; }
          .footer { text-align: center; margin-top: 32px; font-size: 12px; color: #9CA3AF; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">SHRI AMUDHA SMALL FINANCE</div>
          <div class="sub">Loan Collection Payment Receipt</div>
        </div>
        <table class="table">
          <tr><th>Receipt No:</th><td>${data.receiptNo}</td></tr>
          <tr><th>Customer:</th><td>${data.customerName}</td></tr>
          <tr><th>Loan Code:</th><td>${data.loanCode}</td></tr>
          <tr><th>Date & Time:</th><td>${new Date().toLocaleString('en-IN')}</td></tr>
          <tr><th>Collected By:</th><td>${data.collectedByName}</td></tr>
          <tr><th>Penalty Settle:</th><td>Rs. ${(data.penaltyPaidPaise / 100).toFixed(2)}</td></tr>
          <tr><th>Interest Settle:</th><td>Rs. ${(data.interestPaidPaise / 100).toFixed(2)}</td></tr>
          <tr><th>Principal Settle:</th><td>Rs. ${(data.principalPaidPaise / 100).toFixed(2)}</td></tr>
          <tr class="total"><th>TOTAL PAID:</th><td>Rs. ${(data.amountPaise / 100).toFixed(2)}</td></tr>
          <tr><th>Remaining Balance:</th><td>Rs. ${(data.remainingBalancePaise / 100).toFixed(2)}</td></tr>
        </table>
        <div class="footer">Computer-generated official receipt • Thank you for banking with Shri Amudha Small Finance.</div>
      </body>
      </html>
    `;
  }
}
