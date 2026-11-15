import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { Utensils, MapPin, Search, Plus } from 'lucide-react'

export default function Restaurants({ addToCart }) {
  const [restaurants, setRestaurants] = useState([])
  const [selectedRestaurant, setSelectedRestaurant] = useState(null)
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchRestaurants()
  }, [])

  const fetchRestaurants = async () => {
    try {
      const { data, error } = await supabase.from('restaurants').select('*')
      if (error) throw error
      setRestaurants(data || [])
    } catch (error) {
      console.error('Error fetching restaurants:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchMenu = async (restaurant) => {
    setSelectedRestaurant(restaurant)
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', restaurant.id)
      if (error) throw error
      setMenuItems(data || [])
    } catch (error) {
      console.error('Error fetching menu items:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredRestaurants = restaurants.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.cuisine_type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading && restaurants.length === 0) {
    return <div className="text-center py-20 text-gray-500">Loading FlavorFlow restaurants...</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {selectedRestaurant ? (
        <div>
          {/* Back Button */}
          <button 
            onClick={() => { setSelectedRestaurant(null); setMenuItems([]); }}
            className="mb-6 text-orange-600 font-semibold hover:underline flex items-center space-x-1"
          >
            ← Back to all restaurants
          </button>

          {/* Restaurant Header */}
          <div className="bg-white rounded-3xl shadow-md overflow-hidden mb-8 border border-gray-100">
            <div className="h-64 w-full relative">
              <img 
                src={selectedRestaurant.image_url || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800'} 
                alt={selectedRestaurant.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-6">
                <div className="text-white">
                  <h1 className="text-3xl font-extrabold">{selectedRestaurant.name}</h1>
                  <p className="text-sm opacity-90">{selectedRestaurant.cuisine_type}</p>
                  <p className="text-xs opacity-80 flex items-center mt-1">
                    <MapPin className="h-3.5 w-3.5 mr-1" /> {selectedRestaurant.address}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items Grid */}
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Menu</h2>
          {menuItems.length === 0 ? (
            <p className="text-gray-500">No menu items available for this restaurant yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {menuItems.map((item) => (
                <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between space-x-4">
                  <div className="flex-grow">
                    <h3 className="font-bold text-lg text-gray-800">{item.name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 my-1">{item.description}</p>
                    <span className="font-extrabold text-orange-600">₹{item.price}</span>
                  </div>
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <img 
                      src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'} 
                      alt={item.name}
                      className="w-full h-full object-cover rounded-xl"
                    />
                    <button 
                      onClick={() => addToCart(item, selectedRestaurant.id)}
                      className="absolute -bottom-2 -right-2 bg-orange-600 text-white p-2 rounded-full shadow-lg hover:bg-orange-700 transition"
                      title="Add to Cart"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          {/* Header & Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">Explore Restaurants</h1>
              <p className="text-gray-500 text-sm mt-1">Discover top-rated kitchens delivering near you</p>
            </div>
            
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search cuisine or restaurant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none shadow-sm"
              />
            </div>
          </div>

          {/* Restaurant Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant) => (
              <div 
                key={restaurant.id}
                onClick={() => fetchMenu(restaurant)}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition group"
              >
                <div className="h-48 w-full overflow-hidden">
                  <img 
                    src={restaurant.image_url || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600'} 
                    alt={restaurant.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-xl text-gray-900 group-hover:text-orange-600 transition">{restaurant.name}</h3>
                  <p className="text-sm text-orange-600 font-medium mt-0.5">{restaurant.cuisine_type}</p>
                  <p className="text-xs text-gray-400 flex items-center mt-3">
                    <MapPin className="h-3.5 w-3.5 mr-1" /> {restaurant.address}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}