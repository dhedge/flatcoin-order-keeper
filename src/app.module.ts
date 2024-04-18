import { Logger, Module } from '@nestjs/common';
import { BlockchainModule } from './config/blockchainModule';
import { AppPriceService } from './service/app-price.service';
import { ConfigModule } from '@nestjs/config';
import { OrderExecutorService } from './service/order-executor.service';
import { LoggingModule } from './config/logging.module';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { ScheduleModule } from '@nestjs/schedule';

import { BlockchainService } from './service/blockchain.service';
import { ListenerService } from './listener.service';
import { OrderKeeper } from './order.keeper';
import { OrderQueueService } from './service/order-queue.service';
import { ErrorHandler } from './service/error.handler';
import { ConfigService } from './config/config.service';
import { EvmPriceServiceConnection } from '@pythnetwork/pyth-evm-js';

@Module({
  imports: [ConfigModule.forRoot(), ScheduleModule.forRoot(), LoggingModule, BlockchainModule, PrometheusModule.register()],
  controllers: [],
  providers: [
    AppPriceService,
    OrderExecutorService,
    Logger,
    BlockchainService,
    ListenerService,
    OrderKeeper,
    OrderQueueService,
    ErrorHandler,
    ConfigService,

    {
      provide: EvmPriceServiceConnection,
      useValue: new EvmPriceServiceConnection(process.env.PYTH_NETWORK_PRICE_SERVCE_URI),
    },
  ],
})
export class AppModule {}
