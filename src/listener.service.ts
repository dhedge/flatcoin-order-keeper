import { Injectable, Logger } from '@nestjs/common';
import { EthersContract, InjectContractProvider, InjectEthersProvider } from 'nestjs-ethers';
import { JsonRpcProvider } from '@ethersproject/providers';
import { Contract } from '@ethersproject/contracts';
import { DelayedOrder } from './contracts/abi/delayed-order';
import { AnnouncedOrder, OrderType } from './sharedTypes/announcedOrder.types';
import { OrderExecutorService } from './service/order-executor.service';
import { OrderQueueService } from './service/order-queue.service';
import { ErrorHandler } from './service/error.handler';

@Injectable()
export class ListenerService {
  constructor(
    private readonly logger: Logger,
    @InjectContractProvider()
    private readonly ethersContract: EthersContract,
    @InjectEthersProvider()
    private readonly customProvider: JsonRpcProvider,
    private readonly appTxExecutorService: OrderExecutorService,
    private readonly orderQueue: OrderQueueService,
    private readonly errorHandler: ErrorHandler,
  ) {
    this.listenOrderEvents();
  }

  listenOrderEvents(): void {
    const delayedOrderContractAddress = process.env.DELAYED_ORDER_CONTRACT_ADDRESS;
    this.logger.log(`Listening OrderAnnounced event for contract ${delayedOrderContractAddress} ...`);
    const delayedOrderContract: Contract = this.ethersContract.create(delayedOrderContractAddress, DelayedOrder);

    this.listenOrderAnnouncedEvent(delayedOrderContract);
    this.listenOrderExecutedEvent(delayedOrderContract);
    this.listenOrderCancelledEvent(delayedOrderContract);
  }

  listenOrderAnnouncedEvent(delayedOrderContract: Contract): void {
    delayedOrderContract.on('OrderAnnounced', async (account, orderType, keeperFee, event) => {
      try {
        this.logger.log(`new OrderAnnounced event for account ${account}...`);

        const orderAnnouncedTimestamp = Date.now();
        const order: AnnouncedOrder = new AnnouncedOrder();
        order.blockNumber = event.blockNumber;
        order.account = account;
        order.blockTimestamp = orderAnnouncedTimestamp;
        order.orderType = OrderType[orderType];
        order.transactionHash = event.transactionHash;

        this.logger.log(`parsed OrderAnnounced event to order ${JSON.stringify(order)}`);
        await this.appTxExecutorService.tryExecuteOrder(order);
      } catch (error) {
        await this.errorHandler.handleError(`failed to process OrderAnnounced event txHash ${event.transactionHash}`, error);
      }
    });
  }

  listenOrderExecutedEvent(delayedOrderContract: Contract): void {
    delayedOrderContract.on('OrderExecuted', async (account, orderType, keeperFee, event) => {
      try {
        this.logger.log(`new OrderExecuted event for account ${account}...`);
        this.orderQueue.removeOrder(account);
        this.logger.log(`order for account ${account} was removed from queue`);
      } catch (error) {
        await this.errorHandler.handleError(`failed to process OrderExecuted event txHash ${event.transactionHash}`, error);
      }
    });
  }

  listenOrderCancelledEvent(delayedOrderContract: Contract): void {
    delayedOrderContract.on('OrderCancelled', async (account, orderType, event) => {
      try {
        this.logger.log(`new OrderCancelled event for account ${account}...`);
        this.orderQueue.removeOrder(account);
        this.logger.log(`order for account ${account} was removed from queue`);
      } catch (error) {
        await this.errorHandler.handleError(`failed to process OrderCancelled event txHash ${event.transactionHash}`, error);
      }
    });
  }
}
