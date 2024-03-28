import { Injectable, Logger } from '@nestjs/common';
import { BlockchainService } from '../service/blockchain.service';

@Injectable()
export class ConfigService {
  public minExecutabilityAge: number = +process.env.ORDER_MIN_EXECUTABILITY_AGE;
  public maxExecutabilityAge: number = +process.env.ORDER_MAX_EXECUTABILITY_AGE;

  constructor(private readonly blockchainService: BlockchainService, private readonly logger: Logger) {
    this.initProperties();
  }

  private initProperties() {
    this.blockchainService
      .getMaxExecutabilityAge()
      .then((max) => {
        this.logger.log(`initialized maxExecutabilityAge= ${max}sec`);
        this.maxExecutabilityAge = max * 1000;
      })
      .catch((error) => this.logger.error('failed to get maxExecutabilityAge, error:', error));
    this.blockchainService
      .getMinExecutabilityAge()
      .then((min) => {
        this.logger.log(`initialized minExecutabilityAge= ${min}sec`);
        this.minExecutabilityAge = min * 1000;
      })
      .catch((error) => this.logger.error('failed to get minExecutabilityAge, error:', error));
  }
}
