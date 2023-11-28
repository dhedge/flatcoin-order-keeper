import { Injectable, Logger } from '@nestjs/common';
import { AnnouncedOrder } from '../sharedTypes/announcedOrder.types';
import { OrderQueryService } from './order-query.service';
import { ConfigService } from '../config/config.service';
import { BlockchainService } from './blockchain.service';

@Injectable()
export class OrderQueueService {
  private queueOrders: Map<string, AnnouncedOrder> = new Map();

  constructor(
    private readonly orderQueryService: OrderQueryService,
    private readonly configService: ConfigService,
    private readonly logger: Logger,
    private readonly blockchainService: BlockchainService,
  ) {
    (async () => {
      await this.initUnexecutedOrders();
    })();
  }
  public getAllOrders(): AnnouncedOrder[] {
    return Array.from(this.queueOrders.values());
  }

  public addOrder(order: AnnouncedOrder) {
    this.queueOrders.delete(order.account);
    this.queueOrders.set(order.account, order);
  }

  public async removeOrder(account: string) {
    this.queueOrders.delete(account);
  }

  private async initUnexecutedOrders() {
    const maxExecutabilityAge = this.configService.maxExecutabilityAge / 1000;
    this.logger.log(`start checking missed orders for last ${maxExecutabilityAge} sec...`);
    const timestampFrom = Math.floor(Date.now() / 1000 - maxExecutabilityAge);
    const orders = await this.orderQueryService.getAnnouncedOrders(timestampFrom);
    if (orders) {
      this.logger.log(`fetched ${orders.length} orders for last ${maxExecutabilityAge} sec`);
      for (const order of orders) {
        const isExpired = await this.isExpired(order.account);
        if (!isExpired) {
          this.queueOrders.set(order.account, order);
          this.logger.log(`order for account ${order.account} was not expired => add it to queue`);
        } else {
          this.logger.log(`order for account ${order.account} was expired`);
        }
      }
    }
    this.logger.log(`finished checking missed orders for last ${maxExecutabilityAge} sec...`);
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
