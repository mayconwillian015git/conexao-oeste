'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Banner } from '@/lib/types';

const SESSION_KEY = 'banner_visto';

interface PopupBannerProps {
  banner: Banner | null;
}

export default function PopupBanner({ banner }: PopupBannerProps) {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    if (!banner) return;
    if (sessionStorage.getItem(SESSION_KEY)) return;

    const timer = setTimeout(() => {
      setVisivel(true);
      sessionStorage.setItem(SESSION_KEY, '1');
    }, 3000);

    return () => clearTimeout(timer);
  }, [banner]);

  if (!visivel || !banner) return null;

  function fechar() {
    setVisivel(false);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={fechar}
    >
      <div
        className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={fechar}
          className="absolute top-3 right-3 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors"
          aria-label="Fechar"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {banner.link ? (
          <a href={banner.link} target="_blank" rel="noopener noreferrer" onClick={fechar}>
            <div className="relative w-full aspect-video">
              <Image
                src={banner.imagem_url}
                alt="Banner promocional"
                fill
                className="object-cover"
              />
            </div>
          </a>
        ) : (
          <div className="relative w-full aspect-video">
            <Image
              src={banner.imagem_url}
              alt="Banner promocional"
              fill
              className="object-cover"
            />
          </div>
        )}

        <div className="p-4 flex items-center justify-between">
          <p className="text-sm text-muted">Clique fora para fechar</p>
          <button
            onClick={fechar}
            className="text-sm font-medium text-primary hover:underline"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
