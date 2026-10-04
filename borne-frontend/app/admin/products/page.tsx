'use client';

import { useState, useEffect, useCallback } from 'react';
import { getCategories, getProducts, createProduct, updateProduct, deleteProduct, uploadImage } from '@/services/api';
import { Category, Product } from '@/types';
import Image from 'next/image';

export default function ProductsPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // Form states
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [newProduct, setNewProduct] = useState({ 
        name_fr: '', name_en: '', name_ar: '', 
        price: 0, image: '', categoryId: '', 
        pages: '', description_fr: '', description_en: '', description_ar: '' 
    });
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            const [cats, prods] = await Promise.all([getCategories(), getProducts()]);
            setCategories(cats);
            setProducts(prods);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCreateProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUploading(true);
        try {
            let imageUrl = newProduct.image;
            if (selectedFile) {
                const response = await uploadImage(selectedFile);
                imageUrl = response.filename;
            }

            const category = categories.find(c => c.id === parseInt(newProduct.categoryId));
            if (!category) return alert("Sélectionnez une catégorie");

            await createProduct({ ...newProduct, image: imageUrl, category });

            setNewProduct({ 
                name_fr: '', name_en: '', name_ar: '', 
                price: 0, image: '', categoryId: '', 
                pages: '', description_fr: '', description_en: '', description_ar: '' 
            });
            setSelectedFile(null);
            setIsProductModalOpen(false);
            fetchData();
        } catch (error) { alert("Erreur lors de la création"); }
        finally { setIsUploading(false); }
    };

    const handleUpdateProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProduct) return;
        setIsUploading(true);
        try {
            let imageUrl = editingProduct.image;
            if (selectedFile) {
                const response = await uploadImage(selectedFile);
                imageUrl = response.filename;
            }

            await updateProduct(editingProduct.id, { ...editingProduct, image: imageUrl });

            setEditingProduct(null);
            setIsProductModalOpen(false);
            setSelectedFile(null);
            await fetchData();
        } catch (error) { alert("Erreur lors de la mise à jour"); }
        finally { setIsUploading(false); }
    };

    const handleDeleteProduct = async (id: number) => {
        if (!confirm("Supprimer ce produit ?")) return;
        try {
            await deleteProduct(id);
            await fetchData();
        } catch (error) { alert("Erreur lors de la suppression"); }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const FALLBACK_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f1f5f9'/%3E%3Ctext x='50' y='55' font-size='30' text-anchor='middle' fill='%23cbd5e1'%3E%F0%9F%93%B7%3C/text%3E%3C/svg%3E";

    const getImageUrl = (imagePath: string | undefined) => {
        if (!imagePath) return FALLBACK_IMG;
        if (imagePath.startsWith('http')) return imagePath;
        return `http://localhost:3000/uploads/${imagePath}`;
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-[#F8F9FA]">
            {/* Header */}
            <header className="h-20 bg-white border-b border-stone-100 flex items-center justify-between px-10 shrink-0">
                <div className="flex flex-col">
                    <h1 className="text-2xl font-black text-stone-900 capitalize">
                        Gestion Produits
                    </h1>
                    <p className="text-xs text-stone-400 font-bold uppercase tracking-[0.2em]">Restaurant Borne Tactile</p>
                </div>

                <div className="flex items-center gap-6">
                    <button
                        onClick={() => { setEditingProduct(null); setSelectedFile(null); setIsProductModalOpen(true); }}
                        className="bg-[#006747] text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-[#006747]/20 flex items-center gap-2 hover:scale-105 transition-transform"
                    >
                        <span className="text-xl">+</span> Nouveau Produit
                    </button>
                    <div className="w-10 h-10 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-500 font-bold">
                        A
                    </div>
                </div>
            </header>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-10 bg-[#F8F9FA] z-10">
                {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                        <div className="w-10 h-10 border-4 border-[#006747] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Products Header & Search */}
                        <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-stone-100">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                                <h3 className="text-xl font-black flex items-center gap-3">
                                    <span className="p-2 bg-blue-50 text-blue-500 rounded-lg text-lg">🍔</span>
                                    Liste des Produits
                                    <span className="ml-2 text-xs font-bold text-stone-400 bg-stone-100 px-3 py-1 rounded-full">{filteredProducts.length} ARTICLES</span>
                                </h3>

                                <div className="flex-1 max-w-md relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">🔍</span>
                                    <input
                                        type="text"
                                        placeholder="Rechercher par nom..."
                                        className="w-full pl-12 pr-6 py-3.5 bg-stone-50 border border-stone-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#006747]/20 font-bold transition-all"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-left border-b border-stone-100">
                                            <th className="pb-4 font-bold text-stone-400 text-[10px] uppercase tracking-widest pl-4">Produit</th>
                                            <th className="pb-4 font-bold text-stone-400 text-[10px] uppercase tracking-widest">Catégorie</th>
                                            <th className="pb-4 font-bold text-stone-400 text-[10px] uppercase tracking-widest text-center">Prix</th>
                                            <th className="pb-4 font-bold text-stone-400 text-[10px] uppercase tracking-widest text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-50">
                                        {filteredProducts.map(prod => (
                                            <tr key={prod.id} className="group hover:bg-stone-50 transition-colors">
                                                <td className="py-4 pl-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-14 h-14 bg-stone-50 rounded-2xl relative p-2 border border-stone-100 group-hover:scale-105 transition-transform">
                                                            <Image
                                                                src={getImageUrl(prod.image)}
                                                                alt={prod.name}
                                                                fill
                                                                className="object-contain"
                                                            />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-stone-800">{prod.name}</span>
                                                            <span className="text-[10px] text-stone-400 font-medium truncate max-w-[150px]">{prod.pages || 'Sans options'}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4">
                                                    <span className="px-3 py-1 bg-stone-100 text-stone-600 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                                                        {prod.category?.name || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="py-4 text-center">
                                                    <span className="font-black text-[#E2725B] text-lg">{prod.price} <span className="text-xs">DH</span></span>
                                                </td>
                                                <td className="py-4 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => { setEditingProduct(prod); setSelectedFile(null); setIsProductModalOpen(true); }}
                                                            className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                        >
                                                            ✏️
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteProduct(prod.id)}
                                                            className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>
                )}
            </div>

            {/* PRODUCT MODAL (New or Edit) */}
            {(isProductModalOpen || editingProduct) && (
                <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 transition-all duration-300 animate-in fade-in">
                    <div
                        className="bg-white rounded-[3rem] w-full max-w-2xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-500"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-[#006747] p-8 text-white flex justify-between items-center shrink-0">
                            <div>
                                <h3 className="text-2xl font-black">{editingProduct ? 'Modifier le Produit' : 'Ajouter un Produit'}</h3>
                                <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-1">Cuisine Traditionnelle Borne</p>
                            </div>
                            <button
                                onClick={() => { setIsProductModalOpen(false); setEditingProduct(null); }}
                                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        <form
                            onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
                            className="p-10 grid grid-cols-2 gap-8 overflow-y-auto flex-1 custom-scrollbar"
                        >
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    Article (Français) <img src="https://flagcdn.com/w40/fr.png" width="16" alt="FR" />
                                </label>
                                <input
                                    placeholder="ex: Royal Burger"
                                    className="px-5 py-4 bg-stone-50 border border-stone-100 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-[#006747]/20 font-bold transition-all text-sm"
                                    value={editingProduct ? editingProduct.name_fr : newProduct.name_fr}
                                    onChange={e => editingProduct ? setEditingProduct({ ...editingProduct, name_fr: e.target.value }) : setNewProduct({ ...newProduct, name_fr: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    Article (Anglais) <img src="https://flagcdn.com/w40/gb.png" width="16" alt="EN" />
                                </label>
                                <input
                                    placeholder="ex: Royal Burger"
                                    className="px-5 py-4 bg-stone-50 border border-stone-100 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-[#006747]/20 font-bold transition-all text-sm"
                                    value={editingProduct ? (editingProduct.name_en || '') : newProduct.name_en}
                                    onChange={e => editingProduct ? setEditingProduct({ ...editingProduct, name_en: e.target.value }) : setNewProduct({ ...newProduct, name_en: e.target.value })}
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1 flex items-center gap-2 justify-end">
                                    Article (Arabe) <img src="https://flagcdn.com/w40/ma.png" width="16" alt="AR" />
                                </label>
                                <input
                                    placeholder="ex: برجر"
                                    className="px-5 py-4 bg-stone-50 border border-stone-100 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-[#006747]/20 font-bold transition-all text-sm text-right"
                                    value={editingProduct ? (editingProduct.name_ar || '') : newProduct.name_ar}
                                    onChange={e => editingProduct ? setEditingProduct({ ...editingProduct, name_ar: e.target.value }) : setNewProduct({ ...newProduct, name_ar: e.target.value })}
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Prix (DH)</label>
                                <input
                                    type="number"
                                    placeholder="ex: 45"
                                    className="px-5 py-4 bg-stone-50 border border-stone-100 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-[#006747]/20 font-bold transition-all text-sm"
                                    value={editingProduct ? editingProduct.price : newProduct.price}
                                    onChange={e => {
                                        const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                                        if (editingProduct) setEditingProduct({ ...editingProduct, price: val });
                                        else setNewProduct({ ...newProduct, price: val });
                                    }}
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-2 col-span-2">
                                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    Description (Français) <img src="https://flagcdn.com/w40/fr.png" width="16" alt="FR" />
                                </label>
                                <textarea
                                    className="px-5 py-4 bg-stone-50 border border-stone-100 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-[#006747]/20 font-bold transition-all text-sm"
                                    value={editingProduct ? (editingProduct.description_fr || '') : newProduct.description_fr}
                                    onChange={e => editingProduct ? setEditingProduct({ ...editingProduct, description_fr: e.target.value }) : setNewProduct({ ...newProduct, description_fr: e.target.value })}
                                />
                            </div>

                            <div className="flex flex-col gap-2 col-span-2">
                                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    Description (Anglais) <img src="https://flagcdn.com/w40/gb.png" width="16" alt="EN" />
                                </label>
                                <textarea
                                    className="px-5 py-4 bg-stone-50 border border-stone-100 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-[#006747]/20 font-bold transition-all text-sm"
                                    value={editingProduct ? (editingProduct.description_en || '') : newProduct.description_en}
                                    onChange={e => editingProduct ? setEditingProduct({ ...editingProduct, description_en: e.target.value }) : setNewProduct({ ...newProduct, description_en: e.target.value })}
                                />
                            </div>

                            <div className="flex flex-col gap-2 col-span-2">
                                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1 flex items-center gap-2 justify-end">
                                    Description (Arabe) <img src="https://flagcdn.com/w40/ma.png" width="16" alt="AR" />
                                </label>
                                <textarea
                                    className="px-5 py-4 bg-stone-50 border border-stone-100 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-[#006747]/20 font-bold transition-all text-sm text-right"
                                    value={editingProduct ? (editingProduct.description_ar || '') : newProduct.description_ar}
                                    onChange={e => editingProduct ? setEditingProduct({ ...editingProduct, description_ar: e.target.value }) : setNewProduct({ ...newProduct, description_ar: e.target.value })}
                                />
                            </div>

                            <div className="flex flex-col gap-2 col-span-2">
                                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Image du Produit</label>
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200 flex items-center justify-center overflow-hidden">
                                        {selectedFile ? (
                                            <img src={URL.createObjectURL(selectedFile)} className="w-full h-full object-cover" alt="Preview" />
                                        ) : editingProduct?.image ? (
                                            <img src={getImageUrl(editingProduct.image)} className="w-full h-full object-cover" alt="Current" />
                                        ) : (
                                            <span className="text-2xl text-stone-300">📷</span>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                        className="text-xs text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#006747]/10 file:text-[#006747] hover:file:bg-[#006747]/20 cursor-pointer"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 col-span-2">
                                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Pages (Options séparées par des virgules)</label>
                                <input
                                    placeholder="ex: SAUCES, CUISSON"
                                    className="px-5 py-4 bg-stone-50 border border-stone-100 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-[#006747]/20 font-bold transition-all text-sm"
                                    value={editingProduct ? (editingProduct.pages || '') : newProduct.pages}
                                    onChange={e => editingProduct ? setEditingProduct({ ...editingProduct, pages: e.target.value }) : setNewProduct({ ...newProduct, pages: e.target.value })}
                                />
                            </div>

                            {!editingProduct && (
                                <div className="flex flex-col gap-2 col-span-2">
                                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Catégorie (Famille)</label>
                                    <select
                                        className="px-5 py-4 bg-stone-50 border border-stone-100 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-[#006747]/20 font-bold transition-all text-sm"
                                        value={newProduct.categoryId}
                                        onChange={e => setNewProduct({ ...newProduct, categoryId: e.target.value })}
                                        required
                                    >
                                        <option value="">Sélectionner une famille</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.FAMILLE}</option>)}
                                    </select>
                                </div>
                            )}

                            <div className="col-span-2 flex gap-4 pt-4 mt-4 border-t border-stone-50">
                                <button
                                    type="button"
                                    disabled={isUploading}
                                    onClick={() => { setIsProductModalOpen(false); setEditingProduct(null); }}
                                    className="flex-1 px-8 py-5 bg-stone-100 hover:bg-stone-200 text-stone-500 font-extrabold rounded-[1.5rem] transition-all disabled:opacity-50"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUploading}
                                    className="flex-[2] px-8 py-5 bg-[#006747] text-white font-extrabold rounded-[1.5rem] shadow-xl shadow-[#006747]/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                                >
                                    {isUploading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Envoi en cours...
                                        </>
                                    ) : (
                                        editingProduct ? 'Enregistrer les modifications' : 'Créer le produit'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
