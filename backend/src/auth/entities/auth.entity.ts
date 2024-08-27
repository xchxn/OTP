import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class AuthEntity {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  accessToken: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  refreshToken: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  password: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;
}