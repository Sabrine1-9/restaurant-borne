/**
 * This file contains the "Blueprints" (TypeScript Interfaces) for our frontend data.
 * These perfectly mirror the TypeORM "Entities" we defined in the backend!
 * Using these helps catch errors if we try to access a property that doesn't exist.
 */

export interface Category {
    id: number;
    name: string; // Used for UI display (localized)
    FAMILLE?: string;
    FAMILLE_ANG?: string;
    FAMILLE_AR?: string;
    TYPE?: string;
    image?: string;
    products?: Product[];
}

export interface Product {
    id: number;
    name: string; // Used for UI display (localized)
    name_fr: string;
    name_en?: string;
    name_ar?: string;
    price: number;
    image: string;
    category: Category;
    pages?: string;
    description?: string; // Used for UI display (localized)
    description_fr?: string;
    description_en?: string;
    description_ar?: string;
    style?: string;
}

export interface OrderItem {
    id?: number;
    product: Product;
    quantity: number;
    selectedOptions?: string;
}

export interface Order {
    id: number;
    total: number;
    createdAt: string;
    items: OrderItem[];
}
