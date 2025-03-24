import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from ".";
import { toast } from "react-toastify";

interface CartItem {
  product_id: string;
  quantity: number;
  // Add other properties of the cart item as needed
}

interface CartState {
  cart: CartItem[];
}

const initialState: CartState = {
  cart: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const { product_id } = action.payload;
      const existingProduct = state.cart.find(item => item.product_id === product_id);
      if (existingProduct) {
        // Product already exists in cart, show toast
        toast.info('Already exists in cart', {
          position: 'bottom-center'
        });
      } else {
        state.cart.push({ ...action.payload, quantity: 1 });
        // Product added successfully, show toast
        toast.success('Product added successfully', {
          position: 'bottom-center'
        });
      }
    },
    removeFromTheCart: (state, action: PayloadAction<string>) => {
      state.cart = state.cart.filter(item => item.product_id !== action.payload);
    },
    updateQuantity: (state, action: PayloadAction<{ productId: string; quantity: number }>) => {
      const { productId, quantity } = action.payload;
      const product = state.cart.find(item => item.product_id === productId);
      if (product) {
        product.quantity = quantity;
      }
    },
  },
});

export const { addToCart, updateQuantity, removeFromTheCart } = cartSlice.actions;
export const getCart = (state: RootState) => state.cart.cart;
export default cartSlice.reducer;
