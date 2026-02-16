import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import sequelize from "./config/sequelize.js";
import { DataTypes } from "sequelize";

import "./models/user.js";
import "./models/product.js";
import "./models/products_variants.js";


console.log("registered models:", Object.keys(sequelize.models));

dotenv.config();

const app = express();



// Middlewares básicos
app.use(helmet());
app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({ message: "API Laura Ecommerce running" });
});

const PORT = process.env.PORT || 3000;

const startServer = async() => {
    try {
        await sequelize.authenticate();
        console.log("Db connected succesfully");

        await sequelize.sync();
        console.log("Models synchronized");
        

        app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
    } catch(error){
        console.error("Unable to connect to db:", error);
    }
}
startServer();


