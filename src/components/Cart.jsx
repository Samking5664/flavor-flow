import React, { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { ShoppingBag, Plus, Minus, CheckCircle2 } from "lucide-react";

export default function Cart({
  cart = [],
  updateQuantity,
  clearCart,
  session,
}) {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const safeCart = Array.isArray(cart) ? cart : [];

  // Fixed subtotal calculation with correct multiplication (*)
  const subtotal = safeCart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const deliveryFee = safeCart.length > 0 ? 40 : 0;
  const totalAmount = subtotal + deliveryFee;

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!session) {
      alert("Please sign in to place your order!");
      return;
    }
    if (!address.trim()) {
      alert("Please enter a delivery address.");
      return;
    }

    setLoading(true);
    try {
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          customer_id: session.user.id,
          restaurant_id: safeCart[0].restaurantId,
          total_amount: totalAmount,
          delivery_address: address,
          status: "pending",
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItemsData = safeCart.map((item) => ({
        order_id: orderData.id,
        menu_item_id: item.id,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItemsData);

      if (itemsError) throw itemsError;

      setOrderPlaced(true);
      clearCart();
    } catch (error) {
      console.error("Checkout error:", error.message);
      alert("Failed to place order: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
            Order Placed Successfully!
          </h2>
          <p className="text-gray-500 mb-6 text-sm">
            Your kitchen is reviewing your order.
          </p>
          <Link
            to="/restaurants"
            className="bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-orange-700 transition inline-block"
          >
            Order More Food
          </Link>
        </div>
      </div>
    );
  }

  if (safeCart.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-500 mb-6 text-sm">
            Explore partner restaurants and add your favorite dishes.
          </p>
          <Link
            to="/restaurants"
            className="bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-orange-700 transition inline-block"
          >
            Explore Restaurants
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">
        Review Your Cart
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {safeCart.map((item) => (
            <div
              key={item.id}
              className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-xl"
                />
                <div>
                  <h3 className="font-bold text-gray-800">{item.name}</h3>
                  <p className="text-sm font-semibold text-orange-600">
                    ₹{item.price}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => updateQuantity(item.id, -1)}
                  className="p-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                  <Minus className="h-4 w-4 text-gray-600" />
                </button>
                <span className="font-bold text-gray-800 w-6 text-center">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.id, 1)}
                  className="p-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                  <Plus className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-fit">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Order Summary
          </h2>

          <div className="space-y-2 text-sm text-gray-600 mb-6 pb-6 border-b border-gray-100">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span>₹{deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 text-base pt-2">
              <span>Total</span>
              <span>₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <form onSubmit={handleCheckout} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Delivery Address
              </label>
              <textarea
                rows="3"
                placeholder="Enter your complete delivery address..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                required
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 text-white font-bold py-3 rounded-xl hover:bg-orange-700 transition shadow-lg disabled:opacity-50"
            >
              {loading ? "Placing Order..." : "Place Order"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
