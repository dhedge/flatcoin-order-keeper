import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { OrderQueueService } from '../../src/service/order-queue.service';
import { ConfigService } from '../../src/config/config.service';
import { BlockchainService } from '../../src/service/blockchain.service';
import { AnnouncedOrder } from '../../src/sharedTypes/announcedOrder.types';
import { JsonRpcProvider } from '@ethersproject/providers';
import { ErrorHandler } from '../../src/service/error.handler';

import { EthersContract } from 'nestjs-ethers';

describe('OrderQueueService', () => {
  let orderQueueService: OrderQueueService;
  let configService: ConfigService;
  let blockchainService: BlockchainService;
  let logger: Logger;
  let provider: JsonRpcProvider;
  let errorHandler: ErrorHandler;
  let ethersContract: EthersContract;

  beforeAll(async () => {
    process.env.DELAYED_ORDER_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000001';
    process.env.FLATCOIN_VAULT_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000001';

    process.env.SIGNER_WALLET_PK = '0000000000000000000000000000000000000000000000000000000000000001';

    provider = new JsonRpcProvider();

    const module: TestingModule = await Test.createTestingModule({
      providers: [Logger],
    }).compile();

    logger = module.get<Logger>(Logger) as Logger;
    // signer = new Wallet("0000000000000000000000000000000000000000000000000000000000000001", provider);

    blockchainService = new BlockchainService(ethersContract, provider, logger, errorHandler);
    jest.spyOn(blockchainService, 'getMaxExecutabilityAge').mockResolvedValue(Promise.resolve(1200));

    configService = new ConfigService(blockchainService, logger);
    configService.maxExecutabilityAge = 10000;

    orderQueueService = new OrderQueueService(configService, blockchainService, logger);
    errorHandler = new ErrorHandler(logger);
  });

  it('should add and retrieve orders', () => {
    const order: AnnouncedOrder = {
      blockNumber: 123,
      transactionHash: '0x12345',
      orderType: 'STABLE_DEPOSIT',
      account: 'exampleAccount',
      blockTimestamp: 123,
      executeInTime: 12345,
      expirationTime: 12359,
    };

    orderQueueService.addOrder(order);

    const allOrders = orderQueueService.getAllOrders();
    expect(allOrders.length).toBe(1);
    expect(allOrders[0]).toEqual(order);
  });

  it('should remove an order', () => {
    const order: AnnouncedOrder = {
      blockNumber: 123,
      transactionHash: '0x12345',
      orderType: 'STABLE_DEPOSIT',
      account: 'exampleAccount',
      blockTimestamp: 123,
      executeInTime: 12345,
      expirationTime: 12359,
    };

    orderQueueService.addOrder(order);
    orderQueueService.removeOrder(order.account);

    const allOrders = orderQueueService.getAllOrders();
    expect(allOrders.length).toBe(0);
  });

  it('should return true for an expired order', async () => {
    jest.spyOn(blockchainService, 'hasOrderExpired').mockResolvedValue(true);

    const isExpired = await orderQueueService['isExpired']('expiredAccount');

    expect(isExpired).toBe(true);
  });
});
