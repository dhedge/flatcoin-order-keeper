import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { OrderKeeper } from '../src/order.keeper';
import { OrderQueueService } from '../src/service/order-queue.service';
import { ErrorHandler } from '../src/service/error.handler';
import { OrderExecutorService } from '../src/service/order-executor.service';
import { JsonRpcProvider } from '@ethersproject/providers';
import { EthersContract } from 'nestjs-ethers';
import { DelayedOrder } from '../src/contracts/abi/delayed-order';
import { BlockchainService } from '../src/service/blockchain.service';
import { ConfigService } from '../src/config/config.service';
import { Contract } from '@ethersproject/contracts';
import { AppPriceService } from '../src/service/app-price.service';
import { EvmPriceServiceConnection } from '@pythnetwork/pyth-evm-js';

describe('OrderKeeper', () => {
  let orderKeeperService: OrderKeeper;
  let logger: Logger;
  let orderQueueService: OrderQueueService;
  let errorHandler: ErrorHandler;
  let ethersContract: EthersContract;
  let mockContract: Contract;
  let provider: JsonRpcProvider;
  let blockchainService: BlockchainService;
  let configService: ConfigService;
  let orderExecutorService: OrderExecutorService;
  let appPriceService: AppPriceService;
  let evmPriceServiceConnection: EvmPriceServiceConnection;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Logger],
    }).compile();

    process.env.PYTH_NETWORK_PRICE_SERVCE_URI = 'https://test';
    process.env.DELAYED_ORDER_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000001';
    process.env.FLATCOIN_VAULT_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000001';
    process.env.SIGNER_WALLET_PK = '0000000000000000000000000000000000000000000000000000000000000001';

    provider = new JsonRpcProvider();
    ethersContract = new EthersContract(provider);
    mockContract = ethersContract.create(process.env.DELAYED_ORDER_CONTRACT_ADDRESS, DelayedOrder);
    logger = module.get<Logger>(Logger) as Logger;
    blockchainService = new BlockchainService(ethersContract, provider, logger, errorHandler);
    jest.spyOn(blockchainService, 'getMaxExecutabilityAge').mockImplementation(() => Promise.resolve(1200));
    configService = new ConfigService(blockchainService, logger);
    configService.maxExecutabilityAge = 10000;
    orderQueueService = new OrderQueueService(configService, blockchainService, logger);
    logger = module.get<Logger>(Logger) as Logger;
    errorHandler = new ErrorHandler(logger);
    evmPriceServiceConnection = new EvmPriceServiceConnection(process.env.PYTH_NETWORK_PRICE_SERVCE_URI);
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
    orderKeeperService = new OrderKeeper(orderQueueService, logger, errorHandler, orderExecutorService, blockchainService);
  });

  describe('executeKeeper', () => {
    it('should execute keeper successfully with live orders', async () => {
      jest.spyOn(orderQueueService, 'getAllOrders').mockReturnValue([
        {
          account: 'testAccount1',
          expirationTime: Date.now() - 1000,
          blockNumber: 1222,
          transactionHash: 'rtrt',
          orderType: 'STABLE_DEPOSIT',
          blockTimestamp: 565656,
          executeInTime: 500,
        },
        {
          account: 'testAccount2',
          expirationTime: Date.now() - 500,
          blockNumber: 1222,
          transactionHash: 'rtrt',
          orderType: 'STABLE_DEPOSIT',
          blockTimestamp: 565656,
          executeInTime: 100,
        },
      ]);
      jest.spyOn(logger, 'log').mockImplementation();
      jest.spyOn(orderQueueService, 'removeOrder').mockImplementation();
      jest.spyOn(orderExecutorService, 'getPricesAndExecuteOrder').mockResolvedValueOnce(null);

      await orderKeeperService.executeKeeper();

      expect(logger.log).toHaveBeenCalledWith('in queue 2 unexecuted orders, executable orders count: 0');
      expect(logger.log).toHaveBeenCalledWith('order testAccount1 was expired, remove it from queue...');
      expect(logger.log).toHaveBeenCalledWith('order testAccount2 was expired, remove it from queue...');
      expect(orderExecutorService.getPricesAndExecuteOrder).toHaveBeenCalledTimes(0);
      expect(orderQueueService.removeOrder).toHaveBeenCalledTimes(2);
    });

    it('should execute keeper successfully without active orders', async () => {
      jest.spyOn(orderQueueService, 'getAllOrders').mockReturnValue([
        {
          account: 'testAccount1',
          expirationTime: Date.now() - 1000,
          blockNumber: 1222,
          transactionHash: 'rtrt',
          orderType: 'STABLE_DEPOSIT',
          blockTimestamp: 565656,
          executeInTime: 500,
        },
        {
          account: 'testAccount2',
          expirationTime: Date.now() - 500,
          blockNumber: 1222,
          transactionHash: 'rtrt',
          orderType: 'STABLE_DEPOSIT',
          blockTimestamp: 565656,
          executeInTime: 100,
        },
      ]);
      jest.spyOn(logger, 'log').mockImplementation();
      jest.spyOn(orderQueueService, 'removeOrder').mockImplementation();
      jest.spyOn(orderExecutorService, 'getPricesAndExecuteOrder').mockResolvedValueOnce(null);

      await orderKeeperService.executeKeeper();

      expect(logger.log).toHaveBeenCalledWith('in queue 2 unexecuted orders, executable orders count: 0');
      expect(orderExecutorService.getPricesAndExecuteOrder).toHaveBeenCalledTimes(0);
      expect(orderQueueService.removeOrder).toHaveBeenCalledTimes(2);
    });

    it('should handle error and log it', async () => {
      jest.spyOn(orderQueueService, 'getAllOrders').mockImplementation(() => {
        throw new Error('Test Error');
      });
      // jest.spyOn(logger, "log").mockImplementation();
      const handleErrorSpy = jest.spyOn(errorHandler, 'handleError').mockResolvedValueOnce(null);

      await orderKeeperService.executeKeeper();

      // expect(logger.log).toHaveBeenCalledWith("start order execution keeper ... ");
      expect(handleErrorSpy).toHaveBeenCalledWith('error in order execution keeper', expect.any(Error));
    });
  });

  describe('executeOrder', () => {
    it('should execute order successfully and remove it from the queue', async () => {
      const order: any = { account: 'testAccount', expirationTime: Date.now() + 1000 };
      jest.spyOn(orderExecutorService, 'getPricesAndExecuteOrder').mockResolvedValueOnce(null);
      jest.spyOn(orderQueueService, 'removeOrder').mockImplementation();

      await orderKeeperService['executeOrder'](order, 1);

      expect(orderExecutorService.getPricesAndExecuteOrder).toHaveBeenCalledWith(order, 1);
      expect(orderQueueService.removeOrder).toHaveBeenCalledWith(order.account);
    });
  });

  describe('execAsyncKeeperCallback', () => {
    it('should execute callback and handle errors', async () => {
      const callbackSpy = jest.fn().mockResolvedValueOnce(() => {});

      jest.spyOn(errorHandler, 'handleError').mockImplementation();

      await orderKeeperService['execAsyncKeeperCallback']('testAccount', callbackSpy);

      expect(callbackSpy).toHaveBeenCalled();
      expect(errorHandler.handleError).not.toHaveBeenCalled();

      callbackSpy.mockRejectedValueOnce(new Error('Callback Error'));
      await orderKeeperService['execAsyncKeeperCallback']('testAccount', callbackSpy);

      expect(errorHandler.handleError).toHaveBeenCalledWith('error in keeper while execution order for account testAccount', expect.any(Error));
    });
  });
});
