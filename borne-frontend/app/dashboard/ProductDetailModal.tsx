'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Product, Category } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

interface ProductDetailModalProps {
    isOpen: boolean;
    product: Product | null;
    onClose: () => void;
    onAddToCart: (product: Product, selectedOptions?: string) => void;
}

export default function ProductDetailModal({
    isOpen,
    product,
    onClose,
    onAddToCart
}: ProductDetailModalProps) {
    const { t, lang } = useLanguage();
    // Structured state: { "SAUCES": ["Ketchup"], "BOISSONS": ["Coca"] }
    const [selections, setSelections] = useState<Record<string, string[]>>({});
    const [quantity, setQuantity] = useState(1);
    const [optionCategories, setOptionCategories] = useState<Category[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(false);
    const API_URL = "http://localhost:3000";

    const FALLBACK_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f1f5f9'/%3E%3Ctext x='50' y='55' font-size='30' text-anchor='middle' fill='%23cbd5e1'%3E%F0%9F%93%B7%3C/text%3E%3C/svg%3E";

    const getImageUrl = (imagePath: string | undefined) => {
        if (!imagePath) return FALLBACK_IMG;
        if (imagePath.startsWith('http')) return imagePath;
        return `${API_URL}/uploads/${imagePath}`;
    };

    const hasPages = product?.pages && product.pages.trim() !== '';

    // Logic to determine selection limit per category
    const getLimitForCategory = (categoryName: string) => {
        const name = categoryName.toLowerCase();
        if (name.includes('sauce')) return 2;
        return 1; // Default: 1 choice for Drinks, Fries, Sides, etc.
    };

    useEffect(() => {
        if (isOpen && product && hasPages) {
            setLoadingOptions(true);
            // ✅ Nettoyer et dédupliquer les noms de pages avant l'envoi
            const cleanPages = product.pages!
                .split(',')
                .map(n => n.trim())
                .filter((v, i, a) => v && a.indexOf(v) === i)
                .join(',');

            fetch(`${API_URL}/categories/pages/by-names?names=${encodeURIComponent(cleanPages)}&lang=${lang}`)
                .then(res => res.json())
                .then((data: Category[]) => {
                    // ✅ Déduplication par ID ET par NOM (FAMILLE) pour éviter tout doublon visuel
                    const uniqueCategories = data.filter((cat, index, self) =>
                        index === self.findIndex((c) => c.id === cat.id || c.FAMILLE === cat.FAMILLE)
                    );
                    setOptionCategories(uniqueCategories);
                    setSelections({});
                })
                .catch(err => console.error("Failed to load options", err))
                .finally(() => setLoadingOptions(false));
        } else {
            setOptionCategories([]);
            setSelections({});
        }
    }, [isOpen, product, lang, hasPages]);

    if (!isOpen || !product) return null;

    const handleValidate = () => {
        // ✅ Créer une chaîne structurée : "BOISSONS: Coca | FRITES: Potatoes | SAUCES: Mayo, Ketchup"
        const parts = Object.entries(selections)
            .filter(([_, items]) => items.length > 0)
            .map(([category, items]) => `${category.toUpperCase()}: ${items.join(', ')}`);
        
        const optionsString = parts.length > 0 ? parts.join(' | ') : undefined;

        for (let i = 0; i < quantity; i++) {
            onAddToCart(product, optionsString);
        }
        setQuantity(1);
        setSelections({});
        onClose();
    };

    const handleCancel = () => {
        setQuantity(1);
        setSelections({});
        onClose();
    };

    const toggleOption = (categoryName: string, productName: string) => {
        const limit = getLimitForCategory(categoryName);
        const currentSelected = selections[categoryName] || [];

        if (currentSelected.includes(productName)) {
            // Remove if already selected
            setSelections({
                ...selections,
                [categoryName]: currentSelected.filter(s => s !== productName)
            });
        } else {
            if (limit === 1) {
                // If limit is 1, replace current selection
                setSelections({
                    ...selections,
                    [categoryName]: [productName]
                });
            } else if (currentSelected.length < limit) {
                // If under limit, add to selection
                setSelections({
                    ...selections,
                    [categoryName]: [...currentSelected, productName]
                });
            }
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={handleCancel}
        >
            <div
                className="bg-white rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* LEFT SIDE - Image */}
                <div className="relative md:w-1/2 h-80 md:h-auto bg-gradient-to-br from-amber-50 to-orange-50">
                    <div className="relative w-full h-full">
                        <Image
                            src={getImageUrl(product.image)}
                            alt={product.name}
                            fill
                            className="object-contain p-6"
                            priority
                        />
                    </div>
                    <button
                        onClick={handleCancel}
                        className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 text-stone-600 hover:text-red-500 transition-all shadow-lg z-10 md:hidden"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* RIGHT SIDE - Informations */}
                <div className="md:w-1/2 flex flex-col overflow-y-auto p-6">
                    <button
                        onClick={handleCancel}
                        className="hidden md:block absolute top-4 right-4 bg-white/90 rounded-full p-2 text-stone-600 hover:text-red-500 transition-all shadow-lg"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Title & Category */}
                    <div className="mb-4 pr-8">
                        <h2 className="text-3xl font-extrabold text-stone-800">{product.name}</h2>
                        {product.category && (
                            <p className="text-stone-400 text-sm mt-1 font-medium">{product.category.name}</p>
                        )}
                    </div>

                    {/* Price */}
                    <div className="mb-6">
                        <p className="text-4xl font-black text-[#E2725B]">{product.price} <span className="text-xl">DH</span></p>
                    </div>

                    {/* Description */}
                    {product.description && (
                        <div className="mb-6">
                            <h3 className="font-bold text-stone-700 mb-2 text-sm uppercase tracking-wide text-stone-400">
                                {t('Description', 'Description', 'وصف')}
                            </h3>
                            <p className="text-stone-600 leading-relaxed text-sm">{product.description}</p>
                        </div>
                    )}

                    {/* Options Sections (Multiple Pages) */}
                    {hasPages && (
                        <div className="space-y-8 mb-6">
                            {loadingOptions ? (
                                <p className="text-sm text-stone-500 italic">{t('Chargement des options...', 'Loading options...', 'جاري تحميل الخيارات...')}</p>
                            ) : optionCategories.length > 0 ? (
                                optionCategories.map((category) => {
                                    const limit = getLimitForCategory(category.name);
                                    const selectedCount = (selections[category.name] || []).length;
                                    
                                    return (
                                        <div key={category.id} className="animate-in fade-in slide-in-from-left-4 duration-300">
                                            <div className="flex justify-between items-end mb-3 border-b border-stone-100 pb-2">
                                                <h3 className="font-black text-stone-800 text-sm uppercase tracking-wider">
                                                    {category.name}
                                                </h3>
                                                <span className="text-[10px] font-bold text-[#006747] bg-[#006747]/5 px-2 py-0.5 rounded-full">
                                                    {limit === 1 
                                                        ? t('Choix unique', 'Unique choice', 'خيار واحد')
                                                        : `${selectedCount}/${limit} ${t('max', 'max', 'الأقصى')}`
                                                    }
                                                </span>
                                            </div>
                                            
                                            <div className="flex flex-wrap gap-2">
                                                {category.products?.map((optProduct) => {
                                                    const isSelected = (selections[category.name] || []).includes(optProduct.name);
                                                    // ✅ On ne bloque le bouton que si la limite est > 1 et atteinte.
                                                    // Pour les choix uniques (limit 1), on laisse cliquer pour remplacer.
                                                    const isFull = limit > 1 && !isSelected && (selections[category.name] || []).length >= limit;
                                                    
                                                    return (
                                                        <button
                                                            key={optProduct.id}
                                                            onClick={() => toggleOption(category.name, optProduct.name)}
                                                            disabled={isFull}
                                                            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border-2 ${isSelected
                                                                    ? 'border-[#006747] bg-[#006747] text-white shadow-md transform scale-105'
                                                                    : isFull
                                                                        ? 'border-stone-100 bg-stone-50 text-stone-300 cursor-not-allowed'
                                                                        : 'border-stone-100 bg-stone-50 text-stone-600 hover:border-[#006747] hover:bg-white hover:text-[#006747] hover:shadow-sm'
                                                                }`}
                                                        >
                                                            {optProduct.name} {optProduct.price > 0 ? `(+${optProduct.price} DH)` : ''}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-sm text-stone-500">{t('Aucune option disponible', 'No options available', 'لا توجد خيارات متاحة')}</p>
                            )}
                        </div>
                    )}

                    {/* Quantity Section - Only show for simple products without options (McDo logic) */}
                    {!hasPages && (
                        <div className="mb-6 pt-4 border-t border-stone-50">
                            <h3 className="font-bold text-stone-700 mb-3 text-sm uppercase tracking-wide text-stone-400">
                                {t('Quantité', 'Quantity', 'الكمية')}
                            </h3>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center bg-stone-100 rounded-2xl p-1">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-10 h-10 rounded-xl bg-white text-stone-700 text-xl font-bold hover:bg-stone-50 transition-all active:scale-95 shadow-sm"
                                    >
                                        -
                                    </button>
                                    <span className="text-xl font-black w-14 text-center text-stone-800">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-10 h-10 rounded-xl bg-white text-stone-700 text-xl font-bold hover:bg-stone-50 transition-all active:scale-95 shadow-sm"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-4 mt-auto pt-6">
                        <button
                            onClick={handleCancel}
                            className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold py-4 rounded-2xl text-sm transition-all active:scale-95"
                        >
                            {t('Annuler', 'Cancel', 'إلغاء')}
                        </button>
                        <button
                            onClick={handleValidate}
                            className="flex-[2] bg-[#006747] hover:bg-[#004d35] text-white font-bold py-4 rounded-2xl text-sm transition-all active:scale-95 shadow-xl shadow-[#006747]/20 flex items-center justify-center gap-2"
                        >
                            <span className="text-lg">🛒</span> {t('Ajouter au panier', 'Add to cart', 'أضf إلى السلة')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}