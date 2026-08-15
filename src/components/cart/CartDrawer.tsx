import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useCart } from '../../context/CartContext';
import { Button } from '../ui/Button';
import { Drawer } from '../ui/Drawer';
import { Plus, Minus, X, Trash2, ShoppingBag } from 'lucide-react';

interface CartItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export const CartDrawer: React.FC = () => {
  const { isCartOpen, closeCart } = useCart();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: cartItems = [] } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const response = await api.get('/cart');
      return response.data as CartItem[];
    }
  });

  const removeFromCart = useMutation({
    mutationFn: async (itemId: number) => {
      await api.delete(`/cart/${itemId}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] })
  });

  const updateQty = useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
      if (quantity <= 0) {
        await api.delete(`/cart/${id}`);
      } else {
        await api.put(`/cart/${id}`, { quantity });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });

  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <Drawer isOpen={isCartOpen} onClose={closeCart}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--color-bg)' }}>
        <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--border-general)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', margin: 0 }}>Your Cart</h2>
          <button onClick={closeCart} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 'var(--space-2)' }} aria-label="Close cart">
            <X size={24} color="var(--text-primary)" strokeWidth={1.5} />
          </button>
        </div>
        
        <div style={{ flexGrow: 1, padding: 'var(--space-4)', overflowY: 'auto' }}>
          {cartItems.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
              <ShoppingBag size={64} strokeWidth={1} style={{ marginBottom: 'var(--space-4)', opacity: 0.5 }} />
              <p className="text-body-lg" style={{ marginBottom: 'var(--space-6)' }}>Your cart is empty.</p>
              <Button size="lg" onClick={() => { closeCart(); navigate('/shop'); }}>
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {cartItems.map((item) => (
                <div key={item.id} style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                  <img src={item.imageUrl} alt={item.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                  <div style={{ flexGrow: 1 }}>
                    <p className="text-body" style={{ fontWeight: 600 }}>{item.name}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', border: '1px solid var(--color-bg-inset)', borderRadius: '4px', width: 'fit-content' }}>
                      <button 
                        onClick={() => updateQty.mutate({ id: item.id, quantity: item.quantity - 1 })}
                        disabled={updateQty.isPending}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', display: 'flex' }}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-body-sm" style={{ minWidth: '16px', textAlign: 'center' }}>{item.quantity}</span>
                      <button 
                        onClick={() => updateQty.mutate({ id: item.id, quantity: item.quantity + 1 })}
                        disabled={updateQty.isPending}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', display: 'flex' }}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--space-2)' }}>
                    <p className="text-body" style={{ fontWeight: 600 }}>₹{item.price * item.quantity}</p>
                    <button 
                      onClick={() => removeFromCart.mutate(item.id)}
                      disabled={removeFromCart.isPending}
                      style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
                      aria-label="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {cartItems.length > 0 && (
          <div style={{ padding: 'var(--space-4)', borderTop: '1px solid var(--border-general)', paddingBottom: 'calc(var(--space-4) + var(--safe-bottom, 0px))' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
              <span style={{ fontSize: '18px', fontWeight: 500 }}>Subtotal</span>
              <span style={{ fontSize: '18px', fontWeight: 600 }}>₹{cartTotal.toLocaleString('en-IN')}</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 'var(--space-4)' }}>
              Shipping and taxes calculated at checkout.
            </p>
            <Button size="lg" style={{ width: '100%' }} onClick={() => { closeCart(); navigate('/checkout'); }}>
              Proceed to Checkout
            </Button>
          </div>
        )}
      </div>
    </Drawer>
  );
};
