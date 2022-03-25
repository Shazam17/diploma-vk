import { Injectable } from '@nestjs/common';
import { Kafka } from "kafkajs";

@Injectable()
export class KafkaService {
  constructor() {
    // this.kafka = new Kafka({
    //   clientId: 'my-app',
    //   brokers: ['kafka1:9092', 'kafka2:9092'],
    // })
  }
}
