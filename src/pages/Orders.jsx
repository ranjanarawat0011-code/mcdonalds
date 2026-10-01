import { Link, useSearchParams } from "react-router-dom";
import { Empty, Loader, PageHero } from "../components/Shared";
import { useApi, useApp, usePageTitle } from "../lib/context";
import { money, payState } from "../lib/store";

function PayPill({ o }) {
  const s = payState(o);
  if (s === "Paid") return <span className="status-pill completed">✅ Paid - {o.payment}</span>;
  if (s === "Pay on Delivery") return <span className="status-pill cod">💵 Cash on Delivery</span>;
  if (s === "Failed") return <span className="status-pill unpaid">❌ Payment Failed</span>;
  return <span className="status-pill unpaid">💳 Payment pending</span>;
}

export default function Orders() {
  usePageTitle("My Orders");
  const { user } = useApp();
  const [params] = useSearchParams();
  const newId = params.get("new");
  const result = useApi("orders?userId=" + encodeURIComponent(user.email));

  return (
    <main>
      <PageHero title="My Orders">Your order history. Choose a payment option for any unpaid order.</PageHero>
      <section className="section"><div className="container">
        <Loader state={result}>{orders => (<>
        {newId && orders.some(o => o.id === newId) && (
          <div className="notice success">✅ Order <b>{newId}</b> placed successfully! Now choose a payment option for it below.</div>
        )}
        {orders.length ? orders.map(o => {
          const ps = payState(o);
          return (
            <div key={o.id} className={"panel" + (o.id === newId ? " highlight" : "")} style={{ marginBottom: 12 }}>
              <div className="food-meta">
                <div><b>{o.id}</b><small className="muted" style={{ display: "block" }}>{new Date(o.date).toLocaleString()}</small></div>
                <span className={"status-pill" + (o.status === "Served" ? " completed" : "")}>{o.status}</span>
              </div>
              <p>{o.items.map(x => x.qty + " × " + x.name).join(", ")}</p>
              <div className="food-meta" style={{ marginBottom: 8 }}><b>{money(o.total)}</b><PayPill o={o} /></div>
              <div className="food-meta">
                <div>
                  {ps === "Unpaid" && <p className="pay-hint">Payment options: UPI • Card • Wallet • Cash on Delivery</p>}
                  {ps === "Failed" && <p className="pay-hint" style={{ color: "#b71c1c" }}>Your last payment attempt failed. Please retry.</p>}
                </div>
                <div className="order-actions">
                  {(ps === "Unpaid" || ps === "Failed") && (
                    <Link className="btn btn-primary btn-sm" to={"/payment/" + o.id}>{ps === "Failed" ? "🔁 Retry Payment" : "💳 Choose Payment"}</Link>
                  )}
                  <Link className="btn btn-outline btn-sm" to={"/tracking/" + o.id}>View Details</Link>
                </div>
              </div>
            </div>
          );
        }) : (
          <Empty icon="📦" title="No orders yet"><Link className="btn btn-primary" to="/menu">Order Now</Link></Empty>
        )}
        </>)}</Loader>
      </div></section>
    </main>
  );
}
