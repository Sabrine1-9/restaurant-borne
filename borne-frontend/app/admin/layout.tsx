'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const payload = JSON.parse(
        atob(token.split('.')[1])
      );

      setUserRole(payload.role);

      const isExpired =
        payload.exp * 1000 < Date.now();

      if (isExpired) {
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }

      if (
        pathname.startsWith('/admin/users') &&
        payload.role !== 'SUPER_ADMIN'
      ) {
        router.push('/admin');
        return;
      }

      setIsAuthenticated(true);
      setIsLoading(false);
    } catch {
      localStorage.removeItem('token');
      router.push('/login');
    }
  }, [router, pathname]);

  const logout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (!isAuthenticated || isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#006747] border-t-transparent rounded-full animate-spin"></div>

          <p className="text-stone-500 font-medium">
            Chargement du dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F8F9FA] font-sans text-stone-900 overflow-hidden">

      {/* SIDEBAR */}
      <aside className="w-72 bg-[#1A1A1A] text-white flex flex-col p-6 z-30 shadow-2xl">

        {/* LOGO */}
        <div className="flex items-center gap-3 mb-12 px-2">

          <div className="w-10 h-10 bg-[#006747] rounded-xl flex items-center justify-center font-bold text-xl">
            B
          </div>

          <h2 className="text-xl font-bold tracking-tight">
            Borne Admin
          </h2>

        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 space-y-2">

          {/* PRODUITS */}
          <Link
            href="/admin/products"
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
              pathname === '/admin/products'
                ? 'bg-[#006747] text-white shadow-lg shadow-[#006747]/20'
                : 'text-stone-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <span className="text-xl">
              🍔
            </span>

            <span className="font-semibold text-sm tracking-wide uppercase">
              Produits
            </span>
          </Link>

          {/* CATEGORIES */}
          <Link
            href="/admin/categories"
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
              pathname === '/admin/categories'
                ? 'bg-[#006747] text-white shadow-lg shadow-[#006747]/20'
                : 'text-stone-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <span className="text-xl">
              📁
            </span>

            <span className="font-semibold text-sm tracking-wide uppercase">
              Catégories
            </span>
          </Link>

          {/* DASHBOARD */}
          <Link
            href="/admin"
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
              pathname === '/admin'
                ? 'bg-[#006747] text-white shadow-lg shadow-[#006747]/20'
                : 'text-stone-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <span className="text-xl">
              📊
            </span>

            <span className="font-semibold text-sm tracking-wide uppercase">
              Dashboard
            </span>
          </Link>

          {/* COMMANDES */}
          <Link
            href="/admin/orders"
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
              pathname === '/admin/orders'
                ? 'bg-[#006747] text-white shadow-lg shadow-[#006747]/20'
                : 'text-stone-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <span className="text-xl">
              📋
            </span>

            <span className="font-semibold text-sm tracking-wide uppercase">
              Commandes
            </span>
          </Link>

          {/* UTILISATEURS - SUPER ADMIN ONLY */}
          {userRole === 'SUPER_ADMIN' && (
            <Link
              href="/admin/users"
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                pathname === '/admin/users'
                  ? 'bg-[#006747] text-white shadow-lg shadow-[#006747]/20'
                  : 'text-stone-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className="text-xl">
                👥
              </span>

              <span className="font-semibold text-sm tracking-wide uppercase">
                Utilisateurs
              </span>
            </Link>
          )}

        </nav>

        {/* BOTTOM ACTIONS */}
        <div className="pt-6 border-t border-white/10 space-y-4">

          <button
            onClick={() =>
              router.push('/dashboard')
            }
            className="w-full flex items-center gap-4 px-4 py-3 text-stone-400 hover:text-white transition-colors"
          >
            <span className="text-xl">
              🛒
            </span>

            <span className="font-medium text-sm">
              Voir la Boutique
            </span>
          </button>

          <button
            onClick={logout}
            className="w-full bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-4 py-3.5 rounded-2xl flex items-center gap-4 transition-all duration-300 group"
          >
            <span className="text-xl group-hover:scale-110 transition-transform">
              🚪
            </span>

            <span className="font-bold text-sm uppercase tracking-wider">
              Déconnexion
            </span>
          </button>

        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {children}
      </main>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }

        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }
      `}</style>
    </div>
  );
}