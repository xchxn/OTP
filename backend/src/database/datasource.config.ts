// datasource.config.ts
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

// export const AppDataSource = new DataSource({
//   type: 'mysql',
//   host: new ConfigService().get<string>('DATABASE_HOST'),
//   port: 3306,
//   username: new ConfigService().get<string>('DATABASE_USER'),
//   password: new ConfigService().get<string>('DATABASE_PASSWORD'),
//   database: new ConfigService().get<string>('DATABASE_NAME'),
//   entities: [__dirname + '/../**/*.entity{.ts,.js}'],
//   synchronize: true,
// });

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'password',
  database: 'vote',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true,
});