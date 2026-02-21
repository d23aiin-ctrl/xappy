'use client';

import Link from 'next/link';
import { Header, Footer, Badge, Button } from '@/components';
import { Animated, Stagger, StaggerItem, HoverCard, motion } from '@/components/ui';

const features = [
  { icon: 'ri-file-user-line', gradient: 'bg-gradient-teal', title: 'Electronic Health Records', desc: 'Digitize and manage patient health records securely. Access complete medical history, prescriptions, and test results in one place.' },
  { icon: 'ri-calendar-check-line', gradient: 'bg-gradient-primary', title: 'Appointment Management', desc: 'Schedule and manage patient appointments efficiently. Reduce wait times and optimize healthcare facility utilization.' },
  { icon: 'ri-medicine-bottle-line', gradient: 'bg-gradient-green', title: 'Prescription Management', desc: 'Digital prescriptions with drug interaction checks and dosage recommendations. Track medication history and refills.' },
  { icon: 'ri-pie-chart-2-line', gradient: 'bg-gradient-purple', title: 'Health Analytics', desc: 'Data-driven insights for healthcare administrators. Track disease patterns, resource utilization, and treatment outcomes.' },
  { icon: 'ri-building-2-line', gradient: 'bg-gradient-orange', title: 'Multi-Facility Support', desc: 'Manage multiple healthcare facilities from a single dashboard. Centralized data with facility-level access controls.' },
  { icon: 'ri-shield-check-line', gradient: 'bg-gradient-pink', title: 'Data Security & Compliance', desc: 'HIPAA-compliant data storage with encryption, audit trails, and role-based access control for patient data protection.' },
];

const useCases = [
  { icon: 'ri-hospital-line', title: 'Public Health Programs', desc: 'Manage government vaccination drives, maternal health programs, and public health campaigns with patient tracking.' },
  { icon: 'ri-heart-add-line', title: 'Primary Healthcare', desc: 'Support primary healthcare centers with patient registration, basic diagnostics, and referral management.' },
  { icon: 'ri-mental-health-line', title: 'Chronic Disease Management', desc: 'Track and manage patients with chronic conditions like diabetes, hypertension with follow-up reminders.' },
  { icon: 'ri-women-line', title: 'Maternal & Child Health', desc: 'Antenatal care tracking, immunization schedules, and child growth monitoring dashboards.' },
  { icon: 'ri-syringe-line', title: 'Immunization Programs', desc: 'Track vaccination coverage, manage cold chain logistics, and send due date reminders to beneficiaries.' },
  { icon: 'ri-community-line', title: 'Community Health Workers', desc: 'Mobile-first tools for community health workers to register patients and submit health data from the field.' },
];

const statCards = [
  { icon: 'ri-file-list-3-line', label: 'Digital Health Records' },
  { icon: 'ri-user-heart-line', label: 'Patient Management' },
  { icon: 'ri-government-line', label: 'Govt. Healthcare' },
  { icon: 'ri-bar-chart-grouped-line', label: 'Health Analytics' },
];

