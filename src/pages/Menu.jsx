import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FoodCard, Loader, PageHero } from "../components/Shared";
import { useApp, usePageTitle } from "../lib/context";

const CATS = ["All", "Burgers", "Combos", "Sides", "Beverages", "Desserts"];

export default function Menu() {
  usePageTitle("Menu");
  const [params] = useSearchParams();
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState(CATS.includes(params.get("cat")) ? params.get("cat") : "All");
  const [sort, setSort] = useState("default");
  const { menu } = useApp();

  let items = menu.data || [];
  const q = search.toLowerCase();
  if (cat !== "All") items = items.filter(x => x.cat === cat);
  if (q) items = items.filter(x => (x.name + " " + x.desc).toLowerCase().includes(q));
  if (sort === "low") items = [...items].sort((x, y) => x.price - y.price);
  if (sort === "high") items = [...items].sort((x, y) => y.price - x.price);
  if (sort === "popular") items = [...items].sort((x, y) => Number(y.popular) - Number(x.popular));

  return (
    <main>
      <PageHero title="Our Menu 🍟">Search, filter, customize and add your favourites to the cart.</PageHero>
      <section className="section"><div className="container">
        <div className="toolbar">
          <input className="input search" placeholder="🔎 Search burgers, fries, coffee..." value={search} onChange={e => setSearch(e.target.value)} />
          <select className="select" style={{ maxWidth: 200 }} value={cat} onChange={e => setCat(e.target.value)}>
            {CATS.map(c => <option key={c}>{c}</option>)}
          </select>
          <select className="select" style={{ maxWidth: 200 }} value={sort} onChange={e => setSort(e.target.value)}>
            <option value="default">Sort: Featured</option>
            <option value="popular">Most Popular</option>
            <option value="low">Price: Low to High</option>
            <option value="high">Price: High to Low</option>
          </select>
        </div>
        <Loader state={menu}>{() => (
        <div className="grid grid-4">
          {items.length ? items.map(x => <FoodCard key={x.id} item={x} />) : (
            <div className="empty" style={{ gridColumn: "1/-1" }}>
              <div className="empty-icon">🔎</div><h3>No items found</h3><p className="muted">Try another search or category.</p>
            </div>
          )}
        </div>
        )}</Loader>
      </div></section>
    </main>
  );
}
