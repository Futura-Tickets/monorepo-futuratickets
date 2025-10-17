import React from 'react';
import { Route, Routes } from 'react-router-dom';

// COMPONENTS
import Account from './Account/Account';
import Cart from './Cart/Cart';
import CheckOut from './CheckOut/CheckOut';
import Events from './Events/Events';
import Event from './Event/Event';
import Header from './shared/Header/Header';
import Login from './Login/Login';
import Register from './Register/Register';

function App() {
  return (
    <>
      <Header/>
      <Routes>
        <Route path='/' element={<Events/>}/>
        <Route path="/account" element={<Account />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/cart/checkout" element={<CheckOut />} />
        <Route path='/events' element={<Events/>}/>
        <Route path='/events/:eventId' element={<Event/>}/>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </>
  );
}

export default App;
