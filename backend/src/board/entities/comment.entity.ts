import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PostingEntity } from './posting.entity';

@Entity('comment')
export class CommentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  content: string;

  @Column({ length: 100 })
  userId: string;

  @ManyToOne(() => PostingEntity)
  @JoinColumn({ name: 'postingId' })
  posting: PostingEntity;

  @Column()
  posting_id: number;

  @ManyToOne(() => CommentEntity)
  @JoinColumn({ name: 'replyTargetCommentId' })
  parentComment: CommentEntity;

  @Column({ nullable: true })
  replyTargetCommentId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
