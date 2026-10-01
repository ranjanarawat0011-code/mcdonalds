import { useEffect, useState } from "react";
import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import { useApp, useLogout } from "../lib/context";

export function Logo() {
  return (
    <Link className="brand" to="/">
      <div className="logo">
        <svg viewBox="0 0 48 48" width="30" height="30" aria-hidden="true">
          <path d="M8 38V22C8 8 21 8 24 24C27 8 40 8 40 22V38" fill="none" stroke="#ffc72c" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <span>McDonald's India</span>
    </Link>
  );
}

function Navbar() {
  const { user, cart } = useApp();
  const logout = useLogout();
  const [open, setOpen] = useState(false);
  const isAdmin = user?.role === "admin";
  const firstName = user?.name.split(" ")[0];
  const count = cart.reduce((a, x) => a + x.qty, 0);

  return (
    <header className="navbar"><div className="container nav-inner">
      <Logo />
      <button className="hamb" aria-label="Menu" onClick={() => setOpen(o => !o)}>☰</button>
      {/* Clicking any link closes the mobile menu */}
      <nav className={"nav-links" + (open ? " open" : "")} onClick={() => setOpen(false)}>
        <Link to="/">Home</Link>
        <Link to="/menu">Menu</Link>
        <Link to="/#deals">Deals</Link>
        <Link to="/orders">Orders</Link>
        {isAdmin && <Link to="/admin">📊 Dashboard</Link>}
      </nav>
      <div className="nav-actions">
        <Link to="/cart" className="btn btn-outline btn-sm">🛒 <span>{count}</span></Link>
        {user && (isAdmin
          ? <Link to="/admin">👤 {firstName} (Manager)</Link>
          : <Link to="/profile">Hi, {firstName} 👤</Link>)}
        {user
          ? <button className="btn btn-outline btn-sm" onClick={logout}>Logout</button>
          : <Link className="btn btn-primary btn-sm" to="/login">Login</Link>}
      </div>
    </div></header>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div><h3>McDonald's India</h3><p>Academic demonstration of a fast-food restaurant working and online ordering system. Student academic project.</p></div>
        <div><h4>Quick Links</h4><Link to="/menu">Menu</Link><br /><Link to="/orders">My Orders</Link><br /><Link to="/profile">Profile</Link></div>
        <div><h4>Project</h4><Link to="/#about">About Project</Link></div>
        <div><h4>Contact</h4><p>📍 Pune, Maharashtra<br />☎ +91 90000 00000<br />✉ demo@mcdemo.local</p></div>
      </div>
      <div className="container copyright">© 2026 SY B.Sc. Computer Science Field Project • Demo / Simulation only</div>
    </footer>
  );
}

// Scrolls to #hash targets (e.g. /#deals) or to the top on page change.
export function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) document.querySelector(hash)?.scrollIntoView();
    else window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

export default function Layout() {
  return (<><Navbar /><Outlet /><Footer /></>);
}

// Redirects to login (remembering where to come back to) if nobody is logged in.
export function RequireLogin({ children }) {
  const { user } = useApp();
  const { pathname, search } = useLocation();
  if (!user) return <Navigate to={"/login?next=" + encodeURIComponent(pathname + search)} replace />;
  return children;
}
