import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppProvider from "./AppProvider";
import Layout, { RequireLogin, ScrollManager } from "./components/Layout";
import { Empty } from "./components/Shared";
import Admin from "./pages/Admin";
import { AdminLogin, Login, Register } from "./pages/Auth";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Confirmation from "./pages/Confirmation";
import Home from "./pages/Home";
import Item from "./pages/Item";
import Menu from "./pages/Menu";
import Orders from "./pages/Orders";
import Payment from "./pages/Payment";
import Profile from "./pages/Profile";
import Tracking from "./pages/Tracking";

const App = () => {
  return (
    <BrowserRouter>
      <AppProvider>
        <ScrollManager />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/item/:id" element={<Item />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/checkout" element={<RequireLogin><Checkout /></RequireLogin>} />
            <Route path="/payment/:id" element={<RequireLogin><Payment /></RequireLogin>} />
            <Route path="/confirmation/:id?" element={<RequireLogin><Confirmation /></RequireLogin>} />
            <Route path="/tracking/:id?" element={<RequireLogin><Tracking /></RequireLogin>} />
            <Route path="/orders" element={<RequireLogin><Orders /></RequireLogin>} />
            <Route path="/profile" element={<RequireLogin><Profile /></RequireLogin>} />
            <Route path="*" element={<main className="section"><Empty icon="🍟" title="Page not found" /></main>} />
          </Route>
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
};

export default App;
