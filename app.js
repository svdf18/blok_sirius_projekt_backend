import express from "express";
import cors from "cors";
import { userRouter } from "./routes/userRouter.js";

const app = express();
const port = process.env.PORT || 3306;

app.use(express.json());
app.use(cors());
app.use("/users", userRouter);

app.get("/", (req, res) => {
  res.send("Users");
});

app.listen(port, () => {
  console.log(`App running on http://localhost:${port}`);
})
