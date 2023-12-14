import express from "express";
import cors from "cors";
import { userRouter } from "./routes/userRouter.js";
import { preferenceRouter } from "./routes/preferenceRouter.js";
import { departmentRouter } from "./routes/departmentRouter.js";
import { recommendationRouter } from "./routes/recommendationRouter.js";
import { eventRouter } from "./routes/eventRouter.js";
import { authRouter } from "./routes/authRouter.js";
import { eventDepartmentRouter } from "./routes/eventDepartmentRouter.js";
import { linkUserToDepartmentRouter } from "./routes/linkUserDepartmentRouter.js";
import { linkUserToEventRouter } from "./routes/linkUserEventRouter.js";

const app = express();
const port = process.env.PORT || 3333;

app.use(express.json());
app.use(cors());
app.use("/users", userRouter);
app.use("/preferences", preferenceRouter);
app.use("/departments", departmentRouter);
app.use("/recommendations", recommendationRouter);
app.use("/events", eventRouter);
app.use("/api/auth", authRouter);
app.use("/event-departments", eventDepartmentRouter)
app.use("/link-user-to-department", linkUserToDepartmentRouter)
app.use("/link-user-to-event", linkUserToEventRouter)


app.get("/", (req, res) => {
  res.send("Blok Sirius");
});

app.listen(port, () => {
  console.log(`App running on http://localhost:${port}`);
})