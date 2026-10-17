import { Money } from './money';

export class ThermalPrinterHelper {
  private static readonly LINE_WIDTH = 32;

  /**
   * Generates a 32-character monospace string with text aligned to left and right edges.
   */
  static formatLine(left: string, right: string): string {
    const spaceCount = Math.max(1, this.LINE_WIDTH - left.length - right.length);
    return `${left}${' '.repeat(spaceCount)}${right}\n`;
  }

  /**
   * Centers text within the 32-character line width.
   */
  static formatCenter(text: string): string {
    if (text.length >= this.LINE_WIDTH) return `${text.slice(0, this.LINE_WIDTH)}\n`;
    const leftPad = Math.floor((this.LINE_WIDTH - text.length) / 2);
    const rightPad = this.LINE_WIDTH - text.length - leftPad;
    return `${' '.repeat(leftPad)}${text}${' '.repeat(rightPad)}\n`;
  }

  /**
   * Generates formatted text layout for 58mm thermal printers.
   */
  static generateReceiptText(data: {
    shopName?: string;
    branchName?: string;
    receiptNo: string;
    loanCode: string;
    customerName: string;
    customerMobile: string;
    collectedByName: string;
    amountPaise: number;
    penaltyPaidPaise: number;
    interestPaidPaise: number;
    principalPaidPaise: number;
    remainingBalancePaise: number;
    date: Date;
  }): string {
    const divider = '-'.repeat(this.LINE_WIDTH) + '\n';
    const doubleDivider = '='.repeat(this.LINE_WIDTH) + '\n';

    let out = '';
    out += this.formatCenter(data.shopName || 'SHRI AMUDHA SMALL FINANCE');
    out += this.formatCenter('LOAN COLLECTION RECEIPT');
    if (data.branchName) out += this.formatCenter(data.branchName);
    out += divider;

    const formattedDate = new Date(data.date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    out += this.formatLine('Receipt No:', data.receiptNo);
    out += this.formatLine('Date/Time:', formattedDate);
    out += this.formatLine('Customer:', data.customerName.slice(0, 20));
    out += this.formatLine('Mobile:', data.customerMobile);
    out += this.formatLine('Loan Code:', data.loanCode);
    out += this.formatLine('Collector:', data.collectedByName.slice(0, 20));
    out += divider;

    out += this.formatLine('Penalty Paid:', `Rs. ${(data.penaltyPaidPaise / 100).toFixed(2)}`);
    out += this.formatLine('Interest Paid:', `Rs. ${(data.interestPaidPaise / 100).toFixed(2)}`);
    out += this.formatLine('Principal Paid:', `Rs. ${(data.principalPaidPaise / 100).toFixed(2)}`);
    out += doubleDivider;

    out += this.formatLine('TOTAL COLLECTED:', `Rs. ${(data.amountPaise / 100).toFixed(2)}`);
    out += this.formatLine('REMAINING BAL:', `Rs. ${(data.remainingBalancePaise / 100).toFixed(2)}`);
    out += divider;

    out += this.formatCenter('Thank you for prompt payment!');
    out += this.formatCenter('Support: +91 98400 12345');
    out += '\n\n';

    return out;
  }

  /**
   * Generates standard ESC/POS binary buffer for thermal Bluetooth / USB printers.
   * Includes initialization, bold headers, and paper cut.
   */
  static generateEscPosBuffer(plainText: string): Buffer {
    const ESC = 0x1b;
    const GS = 0x1d;

    const init = Buffer.from([ESC, 0x40]); // ESC @: Initialize printer
    const textBuffer = Buffer.from(plainText, 'utf-8');
    const cut = Buffer.from([GS, 0x56, 0x01]); // GS V 1: Partial cut with feed

    return Buffer.concat([init, textBuffer, cut]);
  }
}
