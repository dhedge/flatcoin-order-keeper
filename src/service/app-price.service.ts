import { Injectable, Logger } from '@nestjs/common';
import { EvmPriceServiceConnection } from '@pythnetwork/pyth-evm-js';

@Injectable()
export class AppPriceService {
  constructor(private readonly connection: EvmPriceServiceConnection, private readonly logger: Logger) {}

  async getPriceUpdates(): Promise<string[]> {
    // You can find the ids of prices at https://pyth.network/developers/price-feed-ids#pyth-evm-testnet
    const priceIds = [process.env.PYTH_NETWORK_ETH_USD_PRICE_ID];

    // In order to use Pyth prices in your protocol you need to submit the price update data to Pyth contract in your target
    // chain. `getPriceFeedsUpdateData` creates the update data which can be submitted to your contract. Then your contract should
    // call the Pyth Contract with this data.
    return await this.connection.getPriceFeedsUpdateData(priceIds);
  }

  async getPriceUpdatesWithRetry(maxRetries: number, timeoutMillis: number): Promise<string[]> {
    return this.retry<string[]>(this.getPriceUpdates.bind(this), maxRetries, timeoutMillis);
  }

  async retry<T>(func: () => Promise<T>, maxRetries: number, timeoutMillis: number): Promise<T> {
    for (let retries = 0; retries < maxRetries; retries++) {
      try {
        return await func();
      } catch (err) {
        this.logger.error(`Error querying ${func.name} (retries: ${retries}): ${err.message}`);
        // delay before the next retry
        await new Promise((resolve) => setTimeout(resolve, timeoutMillis)); // 1-second delay
      }
    }
    throw new Error(`Max retry attempts reached`);
  }
}
