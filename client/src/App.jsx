import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import LoadingSpinner from './components/LoadingSpinner';

const Home = lazy(() => import('./pages/Home'));
const Menu = lazy(() => import('./pages/Menu'));
const ItemDetail = lazy(() => import('./pages/ItemDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));
const OrderTracking = lazy(() => import('./pages/OrderTracking'));
const Reservation = lazy(() => import('./pages/Reservation'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Reviews = lazy(() => import('./pages/Reviews'));
const Account = lazy(() => import('./pages/Account'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Contact = lazy(() => import('./pages/Contact'));
const Offers = lazy(() => import('./pages/Offers'));
const About = lazy(() => import('./pages/About'));

const NoFooter = ['/checkout', '/order-success'];

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" toastOptions={{ style: { background: '#12100A', color: '#F5F0E8', border: '1px solid #2A2518' } }} />
      <Navbar />
      <CartDrawer />
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/menu/:id" element={<ItemDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success/:id" element={<OrderSuccess />} />
          <Route path="/track/:id" element={<OrderTracking />} />
          <Route path="/reserve" element={<Reservation />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/account" element={<Account />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </Suspense>
      <Footer />
    </BrowserRouter>
  );
}
