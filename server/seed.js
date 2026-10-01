import bcrypt from "bcryptjs";
import { MenuItem, User } from "./models.js";

// Initial data, inserted the first time the API connects to an empty database.
const seedMenu = [
  {id:"b1",name:"Classic Cheeseburger",cat:"Burgers",price:149,veg:false,popular:true,desc:"Juicy patty, cheese, onions, pickles and signature sauce.",img:"https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80",sizes:[["Regular",0],["Large",35]],extras:[["Extra Cheese",25],["Extra Patty",55]]},
  {id:"b2",name:"McVeggie Style Burger",cat:"Burgers",price:129,veg:true,popular:true,desc:"Crispy vegetable patty with fresh lettuce and creamy sauce.",img:"https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=80",sizes:[["Regular",0],["Large",30]],extras:[["Extra Cheese",25],["Jalapeños",15]]},
  {id:"b3",name:"Spicy Chicken Burger",cat:"Burgers",price:179,veg:false,popular:false,desc:"Crispy chicken, lettuce and spicy mayo in a toasted bun.",img:"https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=900&q=80",sizes:[["Regular",0],["Large",35]],extras:[["Extra Cheese",25],["Extra Chicken",65]]},
  {id:"c1",name:"Classic Meal Combo",cat:"Combos",price:299,veg:false,popular:true,desc:"Burger, medium fries and a chilled beverage.",img:"https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=900&q=80",sizes:[["Regular",0],["Large",45]],extras:[["Extra Fries",45],["Extra Cheese",25]]},
  {id:"c2",name:"Veggie Meal Combo",cat:"Combos",price:269,veg:true,popular:true,desc:"Veggie burger, fries and a refreshing beverage.",img:"https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=900&q=80",sizes:[["Regular",0],["Large",40]],extras:[["Extra Fries",45],["Extra Cheese",25]]},
  {id:"s1",name:"French Fries",cat:"Sides",price:99,veg:true,popular:true,desc:"Golden, crispy and perfectly salted fries.",img:"https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=80",sizes:[["Regular",0],["Large",35]],extras:[["Cheese Dip",25]]},
  {id:"s2",name:"Chicken Nuggets",cat:"Sides",price:139,veg:false,popular:false,desc:"Crispy bite-sized chicken nuggets with dipping sauce.",img:"https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=900&q=80",sizes:[["6 Pc",0],["10 Pc",55]],extras:[["Extra Dip",15]]},
  {id:"d1",name:"Cola",cat:"Beverages",price:79,veg:true,popular:false,desc:"Chilled fizzy cola served over ice.",img:"https://images.unsplash.com/photo-1581636625402-29b2a704ef13?auto=format&fit=crop&w=900&q=80",sizes:[["Regular",0],["Large",25]],extras:[]},
  {id:"d2",name:"Iced Coffee",cat:"Beverages",price:119,veg:true,popular:true,desc:"Smooth chilled coffee with a creamy finish.",img:"https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=80",sizes:[["Regular",0],["Large",30]],extras:[["Extra Cream",20]]},
  {id:"x1",name:"Chocolate Sundae",cat:"Desserts",price:109,veg:true,popular:true,desc:"Creamy soft serve topped with chocolate sauce.",img:"https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=900&q=80",sizes:[["Regular",0]],extras:[["Extra Chocolate",20]]},
  {id:"x2",name:"Apple Pie",cat:"Desserts",price:89,veg:true,popular:false,desc:"Warm crispy pastry with a sweet apple filling.",img:"https://images.unsplash.com/photo-1535920527002-b35e96722d9a?auto=format&fit=crop&w=900&q=80",sizes:[["Regular",0]],extras:[["Extra Dip",15]]}
];

const seedUsers = [
  { name: "Admin Manager", email: "admin@mcdemo.com", mobile: "9999999999", password: "admin123", role: "admin", address: "McDonald's India HQ" },
  { name: "Demo Customer", email: "customer@mcdemo.com", mobile: "9876543210", password: "demo123", role: "user", address: "Pune, Maharashtra" }
];

export async function seed() {
  if (!(await MenuItem.estimatedDocumentCount())) await MenuItem.insertMany(seedMenu);
  if (!(await User.estimatedDocumentCount())) {
    await User.insertMany(await Promise.all(seedUsers.map(async u => ({ ...u, password: await bcrypt.hash(u.password, 10) }))));
  }
}
