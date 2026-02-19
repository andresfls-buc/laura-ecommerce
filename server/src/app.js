import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import sequelize from "./config/sequelize.js";

// Importar modelos para que Sequelize los reconozca
import "./models/index.js"; 

//Import routes
import routes from "./routes/index.js";

import globalErrorHandler from "./middlewares/globalErrorHandler.js";

dotenv.config();

const app = express();

console.log("registered models:", Object.keys(sequelize.models));

// parse JSON bodies
app.use(express.json());

// Middlewares básicos
app.use(helmet());
app.use(cors());

// Routes
app.use("/api", routes);

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({ message: "API Laura Ecommerce running" });
});

// ✅ Global error handler middleware
app.use(globalErrorHandler);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Db connected successfully");

    // sync models, en producción se recomienda usar migraciones en lugar de sync()
    await sequelize.sync();
    console.log("Models synchronized");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Unable to connect to db:", error);
  }
};

startServer();
