import { Injectable, Logger } from '@nestjs/common';
import { InjectEthersProvider } from 'nestjs-ethers';
import { JsonRpcProvider } from '@ethersproject/providers';
import { BigNumber, ethers } from 'ethers';
import { NotificationService } from './notification.service';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class BalanceService {

  private readonly ethersContract: ethers.Contract;

  constructor(
    @InjectEthersProvider()
    private readonly provider: JsonRpcProvider,
    private readonly notificationService: NotificationService,
    private readonly logger: Logger,
  ) {
    this.ethersContract = new ethers.Contract(process.env.SIGNER_WALLET_ADDRESS, [], this.provider);
  }

  @Cron("0 * * * *")
  async checkBalance() {
    if (! await this.hasEnoughEth(process.env.SIGNER_WALLET_ADDRESS)) {
      this.notificationService.sendNotification(`Announced order executor account balance is less than ${+process.env.MIN_BALANCE_LIMIT} eth`)
        .catch(err => this.logger.error("error sending balance check notification", err));
    }
  }

  private async hasEnoughEth(accountAddress: string) {
    const balance = await this.getEthBalance(accountAddress);
    return balance.gte(ethers.utils.parseEther(process.env.MIN_BALANCE_LIMIT));
  }

  private async getEthBalance(accountAddress: string): Promise<BigNumber> {
    return this.provider.getBalance(accountAddress);
  }
}
