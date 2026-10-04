'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getCategories, getProducts, createOrder } from '@/services/api';
import { Product, Category } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import ProductDetailModal from './ProductDetailModal';

export default function DashboardPage() {
    const { lang, setLanguage, t } = useLanguage();
    const [isLoading, setIsLoading] = useState(true);
    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | number>('all');
    const [cart, setCart] = useState<{ cartId: string; product: Product; quantity: number; sauce?: string }[]>([]);
    const [productModal, setProductModal] = useState<{ isOpen: boolean; product: Product | null }>({ isOpen: false, product: null });
    const [isCartOpen, setIsCartOpen] = useState(false);
    const router = useRouter();
    const API_URL = "http://localhost:3000";

    const FALLBACK_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f1f5f9'/%3E%3Ctext x='50' y='55' font-size='30' text-anchor='middle' fill='%23cbd5e1'%3E%F0%9F%93%B7%3C/text%3E%3C/svg%3E";

    // Toutes les images sont dans uploads/ sur le backend
    const getImageUrl = (imagePath: string | undefined) => {
        if (!imagePath) return FALLBACK_IMG;
        if (imagePath.startsWith('http')) return imagePath;
        return `${API_URL}/uploads/${imagePath}`;
    };

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [cats, prods] = await Promise.all([
                getCategories(lang, true),
                getProducts(lang, true),
            ]);

            setCategories(cats);
            setProducts(prods);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setIsLoading(false);
        }
    }, [lang]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filteredProducts = products.filter((p) => {
        if (selectedCategory === 'all') return true;
        return p.category?.id === selectedCategory || p.category?.name.toLowerCase() === String(selectedCategory).toLowerCase();
    });

    const handleProductClick = (product: Product) => {
        // Open product detail modal for ALL products
        setProductModal({ isOpen: true, product });
    };

    const addToCart = (product: Product, sauce?: string) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.product.id === product.id && item.sauce === sauce);
            if (existing) {
                return prev.map((item) =>
                    (item.product.id === product.id && item.sauce === sauce) ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { cartId: `${product.id}-${sauce || 'none'}-${Date.now()}`, product, quantity: 1, sauce }];
        });
    };

    const removeFromCart = (cartId: string) => {
        setCart((prev) => prev.filter((item) => item.cartId !== cartId));
    };

    const updateQuantity = (cartId: string, delta: number) => {
        setCart((prev) =>
            prev.map((item) => {
                if (item.cartId === cartId) {
                    const newQty = Math.max(1, item.quantity + delta);
                    return { ...item, quantity: newQty };
                }
                return item;
            })
        );
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        try {
            const items = cart.map(item => ({
                productId: item.product.id,
                quantity: item.quantity,
                selectedOptions: item.sauce
            }));
            await createOrder(items);
            alert(t('Commande passée avec succès !', 'Order placed successfully!', 'تم تقديم الطلب بنجاح!'));
            setCart([]);
            setIsCartOpen(false);
        } catch (error: any) {
            console.error("Error creating order:", error);
            const errorMsg = error.response?.data?.message || t('Erreur lors de la commande.', 'Order error.', 'خطأ في الطلب.');
            alert(errorMsg);
        }
    };

    const totalAmount = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-stone-900 flex items-center justify-center text-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="animate-pulse">
                        {t('Chargement des délices...', 'Loading...', 'جاري التحميل...')}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-stone-50 font-sans text-stone-900 overflow-hidden zellige-pattern">

            {/* Sidebar - Categories */}
            <aside className="w-28 md:w-36 bg-white border-r border-stone-200 flex flex-col items-center py-8 gap-6 z-20 shadow-xl">
                <div className="w-20 h-20 bg-[#006747] rounded-3xl flex items-center justify-center text-white font-bold text-3xl shadow-lg shadow-[#006747]/20 mb-4 transform rotate-3">
                    B
                </div>

                <nav className="flex-1 flex flex-col gap-6 w-full px-3 overflow-y-auto no-scrollbar">
                    <button
                        onClick={() => setSelectedCategory('all')}
                        className={`flex flex-col items-center justify-center p-4 rounded-3xl transition-all duration-500 gap-2 ${selectedCategory === 'all'
                            ? 'bg-[#006747] text-white shadow-xl shadow-[#006747]/30 scale-105'
                            : 'text-stone-400 hover:bg-stone-50 hover:text-[#006747]'
                            }`}
                    >
                        <span className="text-3xl">🍽️</span>
                        <span className="text-[10px] md:text-sm font-bold uppercase tracking-widest">
                            {t('Tous', 'All', 'الكل')}
                        </span>
                    </button>

                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`flex flex-col items-center justify-center p-4 rounded-3xl transition-all duration-500 gap-2 ${selectedCategory === cat.id
                                ? 'bg-[#006747] text-white shadow-xl shadow-[#006747]/30 scale-105'
                                : 'text-stone-400 hover:bg-stone-50 hover:text-[#006747]'
                                }`}
                        >
                        <div className="w-12 h-12 rounded-2xl overflow-hidden mb-1 flex items-center justify-center bg-stone-100 group-hover:scale-110 transition-transform">
                            {cat.image ? (
                                <img 
                                    src={getImageUrl(cat.image)} 
                                    alt={cat.name} 
                                    className="w-full h-full object-cover" 
                                    onError={(e) => {
                                        const t = e.target as HTMLImageElement;
                                        t.style.display = 'none';
                                        t.parentElement!.innerHTML = '<span style="font-size:1.5rem">📦</span>';
                                    }}
                                />
                            ) : (
                                <span className="text-3xl">📦</span>
                            )}
                        </div>
                        <span className="text-[10px] md:text-sm font-bold uppercase tracking-widest text-center leading-tight">{cat.name}</span>
                        </button>
                    ))}
                </nav>

                <div className="flex flex-col gap-4">
                    <button
                        onClick={() => router.push('/login')}
                        className="p-4 text-stone-300 hover:text-stone-500 transition-colors"
                        title="Espace Admin"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col relative overflow-hidden">
                {/* Header - Optimized for Portrait */}
                <header className="p-6 md:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold moroccan-font text-[#006747]">
                            {t('Menu Gourmet', 'Gourmet Menu', 'قائمة الطعام')}
                        </h1>
                        <p className="text-stone-500 font-medium">
                            {t('À la marocaine', 'Moroccan style', 'على الطريقة المغربية')}
                        </p>
                    </div>
 
                    {/* Sélecteur de langue */}
                    <div className="flex gap-2 flex-wrap">
                        {(['fr', 'en', 'ar'] as const).map((l) => (
                            <button
                                key={l}
                                onClick={() => setLanguage(l)}
                                className={`px-4 py-2 rounded-2xl font-bold text-sm transition-all ${lang === l
                                    ? 'bg-[#006747] text-white shadow-lg'
                                    : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                                    }`}
                            >
                                {l === 'fr' ? (
                                    <div className="flex items-center gap-2">
                                        <img src="/flags/fr.png" width="20" alt="FR" /> FR
                                    </div>
                                ) : l === 'en' ? (
                                    <div className="flex items-center gap-2">
                                        <img src="/flags/en.png" width="20" alt="EN" /> EN
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <img src="/flags/ar.png" width="20" alt="AR" /> AR
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </header>

                {/* Product Grid */}
                <section className="flex-1 overflow-y-auto px-8 md:px-10 pb-40">
                    {filteredProducts.length === 0 ? (
                        <div className="h-64 flex flex-col items-center justify-center text-stone-400 gap-4">
                            <p className="text-xl font-medium">
                                {t('Aucun produit trouvé.', 'No products found.', 'لا توجد منتجات.')}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {filteredProducts.map((p) => (
                                <div
                                    key={p.id}
                                    onClick={() => handleProductClick(p)}
                                    className="group glass-card rounded-[3rem] p-6 flex flex-col items-center text-center gap-4 transition-all duration-700 hover:shadow-2xl hover:shadow-[#006747]/10 hover:-translate-y-3 cursor-pointer relative overflow-hidden"
                                >
                                    {/* Image Section - MODIFIED: Removed border, larger image */}
                                    <div className="relative w-full aspect-square mb-2 transform transition-transform duration-700 group-hover:scale-105">
                                        <div className={`relative w-full h-full transition-all duration-700 ${p.style || ''}`}>
                                            <Image
                                                src={getImageUrl(p.image)}
                                                alt={p.name}
                                                fill
                                                className="object-cover rounded-[2rem]"
                                            />
                                        </div>
                                    </div>

                                    {/* Product Info */}
                                    <div>
                                        <h3 className="font-bold text-stone-800 text-xl mb-1">{p.name}</h3>
                                        <p className="text-[#E2725B] font-black text-2xl">{p.price} DH</p>
                                    </div>

                                    {/* Le symbole "+" a été supprimé */}
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Bottom Bar - Optimized for Portrait */}
                <footer className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 z-30">
                    <div className="bg-stone-900 rounded-[2.5rem] p-2 sm:p-3 flex items-center justify-between text-white shadow-[0_20px_50px_rgba(0,0,0,0.4)] glass-effect border border-white/10">
                        <div className="flex items-center gap-3 sm:gap-5 pl-4 sm:pl-8">
                            <div className="relative scale-90 sm:scale-100">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#006747] rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shadow-lg">
                                    🛍️
                                </div>
                                {cart.length > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-[#E2725B] text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-stone-900">
                                        {cart.reduce((a, b) => a + b.quantity, 0)}
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-stone-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                                    {t('Total à payer', 'Total to pay', 'المجموع')}
                                </span>
                                <span className="text-xl sm:text-2xl font-black text-[#F4C430]">{totalAmount} DH</span>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsCartOpen(true)}
                            className="bg-[#006747] hover:bg-[#004d35] active:scale-95 transition-all text-white font-bold px-6 sm:px-12 py-4 sm:py-6 rounded-[2rem] sm:rounded-[2.5rem] text-lg sm:text-xl shadow-xl shadow-[#006747]/20 flex items-center gap-3"
                        >
                            <span className="hidden sm:inline">{t('Voir la commande', 'View order', 'عرض الطلب')}</span>
                            <span className="sm:hidden">{t('Voir', 'View', 'عرض')}</span>
                        </button>
                    </div>
                </footer>
            </main>

            {/* Cart Drawer */}
            {isCartOpen && (
                <div
                    className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex justify-end transition-all duration-500 animate-in fade-in"
                    onClick={() => setIsCartOpen(false)}
                >
                    <div
                        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col p-8 animate-in slide-in-from-right duration-500"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-10">
                            <h2 className="text-3xl font-extrabold moroccan-font text-[#006747]">
                                {t('Votre Commande', 'Your Order', 'طلبك')}
                            </h2>
                            <button onClick={() => setIsCartOpen(false)} className="text-stone-400 hover:text-red-500 p-2">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-6">
                            {cart.length === 0 ? (
                                <div className="text-center py-20">
                                    <span className="text-6xl block mb-4">🛒</span>
                                    <p className="text-stone-400 font-medium">
                                        {t('Votre panier est vide', 'Your cart is empty', 'سلة التسوق فارغة')}
                                    </p>
                                </div>
                            ) : (
                                cart.map((item) => (
                                    <div key={item.cartId} className="flex items-center gap-4 bg-stone-50 p-4 rounded-3xl border border-stone-100">
                                        <div className="relative w-20 h-20 bg-white rounded-2xl p-2 shrink-0">
                                            <div className={`relative w-full h-full ${item.product.style || ''}`}>
                                                <Image src={getImageUrl(item.product.image)} alt={item.product.name} fill className="object-contain" />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-stone-800">{item.product.name}</h4>
                                            {item.sauce && (
                                                <div className="mt-1 space-y-0.5">
                                                    {item.sauce.split(' | ').map((part, index) => (
                                                        <p key={index} className="text-[10px] font-bold text-[#006747] uppercase tracking-tight bg-[#006747]/5 px-2 py-0.5 rounded-md inline-block mr-1">
                                                            {part}
                                                        </p>
                                                    ))}
                                                </div>
                                            )}
                                            <p className="text-[#E2725B] font-bold">{item.product.price} DH</p>
                                        </div>
                                        <div className="flex items-center gap-3 bg-white px-3 py-2 rounded-xl shadow-sm">
                                            <button onClick={() => updateQuantity(item.cartId, -1)} className="text-stone-400 hover:text-[#006747] font-bold text-xl">−</button>
                                            <span className="font-bold w-4 text-center">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.cartId, 1)} className="text-stone-400 hover:text-[#006747] font-bold text-xl">+</button>
                                        </div>
                                        <button onClick={() => removeFromCart(item.cartId)} className="text-red-300 hover:text-red-500 p-1">
                                            🗑️
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="mt-8 pt-8 border-t border-stone-100 space-y-6">
                            <div className="flex justify-between items-center text-2xl">
                                <span className="font-bold text-stone-400 uppercase tracking-widest text-sm">
                                    {t('Prix Total', 'Total Price', 'السعر الإجمالي')}
                                </span>
                                <span className="font-black text-[#006747]">{totalAmount} DH</span>
                            </div>
                            <button
                                disabled={cart.length === 0}
                                onClick={handleCheckout}
                                className="w-full bg-[#E2725B] hover:bg-[#c95f4a] disabled:bg-stone-200 text-white font-bold py-6 rounded-[2.5rem] text-xl shadow-xl shadow-[#E2725B]/20 transition-all active:scale-95"
                            >
                                {t('Payer maintenant', 'Pay now', 'ادفع الآن')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Product Detail Modal */}
            <ProductDetailModal
                isOpen={productModal.isOpen}
                product={productModal.product}
                onClose={() => setProductModal({ isOpen: false, product: null })}
                onAddToCart={addToCart}
            />

            <style jsx>{`
                .glass-effect {
                    background: rgba(28, 25, 23, 0.95);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}