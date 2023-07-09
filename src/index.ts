import { AppDataSource } from "./data-source";
import { User } from "./entities/User";

import express from "express";
import cors from "cors";
import * as argon2 from "argon2";
import { Theme } from "./entities/Theme";

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
    console.log("req.body", req.body);
    res.json("Test Successfull");
  });

  app.post("/register", async (req, res) => {
    try {
      console.log("req.body", req.body);

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
          res.json({ message: "User could not be created" });
        });
    } catch (err) {
      res.json({ message: "Something went wrong" });
    }
  });

  app.post("/login", async (req, res) => {
    try {
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
        res.json({ message: "User was not found" });
      }
    } catch (err) {
      res.json({ message: "Something went wrong" });
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

  app.post("/themes/", async (req, res) => {
    const userRepository = await AppDataSource.getRepository(User);
    const themeRepository = await AppDataSource.getRepository(Theme);
    const body = req.body;
    let user = await userRepository.findOne({
      where: {
        id: body.id,
      },
      relations: {
        themes: true,
      },
    });
    if (user) {
      let themes = await themeRepository.find({
        where: {
          // user: user,
        },
      });
      console.log("rest", themes);
      res.json(themes);
    } else {
      res.send("User was not found").status(404);
    }
  });

  app.post("/themes/add", async (req, res) => {
    const userRepository = await AppDataSource.getRepository(User);
    const themeRepository = await AppDataSource.getRepository(Theme);
    const body = req.body;
    let user = await userRepository.findOne({
      where: {
        id: body.id,
      },
      relations: {
        themes: true,
      },
    });
    if (user) {
      let createdTheme = await themeRepository.create({
        primary: body.primary,
        secondary: body.secondary,
        primButton: body.primButton,
        secButton: body.secButton,
        accent: body.accent,
        user: user,
      });

      await themeRepository
        .save(createdTheme)
        .then(() => {
          res.json(createdTheme);
        })
        .catch(() => {
          return { message: "Error While Saving Theme" };
        });
    } else {
      res.send({ message: "User was not found" }).status(404);
    }
  });

  app.post("/themes/delete", async (req, res) => {
    try {
      const themeRepository = await AppDataSource.getRepository(Theme);
      const body = req.body;
      await themeRepository.delete(body.id);
      res.json("Successfully deletd");
    } catch (err) {
      res.json({ message: "Error while deleting" });
    }
  });

  app.listen(4000, () => {
    console.log("Server is listening at PORT 4000");
  });
};

main();
