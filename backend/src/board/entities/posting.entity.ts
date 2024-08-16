// src/post/post.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('posting')
export class PostingEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  title: string;

  @Column('text')
  content: string;

  @Column({ length: 50 })
  author: string;

  // @Column('simple-array')
  // tags: number[]; // 숫자 배열

  @Column('json')
  objekts: number[]; // 숫자 배열을 JSON으로 저장

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Have Objekt List

  // Want Objekt List
}
