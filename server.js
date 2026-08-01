require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 9000;

connectDB()

app.listen(PORT, () => {
  console.log(`Server Running on Port ${PORT}`);
});