import React, { useEffect, useMemo, useState } from 'react';
import { ChevronRight, Instagram, Linkedin, Mail, Phone, ArrowUp, Youtube } from 'lucide-react';
import { cn } from '../lib/utils';

type FooterLink = { label: string; href?: string };

export const Footer: React.FC = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 240);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ✅ BACKGROUND IMAGE + OVERLAY + PATTERN
  const footerBgStyle = useMemo<React.CSSProperties>(
    () => ({
      backgroundImage: [
        // dark overlay for readability
        // 'linear-gradient(rgba(8,21,48,0.90), rgba(8,21,48,0.95))',

        // your image (PUT IMAGE IN public/images/)
        "url('/images/footer.png')",

        // subtle star pattern
        'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)',
      ].join(','),

      backgroundSize: 'cover, cover, 48px 48px',
      backgroundPosition: 'center, center, 0 0',
      backgroundRepeat: 'no-repeat, no-repeat, repeat',
    }),
    []
  );

  const legalLinks: FooterLink[] = [
    { label: 'Help Center', href: '#' },
    { label: 'Terms & Conditions', href: 'https://avencheer.com/terms-and-conditions' },
    { label: 'Account Deletion', href: 'https://avencheer.com/account-deletion' },
    { label: 'Privacy Policy', href: 'https://avencheer.com/privacy-policy' },
    { label: 'Cookie Policy', href: 'https://avencheer.com/cookies-policy' },
    { label: 'Refund & Cancellation', href: 'https://avencheer.com/refund-and-cancellation' },
    { label: 'Copyright & IP Policy', href: 'https://avencheer.com/copyright-and-ip-policy' },
    { label: 'Disclaimer', href: 'https://avencheer.com/disclaimer' },
  ];

  const companyLinks: FooterLink[] = [
    { label: 'About', href: 'https://avencheer.com/about-us' },
    { label: 'Contact Us', href: 'https://avencheer.com/contact-us' },
    { label: 'How It Works', href: 'https://avencheer.com/how-it-works' },
    { label: 'Features', href: 'https://avencheer.com/features' },
  ];

  const serviceLinks: FooterLink[] = [
    { label: 'Live Voice & Video Cheers', href: 'https://avencheer.com/features' },
    { label: 'AI-Powered Content Moderation', href: '#' },
    { label: 'Multi-Venue Live Broadcasting', href: '#' },
    { label: 'Remote Participation from Anywhere', href: '#' },
  ];

  return (
    <footer
      className={cn(
        'relative mt-16 border-t border-white/5',
        'text-white'
      )}
      style={footerBgStyle}
    >
      {/* extra soft overlay */}
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />

      <div className="relative page-container pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-12 xl:gap-16">
          
          {/* BRAND */}
          <div className="space-y-5">
            <div>
              <h3 className="text-2xl font-bold">CheerIT™</h3>
              <div className="h-[2px] w-24 bg-white/40 mt-3" />
            </div>

            <p className="text-sm leading-7 text-white/80 max-w-sm">
              CheerIT™ is a pioneering multi-venue audience engagement platform in India, developed by AvenCheer Technologies
            </p>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-white/80">
                <Phone className="w-4 h-4" />
                <a href="tel:+917738337765" className="hover:text-white">
                  +91-7738337765
                </a>
              </div>
              <div className="flex items-center gap-3 text-white/80">
                <Mail className="w-4 h-4" />
                <a href="mailto:enquire@avencheer.com" className="hover:text-white">
                  enquire@avencheer.com
                </a>
              </div>
            </div>
          </div>

          {/* COMPANY */}
          <div className="space-y-5">
            <div>
              <h3 className="text-xl font-bold">Company</h3>
              <div className="h-[2px] w-20 bg-white/40 mt-3" />
            </div>

            <ul className="space-y-3 text-sm">
              {companyLinks.map((l) => (
                <li key={l.label}>
                  <a
  href={l.href}
  target="_blank"
  rel="noopener noreferrer"
  className="inline-flex items-center gap-2 text-white/85 hover:text-white transition-colors"
>
                    <ChevronRight className="w-4 h-4" />
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* SERVICES */}
          <div className="space-y-5">
            <div>
              <h3 className="text-xl font-bold">Services</h3>
              <div className="h-[2px] w-20 bg-white/40 mt-3" />
            </div>

            <ul className="space-y-3 text-sm">
              {serviceLinks.map((l) => (
                <li key={l.label}>
                  <a
  href={l.href}
  target="_blank"
  rel="noopener noreferrer"
  className="inline-flex items-center gap-2 text-white/85 hover:text-white transition-colors"
>
                    <ChevronRight className="w-4 h-4" />
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* SOCIAL */}
          <div className="space-y-5">
            <div>
              <h3 className="text-xl font-bold">Social & Updates</h3>
              <div className="h-[2px] w-32 bg-white/40 mt-3" />
            </div>

            <div className="flex items-center gap-3">
              <a className="w-10 h-10 rounded-md border border-white/20 bg-white/5 hover:bg-white/10 grid place-items-center">
                <Instagram className="w-5 h-5" />
              </a>
              <a className="w-10 h-10 rounded-md border border-white/20 bg-white/5 hover:bg-white/10 grid place-items-center">
                <Linkedin className="w-5 h-5" />
              </a>
              <a className="w-10 h-10 rounded-md border border-white/20 bg-white/5 hover:bg-white/10 grid place-items-center">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* LEGAL */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-xs font-semibold uppercase text-primary">
  {legalLinks.map((l) => (
    <a
      key={l.label}
      href={l.href}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:text-[#FF9D00] transition-colors"
    >
      {l.label}
    </a>
  ))}
</div>
        {/* COPYRIGHT */}
        <div className="mt-12">
          <div className="mx-auto max-w-4xl rounded-2xl bg-white/10 border border-white/10 px-6 py-6 text-center text-sm text-white/90">
            <div>CheerIT™ is a platform of AvenCheer Technologies. Patent Registered</div>
            <div className="mt-1 text-white/80 text-xs sm:text-sm">
              © 2025-26 AvenCheer Technologies · avencheer.com · All rights reserved.
            </div>
          </div>
        </div>
      </div>

      {/* SCROLL TOP */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className={cn(
            'fixed right-6 bottom-24 md:right-8 md:bottom-8 z-50',
            'w-14 h-14 rounded-full',
            'bg-[#1f6feb] hover:bg-[#1a5fd1]',
            'border-4 border-white shadow-2xl',
            'grid place-items-center'
          )}
        >
          <ArrowUp className="w-6 h-6 text-white" />
        </button>
      )}
    </footer>
  );
};
