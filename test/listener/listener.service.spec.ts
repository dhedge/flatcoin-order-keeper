import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Logger } from '@nestjs/common';
import { ListenerService } from '../../src/listener.service';
import { OrderExecutorService } from '../../src/service/order-executor.service';
import { OrderQueueService } from '../../src/service/order-queue.service';
import { EthersContract } from 'nestjs-ethers';
import { Contract } from '@ethersproject/contracts';
import { ErrorHandler } from '../../src/service/error.handler';
import { JsonRpcProvider } from '@ethersproject/providers';
import { DelayedOrder } from '../../src/contracts/abi/delayed-order';
import { ConfigService } from '../../src/config/config.service';
import { BlockchainService } from '../../src/service/blockchain.service';
import { AppPriceService } from '../../src/service/app-price.service';
import { EvmPriceServiceConnection } from '@pythnetwork/pyth-evm-js';

describe('ListenerService', () => {
  let app: INestApplication;
  let listenerService: ListenerService;
  let configService: ConfigService;
  let blockchainService: BlockchainService;
  let orderExecutorService: OrderExecutorService;
  let orderQueueService: OrderQueueService;
  let errorHandler: ErrorHandler;
  let ethersContract: EthersContract;
  let mockContract: Contract;
  let logger: Logger;
  let provider: JsonRpcProvider;
  let evmPriceServiceConnection: EvmPriceServiceConnection;
  let appPriceService: AppPriceService;

  beforeAll(async () => {
    process.env.DELAYED_ORDER_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000001';
    process.env.FLATCOIN_VAULT_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000001';
    process.env.SIGNER_WALLET_PK = '0000000000000000000000000000000000000000000000000000000000000001';
    process.env.PYTH_NETWORK_PRICE_SERVCE_URI = 'https://test';

    const module: TestingModule = await Test.createTestingModule({
      providers: [Logger],
    }).compile();

    app = module.createNestApplication();

    evmPriceServiceConnection = new EvmPriceServiceConnection(process.env.PYTH_NETWORK_PRICE_SERVCE_URI);
    provider = new JsonRpcProvider();
    ethersContract = new EthersContract(provider);
    mockContract = ethersContract.create(process.env.DELAYED_ORDER_CONTRACT_ADDRESS, DelayedOrder);
    logger = module.get<Logger>(Logger) as Logger;
    blockchainService = new BlockchainService(ethersContract, provider, logger, errorHandler);
    jest.spyOn(blockchainService, 'getMaxExecutabilityAge').mockResolvedValue(Promise.resolve(1200));
    configService = new ConfigService(blockchainService, logger);
    configService.maxExecutabilityAge = 10000;
    errorHandler = new ErrorHandler(logger);
    orderQueueService = new OrderQueueService(configService, blockchainService, logger);
    appPriceService = new AppPriceService(evmPriceServiceConnection, logger);
    orderExecutorService = new OrderExecutorService(
      ethersContract,
      provider,
      appPriceService,
      logger,
      errorHandler,
      blockchainService,
      orderQueueService,
      configService,
    );
    listenerService = new ListenerService(logger, ethersContract, provider, orderExecutorService, orderQueueService, errorHandler);
  });

  it('should be defined', () => {
    expect(listenerService).toBeDefined();
  });

  describe('listenOrderEvents', () => {
    it('should listen to order events', () => {
      // Mock the implementation of ethersContract.create
      // const mockContract = { } as Contract;
      jest.spyOn(mockContract, 'on').mockImplementation(() => null);
      jest.spyOn(ethersContract, 'create').mockReturnValue(mockContract);

      // Mock the other functions that are called within listenOrderEvents
      jest.spyOn(listenerService, 'listenOrderAnnouncedEvent');
      jest.spyOn(listenerService, 'listenOrderExecutedEvent');
      jest.spyOn(listenerService, 'listenOrderCancelledEvent');

      listenerService.listenOrderEvents();

      expect(ethersContract.create).toHaveBeenCalledWith(process.env.DELAYED_ORDER_CONTRACT_ADDRESS, DelayedOrder);
      expect(listenerService.listenOrderAnnouncedEvent).toHaveBeenCalledWith(mockContract);
      expect(listenerService.listenOrderExecutedEvent).toHaveBeenCalledWith(mockContract);
      expect(listenerService.listenOrderCancelledEvent).toHaveBeenCalledWith(mockContract);
    });
  });

  describe('listenOrderAnnouncedEvent', () => {
    it('should listen to OrderAnnounced event', () => {
      jest.spyOn(mockContract, 'on');

      listenerService.listenOrderAnnouncedEvent(mockContract);

      expect(mockContract.on).toHaveBeenCalledWith('OrderAnnounced', expect.any(Function));
    });
  });

  describe('listenOrderExecutedEvent', () => {
    it('should listen to OrderExecuted event', () => {
      jest.spyOn(mockContract, 'on');

      listenerService.listenOrderExecutedEvent(mockContract);

      expect(mockContract.on).toHaveBeenCalledWith('OrderExecuted', expect.any(Function));
    });
  });

  describe('listenOrderCancelledEvent', () => {
    it('should listen to OrderCancelled event', () => {
      jest.spyOn(mockContract, 'on');

      listenerService.listenOrderCancelledEvent(mockContract);

      expect(mockContract.on).toHaveBeenCalledWith('OrderCancelled', expect.any(Function));
    });
  });

  // describe("processOrderAnnouncedEvent", () => {
  //   it("should process OrderAnnounced event", async () => {
  //     const event = {
  //       blockNumber: 123,
  //       account: "testAccount",
  //       blockTimestamp: 123456789,
  //       transactionHash: "testTxHash",
  //     };
  //
  //     const orderAnnouncedTimestamp = 123456789; // Replace with a timestamp value
  //
  //     jest.spyOn(Date, "now").mockReturnValue(orderAnnouncedTimestamp);
  //     jest.spyOn(orderExecutorService, "tryExecuteOrder").mockResolvedValue(undefined);
  //     jest.spyOn(logger, "log").mockImplementation();
  //
  //     await listenerService["processOrderAnnouncedEvent"](event);
  //
  //     expect(logger.log).toHaveBeenCalledWith(`new OrderAnnounced event for account ${event.account}...`);
  //     expect(logger.log).toHaveBeenCalledWith(`parsed OrderAnnounced event to order ${JSON.stringify(event)}`);
  //     expect(orderExecutorService.tryExecuteOrder).toHaveBeenCalledWith(expect.any(AnnouncedOrder));
  //   });
  //
  //   it("should handle errors when processing OrderAnnounced event", async () => {
  //     const event = {
  //       account: "testAccount",
  //       blockNumber: 123,
  //       orderType: "STABLE_DEPOSIT",
  //       transactionHash: "testTxHash",
  //     };
  //
  //     jest.spyOn(Date, "now").mockReturnValue(123456789);
  //     jest.spyOn(orderExecutorService, "tryExecuteOrder").mockRejectedValue(new Error("Test error"));
  //     jest.spyOn(logger, "log").mockImplementation();
  //     jest.spyOn(errorHandler, "handleError").mockImplementation();
  //
  //     await listenerService["processOrderAnnouncedEvent"](event);
  //
  //     expect(logger.log).toHaveBeenCalledWith(`new OrderAnnounced event for account ${event.account}...`);
  //     expect(errorHandler.handleError).toHaveBeenCalledWith(`failed to process OrderAnnounced event txHash ${event.transactionHash}`, expect.any(Error));
  //   });
  // });
  //
  // describe("processOrderExecutedEvent", () => {
  //   it("should process OrderExecuted event", async () => {
  //     const event = {
  //       account: "testAccount",
  //       transactionHash: "testTxHash",
  //     };
  //
  //     jest.spyOn(orderQueueService, "removeOrder").mockResolvedValue(undefined);
  //     jest.spyOn(logger, "log").mockImplementation();
  //
  //     await listenerService["processOrderExecutedEvent"](event);
  //
  //     expect(logger.log).toHaveBeenCalledWith(`new OrderExecuted event for account ${event.account}...`);
  //     expect(orderQueueService.removeOrder).toHaveBeenCalledWith(event.account);
  //     expect(logger.log).toHaveBeenCalledWith(`order for account ${event.account} was removed from queue`);
  //   });
  //
  //   it("should handle errors when processing OrderExecuted event", async () => {
  //     const event = {
  //       account: "testAccount",
  //       transactionHash: "testTxHash",
  //     };
  //
  //     jest.spyOn(orderQueueService, "removeOrder").mockRejectedValue(new Error("Test error"));
  //     jest.spyOn(errorHandler, "handleError").mockImplementation();
  //
  //     await listenerService["processOrderExecutedEvent"](event);
  //
  //     expect(logger.log).toHaveBeenCalledWith(`new OrderExecuted event for account ${event.account}...`);
  //     expect(errorHandler.handleError).toHaveBeenCalledWith(`failed to process OrderExecuted event txHash ${event.transactionHash}`, expect.any(Error));
  //   });
  // });
  //
  // describe("processOrderCancelledEvent", () => {
  //   it("should process OrderCancelled event", async () => {
  //     const event = {
  //       account: "testAccount",
  //       transactionHash: "testTxHash",
  //     };
  //
  //     jest.spyOn(orderQueueService, "removeOrder").mockResolvedValue(undefined);
  //
  //     await listenerService["processOrderCancelledEvent"](event);
  //
  //     expect(logger.log).toHaveBeenCalledWith(`new OrderCancelled event for account ${event.account}...`);
  //     expect(orderQueueService.removeOrder).toHaveBeenCalledWith(event.account);
  //     expect(logger.log).toHaveBeenCalledWith(`order for account ${event.account} was removed from queue`);
  //   });
  //
  //   it("should handle errors when processing OrderCancelled event", async () => {
  //     const event = {
  //       account: "testAccount",
  //       transactionHash: "testTxHash",
  //     };
  //
  //     jest.spyOn(orderQueueService, "removeOrder").mockRejectedValue(new Error("Test error"));
  //
  //     await listenerService["processOrderCancelledEvent"](event);
  //
  //     expect(logger.log).toHaveBeenCalledWith(`new OrderCancelled event for account ${event.account}...`);
  //     expect(errorHandler.handleError).toHaveBeenCalledWith(`failed to process OrderCancelled event txHash ${event.transactionHash}`, expect.any(Error));
  //   });
  // });

  afterAll((done) => {
    app.close();
    // done();
  });
});
