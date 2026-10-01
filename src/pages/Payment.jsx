import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Loader, PageHero, RadioCards, Summary } from "../components/Shared";
import { useApi, useApp, usePageTitle } from "../lib/context";
import { api, KEY, money, payState } from "../lib/store";

const NAMES = { upi: "UPI", card: "Card", wallet: "Wallet", cod: "Cash on Delivery (COD)" };

export default function Payment() {
  usePageTitle("Demo Payment");
  const { id } = useParams();
  const { user } = useApp();
  const order = useApi("orders/" + encodeURIComponent(id));
  return (
    <Loader state={order}>{o =>
      o.userId !== user.email || !["Unpaid", "Failed"].includes(payState(o))
        ? <Navigate to="/orders" replace />
        : <PaymentForm order={o} />
    }</Loader>
  );
}

function PaymentForm({ order }) {
  const { toast } = useApp();
  const navigate = useNavigate();
  const [method, setMethod] = useState("upi");
  const [f, setF] = useState({ upi: "", cardNumber: "", cardName: "", expiry: "", cvv: "" });
  const [failMsg, setFailMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const field = k => ({ value: f[k], onChange: e => setF(s => ({ ...s, [k]: e.target.value })) });

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    const upi = f.upi.trim(), cardNum = f.cardNumber.replace(/\s/g, "");
    if (method === "upi" && !/^[\w.-]{2,}@[a-zA-Z]{2,}$/.test(upi)) { toast("Enter a valid demo UPI ID", "error"); return; }
    if (method === "card" && (!/^\d{16}$/.test(cardNum) || !f.cardName.trim() || !/^\d{2}\/\d{2}$/.test(f.expiry) || !/^\d{3,4}$/.test(f.cvv))) {
      toast("Please enter valid demo card details", "error"); return;
    }
    // Demo failure simulation: UPI id containing "fail", or a card number ending in an odd digit.
    // Card details are only checked here in the browser and are never sent to the server.
    const failed = method === "upi" ? /fail/i.test(upi) : method === "card" ? Number(cardNum.slice(-1)) % 2 === 1 : false;

    setBusy(true);
    try {
      await api("payments", { method: "POST", body: { orderId: order.id, method: NAMES[method], status: failed ? "Failed" : "Success" } });
    } catch (err) {
      toast(err.message, "error");
      setBusy(false);
      return;
    }
    if (failed) {
      setFailMsg("❌ Payment Failed — your " + NAMES[method] + " payment could not be processed. Please try again or choose a different payment option.");
      toast("Payment Failed. Please try again.", "error");
      setBusy(false);
      return;
    }
    localStorage.setItem(KEY.lastOrder, order.id);
    toast(method === "cod" ? "Order confirmed - pay on delivery" : "Payment Successful!", "success");
    setTimeout(() => navigate("/confirmation/" + order.id), 400);
  }

  return (
    <main>
      <PageHero title="Payment">Order <b>{order.id}</b> — choose how you want to pay. Demo only, no real money is processed.</PageHero>
      <section className="section"><div className="container split">
        <div className="panel">
          <div className="notice" style={{ background: "#fff8e7" }}>⚠️ <b>Simulation:</b> Never enter real payment credentials in this academic prototype.</div>
          <form onSubmit={submit}>
            <h3>Choose Payment Method</h3>
            <RadioCards name="payment" className="two" value={method} onChange={setMethod}
              options={[["upi", "UPI"], ["card", "Card"], ["wallet", "Wallet"], ["cod", "💵 Cash on Delivery (COD)"]]} />
            <div style={{ marginTop: 18 }}>
              {method === "upi" && <div className="field"><label>Demo UPI ID</label><input className="input" placeholder="demo@upi" {...field("upi")} /></div>}
              {method === "card" && (<>
                <div className="field"><label>Card Number (demo only)</label><input className="input" inputMode="numeric" maxLength="16" placeholder="16 digits" {...field("cardNumber")} /></div>
                <div className="field"><label>Card Holder Name</label><input className="input" {...field("cardName")} /></div>
                <div className="form-row">
                  <div className="field"><label>Expiry (MM/YY)</label><input className="input" placeholder="12/30" {...field("expiry")} /></div>
                  <div className="field"><label>CVV</label><input className="input" type="password" maxLength="4" {...field("cvv")} /></div>
                </div>
              </>)}
              {method === "wallet" && (
                <div className="field"><label>Wallet</label><select className="select"><option>Demo Wallet</option><option>Demo Pay</option><option>Demo Cash Wallet</option></select></div>
              )}
              {method === "cod" && <div className="notice" style={{ background: "#edf9f1", color: "#19743c" }}>Pay in cash when your order is delivered / handed over. No online payment needed.</div>}
            </div>
            {failMsg && <div className="notice error" style={{ marginTop: 14 }}>{failMsg}</div>}
            <button className="btn btn-primary" style={{ width: "100%" }} disabled={busy}>
              {busy ? "Processing..." : method === "cod" ? "Confirm Cash on Delivery" : "Pay " + money(order.total) + " (Demo)"}
            </button>
            <p className="pay-hint">Demo tip: a UPI ID containing "fail" or a card number ending in an odd digit simulates a failed payment.</p>
          </form>
        </div>
        <div className="panel summary"><h2>Amount Due</h2><Summary items={order.items} /></div>
      </div></section>
    </main>
  );
}
