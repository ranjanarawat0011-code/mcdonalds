import { useState } from "react";
import { Link } from "react-router-dom";
import { PageHero } from "../components/Shared";
import { useApp, useLogout, usePageTitle } from "../lib/context";
import { api } from "../lib/store";

export default function Profile() {
  usePageTitle("My Profile");
  const { user, setUser, toast } = useApp();
  const logout = useLogout();
  const [form, setForm] = useState({ name: user.name, mobile: user.mobile || "", address: user.address || "" });
  const field = k => ({ value: form[k], onChange: e => setForm(f => ({ ...f, [k]: e.target.value })) });

  async function save(e) {
    e.preventDefault();
    try {
      setUser(await api("users/" + encodeURIComponent(user.email), { method: "PUT", body: form }));
    } catch (err) {
      toast(err.message, "error");
      return;
    }
    toast("Profile updated", "success");
  }

  return (
    <main>
      <PageHero title="My Profile 👤">Edit your basic account information and saved address.</PageHero>
      <section className="section"><div className="container split">
        <div className="panel">
          <form onSubmit={save}>
            <div className="field"><label>Name</label><input className="input" required {...field("name")} /></div>
            <div className="field"><label>Email</label><input className="input" value={user.email} disabled /></div>
            <div className="field"><label>Mobile</label><input className="input" maxLength="10" {...field("mobile")} /></div>
            <div className="field"><label>Saved Address</label><textarea className="input" rows="4" {...field("address")} /></div>
            <button className="btn btn-primary">Save Changes</button>
          </form>
          <button className="btn btn-danger" style={{ marginTop: 12 }} onClick={logout}>Logout</button>
        </div>
        <div className="panel">
          <h2>Account Safety</h2>
          <p className="muted">This academic frontend stores demo account data in your browser's localStorage. A production system should use secure server-side authentication, password hashing and protected APIs.</p>
          <Link className="btn btn-outline" to="/orders">View My Orders</Link>
        </div>
      </div></section>
    </main>
  );
}
