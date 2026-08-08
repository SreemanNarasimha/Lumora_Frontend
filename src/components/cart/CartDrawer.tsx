import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useCart } from '../../context/CartContext';
import { Button } from '../ui/Button';

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

  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <>
      <div 
        style={{ 
          position: 'fixed', 
          top: 0, 
          right: 0, 
          width: '100%', 
          maxWidth: '400px', 
          height: '100vh', 
          backgroundColor: 'var(--color-bg)', 
          boxShadow: '-4px 0 24px rgba(0,0,0,0.1)',
          transform: isCartOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease-in-out',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--color-bg-inset)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="text-h2">Your Cart</h2>
          <Button variant="ghost" onClick={closeCart}>Close</Button>
        </div>
        <div style={{ flexGrow: 1, padding: 'var(--space-4)', overflowY: 'auto' }}>
          {cartItems.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-ink-secondary)' }}>
              <p className="text-body-lg">Your cart is empty.</p>
              <Button variant="secondary" style={{ marginTop: 'var(--space-4)' }} onClick={() => { closeCart(); navigate('/dashboard'); }}>
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
                    <p className="text-body-sm" style={{ color: 'var(--color-ink-secondary)' }}>Qty: {item.quantity}</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--space-2)' }}>
                    <p className="text-body" style={{ fontWeight: 600 }}>₹{item.price * item.quantity}</p>
                    <button 
                      onClick={() => removeFromCart.mutate(item.id)}
                      disabled={removeFromCart.isPending}
                      style={{ background: 'none', border: 'none', color: 'var(--color-terracotta)', cursor: 'pointer', fontSize: '0.875rem' }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {cartItems.length > 0 && (
          <div style={{ padding: 'var(--space-4)', borderTop: '1px solid var(--color-bg-inset)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
              <span className="text-h3">Total</span>
              <span className="text-h3">₹{cartTotal}</span>
            </div>
            <Button variant="primary" style={{ width: '100%' }} onClick={() => { closeCart(); navigate('/checkout'); }}>
              Proceed to Checkout
            </Button>
          </div>
        )}
      </div>
      
      {/* Drawer Overlay */}
      {isCartOpen && (
        <div 
          onClick={closeCart}
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', backgroundColor: 'rgba(27, 26, 23, 0.4)', zIndex: 999 }} 
        />
      )}
    </>
  );
};
