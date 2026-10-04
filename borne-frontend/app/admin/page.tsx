'use client';

export default function AdminDashboardPage() {
    return (
        <div className="flex-1 flex flex-col h-full bg-[#F8F9FA]">
            {/* Header */}
            <header className="h-20 bg-white border-b border-stone-100 flex items-center justify-between px-10 shrink-0">
                <div className="flex flex-col">
                    <h1 className="text-2xl font-black text-stone-900 capitalize">
                        Dashboard
                    </h1>
                    <p className="text-xs text-stone-400 font-bold uppercase tracking-[0.2em]">Restaurant Borne Tactile</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-500 font-bold">
                    A
                </div>
            </header>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-10 bg-[#F8F9FA] z-10 flex flex-col items-center justify-center text-stone-300 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-8xl mb-6">📉</div>
                <h2 className="text-2xl font-black text-stone-800">Module Statistiques</h2>
                <p className="font-medium text-stone-400">En cours de développement...</p>
            </div>
        </div>
    );
}
