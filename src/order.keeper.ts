import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OrderQueueService } from './service/order-queue.service';
import { ErrorHandler } from './service/error.handler';
import { chunk } from 'lodash';
import { OrderExecutorService } from './executor/order-executor.service';
import { delay } from './utils/utils';
import { AnnouncedOrder } from './sharedTypes/announcedOrder.types';

@Injectable()
export class OrderKeeper {
  private activeKeeperTasks: Record<string, boolean> = {};

  constructor(
    private readonly queueService: OrderQueueService,
    private readonly logger: Logger,
    private readonly errorHandler: ErrorHandler,
    private readonly orderExecutor: OrderExecutorService,
  ) {}

  @Cron(CronExpression.EVERY_5_SECONDS)
  async executeKeeper() {
    try {
      const orders = this.queueService.getAllOrders();
      if (orders.length > 0) {
        this.logger.log('start order execution keeper ... ');
        this.logger.log(`in queue ${orders.length} unexecuted orders`);
        const liveOrders = orders.filter((order) => {
          const isExpired = order.expirationTime < Date.now();
          if (isExpired) {
            this.logger.log(`order ${order.account} was expired, remove it from queue...`);
            this.queueService.removeOrder(order.account);
          }
          return !isExpired;
        });
        for (const ordersBatch of chunk(liveOrders, 5)) {
          const batches = ordersBatch.map((order) => {
            this.execAsyncKeeperCallback(order.account, () => this.executeOrder(order));
          });
          await Promise.all(batches);
          await delay(100);
        }
      }
    } catch (error) {
      await this.errorHandler.handleError('error in order execution keeper', error);
    }
  }

  private async executeOrder(order: AnnouncedOrder) {
    await this.orderExecutor.getPricesAndExecuteOrder(order);
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
