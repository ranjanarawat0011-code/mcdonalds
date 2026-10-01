import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Logo } from "../components/Layout";
import { PageHero } from "../components/Shared";
import { useApp, useLogout, usePageTitle } from "../lib/context";
import { api, money, payState } from "../lib/store";

const payLabel = o => ({ Paid: "✅ Paid", "Pay on Delivery": "💵 COD", Failed: "❌ Failed" }[payState(o)] || "⏳ Unpaid");

function Table({ headers, rows, empty }) {
  if (!rows.length) return <p className="muted">{empty}</p>;
  return (
    <table className="admin-table">
      <thead><tr>{headers.map(h => <th key={h}>{h}</th>)}</tr></thead>
      <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody>
    </table>
  );
}

export default function Admin() {
  usePageTitle("Manager Dashboard");
  const { user } = useApp();
  const logout = useLogout();
  const [db, setDb] = useState(null);
  const [error, setError] = useState(null);
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (!isAdmin) return;
    Promise.all(["users", "orders", "payments", "menu"].map(t => api(t))).then(
      ([users, orders, payments, menu]) => setDb({ users, orders, payments, menu }),
      err => setError(err.message));
  }, [isAdmin]);

  if (!isAdmin) return <Navigate to="/admin-login" replace />;

  return (<>
    <header className="navbar"><div className="container nav-inner">
      <Logo />
      <nav className="nav-links"><Link to="/">Home</Link><Link to="/menu">Menu</Link></nav>
      <div className="nav-actions"><span>👤 <b>{user.name}</b></span><button className="btn btn-outline btn-sm" onClick={logout}>Logout</button></div>
    </div></header>

    <main>
      <PageHero title="Manager Dashboard 📊">Live view of users, orders and payments from the project database.</PageHero>
      <section className="section"><div className="container">
        {error ? <div className="notice error">Could not load the database: {error}</div> : !db ? <p className="muted">Loading…</p> : <Dashboard db={db} />}
      </div></section>
    </main>

    <footer className="footer"><div className="container copyright">© 2026 SY B.Sc. Computer Science Field Project • Demo / Simulation only</div></footer>
  </>);
}

function Dashboard({ db }) {
  const { users, orders, payments, menu } = db;
  const revenue = orders.filter(o => ["Paid", "Pay on Delivery"].includes(payState(o))).reduce((a, o) => a + Number(o.total || 0), 0);
  const stats = [
    ["👥", "Users", users.length], ["🧾", "Orders", orders.length], ["💰", "Revenue", money(revenue)],
    ["⏳", "Pending Payment", orders.filter(o => payState(o) === "Unpaid").length],
    ["❌", "Failed Payments", orders.filter(o => payState(o) === "Failed").length], ["🍔", "Menu Items", menu.length]
  ];

  return (<>
    <div className="notice info">🟢 Connected to the MongoDB database — showing live data shared by all customers.</div>
    <div className="stat-grid">
      {stats.map(([icon, label, value]) => (
        <div className="panel stat" key={label}><div className="stat-icon">{icon}</div><div><b>{value}</b><span>{label}</span></div></div>
      ))}
    </div>

    <h2 style={{ marginTop: 30 }}>Orders</h2>
    <div className="table-wrap">
      <Table empty="No orders yet." headers={["Order ID", "Customer", "Items", "Total", "Payment", "Status", "Date"]}
        rows={orders.map(o => [o.id, o.name || o.userId || "", (o.items || []).reduce((a, x) => a + x.qty, 0), money(o.total), payLabel(o), o.status, new Date(o.date).toLocaleString()])} />
    </div>

    <h2 style={{ marginTop: 30 }}>Payments</h2>
    <div className="table-wrap">
      <Table empty="No payment attempts yet." headers={["Order ID", "Method", "Amount", "Status", "Date"]}
        rows={payments.map(p => [p.orderId, p.method, money(p.amount), p.status === "Failed" ? "❌ Failed" : "✅ Success", new Date(p.date).toLocaleString()])} />
    </div>

    <h2 style={{ marginTop: 30 }}>Registered Users</h2>
    <div className="table-wrap">
      <Table empty="No users yet." headers={["Name", "Email", "Mobile", "Role"]}
        rows={users.map(x => [x.name, x.email, x.mobile || "-", x.role || "user"])} />
    </div>
  </>);
}
