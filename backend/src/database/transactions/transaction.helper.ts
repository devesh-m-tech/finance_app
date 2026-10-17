import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, ClientSession } from 'mongoose';

@Injectable()
export class TransactionHelper {
  private readonly logger = new Logger(TransactionHelper.name);

  constructor(@InjectConnection() private readonly connection: Connection) {}

  /**
   * Executes a business operation within a MongoDB multi-document ACID transaction.
   * Auto-commits on success; rolls back on error.
   */
  async withTransaction<T>(
    operation: (session: ClientSession) => Promise<T>
  ): Promise<T> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const result = await operation(session);
      await session.commitTransaction();
      return result;
    } catch (error) {
      this.logger.error(`Transaction aborted: ${error.message}`, error.stack);
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }
}
