import { Injectable, Logger } from '@nestjs/common';
import { AnnouncedOrder } from '../sharedTypes/announcedOrder.types';

import { ConfigService } from '../config/config.service';
import { BlockchainService } from './blockchain.service';

@Injectable()
export class OrderQueueService {
  private queueOrders: Map<string, AnnouncedOrder> = new Map();

  constructor(private readonly configService: ConfigService, private readonly blockchainService: BlockchainService, private readonly logger: Logger) {}
  public getAllOrders(): AnnouncedOrder[] {
    return Array.from(this.queueOrders.values());
  }

  public addOrder(order: AnnouncedOrder) {
    this.queueOrders.delete(order.account);
    this.queueOrders.set(order.account, order);
  }

  public removeOrder(account: string) {
    this.queueOrders.delete(account);
  }

  private async isExpired(account: string): Promise<boolean> {
    try {
      return await this.blockchainService.hasOrderExpired(account);
    } catch (error) {
      this.logger.log(`failed to get hasOrderExpired for account ${account}`);
      //ZeroValue means order have been executes
      return error.errorName === 'ZeroValue';
    }
  }
}
