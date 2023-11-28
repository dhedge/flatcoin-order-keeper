import { Injectable, Logger } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Injectable()
export class ErrorHandler {
  constructor(private readonly notificationService: NotificationService, private readonly logger: Logger) {}

  public async handleError(message: string, error: any) {
    const messageToSlack = `${message}, error ${error?.message}`;
    this.logger.error(messageToSlack, error);
    this.logger.error((error as Error).stack);

    if (process.env.SLACK_NOTIFICATIONS_ENABLED) {
      await this.notificationService.sendNotification(messageToSlack);
    }
  }
}
