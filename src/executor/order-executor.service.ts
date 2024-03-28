import { Injectable, Logger } from '@nestjs/common';
import { EthersContract, InjectContractProvider, InjectEthersProvider } from 'nestjs-ethers';
import { JsonRpcProvider } from '@ethersproject/providers';
import { AnnouncedOrder } from '../sharedTypes/announcedOrder.types';
import { AppPriceService } from '../service/app-price.service';
import { BlockchainService } from '../service/blockchain.service';
import { OrderQueueService } from '../service/order-queue.service';
import { ErrorHandler } from '../service/error.handler';
import { ConfigService } from '../config/config.service';

@Injectable()
export class OrderExecutorService {
  constructor(
    @InjectContractProvider()
    private readonly ethersContract: EthersContract,
    @InjectEthersProvider()
    private readonly customProvider: JsonRpcProvider,
    private readonly appPriceService: AppPriceService,
    private readonly logger: Logger,
    private readonly errorHandler: ErrorHandler,
    private readonly blockchainService: BlockchainService,
    private readonly orderQueue: OrderQueueService,
    private readonly configService: ConfigService,
  ) {}

  async tryExecuteOrder(order: AnnouncedOrder): Promise<void> {
    const orderExpirationTime = this.getOrderExpirationTime(order);
    if (Date.now() < orderExpirationTime) {
      order.executeInTime = this.getExecuteInTime(order);
      const executeIn = order.executeInTime - Date.now();
      this.logger.log(`order ${order.account} setting timeout to ${executeIn} ms`);

      setTimeout(async () => {
        try {
          await this.getPricesAndExecuteOrder(order);
        } catch (error) {
          this.orderQueue.addOrder(order);
          await this.errorHandler.handleError(`failed to execute order ${order.account} => put it to queue`, error);
        }
      }, executeIn);
    } else this.logger.log(`order ${order.account} expired`);
  }

  public async getPricesAndExecuteOrder(order: AnnouncedOrder): Promise<void> {
    this.logger.log(`start processing order ${order.account}...`);
    const account = order.account;
    const prices = await this.appPriceService.getPriceUpdates();
    this.logger.log(`prices received, start executing order ${account} ...`);
    const resultTxHash = await this.blockchainService.executeOrder(prices, account);
    this.logger.log(`order ${account} was executed, execution txHash: ${resultTxHash}`);
  }

  private getExecuteInTime(order: AnnouncedOrder): number {
    const executeInTime = order.blockTimestamp + this.configService.minExecutabilityAge;
    order.executeInTime = executeInTime;
    return executeInTime;
  }

  public getOrderExpirationTime(order: AnnouncedOrder): number {
    const orderExpirationTime = order.blockTimestamp + this.configService.maxExecutabilityAge;
    order.expirationTime = orderExpirationTime;
    return orderExpirationTime;
  }
}
