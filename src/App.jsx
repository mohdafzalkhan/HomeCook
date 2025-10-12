import './App.css';
import Home from './screens/Home.jsx';
import Login from './screens/Login.jsx';
import Signup from './screens/Signup.jsx';
import ChefDashboard from './screens/ChefDashboard.jsx';
import{BrowserRouter as Router,Routes,Route} from 'react-router-dom';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { CartProvider } from './components/ContextReducer.jsx';
import Cart from './screens/Cart.jsx';
import MyOrder from './screens/MyOrder.jsx';
import ChefTrackOrders from "./screens/ChefTrackOrder";
function App() {
  return (
    <CartProvider>
      <Router>
        <div>
          <Routes>
            <Route exact path="/" element={<Home/>} />
            <Route exact path="/login" element={<Login/>} />
            <Route exact path="/createuser" element={<Signup/>} />
            <Route exact path="/cart" element={<Cart/>} />
            <Route exact path="/myorder" element={<MyOrder/>} />
            <Route exact path="/chef-dashboard" element={<ChefDashboard/>} />
            <Route path="/chef" element={<ChefDashboard />} />
            <Route path="/chefTrackOrders" element={<ChefTrackOrders />} />
          </Routes>
        </div>
      </Router>
    </CartProvider>
  ); 
}

export default App;
