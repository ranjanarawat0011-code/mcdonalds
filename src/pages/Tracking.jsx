import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Empty, Loader, PageHero } from "../components/Shared";
import { useApi, usePageTitle } from "../lib/context";
import { api, KEY, money, payState } from "../lib/store";

const STATUSES = ["Ordered", "Preparing", "Ready", "Served"];
const PAY_COLORS = { Paid: "#19743c", Failed: "#b71c1c", "Pay on Delivery": "#1a4fa0" };

export default function Tracking() {
  usePageTitle("Track Order");
  const id = useParams().id || localStorage.getItem(KEY.lastOrder);
  const order = useApi(id ? "orders/" + encodeURIComponent(id) : null);
  return (
    <main>
      <PageHero title="Track Your Order 📍">Order progress is simulated automatically for demonstration.</PageHero>
      <section className="section"><div className="container">
        {id ? <Loader state={order}>{o => <TrackPanel key={o.id} o={o} />}</Loader> : <Empty title="Order not found" />}
      </div></section>
    </main>
  );
}

function TrackPanel({ o }) {
  const [step, setStep] = useState(o.statusIndex);

  // Simulate kitchen progress: advance one status every 5 seconds until Served
  useEffect(() => {
    if (step >= STATUSES.length - 1) return;
    const t = setTimeout(() => {
      api("orders/" + o.id + "/status", { method: "PUT", body: { statusIndex: step + 1 } }).catch(() => {});
      setStep(step + 1);
    }, 5000);
    return () => clearTimeout(t);
  }, [step, o.id]);

  const ps = payState(o);
  return (
    <div className="panel">
      <div className="food-meta">
        <div><small className="muted">Order ID</small><div className="order-id">{o.id}</div></div>
        <span className="status-pill">{STATUSES[step]}</span>
      </div>
      <div className="steps">
        {STATUSES.map((s, i) => (
          <div key={s} className={"step" + (i < step ? " done" : "") + (i === step ? " active" : "")}>
            <div className="step-dot">{i < step ? "✓" : i + 1}</div><label>{s}</label>
          </div>
        ))}
      </div>
      <div className="split">
        <div>
          <h3>Order Items</h3>
          {o.items.map(x => <p key={x.key}>{x.qty} × {x.name} <b style={{ float: "right" }}>{money(x.price * x.qty)}</b></p>)}
        </div>
        <div>
          <h3>Order Details</h3>
          <p>Date: {new Date(o.date).toLocaleString()}</p>
          <p>Payment: {o.payment} <b style={{ color: PAY_COLORS[ps] || "#8a5b00" }}>({ps === "Failed" ? "❌ Failed" : ps === "Paid" ? "✅ Paid" : ps})</b></p>
          <p>Total: <b>{money(o.total)}</b></p>
        </div>
      </div>
    </div>
  );
}
