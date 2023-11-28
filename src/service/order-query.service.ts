import { Injectable, Logger } from '@nestjs/common';
import { AnnouncedOrder } from '../sharedTypes/announcedOrder.types';
import { GraphQLClient, gql } from 'graphql-request';

@Injectable()
export class OrderQueryService {
  private readonly graphQLClient: GraphQLClient;

  constructor(private readonly logger: Logger) {
    this.graphQLClient = new GraphQLClient(process.env.GRAPH_URL);
  }

  async getAnnouncedOrders(timestampFrom: number): Promise<AnnouncedOrder[]> {
    const variables = { timestamp: timestampFrom.toString() };
    try {
      const response = await this.graphQLClient.request<Data>(getAnnouncedOrdersQuery, variables);
      return response.orderAnnounceds;
    } catch (error) {
      this.logger.error('Error fetching announced orders from the graph:', error);
    }
  }
}

export const getAnnouncedOrdersQuery = gql`
  query GetAnnouncedOrders($timestamp: String) {
    orderAnnounceds(where: { blockTimestamp_gte: $timestamp }) {
      blockNumber
      transactionHash
      orderType
      account
      blockTimestamp
    }
  }
`;

interface Data {
  orderAnnounceds: AnnouncedOrder[];
}
