import { Test, TestingModule } from '@nestjs/testing';
import { EvmPriceServiceConnection } from '@pythnetwork/pyth-evm-js';
import { Logger } from '@nestjs/common';
import { AppPriceService } from '../../src/service/app-price.service';

describe('AppPriceService', () => {
  let appPriceService: AppPriceService;
  let evmPriceServiceConnection: EvmPriceServiceConnection;
  let logger: Logger;

  beforeEach(async () => {
    process.env.PYTH_NETWORK_PRICE_SERVCE_URI = 'https://test';
    process.env.PYTH_NETWORK_ETH_USD_PRICE_ID = 'price_id';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        Logger,
        {
          provide: EvmPriceServiceConnection,
          useValue: evmPriceServiceConnection,
        },
      ],
    }).compile();

    logger = module.get<Logger>(Logger);
    evmPriceServiceConnection = new EvmPriceServiceConnection(process.env.PYTH_NETWORK_PRICE_SERVCE_URI);
    appPriceService = new AppPriceService(evmPriceServiceConnection, logger);
  });

  describe('getPriceUpdates', () => {
    it('should call getPriceFeedsUpdateData and return price updates', async () => {
      const getPriceFeedsUpdateDataSpy = jest.spyOn(evmPriceServiceConnection, 'getPriceFeedsUpdateData').mockResolvedValue(['123.45']);
      const result = await appPriceService.getPriceUpdates();

      expect(getPriceFeedsUpdateDataSpy).toHaveBeenCalledWith(['price_id']);
      expect(result).toEqual(['123.45']);
    });
  });

  describe('getPriceUpdatesWithRetry', () => {
    it('should call getPriceUpdates and return price updates', async () => {
      const getPriceUpdatesSpy = jest.spyOn(appPriceService, 'getPriceUpdates').mockResolvedValue(['123.45']);
      const result = await appPriceService.getPriceUpdatesWithRetry(3, 1000);

      expect(getPriceUpdatesSpy).toHaveBeenCalled();
      expect(result).toEqual(['123.45']);
    });

    it('should retry and throw an error after reaching max retries', async () => {
      const getPriceUpdatesSpy = jest.spyOn(appPriceService, 'getPriceUpdates').mockRejectedValueOnce(new Error('Network error'));
      const loggerErrorSpy = jest.spyOn(logger, 'error').mockImplementation();

      await expect(appPriceService.getPriceUpdatesWithRetry(2, 1000)).rejects.toThrowError('Max retry attempts reached');

      expect(getPriceUpdatesSpy).toHaveBeenCalledTimes(2);
      expect(loggerErrorSpy).toHaveBeenCalledTimes(2);
      expect(loggerErrorSpy).toHaveBeenCalledWith('Error querying bound mockConstructor (retries: 0): Network error');
    });
  });

  describe('retry', () => {
    it('should call the provided function and return the result', async () => {
      const func = jest.fn().mockResolvedValue('success');
      const result = await appPriceService['retry'](func, 3, 1000);

      expect(func).toHaveBeenCalledTimes(1);
      expect(result).toEqual('success');
    });

    it('should retry and throw an error after reaching max retries', async () => {
      const func = jest.fn().mockRejectedValue(new Error('Function error'));
      const loggerErrorSpy = jest.spyOn(logger, 'error').mockImplementation();

      await expect(appPriceService['retry'](func, 2, 1000)).rejects.toThrowError('Max retry attempts reached');

      expect(func).toHaveBeenCalledTimes(2);
      expect(loggerErrorSpy).toHaveBeenCalledWith('Error querying mockConstructor (retries: 0): Function error');
    });
  });
});
