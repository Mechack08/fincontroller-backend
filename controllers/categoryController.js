const prisma = require("../prisma");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const paginate = require("../utils/paginate");

const Category = prisma.category;

// Create Expense
exports.createCategory = catchAsync(async (req, res, next) => {
  const { name } = req.body;
  const userId = req.user.id;

  const category = await Category.create({
    data: { name, ownerId: userId },
  });

  res.status(201).json({
    status: "success",
    data: { category },
  });
});

// Get All Categories
exports.getAllCategories = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;
  const userId = req.user.id;

  const where = {
    OR: [{ ownerId: userId }, { owner: { role: "ADMIN" } }],
  };

  const categories = await Category.findMany(
    paginate(
      {
        where,
        orderBy: { createdAt: "desc" },
      },
      { page, limit }
    )
  );

  const total = await Category.count({ where });

  res.status(200).json({
    status: "success",
    results: categories.length,
    total,
    page: Number(page),
    limit: Number(limit),
    data: { categories },
  });
});

// Search Categories by Name
exports.searchCategories = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;
  const { name } = req.body;
  const userId = req.user.id;

  if (!name) {
    return next(new AppError("Please provide a name to search", 400));
  }

  const where = {
    AND: [
      {
        name: {
          contains: name,
          mode: "insensitive",
        },
      },
      {
        OR: [{ ownerId: userId }, { owner: { role: "ADMIN" } }],
      },
    ],
  };

  const categories = await Category.findMany(
    paginate(
      {
        where,
        orderBy: { createdAt: "desc" },
      },
      { page, limit }
    )
  );

  const total = await Category.count({ where });

  res.status(200).json({
    status: "success",
    results: categories.length,
    total,
    page: Number(page),
    limit: Number(limit),
    data: { categories },
  });
});

// Get Category by ID
exports.getCategoryById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const category = await Category.findUnique({ where: { id: id } });
  if (!category) {
    return next(new AppError("Category not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: { category },
  });
});

// Update Category
exports.updateCategory = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;

  let category = await Category.findUnique({ where: { id: id } });
  if (!category) {
    return next(new AppError("Category not found", 404));
  }

  category = await Category.update({
    where: { id: id },
    data: { name },
  });

  res.status(200).json({
    status: "success",
    data: { category },
  });
});

// Delete Category
exports.deleteCategory = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const category = await Category.findUnique({ where: { id } });
  if (!category) {
    return next(new AppError("Category not found", 404));
  }

  await Category.delete({ where: { id } });

  res.status(204).json({
    status: "success",
    data: null,
  });
});
