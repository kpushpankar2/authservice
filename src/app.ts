import "reflect-metadata";
import cookieParser from "cookie-parser";
import express from "express";
import authRouter from "./routes/auth";
import tenantRouter from "./routes/tenant";
import userRouter from "./routes/user";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
// import { Config } from "./config";
// import cors from "cors";

const app = express();

// const ALLOWED_DOMAINS = [Config.CLIENT_UI_DOMAIN, Config.ADMIN_UI_DOMAIN];

// app.use(cors({ origin: ALLOWED_DOMAINS as string[] }));

app.use(express.static("public"));

app.use(express.json());
app.use(cookieParser());

app.get("/", async (req, res) => {
    res.send("Welcone to Authentication Service");
});

app.use("/auth", authRouter);
app.use("/tenants", tenantRouter);
app.use("/users", userRouter);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use(globalErrorHandler);

export default app;
