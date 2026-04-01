"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Locale } from "@/types";
import { t } from "@/lib/translations";
import { StockIcon, MpesaIcon, ReportIcon } from "@/components/ui/Icons";
import { AnimatedDukaShop } from "@/components/ui/Icons";

const testimonials = [
  { name: "Mama Njeri", shop: "Njeri Groceries", location: "Gikomba, Nairobi",
    quote: { en: "DukaManager changed how I run my shop. I know exactly what I sell every day now.", sw: "DukaManager imebadilisha jinsi ninavyoendesha duka langu." } },
  { name: "Hassan Omar", shop: "Omar Hardware", location: "Mombasa",
    quote: { en: "M-Pesa tracking alone saves me hours every week. Best investment for my duka.", sw: "Kufuatilia M-Pesa peke yake kunaniokoa masaa kila wiki." } },
  { name: "Grace Wambui", shop: "Grace Mini Mart", location: "Thika",
    quote: { en: "My staff learned to use it in one day. So simple and the reports are clear.", sw: "Wafanyakazi wangu walijifunza kutumia siku moja tu." } },
];

const benefits = [
  { icon: <StockIcon />, title: { en: "Track Your Stock", sw: "Fuatilia Hesabu Yako" }, desc: { en: "Know exactly what's on your shelves.", sw: "Jua kilicho kwenye rafu zako." } },
  { icon: <MpesaIcon />, title: { en: "M-Pesa Payments", sw: "Malipo ya M-Pesa" }, desc: { en: "Accept M-Pesa, cash, and card payments.", sw: "Kubali malipo ya M-Pesa, pesa, na kadi." } },
  { icon: <ReportIcon />, title: { en: "Daily Reports", sw: "Ripoti za Kila Siku" }, desc: { en: "See your profits at a glance.", sw: "Ona faida zako kwa haraka." } },
];

export default function BrandSection({ locale }: { locale: Locale }) {
  const [idx, setIdx] = useState(0);

  const next = useCallback(() => setIdx((p) => (p + 1) % testimonials.length), []);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <div className="brand-section">
      {/* Logo */}
      <h1 className="brand-section__logo">
        Duka<span className="brand-section__logo-accent">Manager</span>
      </h1>
      <p className="brand-section__tagline">{t("heroSubtitle", locale)}</p>

      {/* Illustration */}
      <div className="brand-section__illustration">
        <AnimatedDukaShop />
      </div>

      {/* Benefits */}
      <div className="brand-section__benefits">
        {benefits.map((b, i) => (
          <div key={i} className="brand-section__benefit">
            <div className="brand-section__benefit-icon">{b.icon}</div>
            <h3 className="brand-section__benefit-title">{b.title[locale]}</h3>
            <p className="brand-section__benefit-desc">{b.desc[locale]}</p>
          </div>
        ))}
      </div>

      {/* Testimonial */}
      <div className="brand-section__testimonial">
        <AnimatePresence mode="wait">
          <motion.div key={idx}
            initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.3 }}
            className="brand-section__testimonial-card">
            <div className="brand-section__testimonial-avatar">
              {testimonials[idx].name.charAt(0)}
            </div>
            <div className="brand-section__testimonial-content">
              <p className="brand-section__testimonial-quote">
                &ldquo;{testimonials[idx].quote[locale]}&rdquo;
              </p>
              <p className="brand-section__testimonial-author">
                {testimonials[idx].name}
                <span className="brand-section__testimonial-meta">
                  {testimonials[idx].shop} &middot; {testimonials[idx].location}
                </span>
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
        <div className="brand-section__testimonial-dots">
          {testimonials.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)}
              className={`brand-section__testimonial-dot ${i === idx ? "brand-section__testimonial-dot--active" : ""}`}
              aria-label={`Testimonial ${i + 1}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
