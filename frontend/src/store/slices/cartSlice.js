import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/cart');
    return res.data.cart;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const addToCart = createAsyncThunk('cart/add', async (item, { rejectWithValue }) => {
  try {
    const res = await api.post('/cart/add', item);
    return res.data.cart;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const updateCartItem = createAsyncThunk('cart/update', async ({ itemId, quantity }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/cart/update/${itemId}`, { quantity });
    return res.data.cart;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const removeFromCart = createAsyncThunk('cart/remove', async (itemId, { rejectWithValue }) => {
  try {
    const res = await api.delete(`/cart/remove/${itemId}`);
    return res.data.cart;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const clearCart = createAsyncThunk('cart/clear', async (_, { rejectWithValue }) => {
  try {
    await api.delete('/cart/clear');
    return { items: [], totalPrice: 0 };
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [], totalPrice: 0, loading: false },
  reducers: {},
  extraReducers: (builder) => {
    const setCart = (state, action) => {
      state.loading = false;
      if (action.payload) {
        state.items = action.payload.items || [];
        state.totalPrice = action.payload.totalPrice || 0;
      }
    };
    builder
      .addCase(fetchCart.pending, (state) => { state.loading = true; })
      .addCase(fetchCart.fulfilled, setCart)
      .addCase(addToCart.fulfilled, (state, action) => {
        setCart(state, action);
        toast.success('Added to cart! 🍕');
      })
      .addCase(updateCartItem.fulfilled, setCart)
      .addCase(removeFromCart.fulfilled, (state, action) => {
        setCart(state, action);
        toast.success('Item removed');
      })
      .addCase(clearCart.fulfilled, setCart);
  },
});

export default cartSlice.reducer;
