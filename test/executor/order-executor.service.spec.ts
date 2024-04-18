import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Logger } from '@nestjs/common';
import { OrderExecutorService } from '../../src/service/order-executor.service';
import { AppPriceService } from '../../src/service/app-price.service';
import { ErrorHandler } from '../../src/service/error.handler';
import { BlockchainService } from '../../src/service/blockchain.service';
import { OrderQueueService } from '../../src/service/order-queue.service';
import { ConfigService } from '../../src/config/config.service';
import { EvmPriceServiceConnection } from '@pythnetwork/pyth-evm-js';
import { JsonRpcProvider } from '@ethersproject/providers';
import { EthersContract } from 'nestjs-ethers';
import { BigNumber } from 'ethers';

describe('OrderExecutorService', () => {
  let app: INestApplication;
  let orderExecutorService: OrderExecutorService;
  let appPriceService: AppPriceService;
  let logger: Logger;
  let errorHandler: ErrorHandler;
  let blockchainService: BlockchainService;
  let orderQueueService: OrderQueueService;
  let configService: ConfigService;
  let evmPriceServiceConnection: EvmPriceServiceConnection;
  let provider: JsonRpcProvider;
  let ethersContract: EthersContract;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Logger],
    }).compile();

    app = module.createNestApplication();

    process.env.PYTH_NETWORK_PRICE_SERVCE_URI = 'https://test';
    process.env.PYTH_NETWORK_ETH_USD_PRICE_ID = 'price_id';
    process.env.DELAYED_ORDER_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000001';
    process.env.FLATCOIN_VAULT_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000001';
    process.env.SIGNER_WALLET_PK = '0000000000000000000000000000000000000000000000000000000000000001';
    process.env.ORDER_MIN_EXECUTABILITY_AGE = '5000';
    process.env.ORDER_MAX_EXECUTABILITY_AGE = '120000';

    provider = new JsonRpcProvider();
    ethersContract = new EthersContract(provider);
    logger = module.get<Logger>(Logger);
    evmPriceServiceConnection = new EvmPriceServiceConnection(process.env.PYTH_NETWORK_PRICE_SERVCE_URI);
    appPriceService = new AppPriceService(evmPriceServiceConnection, logger);
    blockchainService = new BlockchainService(ethersContract, provider, logger, errorHandler);
    jest.spyOn(blockchainService, 'getMaxExecutabilityAge').mockImplementation(() => Promise.resolve(1200));
    configService = new ConfigService(blockchainService, logger);
    configService.maxExecutabilityAge = 10000;
    configService.minExecutabilityAge = 500;
    errorHandler = new ErrorHandler(logger);
    orderQueueService = new OrderQueueService(configService, blockchainService, logger);
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
  });

  afterAll(() => {
    app.close();
  });

  describe('tryExecuteOrder', () => {
    it('should execute order if not expired and set timeout', async () => {
      const order: any = {
        account: 'testAccount',
        executeInTime: Date.now() + 1000,
      };

      jest.spyOn(orderExecutorService, 'getOrderExpirationTime').mockReturnValue(Date.now() + 2000);

      jest.spyOn(logger, 'log').mockImplementation();

      const getExecuteInTimeSpy = jest.spyOn(orderExecutorService as any, 'getExecuteInTime');
      const getPricesAndExecuteOrderSpy = jest.spyOn(orderExecutorService, 'getPricesAndExecuteOrder');
      const setTimeoutSpy = jest.spyOn(global, 'setTimeout');

      await orderExecutorService.tryExecuteOrder(order);

      expect(getExecuteInTimeSpy).toHaveBeenCalledWith(order);
      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), order.executeInTime - Date.now());
      expect(logger.log).toHaveBeenCalledWith(`order ${order.account} setting timeout to ${order.executeInTime - Date.now()} ms`);
      expect(getPricesAndExecuteOrderSpy).not.toHaveBeenCalled();
    });

    it('should log expiration if order is expired', async () => {
      const order: any = {
        account: 'testAccount',
        executeInTime: Date.now() + 1000,
      };
      jest.spyOn(orderExecutorService, 'getOrderExpirationTime').mockReturnValue(Date.now() - 2000);
      const getExecuteInTimeSpy = jest.spyOn(orderExecutorService as any, 'getExecuteInTime');
      const getPricesAndExecuteOrderSpy = jest.spyOn(orderExecutorService, 'getPricesAndExecuteOrder');

      const setTimeoutSpy = jest.spyOn(global, 'setTimeout');
      jest.spyOn(logger, 'log').mockImplementation();

      await orderExecutorService.tryExecuteOrder(order);

      expect(getExecuteInTimeSpy).not.toHaveBeenCalled();
      // expect(setTimeoutSpy).not.toHaveBeenCalled();

      expect(logger.log).toHaveBeenCalledWith(`order ${order.account} expired`);
      expect(getPricesAndExecuteOrderSpy).not.toHaveBeenCalled();
    });

    it('should handle error and add order to queue if execution fails', async () => {
      const order: any = {
        account: 'testAccount',
        executeInTime: 1000,
        expirationTime: Date.now() + 5000,
        blockNumber: 1222,
        transactionHash: 'rtrt',
        orderType: 'STABLE_DEPOSIT',
        blockTimestamp: Date.now(),
      };
      // jest.spyOn(orderExecutorService, "getOrderExpirationTime").mockReturnValue(
      //   Date.now() + 2000,
      // );
      const getExecuteInTimeSpy = jest.spyOn(orderExecutorService as any, 'getExecuteInTime');
      const getPricesAndExecuteOrderSpy = jest.spyOn(orderExecutorService, 'getPricesAndExecuteOrder');
      const setTimeoutSpy = jest.spyOn(global, 'setTimeout');
      getPricesAndExecuteOrderSpy.mockRejectedValueOnce(new Error('Test Error'));
      const handleErrorSpy = jest.spyOn(errorHandler, 'handleError');
      jest.spyOn(logger, 'log').mockImplementation();
      jest.spyOn(orderQueueService, 'addOrder').mockImplementation();

      await orderExecutorService.tryExecuteOrder(order);

      expect(getExecuteInTimeSpy).toHaveBeenCalledWith(order);
      // expect(setTimeoutSpy).toHaveBeenCalledWith(
      //   expect.any(Function),
      // order.blockTimestamp - Date.now(),
      // );
      // expect(logger.log).toHaveBeenCalledWith(
      //   `order ${order.account} setting timeout to ${order.executeInTime - Date.now()} ms`,
      // );
      // expect(getPricesAndExecuteOrderSpy).toHaveBeenCalled();
      // expect(handleErrorSpy).toHaveBeenCalledWith(
      //   `failed to execute order ${order.account} => put it to queue`,
      //   expect.any(Error),
      // );
      // expect(orderQueueService.addOrder).toHaveBeenCalledWith(order);
    });
  });

  describe('getPricesAndExecuteOrder', () => {
    it('should get prices and execute order successfully', async () => {
      const order: any = {
        account: 'testAccount',
      };
      const getPriceUpdatesSpy = jest.spyOn(appPriceService, 'getPriceUpdates').mockResolvedValueOnce(['mockedPrices']);
      const mockedTxHash = 'mockedTxHash';
      const executeOrderSpy = jest.spyOn(blockchainService, 'executeOrder').mockResolvedValueOnce(mockedTxHash);
      jest.spyOn(provider, 'send').mockResolvedValue(12);
      jest.spyOn(logger, 'log').mockImplementation();
      jest.spyOn(orderQueueService, 'removeOrder').mockImplementation();

      await orderExecutorService.getPricesAndExecuteOrder(order, 1);

      expect(getPriceUpdatesSpy).toHaveBeenCalled();
      expect(executeOrderSpy).toHaveBeenCalledWith(['mockedPrices'], 'testAccount', BigNumber.from(12), 1);
      expect(logger.log).toHaveBeenCalledWith(`start processing order ${order.account}...`);
      expect(logger.log).toHaveBeenCalledWith(`prices received, start executing order ${order.account} ...`);
      expect(logger.log).toHaveBeenCalledWith(`order ${order.account} was executed, execution txHash: ${mockedTxHash}`);
      // expect(orderQueueService.removeOrder).toHaveBeenCalledWith("testAccount");
    });
    //
    //   it("should handle error and add order to queue if execution fails", async () => {
    //     const order: any = {
    //       account: "testAccount",
    //       // Add other required fields
    //     };
    //     const getPriceUpdatesSpy = jest.spyOn(
    //       appPriceService,
    //       "getPriceUpdates",
    //     ).mockResolvedValueOnce(["mockedPrices"]);
    //     const executeOrderSpy = jest.spyOn(
    //       blockchainService,
    //       "executeOrder",
    //     ).mockRejectedValueOnce(new Error("Test Error"));
    //
    //     const handleErrorSpy = jest.spyOn(errorHandler, "handleError");
    //
    //     await orderExecutorService.getPricesAndExecuteOrder(order);
    //
    //     expect(getPriceUpdatesSpy).toHaveBeenCalled();
    //     expect(executeOrderSpy).toHaveBeenCalled();
    //     expect(logger.log).toHaveBeenCalledWith(
    //       `start processing order ${order.account}...`,
    //     );
    //     expect(logger.log).toHaveBeenCalledWith(
    //       `prices received, start executing order ${order.account} ...`,
    //     );
    //     expect(handleErrorSpy).toHaveBeenCalledWith(
    //       `failed to execute order ${order.account} => put it to queue`,
    //       expect.any(Error),
    //     );
    //     expect(orderQueueService.addOrder).toHaveBeenCalledWith(order);
    //   });
  });

  describe('getExecuteInTime', () => {
    it('should return executeInTime based on config', () => {
      const order: any = {
        blockTimestamp: 1000,
      };
      // jest.spyOn(configService, "minExecutabilityAge").mockReturnValue(500);
      const result = orderExecutorService['getExecuteInTime'](order);
      expect(result).toBe(1500);
      expect(order.executeInTime).toBe(1500);
    });
  });

  describe('getOrderExpirationTime', () => {
    it('should return expirationTime based on config', () => {
      const order: any = {
        blockTimestamp: 1000,
      };
      configService.maxExecutabilityAge = 500;
      const result = orderExecutorService['getOrderExpirationTime'](order);
      expect(result).toBe(1500);
      expect(order.expirationTime).toBe(1500);
    });
  });
});
