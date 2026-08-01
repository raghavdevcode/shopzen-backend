const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");

const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

router.get("/", verifyToken, verifyAdmin, getUsers);

router.get("/:id", verifyToken, verifyAdmin, getUser);

router.put("/:id", verifyToken, verifyAdmin, updateUser);

router.delete("/:id", verifyToken, verifyAdmin, deleteUser);

module.exports = router;