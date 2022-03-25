import { Column, Model, Table } from 'sequelize-typescript';

@Table
export class Message extends Model {
  @Column
  id: number;

  @Column
  text: string;

  @Column
  peer_id: number;

  @Column
  from: number;
}
