import { Link, useParams } from "react-router-dom";
import { Empty, Loader } from "../components/Shared";
import { useApi, usePageTitle } from "../lib/context";
import { KEY, money, payState } from "../lib/store";

export default function Confirmation() {
  usePageTitle("Order Confirmation");
  const id = useParams().id || localStorage.getItem(KEY.lastOrder);
  const order = useApi(id ? "orders/" + encodeURIComponent(id) : null);
  return (
    <main><section className="section"><div className="container">
      {id ? <Loader state={order}>{o => <Details o={o} />}</Loader> : <Empty title="Order not found" />}
    </div></section></main>
  );
}

function Details({ o }) {
  const ps = payState(o);
  if (ps === "Failed" || ps === "Unpaid") {
    const failed = ps === "Failed";
    return (
      <div className="panel text-center">
        <div className="success-icon" style={{ color: "#b71c1c" }}>✕</div>
        <h1>{failed ? "Payment Failed" : "Order Placed - Payment Pending"}</h1>
        <p className="muted">Thank you, {o.name}. Your order <b>{o.id}</b> was recorded, but {failed ? "the payment attempt was not successful" : "no payment has been made yet"}.</p>
        <div className="hero-actions" style={{ justifyContent: "center" }}>
          <Link className="btn btn-primary" to={"/payment/" + o.id}>{failed ? "Retry Payment" : "Choose Payment"}</Link>
          <Link className="btn btn-outline" to="/orders">View Orders</Link>
        </div>
      </div>
    );
  }
  return (
    <div className="panel text-center">
      <div className="success-icon">✓</div>
      <h1>{ps === "Paid" ? "Payment Successful!" : "Order Confirmed - Pay on Delivery"}</h1>
      <p className="muted">Thank you, {o.name}. Your demo order has been received.</p>
      <div className="order-id">{o.id}</div>
      <p><span className="status-pill">{o.status}</span></p>
      <div className="split" style={{ textAlign: "left", marginTop: 25 }}>
        <div><b>Order Type</b><p>{o.type}</p><b>Payment</b><p>{o.payment} <small className="muted">({ps})</small></p></div>
        <div><b>Estimated Time</b><p>15–25 minutes</p><b>Total</b><p className="price">{money(o.total)}</p></div>
      </div>
      <div className="hero-actions" style={{ justifyContent: "center" }}>
        <Link className="btn btn-primary" to={"/tracking/" + o.id}>Track Order</Link>
        <Link className="btn btn-outline" to="/orders">View Orders</Link>
        <Link className="btn btn-yellow" to="/">Back to Home</Link>
      </div>
    </div>
  );
}
