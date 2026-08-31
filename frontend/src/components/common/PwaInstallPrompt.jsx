import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import logoImg from '../../assets/logo.png';

export const PwaInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode (PWA installed)
    const isAppStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isAppStandalone) {
      setIsStandalone(true);
      return;
    }

    const handler = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Check if user dismissed recently
      const dismissed = localStorage.getItem('pwa_prompt_dismissed');
      const dismissedTime = dismissed ? parseInt(dismissed, 10) : 0;
      const now = Date.now();
      // Show again after 3 days if dismissed
      if (!dismissedTime || now - dismissedTime > 3 * 24 * 60 * 60 * 1000) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    // Show native install prompt
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa_prompt_dismissed', Date.now().toString());
  };

  if (!showPrompt || isStandalone) return null;

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-4 left-4 sm:left-auto sm:right-6 sm:w-96 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-emerald-100/80 flex items-center gap-3.5 ring-1 ring-black/5">
        <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-2 shrink-0 shadow-sm">
          <img src={logoImg} alt="BioProFLiC" className="w-full h-full object-contain" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
            Install BioProFLiC
          </h4>
          <p className="text-xs text-slate-500 line-clamp-1">
            Akses lebih cepat & praktis dari layar utama
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleInstall}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-semibold rounded-xl shadow-sm shadow-emerald-600/20 transition-all flex items-center gap-1.5"
          >
            <Download size={13} />
            <span>Install</span>
          </button>
          
          <button
            onClick={handleDismiss}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Tutup"
          >
            <X size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
