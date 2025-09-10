const prisma = require("../prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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
exports.signup = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const existingUser = await User.findUnique({ where: { email } });
    if (existingUser)
      return res.status(401).json({ msg: "User already exists" });

    const hashedPassword = encryptPassword(password);
    const user = await User.create({
      data: { email, name, passwordHash: hashedPassword },
    });

    const token = signToken(user);
    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// Email/Password Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = signToken(user);
    res.status(200).json({
      token,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// Forgot Password
// exports.forgotPassword = async (req, res) => {
//   try {
//     const { email } = req.body;
//     const user = await User.findUnique({ where: { email } });
//     if (!user) return res.status(400).json({ msg: "User not found" });

//     // Generate reset token (in a real app, use a more secure method)
//     const resetToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });

//     // Here you would send the resetToken via email to the user
//     // For simplicity, we'll just return it in the response
//     res.json({ msg: "Password reset token generated", resetToken });
//   } catch (err) {
//     res.status(500).json({ msg: "Server error" });
//   }
// };

// Reset Password
// exports.resetPassword = async (req, res) => {
//   try {
//     const { token, newPassword } = req.body;
//     const decoded = jwt.verify(token, JWT_SECRET);
//     const user = await User.findUnique({ where: { id: decoded.id } });
//     if (!user) return res.status(400).json({ msg: "Invalid token" });

//     const hashedPassword = await encryptPassword(newPassword);
//     await User.update({
//       where: { id: user.id },
//       data: { passwordHash: hashedPassword, passwordChangeAt: new Date() },
//     });

//     res.json({ msg: "Password reset successful" });
//   } catch (err) {
//     res.status(500).json({ msg: "Server error" });
//   }
// };

// const { OAuth2Client } = require("google-auth-library"); // For Google auth
// const fetch = require('node-fetch');

// const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
// const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;
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

// // Facebook OAuth
// exports.facebookAuth = async (req, res) => {
//     try {
//         const { accessToken, userID } = req.body;
//         const url = `https://graph.facebook.com/v8.0/${userID}?fields=id,name,email&access_token=${accessToken}`;
//         const response = await fetch(url);
//         const data = await response.json();

//         if (!data.email) return res.status(400).json({ msg: 'Facebook authentication failed' });

//         let user = await User.findOne({ email: data.email });
//         if (!user) {
//             user = new User({ email: data.email, name: data.name, password: '' });
//             await user.save();
//         }

//         const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
//         res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
//     } catch (err) {
//         res.status(500).json({ msg: 'Facebook authentication failed' });
//     }
// };
