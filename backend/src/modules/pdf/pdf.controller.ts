import { Controller, Get, Param, Res } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { PdfService } from './pdf.service';

@ApiTags('PDF & Receipts')
@Controller('pdf')
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @Get('receipt/:receiptNo')
  @ApiOperation({ summary: 'Stream printable HTML / PDF receipt' })
  getReceiptPdf(@Param('receiptNo') receiptNo: string, @Res() res: Response) {
    const html = this.pdfService.generateReceiptHtml({
      receiptNo,
      customerName: 'M. Murugan',
      loanCode: 'LN-202610-00042',
      collectedByName: 'sales1',
      penaltyPaidPaise: 0,
      interestPaidPaise: 12000,
      principalPaidPaise: 38000,
      amountPaise: 50000,
      remainingBalancePaise: 1450000,
    });

    res.setHeader('Content-Type', 'text/html');
    return res.send(html);
  }
}
