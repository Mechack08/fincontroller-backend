const express = require("express");
const categoryController = require("../controllers/categoryController");
const authController = require("../controllers/authController");

const router = express.Router();

router
  .route("/")
  .post(authController.protect, categoryController.createCategory)
  .get(authController.protect, categoryController.getAllCategories);

router
  .route("/search")
  .get(authController.protect, categoryController.searchCategories);

router
  .route("/:id")
  .get(authController.protect, categoryController.getCategoryById)
  .patch(authController.protect, categoryController.updateCategory)
  .delete(authController.protect, categoryController.deleteCategory);

module.exports = router;
