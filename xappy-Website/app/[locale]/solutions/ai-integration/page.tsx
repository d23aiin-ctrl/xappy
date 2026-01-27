'use client';

import Link from 'next/link';
import { Header, Footer, Badge, Button } from '@/components';
import { Animated, Stagger, StaggerItem, HoverCard, Counter, motion } from '@/components/ui';

const features = [
  { icon: 'ri-api-fill', title: 'API Development', desc: 'Custom REST and GraphQL APIs that expose AI capabilities to your applications with proper authentication and rate limiting.' },
  { icon: 'ri-database-line', title: 'Database Integration', desc: 'Connect AI to PostgreSQL, MongoDB, MySQL, and other databases. Enable intelligent queries and data analysis.' },
  { icon: 'ri-building-2-line', title: 'Legacy System Modernization', desc: 'Add AI capabilities to existing systems without full rewrites. Gradual modernization that minimizes risk.' },
  { icon: 'ri-flow-chart', title: 'Data Pipelines', desc: 'Automated ETL workflows that prepare your data for AI training and inference at scale.' },
  { icon: 'ri-cloud-line', title: 'Cloud Deployment', desc: 'Deploy on AWS, GCP, Azure, or on-premise. We optimize for cost, latency, and compliance requirements.' },
  { icon: 'ri-bar-chart-box-line', title: 'Monitoring & Observability', desc: 'Real-time dashboards, alerting, and logging to ensure your AI systems run reliably in production.' },
];

const integrations = [
  { name: 'Salesforce', icon: 'ri-cloud-line', color: '#00a1e0' },
  { name: 'SAP', icon: 'ri-stack-line', color: '#0070f2' },
  { name: 'HubSpot', icon: 'ri-radar-line', color: '#ff7a59' },
  { name: 'Slack', icon: 'ri-slack-line', color: '#4a154b' },
  { name: 'Zendesk', icon: 'ri-customer-service-line', color: '#03363d' },
  { name: 'Jira', icon: 'ri-task-line', color: '#0052cc' },
];

const process = [
  { num: 1, title: 'Discovery', desc: 'Audit existing systems and identify integration points', icon: 'ri-search-eye-line' },
  { num: 2, title: 'Architecture', desc: 'Design secure, scalable integration architecture', icon: 'ri-layout-grid-line' },
  { num: 3, title: 'Development', desc: 'Build APIs, connectors, and data pipelines', icon: 'ri-code-s-slash-line' },
  { num: 4, title: 'Deployment', desc: 'Deploy with monitoring, testing, and rollback plans', icon: 'ri-rocket-line' },
];

