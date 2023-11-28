import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class NotificationService {
  constructor(private readonly logger: Logger) {}

  async sendNotification(message: string) {
    try {
      await axios.post(process.env.SLACK_CHANNEL, { text: message });
    } catch (error) {
      this.logger.error(`Error sending notification '${message}' to slack channel ${process.env.SLACK_CHANNEL}`, error);
    }
  }
}
