import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useApp, usePageTitle } from "../lib/context";
import { api, validEmail } from "../lib/store";

// Live "existing user / new user" hint shown under the email field
function UserStatus({ email, isReg }) {
  const v = email.trim().toLowerCase();
  const valid = validEmail(v);
  const [found, setFound] = useState({ email: null, user: null });

  // Ask the API whether this email is registered, 300ms after typing stops
  useEffect(() => {
    if (!valid) return;
    const t = setTimeout(() => {
      api("users/check?email=" + encodeURIComponent(v)).then(r => setFound({ email: v, user: r.exists ? r : null }), () => {});
    }, 300);
    return () => clearTimeout(t);
  }, [v, valid]);

  if (!v) return null;
  if (!valid) return <div className="notice error">Email must look like name@example.com and end with .com</div>;
  if (found.email !== v) return null;
  const u = found.user, q = encodeURIComponent(v);
  if (u) return isReg
    ? <div className="notice success">You are already a user ({u.name}). <Link to={"/login?email=" + q}><b>Login instead</b></Link></div>
    : <div className="notice success">✅ Existing user - welcome back, {u.name.split(" ")[0]}! Enter your password.</div>;
  return isReg
    ? <div className="notice info">🆕 New user - you can create your account below.</div>
    : <div className="notice info">🆕 New user - no account found for this email. <Link to={"/register?email=" + q}><b>Register here</b></Link></div>;
}

const emailProps = {
  className: "input", type: "email", required: true, autoComplete: "email",
  pattern: "[^\\s@]+@[^\\s@]+\\.com", title: "Enter an email ending with .com, e.g. name@gmail.com", placeholder: "name@gmail.com"
};

export function Login() {
  usePageTitle("Login");
  const { setUser, toast } = useApp();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState(params.get("email") || "");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  async function submit(e) {
    e.preventDefault();
    const em = email.trim().toLowerCase();
    if (!validEmail(em)) { toast("Email must end with .com", "error"); return; }
    let u;
    try {
      u = await api("auth/login", { method: "POST", body: { email: em, password } });
    } catch (err) {
      toast(err.message, "error");
      if (err.status === 404) setTimeout(() => navigate("/register?email=" + encodeURIComponent(em)), 1200);
      return;
    }
    setUser(u, remember);
    toast("Welcome back, " + u.name.split(" ")[0] + "!", "success");
    setTimeout(() => navigate(params.get("next") || "/"), 600);
  }

  return (
    <main className="auth-wrap"><div className="form-card">
      <h1>Welcome back 👋</h1>
      <p className="muted">Login to continue your demo order.</p>
      <div className="notice info"><b>Demo customer:</b> customer@mcdemo.com / demo123</div>
      <form onSubmit={submit}>
        <div className="field"><label>Email (must end with .com)</label><input {...emailProps} value={email} onChange={e => setEmail(e.target.value)} /></div>
        <UserStatus email={email} />
        <div className="field"><label>Password</label><input className="input" type="password" required autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} /></div>
        <div className="food-meta" style={{ margin: "12px 0 20px" }}>
          <label className="checkbox"><input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} /> Remember Me on this device</label>
        </div>
        <button className="btn btn-primary" style={{ width: "100%" }}>Login</button>
      </form>
      <p className="text-center muted">New customer? <Link style={{ color: "var(--red)", fontWeight: 800 }} to="/register">Create Account</Link></p>
      <p className="text-center"><Link className="muted" to="/admin-login">Manager / Admin Login →</Link></p>
    </div></main>
  );
}

export function Register() {
  usePageTitle("Register");
  const { setUser, toast } = useApp();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState(params.get("email") || "");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  async function submit(e) {
    e.preventDefault();
    const nm = name.trim(), em = email.trim().toLowerCase();
    if (nm.length < 2) { toast("Please enter your name", "error"); return; }
    if (!validEmail(em)) { toast("Email must end with .com", "error"); return; }
    if (password.length < 6) { toast("Password must be at least 6 characters", "error"); return; }
    let u;
    try {
      u = await api("auth/register", { method: "POST", body: { name: nm, email: em, password } });
    } catch (err) {
      toast(err.message, "error");
      if (err.status === 409) setTimeout(() => navigate("/login?email=" + encodeURIComponent(em)), 1500);
      return;
    }
    setUser(u);
    toast("Account created - welcome, " + nm.split(" ")[0] + "!", "success");
    setTimeout(() => navigate(params.get("next") || "/"), 700);
  }

  return (
    <main className="auth-wrap"><div className="form-card">
      <h1>Create Account</h1>
      <p className="muted">Just 3 quick details and you are ready to order.</p>
      <form onSubmit={submit}>
        <div className="field"><label>Full Name</label><input className="input" required autoComplete="name" value={name} onChange={e => setName(e.target.value)} /></div>
        <div className="field"><label>Email (must end with .com)</label><input {...emailProps} value={email} onChange={e => setEmail(e.target.value)} /></div>
        <UserStatus email={email} isReg />
        <div className="field"><label>Password (min 6 characters)</label>
          <input className="input" type={showPw ? "text" : "password"} minLength="6" required autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <label className="checkbox" style={{ marginBottom: 18 }}><input type="checkbox" checked={showPw} onChange={e => setShowPw(e.target.checked)} /> Show password</label>
        <button className="btn btn-primary" style={{ width: "100%" }}>Create Account</button>
      </form>
      <p className="text-center muted">Already registered? <Link style={{ color: "var(--red)", fontWeight: 800 }} to="/login">Login</Link></p>
    </div></main>
  );
}

export function AdminLogin() {
  usePageTitle("Manager Login");
  const { setUser, toast } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function submit(e) {
    e.preventDefault();
    let u;
    try {
      u = await api("auth/login", { method: "POST", body: { email, password, admin: true } });
    } catch (err) {
      toast(err.message, "error");
      return;
    }
    setUser(u);
    toast("Welcome, " + u.name + "!", "success");
    setTimeout(() => navigate("/admin"), 500);
  }

  return (
    <main className="auth-wrap"><div className="form-card">
      <h1>Manager / Admin Login 🔐</h1>
      <p className="muted">Staff-only area. Not for customer accounts.</p>
      <div className="notice info"><b>Demo manager:</b> admin@mcdemo.com / admin123</div>
      <form onSubmit={submit}>
        <div className="field"><label>Admin Email</label><input className="input" type="email" required autoComplete="username" placeholder="name@mcdemo.com" value={email} onChange={e => setEmail(e.target.value)} /></div>
        <div className="field"><label>Password</label><input className="input" type="password" required autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} /></div>
        <button className="btn btn-primary" style={{ width: "100%" }}>Login to Dashboard</button>
      </form>
      <p className="text-center muted">Not a manager? <Link style={{ color: "var(--red)", fontWeight: 800 }} to="/login">Customer Login</Link></p>
    </div></main>
  );
}
