import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";

import testRoutes from "./routes/testRoutes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Workforce Management API Running");
});

app.use("/api/auth", authRoutes);

app.use("/api/test", testRoutes);

export default app;