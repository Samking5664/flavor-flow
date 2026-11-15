import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { Utensils, ShoppingBag, User, Compass, LogOut, Package } from 'lucide-react'
import { supabase } from './supabaseClient'
import Auth from './components/Auth'
import Restaurants from './components/Restaurants'
import Cart from './components/Cart'
import Orders from './components/Orders' // <-- 1. Import the Orders component

function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center py-16 bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl text-white shadow-xl">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4">Crave it. Get it. Delivered.</h1>
        <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto mb-8">
          Explore top local restaurants and get your favorite meals delivered straight to your door with FlavorFlow.
        </p>
        <Link to="/restaurants" className="bg-white text-orange-600 font-bold px-8 py-3 rounded-full shadow-lg hover:bg-orange-50 transition inline-block">
          Browse Restaurants
        </Link>
      </div>
    </div>
  )
}

export default function App() {
  const [session, setSession] = useState(null)
  const [cart, setCart] = useState([])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const addToCart = (item, restaurantId) => {
    if (cart.length > 0 && cart[0].restaurantId !== restaurantId) {
      if (!window.confirm("Your cart contains items from another restaurant. Do you want to clear your cart and add this item?")) {
        return
      }
      setCart([{ ...item, quantity: 1, restaurantId }])
      return
    }

    setCart(prevCart => {
      const existing = prevCart.find(i => i.id === item.id)
      if (existing) {
        return prevCart.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prevCart, { ...item, quantity: 1, restaurantId }]
    })
  }

  const updateQuantity = (id, delta) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.id === id) {
          const newQty = item.quantity + delta
          return newQty > 0 ? { ...item, quantity: newQty } : null
        }
        return item
      }).filter(Boolean)
    })
  }

  const clearCart = () => setCart([])

  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col">
        {/* Navbar */}
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2 text-orange-600 font-extrabold text-2xl">
              <Utensils className="h-7 w-7" />
              <span>FlavorFlow</span>
            </Link>
            
            <nav className="flex items-center space-x-6 font-medium">
              <Link to="/restaurants" className="flex items-center space-x-1 hover:text-orange-600 transition">
                <Compass className="h-5 w-5" />
                <span>Explore</span>
              </Link>
              
              {/* 2. Add Orders link to the navbar */}
              <Link to="/orders" className="flex items-center space-x-1 hover:text-orange-600 transition">
                <Package className="h-5 w-5" />
                <span>Orders</span>
              </Link>

              <Link to="/cart" className="flex items-center space-x-1 hover:text-orange-600 transition relative">
                <ShoppingBag className="h-5 w-5" />
                <span>Cart</span>
                {totalItemsCount > 0 && (
                  <span className="absolute -top-2 -right-3 bg-orange-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {totalItemsCount}
                  </span>
                )}
              </Link>

              {session ? (
                <button 
                  onClick={handleLogout}
                  className="flex items-center space-x-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-200 transition"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              ) : (
                <Link to="/login" className="flex items-center space-x-1 bg-orange-600 text-white px-4 py-2 rounded-full hover:bg-orange-700 transition">
                  <User className="h-4 w-4" />
                  <span>Sign In</span>
                </Link>
              )}
            </nav>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/restaurants" element={<Restaurants addToCart={addToCart} />} />
            <Route path="/cart" element={<Cart cart={cart} updateQuantity={updateQuantity} clearCart={clearCart} session={session} />} />
            
            {/* 3. Add Orders Route */}
            <Route path="/orders" element={<Orders session={session} />} />
            
            <Route path="/login" element={<Auth />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-6 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} FlavorFlow. Built with React, Tailwind CSS & Supabase.
        </footer>
      </div>
    </Router>
  )
}