import { Link } from "react-router-dom";
import { FoodCard, Loader } from "../components/Shared";
import { useApp, usePageTitle } from "../lib/context";

const deals = [
  ["DEAL 01", "Combo Saver", "Get a complete meal at a student-friendly demo price.", "Order Combo", "/menu"],
  ["DEAL 02", "10% OFF", "Automatic demo discount on orders above ₹500.", "Shop ₹500+", "/menu"],
  ["DEAL 03", "Sweet Finish", "Add a dessert to complete your digital meal.", "Desserts", "/menu?cat=Desserts"]
];
const features = [
  ["⚡", "Quick Ordering", "Search, filter, customize and add items without complicated steps."],
  ["🧾", "Clear Billing", "Subtotal, discount, tax and final total are calculated automatically."],
  ["📍", "Order Tracking", "Follow an order through Ordered, Preparing, Ready and Served."],
  ["💵", "Pay Your Way", "Place your order first, then pay by UPI, Card, Wallet or Cash on Delivery."]
];
const reviews = [
  ["★★★★★", "The menu is simple and the order tracking makes the whole process easy to understand.", "Aarav • Student"],
  ["★★★★★", "Customization and automatic price calculation are useful features for an online ordering system.", "Meera • Customer"],
  ["★★★★☆", "Ordering first and choosing how to pay from My Orders is really convenient.", "Rahul • Customer"]
];

function SectionHead({ title, sub, children }) {
  return <div className="section-head"><div><h2>{title}</h2><p className="section-sub">{sub}</p></div>{children}</div>;
}

export default function Home() {
  usePageTitle("Home");
  const { menu } = useApp();
  return (
    <main>
      <section className="hero"><div className="container hero-grid">
        <div>
          <span className="eyebrow">🍔 Fast • Fresh • Digital</span>
          <h1>Your favourites.<br /><span>One simple order.</span></h1>
          <p>A complete academic demonstration of how restaurant ordering, customization, order history, flexible payment options and order tracking can work together in one responsive web application.</p>
          <div className="hero-actions">
            <Link className="btn btn-primary" to="/menu">Order Now →</Link>
            <a className="btn btn-outline" href="#about">Explore Project</a>
          </div>
        </div>
        <div className="hero-img"><div className="hero-badge">⚡ Quick ordering • Demo system</div></div>
      </div></section>

      <section className="section"><div className="container">
        <SectionHead title="Popular Picks" sub="Customer favourites for a quick demo order.">
          <Link className="btn btn-outline" to="/menu">View Full Menu</Link>
        </SectionHead>
        <Loader state={menu}>
          {items => <div className="grid grid-4">{items.filter(x => x.popular).slice(0, 4).map(x => <FoodCard key={x.id} item={x} />)}</div>}
        </Loader>
      </div></section>

      <section className="section" id="deals" style={{ background: "#fff" }}><div className="container">
        <SectionHead title="Today's Deals" sub="Example offers built into the academic prototype." />
        <div className="grid grid-3">
          {deals.map(([tag, title, text, cta, to]) => (
            <div className="deal" key={tag}><small>{tag}</small><h3>{title}</h3><p>{text}</p><Link className="btn btn-yellow" to={to}>{cta}</Link></div>
          ))}
        </div>
      </div></section>

      <section className="section"><div className="container">
        <SectionHead title="Why Choose Us?" sub="The system demonstrates common restaurant workflow improvements." />
        <div className="features">
          {features.map(([icon, title, text]) => (
            <div className="feature" key={title}><div className="feature-icon">{icon}</div><h3>{title}</h3><p>{text}</p></div>
          ))}
        </div>
      </div></section>

      <section className="section" id="about" style={{ background: "var(--cream)" }}><div className="container split">
        <div>
          <h2>About the Project</h2>
          <p style={{ lineHeight: 1.8 }}>This project is developed as a field project for <b>SY B.Sc. Computer Science</b>. It studies the working system of a fast-food restaurant and demonstrates how digital ordering, order history, payment options and order tracking can improve operational efficiency and customer experience.</p>
          <p className="muted">All accounts, orders and payment records in this browser prototype are simulated using localStorage. No real payments are processed and no real card information should be entered.</p>
        </div>
        <div className="panel">
          <h3>Quick Demo</h3>
          <p><b>Customer:</b> customer@mcdemo.com / demo123</p>
          <Link className="btn btn-primary" to="/login">Start Demo →</Link>
        </div>
      </div></section>

      <section className="section"><div className="container">
        <SectionHead title="What Customers Say" sub="Sample review content for the UI demonstration." />
        <div className="grid grid-3">
          {reviews.map(([stars, text, person]) => (
            <div className="card review" key={person}><div className="stars">{stars}</div><p>“{text}”</p><div className="person">{person}</div></div>
          ))}
        </div>
      </div></section>
    </main>
  );
}
