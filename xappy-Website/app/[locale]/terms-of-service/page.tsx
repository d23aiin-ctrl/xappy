'use client';

import Link from 'next/link';
import { Header, Footer } from '@/components';
import { Animated } from '@/components/ui';

export default function TermsOfServicePage() {
  return (
    <>
      <Header />

      {/* Page Header */}
      <section className="page-header">
        <div className="container">
          <Animated animation="fadeInUp">
            <h1>Terms of Service</h1>
          </Animated>
          <Animated animation="fadeInUp" delay={0.1}>
            <p>Please read these terms carefully before using our services.</p>
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
                Terms of Service
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
                1. Acceptance of Terms
              </h2>
              <p className="text-text-muted leading-relaxed mb-6">
                By accessing and using Mobirizer&apos;s services, you accept and agree to be bound by
                the terms and provisions of this agreement. If you do not agree to abide by these
                terms, please do not use our services.
              </p>

              <h2 className="text-2xl font-bold text-text-dark mt-8 mb-4">
                2. Services Description
              </h2>
              <p className="text-text-muted leading-relaxed mb-6">
                Mobirizer provides AI development services, software products, and related consulting
                services. We reserve the right to modify, suspend, or discontinue any aspect of our
                services at any time without prior notice.
              </p>

              <h2 className="text-2xl font-bold text-text-dark mt-8 mb-4">
                3. User Responsibilities
              </h2>
              <p className="text-text-muted leading-relaxed mb-6">
                You are responsible for maintaining the confidentiality of your account information
                and for all activities that occur under your account. You agree to notify us
                immediately of any unauthorized use of your account.
              </p>

              <h2 className="text-2xl font-bold text-text-dark mt-8 mb-4">
                4. Intellectual Property
              </h2>
              <p className="text-text-muted leading-relaxed mb-6">
                All content, trademarks, and intellectual property on our website and in our products
                are owned by Mobirizer Services Pvt. Ltd. You may not use, reproduce, or distribute
                any content without our express written permission.
              </p>

              <h2 className="text-2xl font-bold text-text-dark mt-8 mb-4">
                5. Limitation of Liability
              </h2>
              <p className="text-text-muted leading-relaxed mb-6">
                Mobirizer shall not be liable for any indirect, incidental, special, consequential,
                or punitive damages resulting from your use of or inability to use our services.
              </p>

              <h2 className="text-2xl font-bold text-text-dark mt-8 mb-4">
                6. Governing Law
              </h2>
              <p className="text-text-muted leading-relaxed mb-6">
                These terms shall be governed by and construed in accordance with the laws of India.
                Any disputes arising under these terms shall be subject to the exclusive jurisdiction
                of the courts in New Delhi, India.
              </p>

              <h2 className="text-2xl font-bold text-text-dark mt-8 mb-4">
                7. Contact Information
              </h2>
              <p className="text-text-muted leading-relaxed mb-4">
                For questions about these Terms of Service, please contact us at:
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
