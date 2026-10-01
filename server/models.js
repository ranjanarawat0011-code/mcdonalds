import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

// `id: false` turns off Mongoose's built-in `id` virtual so we can store our own
// readable ids (e.g. "b1", "MCD12345678"). `_id` and password hashes never leave the API.
const options = {
  id: false,
  versionKey: false,
  toJSON: { transform: (_doc, ret) => { delete ret._id; delete ret.password; return ret; } }
};

const menuItemSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: String, cat: String, price: Number, veg: Boolean, popular: Boolean, desc: String, img: String,
  sizes: Schema.Types.Mixed,  // [["Regular", 0], ["Large", 35]]
  extras: Schema.Types.Mixed  // [["Extra Cheese", 25], ...]
}, options);

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true }, // bcrypt hash
  mobile: { type: String, default: "" },
  address: { type: String, default: "" },
  role: { type: String, enum: ["user", "admin"], default: "user" }
}, options);

const orderSchema = new Schema({
  id: { type: String, required: true, unique: true },
  date: { type: Date, default: Date.now },
  userId: { type: String, index: true }, // customer email
  name: String, mobile: String, email: String,
  type: { type: String, enum: ["Dine-in", "Takeaway", "Delivery"] },
  address: String, city: String, pin: String,
  items: Schema.Types.Mixed,
  total: Number,
  payment: { type: String, default: "Not selected" },
  paymentStatus: { type: String, default: "Unpaid" }, // Unpaid | Paid | Pay on Delivery | Failed
  status: { type: String, default: "Ordered" },
  statusIndex: { type: Number, default: 0 }
}, options);

const paymentSchema = new Schema({
  orderId: { type: String, index: true },
  method: String,
  amount: Number,
  status: { type: String, enum: ["Success", "Failed"] },
  date: { type: Date, default: Date.now },
  simulation: { type: Boolean, default: true }
}, options);

// Reuse compiled models when the serverless function is warm
export const MenuItem = models.MenuItem || model("MenuItem", menuItemSchema);
export const User = models.User || model("User", userSchema);
export const Order = models.Order || model("Order", orderSchema);
export const Payment = models.Payment || model("Payment", paymentSchema);
