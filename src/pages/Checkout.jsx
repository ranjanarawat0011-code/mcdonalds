import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { PageHero, RadioCards, Summary } from "../components/Shared";
import { useApp, usePageTitle } from "../lib/context";
import { api, KEY } from "../lib/store";

export default function Checkout() {
  usePageTitle("Checkout");
  const { user, setUser, cart, setCart, toast } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: user.name, mobile: user.mobile || "", email: user.email, address: "", city: "", pin: "" });
  const [type, setType] = useState("Dine-in");
  const [placing, setPlacing] = useState(false);

  if (!cart.length && !placing) return <Navigate to="/cart" replace />;

  const field = k => ({ value: form[k], onChange: e => setForm(f => ({ ...f, [k]: e.target.value })) });

  async function submit(e) {
    e.preventDefault();
    if (placing) return; // guard against double-click / double-submit creating two orders
    if (type === "Delivery" && !form.address.trim()) { toast("Please enter your delivery address", "error"); return; }
    setPlacing(true);

    let order;
    try {
      // The server assigns the order id and recalculates the total
      order = await api("orders", { method: "POST", body: {
        userId: user.email, name: form.name.trim(), mobile: form.mobile.trim(), email: form.email.trim(), type,
        address: form.address, city: form.city, pin: form.pin, items: cart
      } });
    } catch (err) {
      toast(err.message, "error");
      setPlacing(false);
      return;
    }
    // The server saves the mobile number to the profile the first time; mirror it locally
    if (!user.mobile && order.mobile) setUser({ ...user, mobile: order.mobile });
    localStorage.setItem(KEY.lastOrder, order.id);
    navigate("/orders?new=" + order.id);
    setCart([]);
  }

  return (
    <main>
      <PageHero title="Checkout">Enter your details and place the order. You will choose the payment option from My Orders.</PageHero>
      <section className="section"><div className="container split">
        <div className="panel">
          <h2>Customer Information</h2>
          <form onSubmit={submit}>
            <div className="field"><label>Name</label><input className="input" required {...field("name")} /></div>
            <div className="form-row">
              <div className="field"><label>Mobile</label><input className="input" required {...field("mobile")} /></div>
              <div className="field"><label>Email</label><input className="input" type="email" required {...field("email")} /></div>
            </div>
            <h3>Order Type</h3>
            <RadioCards name="orderType" value={type} onChange={setType}
              options={[["Dine-in", "🍽️ Dine-in"], ["Takeaway", "🛍️ Takeaway"], ["Delivery", "🛵 Delivery"]]} />
            {type === "Delivery" && (
              <div style={{ marginTop: 18 }}>
                <div className="field"><label>Address</label><textarea className="input" rows="3" {...field("address")} /></div>
                <div className="form-row">
                  <div className="field"><label>City</label><input className="input" {...field("city")} /></div>
                  <div className="field"><label>PIN Code</label><input className="input" maxLength="6" inputMode="numeric" {...field("pin")} /></div>
                </div>
              </div>
            )}
            <button className="btn btn-primary" style={{ width: "100%", marginTop: 10 }} disabled={placing}>
              {placing ? "Placing order..." : "Place Order →"}
            </button>
          </form>
        </div>
        <div className="panel summary">
          <h2>Order Summary</h2>
          <Summary items={cart} />
          <div className="notice" style={{ background: "#f4f4f4" }}>🧾 Step 1: Place your order. Step 2: Open <b>My Orders</b> and choose UPI, Card, Wallet or Cash on Delivery.</div>
        </div>
      </div></section>
    </main>
  );
}
