import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession } from 'mongoose';
import { Counter } from './counter.schema';

@Injectable()
export class CounterService {
  constructor(@InjectModel(Counter.name) private counterModel: Model<Counter>) {}

  /**
   * Atomically gets the next sequential number for a given sequence name.
   * Can participate in an ongoing MongoDB transaction session.
   */
  async getNextSequence(sequenceName: string, session?: ClientSession): Promise<number> {
    const query = this.counterModel.findOneAndUpdate(
      { sequenceName },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    if (session) {
      query.session(session);
    }

    const counter = await query.exec();
    return counter.seq;
  }

  /**
   * Formats a formatted sequential reference code, e.g. REC-BR1-2026-000001
   */
  async generateFormattedCode(
    prefix: string,
    sequenceName: string,
    padLength = 6,
    session?: ClientSession
  ): Promise<string> {
    const seq = await this.getNextSequence(sequenceName, session);
    const padded = String(seq).padStart(padLength, '0');
    return `${prefix}-${padded}`;
  }
}
