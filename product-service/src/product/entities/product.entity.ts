import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column()
  name: string;

  @Column({type: 'text', nullable: true})
  description: string

  @Column({type: 'decimal', precision: 10, scale: 2})
  price: number;

  @Column({type: 'int', nullable: true})
  stock: number;

  @Column()
  category: string

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}