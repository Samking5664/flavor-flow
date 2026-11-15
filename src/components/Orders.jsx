import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { Clock, Package, MapPin, CheckCircle, ChefHat, Truck } from 'lucide-react'

export default function Orders({ session }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session) {
      fetchOrders()
    }
  }, [session])

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          restaurants (name, image_url),
          order_items (
            quantity,
            price,
            menu_items (name)
          )
        `)
        .eq('customer_id', session.user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error('Error fetching orders:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold flex items-center w-fit"><Clock className="h-3.5 w-3.5 mr-1" /> Pending</span>
      case 'confirmed':
      case 'preparing':
        return <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold flex items-center w-fit"><ChefHat className="h-3.5 w-3.5 mr-1" /> Preparing</span>
      case 'out_for_delivery':
        return <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-bold flex items-center w-fit"><Truck className="h-3.5 w-3.5 mr-1" /> Out for Delivery</span>
      case 'delivered':
        return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold flex items-center w-fit"><CheckCircle className="h-3.5 w-3.5 mr-1" /> Delivered</span>
      default:
        return <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-bold">{status}</span>
    }
  }

  if (!session) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in required</h2>
          <p className="text-gray-500 mb-6 text-sm">Please sign in to view your live orders and order history.</p>
          <Link to="/login" className="bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-orange-700 transition inline-block">
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return <div className="text-center py-20 text-gray-500">Loading your orders...</div>
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Your Orders</h1>

      {orders.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-100 text-center">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">No orders placed yet</h2>
          <p className="text-gray-500 mb-6 text-sm">Explore our restaurants and place your first delicious order!</p>
          <Link to="/restaurants" className="bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-orange-700 transition inline-block">
            Browse Restaurants
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-gray-100 gap-4">
                <div>
                  <h3 className="font-extrabold text-lg text-gray-900">{order.restaurants?.name || 'Restaurant'}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Order ID: {order.id}</p>
                </div>
                <div className="flex items-center space-x-4">
                  {getStatusBadge(order.status)}
                  <span className="font-extrabold text-orange-600 text-lg">₹{order.total_amount}</span>
                </div>
              </div>

              {/* Order Items */}
              <div className="py-4 space-y-2">
                <h4 className="text-xs font-bold text-gray-500 uppercase">Items Ordered</h4>
                <ul className="space-y-1">
                  {order.order_items?.map((item, idx) => (
                    <li key={idx} className="flex justify-between text-sm text-gray-700">
                      <span>{item.quantity}x {item.menu_items?.name || 'Item'}</span>
                      <span className="font-medium">₹{item.price * item.quantity}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Delivery Address */}
              <div className="pt-3 border-t border-gray-100 flex items-start text-xs text-gray-500">
                <MapPin className="h-4 w-4 mr-1 text-gray-400 flex-shrink-0 mt-0.5" />
                <span><strong>Delivery Address:</strong> {order.delivery_address}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}