import express from "express";
import cors from "cors";
import { config } from "./config/env.js";
import { verifyConnection } from "./config/db.js";
import routes from "./routes/index.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

const app = express();

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || config.corsOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
  })
);
app.use(express.json({ limit: "100kb" }));

app.use("/api", routes);
app.use(notFound);
app.use(errorHandler);

async function start() {
  try {
    await verifyConnection();
  } catch (error) {
    console.error(
      `Could not connect to MySQL at ${config.db.host}:${config.db.port} (${error.message}).\n` +
        "Check backend/.env and run `npm run db:reset` to create and seed the database."
    );
    process.exit(1);
  }

  app.listen(config.port, () => {
    console.log(`ArchiVis API listening on http://localhost:${config.port}/api`);
  });
}

start();

export default app;
