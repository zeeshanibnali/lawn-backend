import { AppDataSource } from "./data-source";
import { User } from "./entities/User";

import express from "express";
import cors from "cors";
import * as argon2 from "argon2";

const main = () => {
  AppDataSource.initialize()
    .then(async () => {
      console.log("Database has been connected successfully");
    })
    .catch((error) => console.log(error));

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get("", (req, res) => {
    console.log("req.body", req.body)
    res.json("Test Successfull");
  });

  app.post("/register", async (req, res) => {
    console.log("req.body", req.body)

    const userRepository = await AppDataSource.getRepository(User);
    const body = req.body;
    const hash = await argon2.hash(body.password);
    let createdUser = await userRepository.create({
      name: body.name,
      email: body.email,
      password: hash,
    });
    await userRepository
      .save(createdUser)
      .then(() => {
        let { password, ...user } = createdUser;
        res.json(user);
      })
      .catch(() => {
        return { message: "Error" };
      });
  });

  app.post("/login", async (req, res) => {
    const userRepository = await AppDataSource.getRepository(User);
    const body = req.body;
    let user = await userRepository.findOne({
      where: {
        email: body.email,
      },
    });
    if (user) {
      const check = await argon2.verify(user.password, body.password);
      if (check) {
        const { password, ...rest } = user;
        res.json(rest);
      } else {
        res.send({ message: "Wrong Credentials" }).status(204);
      }
    } else {
      res.send("User was not found").status(404);
    }
  });

  app.post("/me", async (req, res) => {
    const userRepository = await AppDataSource.getRepository(User);
    const body = req.body;
    let user = await userRepository.findOne({
      where: {
        id: body.id,
      },
    });
    if (user) {
      const { password, ...rest } = user;
      res.json(user);
    } else {
      res.send("User was not found").status(404);
    }
  });

  app.listen(4000, () => {
    console.log("Server is listening at PORT 4000");
  });
};

main();
