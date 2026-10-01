import bcrypt from "bcryptjs";
import express from "express";
import { connectDb } from "./db.js";
import { MenuItem, Order, Payment, User } from "./models.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.com$/i;
const STATUSES = ["Ordered", "Preparing", "Ready", "Served"];

// Small helper so route handlers can reject a request with a status code
class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

// Same billing rules as the frontend: 10% off at ₹500+, then 5% tax
function orderTotal(items) {
  const subtotal = items.reduce((a, x) => a + Number(x.price) * Number(x.qty), 0);
  const discount = subtotal >= 500 ? Math.round(subtotal * 0.10) : 0;
  const taxable = subtotal - discount;
  return taxable + Math.round(taxable * 0.05 * 100) / 100;
}

const api = express.Router();
api.use(async (_req, _res, next) => { await connectDb(); next(); });

// ---------- Menu ----------
api.get("/menu", async (_req, res) => {
  res.json(await MenuItem.find().sort({ _id: 1 }));
});

// ---------- Users & auth ----------
api.get("/users/check", async (req, res) => {
  const user = await User.findOne({ email: String(req.query.email || "").trim().toLowerCase() });
  res.json(user ? { exists: true, name: user.name } : { exists: false });
});

api.post("/auth/register", async (req, res) => {
  const name = String(req.body.name || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  if (name.length < 2) throw new HttpError(400, "Please enter your name");
  if (!EMAIL_RE.test(email)) throw new HttpError(400, "Email must end with .com");
  if (password.length < 6) throw new HttpError(400, "Password must be at least 6 characters");
  if (await User.exists({ email })) throw new HttpError(409, "You are already a user - please login");

  const user = await User.create({ name, email, password: await bcrypt.hash(password, 10) });
  res.status(201).json(user);
});

api.post("/auth/login", async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const user = await User.findOne({ email });
  if (req.body.admin && user?.role !== "admin") throw new HttpError(403, "No manager account found for this email");
  if (!user) throw new HttpError(404, "New user - please register first");
  if (!(await bcrypt.compare(String(req.body.password || ""), user.password))) throw new HttpError(401, "Incorrect password");
  res.json(user);
});

api.get("/users", async (_req, res) => {
  res.json(await User.find().sort({ _id: 1 }));
});

api.put("/users/:email", async (req, res) => {
  const { name, mobile, address } = req.body;
  const changes = Object.fromEntries(Object.entries({ name, mobile, address }).filter(([, v]) => v !== undefined));
  const user = await User.findOneAndUpdate({ email: req.params.email.toLowerCase() }, changes, { new: true, runValidators: true });
  if (!user) throw new HttpError(404, "User not found");
  res.json(user);
});

// ---------- Orders ----------
api.get("/orders", async (req, res) => {
  const filter = req.query.userId ? { userId: String(req.query.userId).toLowerCase() } : {};
  res.json(await Order.find(filter).sort({ date: -1 }));
});

api.get("/orders/:id", async (req, res) => {
  const order = await Order.findOne({ id: req.params.id });
  if (!order) throw new HttpError(404, "Order not found");
  res.json(order);
});

api.post("/orders", async (req, res) => {
  const b = req.body;
  if (!Array.isArray(b.items) || !b.items.length) throw new HttpError(400, "Your cart is empty");
  if (b.type === "Delivery" && !String(b.address || "").trim()) throw new HttpError(400, "Please enter your delivery address");

  const order = await Order.create({
    id: "MCD" + Date.now().toString().slice(-8),
    userId: String(b.userId || "").toLowerCase(),
    name: b.name, mobile: b.mobile, email: b.email, type: b.type,
    address: b.address, city: b.city, pin: b.pin,
    items: b.items, total: orderTotal(b.items)
  });
  // Remember the mobile number on the customer's profile the first time it's given
  if (b.mobile) await User.updateOne({ email: order.userId, mobile: "" }, { mobile: b.mobile });
  res.status(201).json(order);
});

// Used by the tracking page to advance the kitchen status
api.put("/orders/:id/status", async (req, res) => {
  const statusIndex = Number(req.body.statusIndex);
  if (!(statusIndex >= 0 && statusIndex < STATUSES.length)) throw new HttpError(400, "Invalid status");
  const order = await Order.findOneAndUpdate({ id: req.params.id }, { statusIndex, status: STATUSES[statusIndex] }, { new: true });
  if (!order) throw new HttpError(404, "Order not found");
  res.json(order);
});

// ---------- Payments ----------
api.get("/payments", async (_req, res) => {
  res.json(await Payment.find().sort({ date: -1 }));
});

// Records a (simulated) payment attempt and updates the order's payment status
api.post("/payments", async (req, res) => {
  const { orderId, method, status } = req.body;
  const order = await Order.findOne({ id: orderId });
  if (!order) throw new HttpError(404, "Order not found");
  if (!["Unpaid", "Failed"].includes(order.paymentStatus)) throw new HttpError(409, "This order is already paid");
  if (!["Success", "Failed"].includes(status)) throw new HttpError(400, "Invalid payment status");

  const isCod = method === "Cash on Delivery (COD)";
  order.payment = method;
  order.paymentStatus = status === "Failed" ? "Failed" : isCod ? "Pay on Delivery" : "Paid";
  await order.save();
  const payment = await Payment.create({ orderId, method, amount: order.total, status });
  res.status(201).json({ order, payment });
});

api.use((req, res) => res.status(404).json({ error: "Unknown API route: " + req.method + " " + req.originalUrl }));

const app = express();
app.use(express.json());
app.use("/api", api);
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  if (!err.status) console.error(err);
  res.status(err.status || 500).json({ error: err.status ? err.message : "Server error: " + err.message });
});

export default app;
