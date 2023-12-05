import express from "express";
import cors from "cors";
import { userRouter } from "./routes/userRouter.js";
import { preferenceRouter } from "./routes/preferenceRouter.js";
import { departmentRouter } from "./routes/departmentRouter.js";
import { recommendationRouter } from "./routes/recommendationRouter.js";
import { eventRouter } from "./routes/eventRouter.js";
import { authRouter } from "./routes/authRouter.js";

const app = express();
const port = process.env.PORT || 3306;

app.use(express.json());
app.use(cors());
app.use("/users", userRouter);
app.use("/preferences", preferenceRouter);
app.use("/departments", departmentRouter);
app.use("/recommendations", recommendationRouter);
app.use("/events", eventRouter);
app.use("/api/auth", authRouter);


app.get("/", (req, res) => {
  res.send("Users");
});

app.listen(port, () => {
  console.log(`App running on http://localhost:${port}`);
})
