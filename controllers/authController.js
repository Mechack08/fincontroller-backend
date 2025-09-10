const prisma = require("../prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

const User = prisma.user;
const JWT_SECRET = process.env.JWT_SECRET;

// Sign token
const signToken = (user) => {
  return jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });
};

// Encrypt password
const encryptPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Email/Password Signup
exports.signup = catchAsync(async (req, res, next) => {
  const { email, password, name } = req.body;
  const existingUser = await User.findUnique({ where: { email } });
  if (existingUser) {
    return next(new AppError("User already exists", 401));
  }

  const hashedPassword = await encryptPassword(password);
  const user = await User.create({
    data: { email, name, passwordHash: hashedPassword },
  });

  const token = signToken(user);
  res.status(201).json({
    status: "success",
    token,
    data: { user: { id: user.id, email: user.email, name: user.name } },
  });
});

// Email/Password Login
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findUnique({ where: { email } });
  if (!user) {
    return next(new AppError("Invalid credentials", 401));
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    return next(new AppError("Invalid credentials", 401));
  }

  const token = signToken(user);
  res.status(200).json({
    status: "success",
    token,
    data: { user: { id: user.id, email: user.email, name: user.name } },
  });
});

// Protected route example
exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("You are not logged in! Please log in.", 401));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const currentUser = await User.findUnique({ where: { id: decoded.id } });
    if (!currentUser) {
      return next(
        new AppError("The user belonging to this token no longer exists.", 401)
      );
    }
    req.user = currentUser;
    next();
  } catch (err) {
    return next(new AppError("Invalid token. Please log in again.", 401));
  }
});

// const { OAuth2Client } = require("google-auth-library"); // For Google auth
// const fetch = require('node-fetch');

// const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

// Google OAuth
// exports.googleAuth = async (req, res) => {
//   try {
//     const { tokenId } = req.body;
//     const client = new OAuth2Client(GOOGLE_CLIENT_ID);
//     const ticket = await client.verifyIdToken({
//       idToken: tokenId,
//       audience: GOOGLE_CLIENT_ID,
//     });
//     const { email, name } = ticket.getPayload();

//     let user = await User.findUnique({ where: { email } });
//     if (!user) {
//       user = await User.create({ data: { email, name, password: "" } });
//     }

//     const token = signToken(user);
//     res.json({
//       token,
//       user: { id: user.id, email: user.email, name: user.name },
//     });
//   } catch (err) {
//     res.status(500).json({ msg: "Google authentication failed" });
//   }
// };