export default function XappyPage() {
  return (
    <>
      <Header activePage="products" />

      {/* Page Header */}
      <section className="page-header bg-gradient-hero">
        <div className="container">
          <Animated animation="fadeInUp">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <i className="ri-heart-pulse-line text-3xl text-white" />
              </div>
              <div>
                <h1 className="mb-1">Xappy</h1>
                <p className="m-0 opacity-90">Healthcare Management Platform</p>
              </div>
            </div>
          </Animated>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="breadcrumb-wrapper">
        <div className="container">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item"><Link href="/">Home</Link></li>
              <li className="breadcrumb-item"><Link href="/products">Products</Link></li>
              <li className="breadcrumb-item active" aria-current="page">Xappy</li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main id="main-content" role="main">
        {/* Overview Section */}
        <section className="section bg-white">
          <div className="container">
            <div className="two-col-section">
              <div className="col-left">
                <Animated animation="fadeInUp">
                  <Badge icon="ri-hospital-line" className="mb-4" style={{ background: 'linear-gradient(135deg, rgba(8, 145, 178, 0.1) 0%, rgba(34, 211, 238, 0.1) 100%)', color: '#0891b2', borderColor: 'rgba(8, 145, 178, 0.2)' }}>
                    Healthcare Tech
                  </Badge>
                </Animated>
                <Animated animation="fadeInUp" delay={0.1}>
                  <h2 className="text-3xl md:text-4xl font-bold text-text-dark mb-6">Digital Healthcare Infrastructure</h2>
                </Animated>
                <Animated animation="fadeInUp" delay={0.2}>
                  <p className="text-lg text-text-muted leading-relaxed mb-5">
                    Xappy is a comprehensive healthcare management platform designed for government health departments and healthcare institutions. It digitizes patient records, streamlines health services delivery, and enables data-driven healthcare decisions.
                  </p>
                </Animated>
                <Animated animation="fadeInUp" delay={0.3}>
                  <p className="text-lg text-text-muted leading-relaxed mb-8">
                    Currently deployed in Sri Lanka for government healthcare programs, Xappy provides end-to-end patient management, health record digitization, and healthcare analytics capabilities.
                  </p>
                </Animated>
                <Animated animation="fadeInUp" delay={0.4}>
                  <div className="flex gap-3 flex-wrap">
                    <Button variant="cta" asChild style={{ background: 'linear-gradient(135deg, #0891b2 0%, #22d3ee 100%)' }}>
                      <Link href="/contact">
                        <span>Request Demo</span>
                        <i className="ri-arrow-right-line" />
                      </Link>
                    </Button>
                  </div>
                </Animated>
              </div>
              <div className="col-right">
                <Animated animation="fadeInRight" delay={0.3}>
                  <Stagger className="grid grid-cols-2 gap-5" staggerDelay={0.1}>
                    {statCards.map((stat, i) => (
                      <StaggerItem key={i}>
                        <HoverCard className="service-card text-center p-7">
                          <div className="text-4xl font-extrabold text-cyan-600 mb-2">
                            <i className={stat.icon} />
                          </div>
                          <div className="text-text-muted text-sm">{stat.label}</div>
                        </HoverCard>
                      </StaggerItem>
                    ))}
                  </Stagger>
                </Animated>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="section">
          <div className="container">
            <div className="section-header">
              <Animated animation="fadeInUp">
                <Badge icon="ri-star-line">Features</Badge>
              </Animated>
              <Animated animation="fadeInUp" delay={0.1}>
                <h2 className="section-title">Comprehensive Healthcare Solutions</h2>
              </Animated>
              <Animated animation="fadeInUp" delay={0.2}>
                <p className="section-subtitle">Everything healthcare institutions need to go digital.</p>
              </Animated>
            </div>
            <Stagger className="grid-3-col" staggerDelay={0.1}>
              {features.map((feature, i) => (
                <StaggerItem key={i} className="grid-item">
                  <HoverCard className="service-card p-7 h-full">
                    <motion.div
                      className={`w-14 h-14 ${feature.gradient} rounded-2xl flex items-center justify-center mb-5`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <i className={`${feature.icon} text-2xl text-white`} />
                    </motion.div>
                    <h3 className="text-lg font-bold mb-3">{feature.title}</h3>
                    <p className="text-text-muted text-sm leading-relaxed">{feature.desc}</p>
                  </HoverCard>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="section bg-white">
          <div className="container">
            <div className="section-header">
              <Animated animation="fadeInUp">
                <Badge icon="ri-lightbulb-line">Use Cases</Badge>
              </Animated>
              <Animated animation="fadeInUp" delay={0.1}>
                <h2 className="section-title">Healthcare Programs We Support</h2>
              </Animated>
              <Animated animation="fadeInUp" delay={0.2}>
                <p className="section-subtitle">Powering healthcare delivery at scale.</p>
              </Animated>
            </div>
            <Stagger className="grid-3-col" staggerDelay={0.1}>
              {useCases.map((useCase, i) => (
                <StaggerItem key={i} className="grid-item">
                  <HoverCard className="value-card h-full">
                    <h3 className="text-lg">
                      <i className={`${useCase.icon} mr-2 text-cyan-600`} />
                      {useCase.title}
                    </h3>
                    <p className="text-text-muted text-sm">{useCase.desc}</p>
                  </HoverCard>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* Deployment Section */}
        <section className="section">
          <div className="container">
            <div className="section-header">
              <Animated animation="fadeInUp">
                <Badge icon="ri-global-line">Deployments</Badge>
              </Animated>
              <Animated animation="fadeInUp" delay={0.1}>
                <h2 className="section-title">Active Deployments</h2>
              </Animated>
              <Animated animation="fadeInUp" delay={0.2}>
                <p className="section-subtitle">Xappy is deployed for government healthcare programs.</p>
              </Animated>
            </div>
            <Animated animation="scaleIn" delay={0.3}>
              <div className="max-w-xl mx-auto">
                <HoverCard className="service-card text-center p-10">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Flag_of_Sri_Lanka.svg/320px-Flag_of_Sri_Lanka.svg.png"
                    alt="Sri Lanka Flag"
                    className="h-16 mx-auto mb-5 rounded shadow-md"
                  />
                  <h3 className="text-2xl font-bold mb-3">Sri Lanka Healthcare Program</h3>
                  <p className="text-text-muted">
                    Deployed for government healthcare digitization initiative, enabling digital health records and patient management across healthcare facilities.
                  </p>
                </HoverCard>
              </div>
            </Animated>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="container">
            <Animated animation="scaleIn">
              <div className="cta-card" style={{ background: 'linear-gradient(135deg, #0e7490 0%, #0891b2 100%)' }}>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  Transform Healthcare Delivery
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  Let&apos;s discuss how Xappy can help digitize your healthcare programs.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                >
                  <Button variant="ctaWhite" asChild>
                    <Link href="/contact">
                      <span>Request Demo</span>
                      <i className="ri-arrow-right-line" />
                    </Link>
                  </Button>
                </motion.div>
              </div>
            </Animated>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
