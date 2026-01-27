'use client';

import Link from 'next/link';
import { Header, Footer } from '@/components';
import { Animated } from '@/components/ui';

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />

      {/* Page Header */}
      <section className="page-header">
        <div className="container">
          <Animated animation="fadeInUp">
            <h1>Privacy Policy</h1>
          </Animated>
          <Animated animation="fadeInUp" delay={0.1}>
            <p>How we collect, use, and protect your data.</p>
          </Animated>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="breadcrumb-wrapper">
        <div className="container">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link href="/">Home</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Privacy Policy
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main id="main-content" role="main">
        <section className="section bg-white">
          <div className="container">
            <div className="max-w-3xl mx-auto">
              <p className="text-text-muted mb-6">
                <strong>Last updated:</strong> January 1, 2025
              </p>

              <h2 className="text-2xl font-bold text-text-dark mt-8 mb-4">
                1. Information We Collect
              </h2>
              <p className="text-text-muted leading-relaxed mb-6">
                We collect information you provide directly to us, such as when you create an account,
                make a purchase, contact us, or otherwise communicate with us. This may include your
                name, email address, phone number, and company information.
              </p>

              <h2 className="text-2xl font-bold text-text-dark mt-8 mb-4">
                2. How We Use Your Information
              </h2>
              <p className="text-text-muted leading-relaxed mb-6">
                We use the information we collect to provide, maintain, and improve our services,
                process transactions, send you technical notices and support messages, and respond
                to your comments and questions.
              </p>

              <h2 className="text-2xl font-bold text-text-dark mt-8 mb-4">
                3. Information Sharing
              </h2>
              <p className="text-text-muted leading-relaxed mb-6">
                We do not sell, trade, or rent your personal identification information to others.
                We may share generic aggregated demographic information not linked to any personal
                identification information regarding visitors and users with our business partners.
              </p>

              <h2 className="text-2xl font-bold text-text-dark mt-8 mb-4">
                4. Data Security
              </h2>
              <p className="text-text-muted leading-relaxed mb-6">
                We adopt appropriate data collection, storage, and processing practices and security
                measures to protect against unauthorized access, alteration, disclosure, or
                destruction of your personal information.
              </p>

              <h2 className="text-2xl font-bold text-text-dark mt-8 mb-4">
                5. Your Rights
              </h2>
              <p className="text-text-muted leading-relaxed mb-6">
                You have the right to access, correct, or delete your personal information. You may
                also object to or restrict certain processing of your information. To exercise these
                rights, please contact us at info@mobirizer.com.
              </p>

              <h2 className="text-2xl font-bold text-text-dark mt-8 mb-4">
                6. Contact Us
              </h2>
              <p className="text-text-muted leading-relaxed mb-4">
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <div className="bg-bg-light rounded-2xl p-6">
                <p className="text-text-muted m-0">
                  <strong className="text-text-dark">Email:</strong> info@mobirizer.com<br />
                  <strong className="text-text-dark">Phone:</strong> +91 9810503222<br />
                  <strong className="text-text-dark">Address:</strong> At- Bihari Gadh, Post- Bithauli, P.S.- Bhagwanpur, Hajipur,
                  Dist.- Vaishali, Bihar 844114, India
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer variant="simple" />
    </>
  );
}
