'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';

const APP_VERSION = "1.0.0";

export default function RootPage() {
    const router = useRouter();
    const { setLanguage, t } = useLanguage();
    const [isSelecting, setIsSelecting] = useState(false);

    useEffect(() => {
        // Supprimer la langue sauvegardée pour forcer un nouveau choix à chaque fois
        localStorage.removeItem('lang');
    }, []);

    const selectLang = (lang: 'fr' | 'en' | 'ar') => {
        setIsSelecting(true);
        document.body.classList.add('scale-down');

        setLanguage(lang);
        localStorage.setItem('app_version', APP_VERSION);

        setTimeout(() => {
            router.push('/dashboard');
        }, 500);
    };

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center text-white gap-10 overflow-hidden bg-stone-900 animate-fade">

            {/* Background Image (même que login) */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/login-bg.png"
                    alt="Restaurant Background"
                    className="w-full h-full object-cover opacity-60 scale-105 blur-[2px]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-transparent to-stone-900/40" />
            </div>

            {/* Loader */}
            {isSelecting && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-50">
                    <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            {/* Contenu */}
            <div className="z-10 flex flex-col items-center gap-8">

                <h1 className="text-6xl font-extrabold text-[#F4C430] animate-slide-down">
                    {t('🍽️ Bienvenue', '🍽️ Welcome', '🍽️ مرحباً بكم')}
                </h1>

                <p className="text-stone-200 text-xl animate-fade-in">
                    {t('Choisissez votre langue', 'Choose your language', 'اختر لغتك')}
                </p>

                <div className="flex gap-6 animate-slide-up">

                    <button onClick={() => selectLang('fr')} className="lang-btn flex items-center gap-3">
                        <img src="https://flagcdn.com/w40/fr.png" width="30" alt="FR" /> Français
                    </button>

                    <button onClick={() => selectLang('en')} className="lang-btn flex items-center gap-3">
                        <img src="https://flagcdn.com/w40/gb.png" width="30" alt="EN" /> English
                    </button>

                    <button onClick={() => selectLang('ar')} className="lang-btn flex items-center gap-3">
                        <img src="https://flagcdn.com/w40/ma.png" width="30" alt="AR" /> العربية
                    </button>

                </div>
            </div>

            <style jsx>{`
            .lang-btn {
                padding: 16px 28px;
                border-radius: 20px;
                font-size: 20px;
                font-weight: bold;
                background: white;
                color: #006747;
                transition: all 0.3s ease;
            }

            .lang-btn:hover {
                transform: scale(1.1);
                background: #F4C430;
                color: black;
            }

            @keyframes fade {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            .animate-fade {
                animation: fade 1s ease-in-out;
            }

            @keyframes slideDown {
                from { transform: translateY(-40px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }

            .animate-slide-down {
                animation: slideDown 0.8s ease;
            }

            @keyframes slideUp {
                from { transform: translateY(40px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }

            .animate-slide-up {
                animation: slideUp 0.8s ease;
            }

            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            .animate-fade-in {
                animation: fadeIn 1.2s ease;
            }

            .scale-down {
                animation: scaleDown 0.3s ease;
            }

            @keyframes scaleDown {
                from { transform: scale(1); opacity: 1; }
                to { transform: scale(0.95); opacity: 0.7; }
            }
        `}</style>
        </div>
    );


}
