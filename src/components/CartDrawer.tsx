import React from 'react';
import { ShoppingCart, X, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  total: number;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  total,
  onProceedToCheckout,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-[#0b1d3a] shadow-2xl flex flex-col animate-slideInRight text-slate-800 dark:text-slate-100">
          
          {/* Header */}
          <div className="bg-[#031733] px-6 py-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-2 font-bold text-lg">
              <ShoppingCart className="w-5 h-5 text-white" />
              <span>Tu carrito</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Cerrar carrito"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 dark:text-slate-400">
                <ShoppingCart className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4 stroke-1" />
                <h4 className="text-base font-bold text-slate-700 dark:text-slate-200">Tu carrito está vacío</h4>
                <p className="text-sm mt-1 mb-6 text-slate-500 dark:text-slate-400 max-w-xs">
                  Explora nuestro catálogo certificado de dispositivos Aegis para proteger tu hogar.
                </p>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 bg-[#009fe3] hover:bg-[#0088c4] text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Ver dispositivos
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.product.id}
                  className="border-b border-slate-100 dark:border-slate-800 pb-4 flex items-center justify-between gap-4"
                >
                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-[#031733] dark:text-white truncate">
                      {item.product.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {item.product.price.toFixed(2).replace('.', ',')} € × {item.quantity}
                    </p>
                  </div>

                  {/* Quantity Controls & Delete */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.product.id, -1)}
                      className="w-7 h-7 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                      aria-label="Reducir cantidad"
                    >
                      <Minus className="w-3 h-3" />
                    </button>

                    <span className="w-6 text-center text-xs font-bold text-[#031733] dark:text-white">
                      {item.quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.product.id, 1)}
                      className="w-7 h-7 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                      aria-label="Aumentar cantidad"
                    >
                      <Plus className="w-3 h-3" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.product.id)}
                      className="ml-1 p-1 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                      title="Eliminar producto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary & Checkout Action */}
          {items.length > 0 && (
            <div className="border-t border-slate-200 dark:border-slate-800 p-6 bg-slate-50/70 dark:bg-[#071830] space-y-4">
              <div className="flex items-center justify-between text-base">
                <span className="font-extrabold text-[#031733] dark:text-white text-lg">Total</span>
                <span className="font-extrabold text-[#031733] dark:text-white text-xl">
                  {total.toFixed(2).replace('.', ',')} €
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onProceedToCheckout();
                }}
                className="w-full py-4 px-6 rounded-xl font-bold text-base text-white bg-[#009fe3] hover:bg-[#0088c4] active:scale-98 transition-all duration-200 cursor-pointer shadow-lg shadow-[#009fe3]/25 flex items-center justify-center gap-2"
              >
                <span>Solicitar pedido / Pagar</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center">
                <span className="text-[11px] text-slate-400 font-medium">
                  🔒 Pago 100% seguro con garantía certificada AEGIS
                </span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
