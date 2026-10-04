'use client';

import { useState, useEffect, useCallback } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory, uploadImage } from '@/services/api';
import { Category } from '@/types';

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [categorySearchTerm, setCategorySearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // Form states
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [newCategory, setNewCategory] = useState({ 
        FAMILLE: '', 
        FAMILLE_ANG: '', 
        FAMILLE_AR: '', 
        TYPE: 'FAMILLE',
        image: ''
    });
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            const cats = await getCategories();
            setCategories(cats);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCreateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUploading(true);
        try {
            let imageUrl = newCategory.image;
            if (selectedFile) {
                const response = await uploadImage(selectedFile);
                imageUrl = response.filename; 
            }
            await createCategory({ ...newCategory, image: imageUrl });
            setNewCategory({ FAMILLE: '', FAMILLE_ANG: '', FAMILLE_AR: '', TYPE: 'FAMILLE', image: '' });
            setSelectedFile(null);
            setIsCategoryModalOpen(false);
            fetchData();
        } catch (error) { alert("Erreur lors de la création"); }
        finally { setIsUploading(false); }
    };

    const handleUpdateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCategory) return;
        setIsUploading(true);
        try {
            let imageUrl = editingCategory.image;
            if (selectedFile) {
                const response = await uploadImage(selectedFile);
                imageUrl = response.filename;
            }
            await updateCategory(editingCategory.id, {
                FAMILLE: editingCategory.FAMILLE,
                FAMILLE_ANG: editingCategory.FAMILLE_ANG,
                FAMILLE_AR: editingCategory.FAMILLE_AR,
                TYPE: editingCategory.TYPE,
                image: imageUrl,
            });
            setEditingCategory(null);
            setIsCategoryModalOpen(false);
            setSelectedFile(null);
           await fetchData();

        } catch (error) { alert("Erreur lors de la mise à jour"); }
        finally { setIsUploading(false); }
    };

    const handleDeleteCategory = async (id: number) => {
        if (!confirm("Supprimer cette catégorie ? (Attention aux produits liés)")) return;
        try {
            await deleteCategory(id);
            fetchData();
        } catch (error) { alert("Erreur lors de la suppression"); }
    };

    const filteredCategories = categories.filter(c =>
        (c.FAMILLE || '').toLowerCase().includes(categorySearchTerm.toLowerCase()) ||
        (c.name || '').toLowerCase().includes(categorySearchTerm.toLowerCase())
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
                        Gestion Catégories
                    </h1>
                    <p className="text-xs text-stone-400 font-bold uppercase tracking-[0.2em]">Restaurant Borne Tactile</p>
                </div>

                <div className="flex items-center gap-6">
                    <button
                        onClick={() => { setEditingCategory(null); setSelectedFile(null); setIsCategoryModalOpen(true); }}
                        className="bg-[#006747] text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-[#006747]/20 flex items-center gap-2 hover:scale-105 transition-transform"
                    >
                        <span className="text-xl">+</span> Nouvelle Catégorie
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
                        {/* Categories Header & Search */}
                        <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-stone-100">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                                <h3 className="text-xl font-black flex items-center gap-3">
                                    <span className="p-2 bg-orange-50 text-orange-500 rounded-lg text-lg">📁</span>
                                    Liste des Catégories
                                    <span className="ml-2 text-xs font-bold text-stone-400 bg-stone-100 px-3 py-1 rounded-full">{filteredCategories.length} FAMILLES</span>
                                </h3>

                                <div className="flex-1 max-w-md relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">🔍</span>
                                    <input
                                        type="text"
                                        placeholder="Rechercher une catégorie..."
                                        className="w-full pl-12 pr-6 py-3.5 bg-stone-50 border border-stone-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#006747]/20 font-bold transition-all"
                                        value={categorySearchTerm}
                                        onChange={(e) => setCategorySearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-left border-b border-stone-100">
                                            <th className="pb-4 font-bold text-stone-400 text-[10px] uppercase tracking-widest pl-4">Image</th>
                                            <th className="pb-4 font-bold text-stone-400 text-[10px] uppercase tracking-widest">Nom (Français)</th>
                                            <th className="pb-4 font-bold text-stone-400 text-[10px] uppercase tracking-widest">Nom (Arabe)</th>
                                            <th className="pb-4 font-bold text-stone-400 text-[10px] uppercase tracking-widest text-center">Type</th>
                                            <th className="pb-4 font-bold text-stone-400 text-[10px] uppercase tracking-widest text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-50">
                                        {filteredCategories.map(cat => (
                                            <tr key={cat.id} className="group hover:bg-stone-50 transition-colors">
                                                <td className="py-4 pl-4">
                                                    <div className="w-12 h-12 rounded-xl bg-stone-100 border border-stone-200 overflow-hidden shadow-sm flex items-center justify-center">
                                                        <img 
                                                            src={getImageUrl(cat.image)} 
                                                            alt="" 
                                                            className="w-full h-full object-cover" 
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).src = FALLBACK_IMG;
                                                            }}
                                                        />
                                                    </div>
                                                </td>
                                                <td className="py-4">
                                                    <span className="font-bold text-stone-800">{cat.FAMILLE}</span>
                                                </td>
                                                <td className="py-4">
                                                    <span className="font-bold text-stone-800">{cat.FAMILLE_AR}</span>
                                                </td>
                                                <td className="py-4 text-center">
                                                    <span className="px-3 py-1 bg-stone-100 text-stone-600 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                                                        {cat.TYPE || 'FAMILLE'}
                                                    </span>
                                                </td>
                                                <td className="py-4 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => { setEditingCategory(cat); setSelectedFile(null); setIsCategoryModalOpen(true); }}
                                                            className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                        >
                                                            ✏️
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteCategory(cat.id)}
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

            {/* MODAL CATEGORIES */}
            {(isCategoryModalOpen || editingCategory) && (
                <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 transition-all duration-300 animate-in fade-in">
                    <div className="bg-white rounded-[3rem] w-full max-w-xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-500" onClick={(e) => e.stopPropagation()}>
                        <div className="bg-[#006747] p-8 text-white flex justify-between items-center shrink-0">
                            <div>
                                <h3 className="text-2xl font-black">{editingCategory ? 'Modifier la Catégorie' : 'Ajouter une Catégorie'}</h3>
                                <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-1">Organisation du Menu</p>
                            </div>
                            <button onClick={() => { setIsCategoryModalOpen(false); setEditingCategory(null); }} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-2xl">×</button>
                        </div>
                        <form onSubmit={editingCategory ? handleUpdateCategory : handleCreateCategory} className="p-10 space-y-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
                            <div className="grid grid-cols-1 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1 flex items-center gap-2">Nom (Français) <img src="https://flagcdn.com/w40/fr.png" width="16" alt="FR" /></label>
                                    <input placeholder="ex: Burgers" className="px-5 py-4 bg-stone-50 border border-stone-100 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-[#006747]/20 font-bold transition-all text-sm" value={editingCategory ? editingCategory.FAMILLE : newCategory.FAMILLE} onChange={e => editingCategory ? setEditingCategory({ ...editingCategory, FAMILLE: e.target.value }) : setNewCategory({ ...newCategory, FAMILLE: e.target.value })} required />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1 flex items-center gap-2">Nom (Anglais) <img src="https://flagcdn.com/w40/gb.png" width="16" alt="EN" /></label>
                                    <input placeholder="ex: Burgers" className="px-5 py-4 bg-stone-50 border border-stone-100 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-[#006747]/20 font-bold transition-all text-sm" value={editingCategory ? (editingCategory.FAMILLE_ANG || '') : newCategory.FAMILLE_ANG} onChange={e => editingCategory ? setEditingCategory({ ...editingCategory, FAMILLE_ANG: e.target.value }) : setNewCategory({ ...newCategory, FAMILLE_ANG: e.target.value })} />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1 flex items-center gap-2">Nom (Arabe) <img src="https://flagcdn.com/w40/ma.png" width="16" alt="AR" /></label>
                                    <input placeholder="ex: برجر" className="px-5 py-4 bg-stone-50 border border-stone-100 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-[#006747]/20 font-bold transition-all text-sm text-right" value={editingCategory ? (editingCategory.FAMILLE_AR || '') : newCategory.FAMILLE_AR} onChange={e => editingCategory ? setEditingCategory({ ...editingCategory, FAMILLE_AR: e.target.value }) : setNewCategory({ ...newCategory, FAMILLE_AR: e.target.value })} />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Type de catégorie</label>
                                    <select className="px-5 py-4 bg-stone-50 border border-stone-100 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-[#006747]/20 font-bold transition-all text-sm appearance-none cursor-pointer" value={editingCategory ? editingCategory.TYPE || 'FAMILLE' : newCategory.TYPE} onChange={e => editingCategory ? setEditingCategory({ ...editingCategory, TYPE: e.target.value }) : setNewCategory({ ...newCategory, TYPE: e.target.value })} required >
                                        <option value="FAMILLE">FAMILLE (Menu)</option>
                                        <option value="PAGE">PAGE (Info)</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Image de la Catégorie</label>
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-stone-50 rounded-xl border-2 border-dashed border-stone-200 flex items-center justify-center overflow-hidden">
                                            {selectedFile ? (
                                                <img src={URL.createObjectURL(selectedFile)} className="w-full h-full object-cover" alt="Preview" />
                                            ) : editingCategory?.image ? (
                                                <img src={getImageUrl(editingCategory.image)} className="w-full h-full object-cover" alt="Current" />
                                            ) : (
                                                <span className="text-xl text-stone-300">📁</span>
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                            className="text-[10px] text-stone-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-[#006747]/10 file:text-[#006747] hover:file:bg-[#006747]/20 cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-4 pt-4 mt-4 border-t border-stone-50">
                                <button type="button" onClick={() => { setIsCategoryModalOpen(false); setEditingCategory(null); }} className="flex-1 px-8 py-5 bg-stone-100 hover:bg-stone-200 text-stone-500 font-extrabold rounded-[1.5rem] transition-all">Annuler</button>
                                <button type="submit" className="flex-[2] px-8 py-5 bg-[#006747] text-white font-extrabold rounded-[1.5rem] shadow-xl shadow-[#006747]/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">{editingCategory ? 'Enregistrer les modifications' : 'Créer la catégorie'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
