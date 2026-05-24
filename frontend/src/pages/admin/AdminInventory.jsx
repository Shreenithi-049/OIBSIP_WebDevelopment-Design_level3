import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { initSocket } from '../../services/socket';

const CATEGORIES = ['base', 'sauce', 'cheese', 'veggie', 'meat'];
const categoryIcons = { base: '🫓', sauce: '🍅', cheese: '🧀', veggie: '🥦', meat: '🍖' };

const defaultForm = { category: 'base', name: '', quantity: 100, unit: 'units', threshold: 20, pricePerUnit: 0 };

const AdminInventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(defaultForm);

  // Patch a list of updated items into state without full refetch
  const patchItems = (updatedItems) => {
    setItems((prev) =>
      prev.map((existing) => {
        const updated = updatedItems.find((u) => u._id === existing._id);
        return updated || existing;
      })
    );
  };

  const fetchItems = async () => {
    const params = activeCategory !== 'all' ? { category: activeCategory } : {};
    const res = await api.get('/inventory', { params });
    setItems(res.data.items);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, [activeCategory]);

  // Socket: live inventory updates
  useEffect(() => {
    const socket = initSocket();
    socket.emit('join-admin-room');

    socket.on('inventory-updated', ({ items: updatedItems }) => {
      patchItems(updatedItems);
    });

    socket.on('low-stock-alert', ({ item }) => {
      // Patch the item and show a toast
      patchItems([item]);
      toast.error(`⚠️ Low stock: ${item.name} — only ${item.quantity} ${item.unit} left`, {
        duration: 5000,
        id: `low-stock-${item._id}`, // deduplicate toasts for same item
      });
    });

    return () => {
      socket.off('inventory-updated');
      socket.off('low-stock-alert');
    };
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await api.put(`/inventory/${editItem._id}`, form);
        toast.success('Item updated!');
      } else {
        await api.post('/inventory', form);
        toast.success('Item added!');
      }
      setShowForm(false);
      setEditItem(null);
      setForm(defaultForm);
      fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving item');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this item?')) return;
    await api.delete(`/inventory/${id}`);
    toast.success('Item deleted');
    fetchItems();
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({ category: item.category, name: item.name, quantity: item.quantity, unit: item.unit, threshold: item.threshold, pricePerUnit: item.pricePerUnit });
    setShowForm(true);
  };

  const isLowStock = (item) => item.quantity <= item.threshold;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-app-text">🏪 Inventory Management</h1>
          <button onClick={() => { setShowForm(true); setEditItem(null); setForm(defaultForm); }} className="btn-primary">
            + Add Item
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex gap-3 mb-6 flex-wrap">
          {['all', ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all capitalize ${
                activeCategory === cat ? 'bg-primary text-white' : 'bg-white text-app-text border border-gray-200 hover:border-primary'
              }`}
            >
              {cat !== 'all' && categoryIcons[cat]} {cat === 'all' ? '📋 All' : cat}
            </button>
          ))}
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="text-center py-20"><div className="text-6xl animate-bounce">🍕</div></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <motion.div key={item._id} whileHover={{ y: -2 }} className={`card p-5 ${isLowStock(item) ? 'border-2 border-secondary' : ''}`}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{categoryIcons[item.category]}</span>
                    <div>
                      <p className="font-bold text-app-text">{item.name}</p>
                      <p className="text-gray-500 text-xs capitalize">{item.category}</p>
                    </div>
                  </div>
                  {isLowStock(item) && (
                    <span className="bg-secondary/10 text-secondary text-xs font-bold px-2 py-0.5 rounded-full">⚠️ Low</span>
                  )}
                </div>

                <div className="space-y-1 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Quantity</span>
                    <span className={`font-bold ${isLowStock(item) ? 'text-secondary' : 'text-app-text'}`}>
                      {item.quantity} {item.unit}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Threshold</span>
                    <span className="font-semibold text-app-text">{item.threshold} {item.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Price/Unit</span>
                    <span className="font-semibold text-primary">₹{item.pricePerUnit}</span>
                  </div>
                </div>

                {/* Stock bar */}
                <div className="bg-gray-200 rounded-full h-2 mb-4">
                  <div
                    className={`h-2 rounded-full transition-all ${isLowStock(item) ? 'bg-secondary' : 'bg-primary'}`}
                    style={{ width: `${Math.min((item.quantity / 150) * 100, 100)}%` }}
                  />
                </div>

                <div className="flex gap-2">
                  <button onClick={() => openEdit(item)} className="flex-1 text-sm py-2 bg-primary/10 text-primary rounded-lg font-semibold hover:bg-primary/20 transition-colors">
                    ✏️ Edit
                  </button>
                  <button onClick={() => handleDelete(item._id)} className="flex-1 text-sm py-2 bg-secondary/10 text-secondary rounded-lg font-semibold hover:bg-secondary/20 transition-colors">
                    🗑️ Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
              onClick={(e) => e.target === e.currentTarget && setShowForm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-6 w-full max-w-md"
              >
                <h3 className="text-xl font-bold text-app-text mb-6">{editItem ? 'Edit Item' : 'Add Inventory Item'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-app-text mb-1">Category</label>
                    <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field">
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-app-text mb-1">Name</label>
                    <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-app-text mb-1">Quantity</label>
                      <input type="number" required value={form.quantity} onChange={(e) => setForm({ ...form, quantity: +e.target.value })} className="input-field" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-app-text mb-1">Unit</label>
                      <input type="text" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="input-field" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-app-text mb-1">Threshold</label>
                      <input type="number" value={form.threshold} onChange={(e) => setForm({ ...form, threshold: +e.target.value })} className="input-field" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-app-text mb-1">Price/Unit (₹)</label>
                      <input type="number" value={form.pricePerUnit} onChange={(e) => setForm({ ...form, pricePerUnit: +e.target.value })} className="input-field" />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setShowForm(false)} className="btn-accent flex-1">Cancel</button>
                    <button type="submit" className="btn-primary flex-1">{editItem ? 'Update' : 'Add Item'}</button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminInventory;
