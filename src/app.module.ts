import { Logger, Module } from '@nestjs/common';
import { BlockchainModule } from './config/blockchainModule';
import { AppPriceService } from './service/app-price.service';
import { ConfigModule } from '@nestjs/config';
import { OrderExecutorService } from './executor/order-executor.service';
import { LoggingModule } from './config/logging.module';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationService } from './service/notification.service';
import { BalanceService } from './service/balance.service';
import { BlockchainService } from './service/blockchain.service';
import { ListenerService } from './listener.service';
import { OrderQueryService } from './service/order-query.service';
import { OrderKeeper } from './order.keeper';
import { OrderQueueService } from './service/order-queue.service';
import { ErrorHandler } from './service/error.handler';
import { ConfigService } from './config/config.service';

@Module({
  imports: [ConfigModule.forRoot(), ScheduleModule.forRoot(), LoggingModule, BlockchainModule, PrometheusModule.register()],
  controllers: [],
  providers: [
    AppPriceService,
    OrderExecutorService,
    Logger,
    NotificationService,
    BlockchainService,
    ListenerService,
    OrderQueryService,
    OrderKeeper,
    OrderQueueService,
    ErrorHandler,
    ConfigService,
    BalanceService
  ],
})
export class AppModule {}
