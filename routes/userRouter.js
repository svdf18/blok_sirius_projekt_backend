import { Router } from "express";
import connection from "../db.js";

const userRouter = Router();

userRouter.get("/", (req, res) => {
  const query = "SELECT * FROM users";
    connection.query(query, (err, results, fields) => {
    if (err) {
      console.log(err);
      res.status(500).json({ error: 'An error occurred' });
    } else {
      res.json(results);
    }
  });
});

export { userRouter };