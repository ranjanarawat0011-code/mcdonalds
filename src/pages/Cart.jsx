import { Link, useNavigate } from "react-router-dom";
import { Empty, PageHero, Summary } from "../components/Shared";
import { useApp, usePageTitle } from "../lib/context";
import { money } from "../lib/store";

export default function Cart() {
  usePageTitle("Shopping Cart");
  const { cart, setCart, toast } = useApp();
  const navigate = useNavigate();

  const changeQty = (i, d) => setCart(cart.map((x, j) => j === i ? { ...x, qty: Math.max(1, x.qty + d) } : x));
  const remove = i => setCart(cart.filter((_, j) => j !== i));
  function checkout() {
    if (!cart.length) toast("Your cart is empty", "error");
    else navigate("/checkout");
  }

  return (
    <main>
      <PageHero title="Your Cart 🛒">Review your customized items before checkout.</PageHero>
      <section className="section"><div className="container split">
        <div className="panel">
          {cart.length ? cart.map((x, i) => (
            <div className="cart-row" key={x.key}>
              <img src={x.img} alt="" />
              <div className="cart-info">
                <h4>{x.name}</h4>
                <small>{x.size}{x.extras.length ? " • " + x.extras.join(", ") : ""}{x.instructions ? " • Note: " + x.instructions : ""}</small>
              </div>
              <div className="qty"><button onClick={() => changeQty(i, -1)}>−</button><span>{x.qty}</span><button onClick={() => changeQty(i, 1)}>+</button></div>
              <strong className="line-total">{money(x.price * x.qty)}</strong>
              <button className="btn btn-danger btn-sm" onClick={() => remove(i)}>Remove</button>
            </div>
          )) : (
            <Empty icon="🛒" title="Your cart is empty">
              <p className="muted">Add something delicious from the menu.</p>
              <Link className="btn btn-primary" to="/menu">Browse Menu</Link>
            </Empty>
          )}
          <div style={{ marginTop: 18 }}><Link className="btn btn-outline" to="/menu">← Continue Shopping</Link></div>
        </div>
        <div className="panel summary">
          <h2>Order Summary</h2>
          {cart.length > 0 && <Summary items={cart} />}
          <button className="btn btn-primary" style={{ width: "100%", marginTop: 15 }} onClick={checkout}>Proceed to Checkout →</button>
        </div>
      </div></section>
    </main>
  );
}
