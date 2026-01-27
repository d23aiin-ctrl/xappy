'use client';

import Link from 'next/link';
import { Header, Footer, Badge } from '@/components';
import { Animated, Stagger, StaggerItem, HoverCard, Accordion, AccordionItem, AccordionTrigger, AccordionContent, motion } from '@/components/ui';
import { ContactForm } from './ContactForm';

const faqs = [
  {
    q: 'What industries do you work with?',
    a: 'We work with government, education, healthcare, BFSI, retail, and media sectors. Our solutions are designed to scale across industries while addressing sector-specific requirements.',
  },
  {
    q: 'How long does a typical AI project take?',
    a: "Project timelines vary based on complexity. A proof-of-concept can be ready in 2-4 weeks, while production-grade systems typically take 2-4 months. We'll provide a detailed timeline after understanding your requirements.",
  },
  {
    q: 'Do you offer ongoing support and maintenance?',
    a: 'Yes, we offer comprehensive support and maintenance packages. All our solutions include monitoring, updates, and technical support to ensure optimal performance.',
  },
  {
    q: 'Can you integrate AI with our existing systems?',
    a: 'Absolutely. We specialize in AI integration with existing systems including CRMs, ERPs, legacy databases, and third-party APIs. Our goal is to enhance your current infrastructure, not replace it.',
  },
  {
    q: 'What is your pricing model?',
    a: 'We offer flexible pricing including fixed-price projects, time-and-materials, and retainer models. Contact us for a custom quote based on your specific requirements and budget.',
  },
];

export default function ContactPage() {
  return (
    <>
      <Header activePage="contact" />

      {/* Page Header */}
      <section className="page-header">
        <div className="container">
          <Animated animation="fadeInUp">
            <h1>Contact Us</h1>
          </Animated>
          <Animated animation="fadeInUp" delay={0.1}>
            <p>Let&apos;s discuss how we can help you build amazing AI solutions.</p>
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
                Contact
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main id="main-content" role="main">
        <section className="section bg-white">
          <div className="container">
            <div className="two-col-section">
              {/* Contact Form */}
              <div className="col-left">
                <Animated animation="fadeInUp">
                  <h2 className="text-2xl font-bold text-text-dark mb-2">Send us a Message</h2>
                </Animated>
                <Animated animation="fadeInUp" delay={0.1}>
                  <p className="text-text-muted mb-8">
                    Fill out the form below and we&apos;ll get back to you within 24 hours.
                  </p>
                </Animated>
                <ContactForm />
              </div>

              {/* Contact Info */}
              <div className="col-right">
                <Animated animation="fadeInRight">
                  <h2 className="text-2xl font-bold text-text-dark mb-2">Get in Touch</h2>
                </Animated>
                <Animated animation="fadeInRight" delay={0.1}>
                  <p className="text-text-muted mb-8">Reach out to us directly or visit our office.</p>
                </Animated>

                <Stagger staggerDelay={0.15}>
                  <StaggerItem>
                    <HoverCard className="info-card">
                      <div className="flex items-start gap-3">
                        <motion.div
                          className="w-12 h-12 bg-gradient-to-br from-primary-blue/10 to-primary-light/15 rounded-xl flex items-center justify-center shrink-0"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ type: 'spring', stiffness: 300 }}
                        >
                          <i className="ri-mail-line text-xl text-primary-blue" />
                        </motion.div>
                        <div>
                          <h4 className="mb-1">Email</h4>
                          <p>
                            <a href="mailto:info@mobirizer.com" className="text-primary-blue hover:text-primary-dark transition-colors">
                              info@mobirizer.com
                            </a>
                          </p>
                        </div>
                      </div>
                    </HoverCard>
                  </StaggerItem>

                  <StaggerItem>
                    <HoverCard className="info-card">
                      <div className="flex items-start gap-3">
                        <motion.div
                          className="w-12 h-12 bg-gradient-to-br from-accent-green/10 to-accent-green-light/15 rounded-xl flex items-center justify-center shrink-0"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ type: 'spring', stiffness: 300 }}
                        >
                          <i className="ri-phone-line text-xl text-accent-green" />
                        </motion.div>
                        <div>
                          <h4 className="mb-1">Phone</h4>
                          <p>
                            <a href="tel:+919810503222" className="text-primary-blue hover:text-primary-dark transition-colors">
                              +91 9810503222
                            </a>
                          </p>
                        </div>
                      </div>
                    </HoverCard>
                  </StaggerItem>

                  <StaggerItem>
                    <HoverCard className="info-card">
                      <div className="flex items-start gap-3">
                        <motion.div
                          className="w-12 h-12 bg-gradient-to-br from-accent-orange/10 to-accent-orange/15 rounded-xl flex items-center justify-center shrink-0"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ type: 'spring', stiffness: 300 }}
                        >
                          <i className="ri-map-pin-line text-xl text-accent-orange" />
                        </motion.div>
                        <div>
                          <h4 className="mb-1">Office Address</h4>
                          <p>
                            At- Bihari Gadh, Post- Bithauli,
                            <br />
                            P.S.- Bhagwanpur, Hajipur,
                            <br />
                            Dist.- Vaishali, Bihar 844114, India
                          </p>
                        </div>
                      </div>
                    </HoverCard>
                  </StaggerItem>

                  <StaggerItem>
                    <HoverCard className="rounded-2xl p-6 mb-4" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
                      <h4 className="text-white text-lg font-semibold mb-3">
                        <i className="ri-time-line mr-2" /> Business Hours
                      </h4>
                      <p className="text-white/90 m-0">
                        Monday - Friday: 9:00 AM - 6:00 PM IST
                        <br />
                        Saturday - Sunday: Closed
                      </p>
                    </HoverCard>
                  </StaggerItem>
                </Stagger>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="section">
          <div className="container">
            <div className="section-header">
              <Animated animation="fadeInUp">
                <Badge icon="ri-question-line">FAQs</Badge>
              </Animated>
              <Animated animation="fadeInUp" delay={0.1}>
                <h2 className="section-title">Frequently Asked Questions</h2>
              </Animated>
              <Animated animation="fadeInUp" delay={0.2}>
                <p className="section-subtitle">Quick answers to common questions.</p>
              </Animated>
            </div>
            <Animated animation="fadeInUp" delay={0.3}>
              <Accordion type="single" collapsible className="content-centered space-y-4">
                {faqs.map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`}>
                    <AccordionTrigger>{faq.q}</AccordionTrigger>
                    <AccordionContent>{faq.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Animated>
          </div>
        </section>
      </main>

      <Footer variant="simple" />
    </>
  );
}
