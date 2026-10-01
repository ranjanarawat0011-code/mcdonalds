import { Link } from "react-router-dom";
import { useApp } from "../lib/context";
import { money, totals } from "../lib/store";

export function PageHero({ title, children }) {
  return <section className="page-hero"><div className="container"><h1>{title}</h1><p>{children}</p></div></section>;
}

export function VegBadge({ veg, long }) {
  return <span className={veg ? "veg" : "veg nonveg"}>● {veg ? (long ? "Vegetarian" : "Veg") : (long ? "Non-Vegetarian" : "Non-Veg")}</span>;
}

export function FoodCard({ item: x }) {
  const { cart, setCart, toast } = useApp();
  function quickAdd() {
    const key = x.id + "|Regular|";
    const existing = cart.find(i => i.key === key);
    setCart(existing
      ? cart.map(i => i.key === key ? { ...i, qty: i.qty + 1 } : i)
      : [...cart, { key, id: x.id, name: x.name, price: x.price, qty: 1, size: x.sizes?.[0]?.[0] || "Regular", extras: [], instructions: "", img: x.img }]);
    toast(x.name + " added to cart", "success");
  }
  return (
    <article className="card">
      <img className="food-img" src={x.img} alt={x.name} />
      <div className="card-body">
        <div className="food-meta"><h3 className="food-name">{x.name}</h3><VegBadge veg={x.veg} /></div>
        <p className="food-desc">{x.desc}</p>
        <div className="food-meta"><span className="price">{money(x.price)}</span><span className="muted">{x.popular ? "⭐ Popular" : ""}</span></div>
        <div className="card-actions">
          <Link className="btn btn-outline" to={"/item/" + x.id}>Customize</Link>
          <button className="btn btn-primary" onClick={quickAdd}>Add to Cart</button>
        </div>
      </div>
    </article>
  );
}

export function Summary({ items }) {
  const t = totals(items);
  return (<>
    <div className="sum-line"><span>Subtotal</span><b>{money(t.subtotal)}</b></div>
    <div className="sum-line discount"><span>Discount</span><b>-{money(t.discount)}</b></div>
    <div className="sum-line"><span>Tax (5%)</span><b>{money(t.tax)}</b></div>
    <div className="sum-line"><span>Delivery</span><b>Free</b></div>
    <div className="sum-line sum-total"><span>Total</span><b>{money(t.total)}</b></div>
  </>);
}

export function Empty({ icon, title, children }) {
  return <div className="empty">{icon && <div className="empty-icon">{icon}</div>}<h2>{title}</h2>{children}</div>;
}

// Renders a useApi() result: a loading line, an error box, or children(data)
export function Loader({ state, children }) {
  if (state.loading) return <p className="muted text-center">Loading…</p>;
  if (state.error) return <Empty icon="⚠️" title="Something went wrong"><p className="muted">{state.error}</p></Empty>;
  return children(state.data);
}

// A row of radio cards styled like the original .radio-grid
export function RadioCards({ name, options, value, onChange, className = "" }) {
  return (
    <div className={"radio-grid " + className}>
      {options.map(([v, label]) => (
        <label key={v} className={"radio-card" + (value === v ? " selected" : "")}>
          <input type="radio" name={name} value={v} checked={value === v} onChange={() => onChange(v)} /> {label}
        </label>
      ))}
    </div>
  );
}
