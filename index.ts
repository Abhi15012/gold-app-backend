import express from "express";
import userRoutes from "./auth/routes";


const app = express();
app.use(express.json());

app.use("/api/user", userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


app.post("/", (req, res) => {
    res.send("Welcome to the API");
});

export default app;