import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OrderQueueService } from './service/order-queue.service';
import { ErrorHandler } from './service/error.handler';
import { chunk } from 'lodash';
import { OrderExecutorService } from './service/order-executor.service';
import { delay } from './utils/utils';
import { AnnouncedOrder } from './sharedTypes/announcedOrder.types';
import { BlockchainService } from './service/blockchain.service';

@Injectable()
export class OrderKeeper {
  private activeKeeperTasks: Record<string, boolean> = {};

  constructor(
    private readonly queueService: OrderQueueService,
    private readonly logger: Logger,
    private readonly errorHandler: ErrorHandler,
    private readonly orderExecutor: OrderExecutorService,
    private readonly blockchainService: BlockchainService,
  ) {}

  @Cron(CronExpression.EVERY_5_SECONDS)
  async executeKeeper() {
    try {
      const orders = this.queueService.getAllOrders();
      if (orders.length > 0) {
        const liveOrders = orders.filter((order) => {
          const isExpired = order.expirationTime < Date.now();
          if (isExpired) {
            this.logger.log(`order ${order.account} was expired, remove it from queue...`);
            this.queueService.removeOrder(order.account);
          }
          return !isExpired;
        });

        this.logger.log(`in queue ${orders.length} unexecuted orders, executable orders count: ${liveOrders.length}`);
        for (const ordersBatch of chunk(liveOrders, 5)) {
          let nonce = await this.blockchainService.getNonce();
          const batches = ordersBatch.map((order) => {
            this.execAsyncKeeperCallback(order.account, () => this.executeOrder(order, nonce));
            nonce++;
          });
          await Promise.all(batches);
          await delay(100);
        }
      }
    } catch (error) {
      await this.errorHandler.handleError('error in order execution keeper', error);
    }
  }

  private async executeOrder(order: AnnouncedOrder, nonce: number) {
    await this.orderExecutor.getPricesAndExecuteOrder(order, nonce);
    this.queueService.removeOrder(order.account);
  }

  private async execAsyncKeeperCallback(account: string, cb: () => Promise<void>): Promise<void> {
    if (this.activeKeeperTasks[account]) {
      // Skip task as its already running.
      return;
    }
    this.activeKeeperTasks[account] = true;
    try {
      await cb();
    } catch (error) {
      await this.errorHandler.handleError(`error in keeper while execution order for account ${account}`, error);
    }
    delete this.activeKeeperTasks[account];
  }
}
