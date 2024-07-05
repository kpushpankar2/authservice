import express from "express";

const app = express();

app.get("/", (req, res) => {
    res.send("Welcone to Authentication Service");
});

export default app;
