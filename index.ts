import express from "express";
import userRoutes from "./auth/routes";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/user", userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});



app.post("/", (req, res) => {
    res.send("Welcome to the API");
});

export default app;