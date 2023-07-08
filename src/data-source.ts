import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entities/User";
import { Theme } from "./entities/Theme";

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: "database.sqlite",
  synchronize: true,
  logging: false,
  entities: [User, Theme],
  migrations: [],
  subscribers: [],
});