export default function AIIntegrationPage() {
  return (
    <>
      <Header activePage="solutions" />

      {/* Page Header */}
      <section className="page-header" style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #c084fc 100%)' }}>
        <div className="container">
          <Animated animation="fadeInUp">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <i className="ri-plug-line text-3xl text-white" />
              </div>
              <div>
                <h1 className="mb-1">AI Integration</h1>
                <p className="m-0 opacity-90">Connect AI to Your Systems</p>
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
              <li className="breadcrumb-item"><Link href="/solutions">Solutions</Link></li>
              <li className="breadcrumb-item active" aria-current="page">AI Integration</li>
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
                  <Badge icon="ri-plug-line" className="mb-4" style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(192, 132, 252, 0.1) 100%)', color: '#a855f7', borderColor: 'rgba(168, 85, 247, 0.2)' }}>
                    Seamless Connection
                  </Badge>
                </Animated>
                <Animated animation="fadeInUp" delay={0.1}>
                  <h2 className="text-3xl md:text-4xl font-bold text-text-dark mb-6">AI That Fits Your Stack</h2>
                </Animated>
                <Animated animation="fadeInUp" delay={0.2}>
                  <p className="text-lg text-text-muted leading-relaxed mb-5">
                    Don&apos;t rip and replace. We integrate AI capabilities into your existing systems—CRMs, ERPs, databases, and custom applications—without disrupting your current operations.
                  </p>
                </Animated>
                <Animated animation="fadeInUp" delay={0.3}>
                  <p className="text-lg text-text-muted leading-relaxed mb-8">
                    Our integration specialists have connected AI to legacy mainframes, modern SaaS platforms, and everything in between. We know how to navigate complex enterprise architectures.
                  </p>
                </Animated>
                <Animated animation="fadeInUp" delay={0.4}>
                  <div className="flex gap-3 flex-wrap">
                    <Button variant="cta" asChild style={{ background: 'linear-gradient(135deg, #a855f7 0%, #c084fc 100%)' }}>
                      <Link href="/contact">
                        <span>Discuss Integration</span>
                        <i className="ri-arrow-right-line" />
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/solutions">
                        <span>All Solutions</span>
                        <i className="ri-arrow-right-line" />
                      </Link>
                    </Button>
                  </div>
                </Animated>
              </div>
              <div className="col-right">
                <Animated animation="fadeInRight" delay={0.3}>
                  <Stagger className="grid grid-cols-2 gap-5" staggerDelay={0.1}>
                    {[
                      { value: 50, suffix: '+', label: 'Integrations Built' },
                      { value: 99.9, suffix: '%', label: 'Uptime SLA' },
                      { icon: 'ri-shield-check-line', label: 'Enterprise Security' },
                      { icon: 'ri-time-line', label: 'Real-Time Sync' },
                    ].map((stat, i) => (
                      <StaggerItem key={i}>
                        <HoverCard className="service-card text-center p-7">
                          <div className="text-4xl font-extrabold text-purple-500 mb-2">
                            {stat.icon ? (
                              <i className={stat.icon} />
                            ) : (
                              <Counter from={0} to={stat.value as number} duration={2} suffix={stat.suffix} />
                            )}
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
                <Badge icon="ri-star-line">Capabilities</Badge>
              </Animated>
              <Animated animation="fadeInUp" delay={0.1}>
                <h2 className="section-title">Integration Services</h2>
              </Animated>
              <Animated animation="fadeInUp" delay={0.2}>
                <p className="section-subtitle">End-to-end integration expertise for any environment</p>
              </Animated>
            </div>
            <Stagger className="grid-3-col" staggerDelay={0.1}>
              {features.map((feature, i) => (
                <StaggerItem key={i} className="grid-item">
                  <HoverCard className="service-card p-7 h-full">
                    <motion.div
                      className="w-14 h-14 bg-gradient-purple rounded-2xl flex items-center justify-center mb-5"
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

        {/* Popular Integrations */}
        <section className="section bg-white">
          <div className="container">
            <div className="section-header">
              <Animated animation="fadeInUp">
                <Badge icon="ri-apps-2-line">Popular Integrations</Badge>
              </Animated>
              <Animated animation="fadeInUp" delay={0.1}>
                <h2 className="section-title">Systems We Connect</h2>
              </Animated>
              <Animated animation="fadeInUp" delay={0.2}>
                <p className="section-subtitle">Pre-built connectors and custom integrations for leading platforms</p>
              </Animated>
            </div>
            <Stagger className="industries-grid" staggerDelay={0.08}>
              {integrations.map((integration, i) => (
                <StaggerItem key={i} className="grid-item">
                  <HoverCard className="service-card hover-lift text-center py-6 px-4">
                    <motion.div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                      style={{ background: `${integration.color}20` }}
                      whileHover={{ scale: 1.15, rotate: 5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <i className={`${integration.icon} text-2xl`} style={{ color: integration.color }} />
                    </motion.div>
                    <h4 className="text-sm font-semibold text-text-dark">{integration.name}</h4>
                  </HoverCard>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* Process Section */}
        <section className="section" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)' }}>
          <div className="container">
            <div className="section-header">
              <Animated animation="fadeInUp">
                <Badge icon="ri-flow-chart" variant="white">Our Process</Badge>
              </Animated>
              <Animated animation="fadeInUp" delay={0.1}>
                <h2 className="section-title text-white">How We Integrate</h2>
              </Animated>
            </div>
            <Stagger className="grid-4-col" staggerDelay={0.1}>
              {process.map((step) => (
                <StaggerItem key={step.num} className="grid-item">
                  <div className="relative h-full p-8 rounded-2xl border border-white/10" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
                    <div className="absolute top-6 right-6 w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg font-bold bg-gradient-purple">
                      {step.num}
                    </div>
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5" style={{ background: 'rgba(168, 85, 247, 0.2)' }}>
                      <i className={`${step.icon} text-3xl text-purple-300`} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                    <p className="text-sm text-white/70 leading-relaxed m-0">{step.desc}</p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="container">
            <Animated animation="scaleIn">
              <div className="cta-card" style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)' }}>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  Let&apos;s Connect Your Systems
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  Tell us about your tech stack. We&apos;ll design an integration strategy that works.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                >
                  <Button variant="ctaWhite" asChild>
                    <Link href="/contact">
                      <span>Schedule Technical Call</span>
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
