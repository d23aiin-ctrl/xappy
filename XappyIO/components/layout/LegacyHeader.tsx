'use client';

import Link from 'next/link';
import { useState } from 'react';

interface LegacyHeaderProps {
  activePage?: 'home' | 'products' | 'solutions' | 'company';
  basePath?: string;
}

export function LegacyHeader({ activePage, basePath = '' }: LegacyHeaderProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const toggleMobileNav = () => {
    setMobileNavOpen(!mobileNavOpen);
  };

  return (
    <>
      {/* Top Bar */}
      <div className="top-bar">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div className="d-flex align-items-center gap-3">
              <span>
                <i className="ri-map-pin-line me-1"></i> Vaishali, Bihar, India
              </span>
              <span className="d-none d-md-inline">
                <i className="ri-mail-line me-1"></i> info@mobirizer.com
              </span>
            </div>
            <div className="d-flex align-items-center gap-3">
              <a href="tel:+919810503222" className="d-none d-md-inline">
                <i className="ri-phone-line me-1"></i> +91 9810503222
              </a>
              <div className="d-flex gap-2">
                <a
                  href="https://www.linkedin.com/company/mobirizer/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                >
                  <i className="ri-linkedin-fill"></i>
                </a>
                <a
                  href="https://twitter.com/mobirizer"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                >
                  <i className="ri-twitter-x-line"></i>
                </a>
                <a
                  href="https://github.com/mobirizer"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                >
                  <i className="ri-github-fill"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header id="page-topbar">
        <div className="container">
          <div className="navbar-header">
            <div className="header-brand">
              <Link href="/" className="brand-logo-img" aria-label="Mobirizer Home">
                <img
                  src="/assets/images/logo.png"
                  alt="Mobirizer Logo"
                  style={{ width: '48px', height: '48px', borderRadius: '12px' }}
                />
              </Link>
              <div className="brand-text">
                <h1>Mobirizer</h1>
                <p>AI Development Studio</p>
              </div>
            </div>
            <nav
              className="main-nav d-none d-lg-flex"
              aria-label="Main navigation"
              style={
                mobileNavOpen
                  ? {
                      display: 'flex',
                      position: 'absolute',
                      top: '72px',
                      left: 0,
                      right: 0,
                      background: '#fff',
                      flexDirection: 'column',
                      padding: '16px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    }
                  : undefined
              }
            >
              <Link href="/" className={activePage === 'home' ? 'active' : ''}>
                Home
              </Link>
              <Link href="/products" className={activePage === 'products' ? 'active' : ''}>
                Products
              </Link>
              <Link href="/solutions" className={activePage === 'solutions' ? 'active' : ''}>
                Solutions
              </Link>
              <Link href="/company" className={activePage === 'company' ? 'active' : ''}>
                Company
              </Link>
            </nav>
            <div className="d-flex align-items-center gap-3">
              <Link href="/contact" className="btn-contact">
                <span>Contact Us</span>
                <i className="ri-arrow-right-line"></i>
              </Link>
              <button
                className="mobile-menu-btn d-lg-none"
                aria-label="Open menu"
                onClick={toggleMobileNav}
              >
                <i className="ri-menu-line"></i>
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
