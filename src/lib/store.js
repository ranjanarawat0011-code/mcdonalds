// Shared data helpers. Users, menu, orders and payments live in MongoDB behind
// the Express API (/api/*). Only the cart and the login session stay in the browser.

export const KEY = { current: "mcd_current_user", cart: "mcd_cart", lastOrder: "mcd_last_order" };

// Calls the backend and returns parsed JSON; throws an Error (with .status) on failure.
export async function api(path, { method = "GET", body } = {}) {
  const res = await fetch("/api/" + path, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || "Request failed (" + res.status + ")"), { status: res.status });
  return data;
}

export const getCart = () => JSON.parse(localStorage.getItem(KEY.cart) || "[]");
export const saveCartStorage = c => localStorage.setItem(KEY.cart, JSON.stringify(c));

// Logged-in state lives in sessionStorage by default, so it clears itself the
// moment the browser tab/window is closed. "Remember Me" also keeps a copy in
// localStorage so the user stays logged in across visits on that device.
export function getCurrentUser() {
  return JSON.parse(sessionStorage.getItem(KEY.current) || localStorage.getItem(KEY.current) || "null");
}
export function storeCurrentUser(u, remember = false) {
  if (!u) { sessionStorage.removeItem(KEY.current); localStorage.removeItem(KEY.current); return; }
  if (remember || localStorage.getItem(KEY.current)) localStorage.setItem(KEY.current, JSON.stringify(u));
  else sessionStorage.setItem(KEY.current, JSON.stringify(u));
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.com$/i;
export const validEmail = e => EMAIL_RE.test(String(e || "").trim());
export const payState = o => o.paymentStatus || "Paid";
export const money = n => "₹" + Number(n).toFixed(2);

export function totals(c) {
  const subtotal = c.reduce((a, x) => a + x.price * x.qty, 0);
  const discount = subtotal >= 500 ? Math.round(subtotal * 0.10) : 0;
  const taxable = subtotal - discount;
  const tax = Math.round(taxable * 0.05 * 100) / 100;
  return { subtotal, discount, tax, delivery: 0, total: taxable + tax };
}
