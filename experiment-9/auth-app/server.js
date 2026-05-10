const express    = require("express");
const mongoose   = require("mongoose");
const jwt        = require("jsonwebtoken");
const bcrypt     = require("bcryptjs");

const app = express();
app.use(express.json());

const JWT_SECRET = "my_super_secret_key_change_in_production";
const PORT       = 5000;

// ── MongoDB Connect ───────────────────────────────
mongoose.connect("mongodb://127.0.0.1:27017/auth_demo")
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err  => console.log("❌ DB Error:", err));

// ── User Schema & Model ───────────────────────────
const userSchema = new mongoose.Schema({
  email:     { type: String, required: true, unique: true, lowercase: true },
  password:  { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema);

// ── REGISTER ──────────────────────────────────────
app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password)
      return res.status(400).json({ success: false, msg: "Email and password are required" });

    if (password.length < 6)
      return res.status(400).json({ success: false, msg: "Password must be at least 6 characters" });

    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ success: false, msg: "User already exists" });

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ email, password: hashedPassword });
    await user.save();

    res.status(201).json({ success: true, msg: "User registered successfully" });

  } catch (err) {
    res.status(500).json({ success: false, msg: "Server error", error: err.message });
  }
});

// ── LOGIN → generate JWT ──────────────────────────
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ success: false, msg: "Email and password are required" });

    // Find user
    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ success: false, msg: "Invalid credentials" });

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ success: false, msg: "Invalid credentials" });

    // Sign JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      success: true,
      msg: "Login successful",
      token,
      expiresIn: "1 hour"
    });

  } catch (err) {
    res.status(500).json({ success: false, msg: "Server error", error: err.message });
  }
});

// ── AUTH MIDDLEWARE ───────────────────────────────
function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];

  // Expect: "Bearer <token>"
  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(401).json({ success: false, msg: "No token provided" });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError")
      return res.status(401).json({ success: false, msg: "Token expired. Please login again." });
    return res.status(401).json({ success: false, msg: "Invalid token" });
  }
}

// ── PROTECTED ROUTE — Profile ─────────────────────
app.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user)
      return res.status(404).json({ success: false, msg: "User not found" });

    res.json({
      success: true,
      data: {
        id:        user._id,
        email:     user.email,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, msg: "Server error", error: err.message });
  }
});

// ── PROTECTED ROUTE — Dashboard ───────────────────
app.get("/dashboard", authMiddleware, (req, res) => {
  res.json({
    success: true,
    msg: `Welcome ${req.user.email}! This is your dashboard.`,
    user: req.user
  });
});

// ── LOGOUT ────────────────────────────────────────
// JWT is stateless — logout means deleting the token on the client side.
// Server just sends a confirmation message.
app.post("/logout", authMiddleware, (req, res) => {
  res.json({
    success: true,
    msg: "Logged out successfully. Please delete the token from your client."
  });
});

// ── ROOT ──────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    msg: "JWT Auth API",
    routes: {
      "POST /register"    : "Register a new user",
      "POST /login"       : "Login and get JWT token",
      "GET  /profile"     : "Protected — view profile (send Bearer token)",
      "GET  /dashboard"   : "Protected — dashboard",
      "POST /logout"      : "Logout (delete token on client)",
    }
  });
});

// ── START SERVER ──────────────────────────────────
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));