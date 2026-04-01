"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";

const slides = [
  "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=1920&q=80",
  "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1920&q=80",
  "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=1920&q=80",
  "https://images.unsplash.com/photo-1605218427306-022ba6c3860f?w=1920&q=80",
];

export default function LandingClient() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const revealRefs = useRef<HTMLElement[]>([]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      document.documentElement.classList.contains("is-standalone");
    if (isStandalone) {
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("active");
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
    revealRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const addRevealRef = useCallback((el: HTMLElement | null) => {
    if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el);
  }, []);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`} id="navbar">
        <Link href="/" className="logo">
          <div className="logo-icon">D</div>
          <span className="logo-text">Duka<span>Manager</span></span>
        </Link>

        <ul className="nav-links">
          <li><a href="#features">Features</a></li>
          <li><a href="#how-it-works">How It Works</a></li>
          <li><a href="#pricing">Pricing</a></li>
          <li><a href="#testimonials">Testimonials</a></li>
        </ul>

        <div className="nav-cta">
          <Link href="/login" className="btn btn-outline">Sign In</Link>
          <Link href="/login" className="btn btn-primary">Start Free Trial</Link>
        </div>

        <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
          {mobileMenuOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
          )}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)} />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="mobile-menu-drawer">
              <div className="mobile-menu-header">
                <Link href="/" className="logo" onClick={() => setMobileMenuOpen(false)}>
                  <div className="logo-icon">D</div>
                  <span className="logo-text">Duka<span>Manager</span></span>
                </Link>
                <button className="mobile-menu-close" onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>
              <div className="mobile-menu-links">
                {[
                  { href: "#features", label: "Features" },
                  { href: "#how-it-works", label: "How It Works" },
                  { href: "#pricing", label: "Pricing" },
                  { href: "#testimonials", label: "Testimonials" },
                ].map((item) => (
                  <a key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)} className="mobile-menu-link">{item.label}</a>
                ))}
              </div>
              <div className="mobile-menu-cta">
                <Link href="/login" className="btn btn-outline" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                <Link href="/login" className="btn btn-primary" onClick={() => setMobileMenuOpen(false)}>Start Free Trial</Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg-slider">
          {slides.map((src, i) => (
            <div key={i} className={`hero-slide ${i === currentSlide ? "active" : ""}`} style={{ backgroundImage: `url('${src}')` }} />
          ))}
        </div>

        <div className="hero-content">
          <div className="hero-text">
            <div className="hero-badge animate-fade-in">
              <i className="fas fa-star" />
              <span>Trusted by 500+ Kenyan Shops</span>
            </div>

            <h1 className="animate-fade-in delay-1">
              Run Your <span className="highlight">Duka</span> Like a Pro
            </h1>

            <p className="hero-subtitle animate-fade-in delay-2">
              The complete shop management system built for Kenyan duka owners. Track sales, manage inventory, accept M-Pesa payments, and grow your business—all from your phone.
            </p>

            <div className="hero-stats animate-fade-in delay-3">
              <div className="hero-stat">
                <span className="hero-stat-number">KSh 2M+</span>
                <span className="hero-stat-label">Daily Transactions</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-number">500+</span>
                <span className="hero-stat-label">Active Shops</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-number">98%</span>
                <span className="hero-stat-label">Uptime</span>
              </div>
            </div>

            <div className="hero-cta-group animate-fade-in delay-4">
              <Link href="/login" className="btn btn-primary btn-large">
                <i className="fas fa-rocket" />
                Start Free Trial
              </Link>
              <a href="#how-it-works" className="hero-cta-secondary">
                <i className="fas fa-play-circle" />
                Watch Demo
              </a>
            </div>
          </div>

          <div className="hero-visual animate-fade-in delay-3">
            <div className="phone-mockup">
              <div className="phone-screen">
                <div className="phone-notch" />
                <div className="app-preview">
                  <div className="app-header">
                    <span className="app-logo">DukaManager</span>
                    <i className="fas fa-bell" style={{ color: "var(--dark-gray)" }} />
                  </div>
                  <div className="app-body">
                    <div className="sales-card">
                      <p style={{ fontSize: "0.875rem", color: "var(--medium-gray)", marginBottom: 4 }}>Today&apos;s Sales</p>
                      <div className="sales-amount">KSh 28,500</div>
                      <div className="payment-methods">
                        <span className="payment-badge mpesa">M-Pesa 65%</span>
                        <span className="payment-badge cash">Cash 35%</span>
                      </div>
                    </div>
                    <div className="quick-actions">
                      <div className="quick-btn"><i className="fas fa-shopping-cart" /><span>New Sale</span></div>
                      <div className="quick-btn"><i className="fas fa-box" /><span>Inventory</span></div>
                      <div className="quick-btn"><i className="fas fa-users" /><span>Customers</span></div>
                      <div className="quick-btn"><i className="fas fa-chart-bar" /><span>Reports</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="slide-indicators">
          {slides.map((_, i) => (
            <div key={i} className={`slide-dot ${i === currentSlide ? "active" : ""}`} onClick={() => goToSlide(i)} />
          ))}
        </div>
      </section>

      {/* Trusted By */}
      <section className="trusted-by">
        <div className="trusted-container">
          <p className="trusted-label">Trusted by shop owners across Kenya</p>
          <div className="trusted-logos">
            <span className="trusted-logo">Nairobi Mart</span>
            <span className="trusted-logo">Mombasa Traders</span>
            <span className="trusted-logo">Kisumu Duka</span>
            <span className="trusted-logo">Nakuru Stores</span>
            <span className="trusted-logo">Eldoret Shop</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features" id="features">
        <div className="section-header reveal" ref={addRevealRef}>
          <span className="section-label"><i className="fas fa-sparkles" /> Powerful Features</span>
          <h2 className="section-title">Everything You Need to Run Your Shop</h2>
          <p className="section-subtitle">From sales tracking to inventory management, DukaManager gives you the tools to operate efficiently and grow your business.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card reveal" ref={addRevealRef}>
            <div className="feature-icon"><i className="fas fa-shopping-cart" /></div>
            <h3>Smart Sales Tracking</h3>
            <p>Record sales in seconds with our intuitive cashier portal. Accept M-Pesa, cash, credit, and bank transfers with automatic reconciliation.</p>
            <ul className="feature-list">
              <li><i className="fas fa-check-circle" /> Multiple payment methods</li>
              <li><i className="fas fa-check-circle" /> Real-time sales dashboard</li>
              <li><i className="fas fa-check-circle" /> Automatic receipt printing</li>
              <li><i className="fas fa-check-circle" /> Offline mode support</li>
            </ul>
          </div>

          <div className="feature-card reveal" ref={addRevealRef}>
            <div className="feature-icon"><i className="fas fa-boxes" /></div>
            <h3>Inventory Management</h3>
            <p>Know exactly what&apos;s on your shelves. Get low stock alerts, track product performance, and never run out of your best-selling items.</p>
            <ul className="feature-list">
              <li><i className="fas fa-check-circle" /> Automatic stock alerts</li>
              <li><i className="fas fa-check-circle" /> Product performance analytics</li>
              <li><i className="fas fa-check-circle" /> Barcode scanning support</li>
              <li><i className="fas fa-check-circle" /> Supplier management</li>
            </ul>
          </div>

          <div className="feature-card reveal" ref={addRevealRef}>
            <div className="feature-icon"><i className="fas fa-mobile-alt" /></div>
            <h3>M-Pesa Integration</h3>
            <p>Seamlessly accept M-Pesa payments with automatic STK push notifications. Track every transaction and reconcile your Till seamlessly.</p>
            <ul className="feature-list">
              <li><i className="fas fa-check-circle" /> STK push notifications</li>
              <li><i className="fas fa-check-circle" /> Automatic confirmation</li>
              <li><i className="fas fa-check-circle" /> Till reconciliation</li>
              <li><i className="fas fa-check-circle" /> Failed payment retry</li>
            </ul>
          </div>

          <div className="feature-card reveal" ref={addRevealRef}>
            <div className="feature-icon"><i className="fas fa-users" /></div>
            <h3>Customer Management</h3>
            <p>Build lasting relationships with your customers. Track purchase history, offer credit facilities, and send personalized promotions.</p>
            <ul className="feature-list">
              <li><i className="fas fa-check-circle" /> Customer database</li>
              <li><i className="fas fa-check-circle" /> Credit tracking</li>
              <li><i className="fas fa-check-circle" /> Purchase history</li>
              <li><i className="fas fa-check-circle" /> Loyalty programs</li>
            </ul>
          </div>

          <div className="feature-card reveal" ref={addRevealRef}>
            <div className="feature-icon"><i className="fas fa-chart-line" /></div>
            <h3>Business Analytics</h3>
            <p>Understand your business with powerful reports. Track sales trends, identify top products, and make data-driven decisions.</p>
            <ul className="feature-list">
              <li><i className="fas fa-check-circle" /> Daily, weekly, monthly reports</li>
              <li><i className="fas fa-check-circle" /> Profit &amp; loss statements</li>
              <li><i className="fas fa-check-circle" /> Top product analysis</li>
              <li><i className="fas fa-check-circle" /> Export to Excel/PDF</li>
            </ul>
          </div>

          <div className="feature-card reveal" ref={addRevealRef}>
            <div className="feature-icon"><i className="fas fa-user-shield" /></div>
            <h3>Staff Management</h3>
            <p>Manage your team with role-based access. Track cashier performance, monitor activity logs, and ensure accountability.</p>
            <ul className="feature-list">
              <li><i className="fas fa-check-circle" /> Role-based permissions</li>
              <li><i className="fas fa-check-circle" /> Activity tracking</li>
              <li><i className="fas fa-check-circle" /> Shift management</li>
              <li><i className="fas fa-check-circle" /> Performance analytics</li>
            </ul>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works" id="how-it-works">
        <div className="section-header reveal" ref={addRevealRef}>
          <span className="section-label"><i className="fas fa-magic" /> Simple Setup</span>
          <h2 className="section-title">Get Started in Minutes</h2>
          <p className="section-subtitle">No technical skills required. Set up your shop and start selling in four easy steps.</p>
        </div>

        <div className="steps-container reveal" ref={addRevealRef}>
          <div className="step">
            <div className="step-number">1</div>
            <h3>Create Account</h3>
            <p>Sign up with your business details and verify your shop information. Takes less than 2 minutes.</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Add Products</h3>
            <p>Import your inventory or add products manually. Set prices, stock levels, and categories.</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Set Up Payments</h3>
            <p>Connect your M-Pesa Till and configure payment methods. Start accepting payments immediately.</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Start Selling</h3>
            <p>Train your staff (takes 10 minutes) and start processing sales. Track everything in real-time.</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials" id="testimonials">
        <div className="section-header reveal" ref={addRevealRef}>
          <span className="section-label"><i className="fas fa-heart" /> Customer Love</span>
          <h2 className="section-title">What Shop Owners Say</h2>
          <p className="section-subtitle">Join hundreds of successful duka owners who transformed their business with DukaManager.</p>
        </div>

        <div className="testimonials-grid">
          <div className="testimonial-card reveal" ref={addRevealRef}>
            <div className="testimonial-stars">
              <i className="fas fa-star" /><i className="fas fa-star" /><i className="fas fa-star" /><i className="fas fa-star" /><i className="fas fa-star" />
            </div>
            <p className="testimonial-text">&ldquo;DukaManager changed everything. I used to spend hours counting stock and reconciling M-Pesa. Now it takes minutes. I can finally focus on growing my business.&rdquo;</p>
            <div className="testimonial-author">
              <div className="author-avatar">HW</div>
              <div className="author-info">
                <h4>Hassan Wanjiku</h4>
                <p>Wanjiku&apos;s Shop, Thika</p>
              </div>
            </div>
          </div>

          <div className="testimonial-card reveal" ref={addRevealRef}>
            <div className="testimonial-stars">
              <i className="fas fa-star" /><i className="fas fa-star" /><i className="fas fa-star" /><i className="fas fa-star" /><i className="fas fa-star" />
            </div>
            <p className="testimonial-text">&ldquo;The M-Pesa integration is a game-changer. No more missed payments or reconciliation errors. My cashiers love how easy it is to use.&rdquo;</p>
            <div className="testimonial-author">
              <div className="author-avatar">MO</div>
              <div className="author-info">
                <h4>Mary Ochieng</h4>
                <p>Ochieng Supermarket, Kisumu</p>
              </div>
            </div>
          </div>

          <div className="testimonial-card reveal" ref={addRevealRef}>
            <div className="testimonial-stars">
              <i className="fas fa-star" /><i className="fas fa-star" /><i className="fas fa-star" /><i className="fas fa-star" /><i className="fas fa-star" />
            </div>
            <p className="testimonial-text">&ldquo;I run 3 shops and DukaManager lets me monitor all of them from my phone. I can see sales in real-time and catch issues before they become problems.&rdquo;</p>
            <div className="testimonial-author">
              <div className="author-avatar">JK</div>
              <div className="author-info">
                <h4>James Kimani</h4>
                <p>Kimani Retail Group, Nairobi</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="pricing" id="pricing">
        <div className="section-header reveal" ref={addRevealRef}>
          <span className="section-label"><i className="fas fa-tag" /> Simple Pricing</span>
          <h2 className="section-title">Choose Your Plan</h2>
          <p className="section-subtitle">Start free and scale as you grow. No hidden fees, no long-term contracts.</p>
        </div>

        <div className="pricing-grid reveal" ref={addRevealRef}>
          <div className="pricing-card">
            <div className="pricing-header">
              <h3 className="pricing-name">Starter</h3>
              <p className="pricing-description">Perfect for small shops just getting started</p>
            </div>
            <div className="pricing-price">
              <span className="price-amount">Free</span>
              <span className="price-period">forever</span>
            </div>
            <ul className="pricing-features">
              <li><i className="fas fa-check" /> 1 shop location</li>
              <li><i className="fas fa-check" /> 100 products</li>
              <li><i className="fas fa-check" /> 1 cashier account</li>
              <li><i className="fas fa-check" /> Basic sales reports</li>
              <li><i className="fas fa-check" /> M-Pesa integration</li>
              <li className="not-included"><i className="fas fa-times" /> Credit management</li>
              <li className="not-included"><i className="fas fa-times" /> Advanced analytics</li>
            </ul>
            <Link href="/login" className="btn btn-outline pricing-cta">Get Started Free</Link>
          </div>

          <div className="pricing-card featured">
            <div className="pricing-header">
              <h3 className="pricing-name">Growth</h3>
              <p className="pricing-description">For growing shops ready to scale</p>
            </div>
            <div className="pricing-price">
              <span className="price-amount">KSh 2,999</span>
              <span className="price-period">/month</span>
            </div>
            <ul className="pricing-features">
              <li><i className="fas fa-check" /> 3 shop locations</li>
              <li><i className="fas fa-check" /> Unlimited products</li>
              <li><i className="fas fa-check" /> 10 cashier accounts</li>
              <li><i className="fas fa-check" /> Advanced reports</li>
              <li><i className="fas fa-check" /> M-Pesa integration</li>
              <li><i className="fas fa-check" /> Credit management</li>
              <li><i className="fas fa-check" /> Priority support</li>
            </ul>
            <Link href="/login" className="btn btn-primary pricing-cta">Start 14-Day Trial</Link>
          </div>

          <div className="pricing-card">
            <div className="pricing-header">
              <h3 className="pricing-name">Enterprise</h3>
              <p className="pricing-description">For multi-shop businesses and chains</p>
            </div>
            <div className="pricing-price">
              <span className="price-amount">KSh 9,999</span>
              <span className="price-period">/month</span>
            </div>
            <ul className="pricing-features">
              <li><i className="fas fa-check" /> Unlimited shops</li>
              <li><i className="fas fa-check" /> Unlimited products</li>
              <li><i className="fas fa-check" /> Unlimited cashiers</li>
              <li><i className="fas fa-check" /> Custom reports</li>
              <li><i className="fas fa-check" /> API access</li>
              <li><i className="fas fa-check" /> Dedicated account manager</li>
              <li><i className="fas fa-check" /> 24/7 phone support</li>
            </ul>
            <Link href="/login" className="btn btn-outline pricing-cta">Contact Sales</Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content reveal" ref={addRevealRef}>
          <h2>Ready to Transform Your Shop?</h2>
          <p>Join 500+ successful duka owners who trust DukaManager. Start your free trial today—no credit card required.</p>
          <Link href="/login" className="btn btn-white btn-large">
            <i className="fas fa-rocket" />
            Start Free Trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href="/" className="logo">
              <div className="logo-icon">D</div>
              <span className="logo-text" style={{ color: "white" }}>Duka<span style={{ color: "var(--savanna-gold)" }}>Manager</span></span>
            </Link>
            <p>The complete shop management system built for Kenyan duka owners. Run your business like a pro.</p>
            <div className="footer-social">
              <a href="#" className="social-link"><i className="fab fa-facebook-f" /></a>
              <a href="#" className="social-link"><i className="fab fa-twitter" /></a>
              <a href="#" className="social-link"><i className="fab fa-instagram" /></a>
              <a href="#" className="social-link"><i className="fab fa-whatsapp" /></a>
            </div>
          </div>

          <div className="footer-links">
            <h4>Product</h4>
            <ul>
              <li><a href="#">Features</a></li>
              <li><a href="#">Pricing</a></li>
              <li><a href="#">Integrations</a></li>
              <li><a href="#">Updates</a></li>
            </ul>
          </div>

          <div className="footer-links">
            <h4>Resources</h4>
            <ul>
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Video Tutorials</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Community</a></li>
            </ul>
          </div>

          <div className="footer-links">
            <h4>Company</h4>
            <ul>
              <li><a href="#">About Us</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Contact</a></li>
              <li><a href="#">Partners</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2024 DukaManager. All rights reserved.</p>
          <p>Made with <i className="fas fa-heart" style={{ color: "var(--terracotta)" }} /> in Nairobi, Kenya</p>
        </div>
      </footer>
    </div>
  );
}
