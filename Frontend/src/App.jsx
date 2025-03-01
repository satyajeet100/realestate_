import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./Pages/Home";
import Register from "./Pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Buy from "./Pages/Buy";
import Rent from "./Pages/Rent";
import Sell from "./Pages/Sell";
import Contact from "./Pages/Contact";
import { Box } from "@mui/material";
import Login from './Pages/Login';
import Details from './Pages/Details'; // Import the Details page
import Wishlist from './Pages/Wishlist';

import BillingAddress from "./Pages/BillingAddress";
import PropertyDetails from "./pages/PropertyDetails";
import Payment from "./Pages/Payment"



function App() {
  return (
    <Router>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh", // Full-screen height
          width: "100vw", // Full-screen width
        }}
      >
        <Header /> {/* Navigation Bar */}

        {/* Main Content (Takes remaining height) */}
        <Box sx={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/buy" element={<Buy />} />
            <Route path="/rent" element={<Rent />} />
            <Route path="/sell" element={<Sell />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/property/:id" element={<PropertyDetails />} />
            <Route path="/viewdetails" element={<Details></Details>}></Route>
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/billing-address" element={<BillingAddress />} />
            <Route path="/payment" element={<Payment />} />
          </Routes>
        </Box>

        <Footer /> {/* Footer Section */}
      </Box>
    </Router>
  );
}

export default App;
