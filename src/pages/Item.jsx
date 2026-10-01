import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Empty, Loader, PageHero, VegBadge } from "../components/Shared";
import { useApp, usePageTitle } from "../lib/context";
import { money } from "../lib/store";

export default function Item() {
  usePageTitle("Customize Item");
  const { id } = useParams();
  const { menu } = useApp();
  return (
    <main>
      <PageHero title="Customize Your Item">Choose size, extras and special instructions before adding it to your cart.</PageHero>
      <section className="section"><div className="container">
        <Loader state={menu}>{items => {
          const x = items.find(i => i.id === id);
          return x ? <ItemForm key={x.id} x={x} /> : (
            <Empty title="Item not found"><Link className="btn btn-primary" to="/menu">Back to Menu</Link></Empty>
          );
        }}</Loader>
      </div></section>
    </main>
  );
}

function ItemForm({ x }) {
  const { cart, setCart, toast } = useApp();
  const navigate = useNavigate();
  const [sizeIdx, setSizeIdx] = useState(0);
  const [extras, setExtras] = useState([]); // names of selected extras
  const [instructions, setInstructions] = useState("");
  const [qty, setQty] = useState(1);

  const [size, sizePrice] = x.sizes[sizeIdx];
  const extraPrice = x.extras.filter(e => extras.includes(e[0])).reduce((a, e) => a + e[1], 0);
  const unitPrice = x.price + sizePrice + extraPrice;

  const toggleExtra = name => setExtras(s => s.includes(name) ? s.filter(n => n !== name) : [...s, name]);

  function addToCart() {
    // Keep extras in menu order so the same combination always gives the same key
    const chosen = x.extras.map(e => e[0]).filter(n => extras.includes(n));
    const key = x.id + "|" + size + "|" + chosen.join(",");
    const existing = cart.find(i => i.key === key);
    setCart(existing
      ? cart.map(i => i.key === key ? { ...i, qty: i.qty + qty } : i)
      : [...cart, { key, id: x.id, name: x.name, price: unitPrice, qty, size, extras: chosen, instructions, img: x.img }]);
    toast("Customized item added", "success");
    setTimeout(() => navigate("/cart"), 450);
  }

  return (
    <div className="item-grid">
      <div><img className="item-main-img" src={x.img} alt={x.name} /></div>
      <div>
        <VegBadge veg={x.veg} long />
        <h1>{x.name}</h1>
        <p className="muted">{x.desc}</p>
        <div className="option-box"><b>Choose size</b>
          {x.sizes.map(([name, price], i) => (
            <label className="option-row" key={name}>
              <span><input type="radio" name="size" checked={sizeIdx === i} onChange={() => setSizeIdx(i)} /> {name}</span>
              <b>{price ? "+ " + money(price) : "Included"}</b>
            </label>
          ))}
        </div>
        <div className="option-box"><b>Extra ingredients</b>
          {x.extras.length ? x.extras.map(([name, price]) => (
            <label className="option-row" key={name}>
              <span><input type="checkbox" checked={extras.includes(name)} onChange={() => toggleExtra(name)} /> {name}</span>
              <b>+ {money(price)}</b>
            </label>
          )) : <p className="muted">No extras available.</p>}
        </div>
        <div className="field"><label>Special instructions</label>
          <textarea className="input" rows="3" placeholder="e.g. Less sauce, no onions..." value={instructions} onChange={e => setInstructions(e.target.value)} />
        </div>
        <div className="food-meta">
          <div className="qty">
            <button onClick={() => setQty(q => Math.max(1, q - 1))}>−</button><span>{qty}</span><button onClick={() => setQty(q => q + 1)}>+</button>
          </div>
          <strong className="price">{money(unitPrice * qty)}</strong>
        </div>
        <button className="btn btn-primary" style={{ width: "100%", marginTop: 18 }} onClick={addToCart}>Add to Cart</button>
      </div>
    </div>
  );
}
