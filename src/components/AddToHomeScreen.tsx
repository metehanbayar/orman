'use client';

import { useState, useEffect } from 'react';

interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

const AddToHomeScreen = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Daha önce gösterilip gösterilmediğini kontrol et
    const hasPromptBeenShown = localStorage.getItem('pwaPromptShown');
    
    // Standalone modda çalışıp çalışmadığını kontrol et
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
                              (window.navigator as NavigatorWithStandalone).standalone || 
                              document.referrer.includes('android-app://');

    setIsStandalone(isInStandaloneMode);

    // Eğer daha önce gösterilmediyse ve standalone modda değilse göster
    if (!hasPromptBeenShown && !isInStandaloneMode) {
      // Kullanıcıya biraz zaman tanıyalım
      setTimeout(() => {
        setShowPrompt(true);
      }, 2000);
    }
  }, []);

  const handleClose = () => {
    setShowPrompt(false);
    localStorage.setItem('pwaPromptShown', 'true');
  };

  if (!showPrompt || isStandalone) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-white rounded-lg shadow-lg p-4 z-50 border border-gray-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Daha İyi Deneyim İçin
          </h3>
          <p className="text-gray-600 text-sm mb-3">
            Bu siteyi ana ekranınıza ekleyerek tam ekran deneyimi yaşayabilirsiniz.
          </p>
          <div className="space-y-2 text-sm text-gray-500">
            <p>Nasıl eklenir:</p>
            <p>1. Tarayıcı menüsünden (⋮) &quot;Ana Ekrana Ekle&quot;yi seçin</p>
            <p>2. Açılan pencerede &quot;Ekle&quot;ye dokunun</p>
          </div>
        </div>
        <button
          onClick={handleClose}
          className="ml-4 text-gray-400 hover:text-gray-500"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default AddToHomeScreen; 