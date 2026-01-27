'use client';

import Link from 'next/link';
import { Header, Footer, Badge, Button } from '@/components';
import { Animated, Stagger, StaggerItem, HoverCard, Counter, motion } from '@/components/ui';

const features = [
  { icon: 'ri-whatsapp-line', gradient: 'bg-gradient-whatsapp', title: '24/7 WhatsApp Bot', desc: 'Automated responses to citizen queries round the clock. Handle thousands of messages without lifting a finger.' },
  { icon: 'ri-translate-2', gradient: 'bg-gradient-primary', title: '6 Regional Languages', desc: 'Communicate with constituents in Hindi, Bhojpuri, Maithili, English, and more regional languages they are comfortable with.' },
  { icon: 'ri-mic-line', gradient: 'bg-gradient-purple', title: 'Voice Message Support', desc: 'Citizens can send voice messages in their language. AI transcribes, understands, and responds appropriately.' },
  { icon: 'ri-file-list-3-line', gradient: 'bg-gradient-orange', title: 'Grievance Management', desc: 'Track, categorize, and resolve citizen complaints efficiently. Never lose track of a single grievance.' },
  { icon: 'ri-user-star-line', gradient: 'bg-gradient-blue', title: 'Public Profile Page', desc: 'Professional digital presence with bio, photo gallery, videos, press coverage, and achievements - all in one place.' },
  { icon: 'ri-bar-chart-box-line', gradient: 'bg-gradient-pink', title: 'Analytics Dashboard', desc: 'Track issues by area, sentiment analysis, response metrics, and constituent engagement patterns.' },
];

const problems = [
  { icon: 'ri-user-unfollow-line', title: 'Citizen Disconnection', desc: 'Citizens feel disconnected from their representatives. JanSeva creates a direct, always-available communication channel.' },
  { icon: 'ri-time-line', title: 'Time Constraints', desc: 'Impossible to respond to every citizen individually. AI automation handles routine queries, freeing your time for governance.' },
  { icon: 'ri-eye-off-line', title: 'Lack of Visibility', desc: 'Your work and achievements are not reaching constituents. Public profile showcases your accomplishments prominently.' },
  { icon: 'ri-spam-2-line', title: 'Misinformation', desc: 'False information spreads quickly. Direct communication channel helps counter misinformation with facts.' },
];

const leaders = [
  { icon: 'ri-government-fill', title: 'MPs', gradient: 'from-red-600 to-red-400' },
  { icon: 'ri-building-2-fill', title: 'MLAs', gradient: 'from-orange-500 to-orange-400' },
  { icon: 'ri-community-fill', title: 'Councillors', gradient: 'from-green-500 to-green-400' },
  { icon: 'ri-home-gear-fill', title: 'Panchayat', gradient: 'from-blue-500 to-blue-400' },
  { icon: 'ri-team-fill', title: 'Party Leaders', gradient: 'from-purple-500 to-purple-400' },
];

export default function JanSevaPage() {
  return (
    <>
      <Header activePage="products" />

      {/* Page Header */}
      <section className="page-header bg-gradient-hero">
        <div className="container">
          <Animated animation="fadeInUp">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <i className="ri-government-line text-3xl text-white" />
              </div>
              <div>
                <h1 className="mb-1">JanSeva</h1>
                <p className="m-0 opacity-90">AI Citizen Engagement Platform</p>
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
              <li className="breadcrumb-item active" aria-current="page">JanSeva</li>
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
                  <Badge icon="ri-government-line" className="mb-4" style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(248, 113, 113, 0.15) 100%)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                    GovTech AI
                  </Badge>
                </Animated>
                <Animated animation="fadeInUp" delay={0.1}>
                  <h2 className="text-3xl md:text-4xl font-bold text-text-dark mb-6">Connect with Every Citizen, Automatically</h2>
                </Animated>
                <Animated animation="fadeInUp" delay={0.2}>
                  <p className="text-lg text-text-muted leading-relaxed mb-5">
                    JanSeva is an AI-powered engagement platform designed for elected representatives - MPs, MLAs, and panchayat members. It automates citizen interactions via WhatsApp, enabling you to respond to grievances, share updates, and build your digital presence 24/7.
                  </p>
                </Animated>
                <Animated animation="fadeInUp" delay={0.3}>
                  <p className="text-lg text-text-muted leading-relaxed mb-8">
                    No technical expertise needed. JanSeva handles thousands of messages automatically in 6 regional languages, with voice message support. Focus on governance while AI handles constituent communications.
                  </p>
                </Animated>
                <Animated animation="fadeInUp" delay={0.4}>
                  <div className="flex gap-3 flex-wrap">
                    <Button variant="cta" asChild style={{ background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)' }}>
                      <a href="https://janseva.site" target="_blank" rel="noopener noreferrer">
                        <span>Visit JanSeva</span>
                        <i className="ri-external-link-line" />
                      </a>
                    </Button>
                    <Button variant="outline" asChild>
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
                    {[
                      { text: '<2hrs', label: 'Response Time' },
                      { value: 95, suffix: '%', label: 'Resolution Rate' },
                      { value: 1000, suffix: '+', label: 'Daily Interactions' },
                      { value: 6, suffix: '', label: 'Regional Languages' },
                    ].map((stat, i) => (
                      <StaggerItem key={i}>
                        <HoverCard className="service-card text-center p-7">
                          <div className="text-4xl font-extrabold text-red-500 mb-2">
                            {stat.text ? (
                              stat.text
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
                <Badge icon="ri-star-line">Features</Badge>
              </Animated>
              <Animated animation="fadeInUp" delay={0.1}>
                <h2 className="section-title">Everything You Need to Engage Citizens</h2>
              </Animated>
              <Animated animation="fadeInUp" delay={0.2}>
                <p className="section-subtitle">Powerful tools designed for busy elected representatives.</p>
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

        {/* Problems Solved Section */}
        <section className="section bg-white">
          <div className="container">
            <div className="section-header">
              <Animated animation="fadeInUp">
                <Badge icon="ri-lightbulb-line">Problems Solved</Badge>
              </Animated>
              <Animated animation="fadeInUp" delay={0.1}>
                <h2 className="section-title">Challenges JanSeva Addresses</h2>
              </Animated>
              <Animated animation="fadeInUp" delay={0.2}>
                <p className="section-subtitle">Common issues faced by elected representatives, solved with AI.</p>
              </Animated>
            </div>
            <Stagger className="grid grid-cols-1 md:grid-cols-2 gap-6" staggerDelay={0.1}>
              {problems.map((problem, i) => (
                <StaggerItem key={i}>
                  <HoverCard className="value-card h-full">
                    <h3 className="text-lg">
                      <i className={`${problem.icon} mr-2 text-red-500`} />
                      {problem.title}
                    </h3>
                    <p className="text-text-muted text-sm">{problem.desc}</p>
                  </HoverCard>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* For Whom Section */}
        <section className="section">
          <div className="container">
            <div className="section-header">
              <Animated animation="fadeInUp">
                <Badge icon="ri-user-3-line">For Whom</Badge>
              </Animated>
              <Animated animation="fadeInUp" delay={0.1}>
                <h2 className="section-title">Built for Elected Representatives</h2>
              </Animated>
              <Animated animation="fadeInUp" delay={0.2}>
                <p className="section-subtitle">JanSeva serves leaders at every level of governance.</p>
              </Animated>
            </div>
            <Stagger className="flex flex-wrap gap-6 justify-center" staggerDelay={0.08}>
              {leaders.map((leader, i) => (
                <StaggerItem key={i}>
                  <HoverCard className="service-card text-center py-6 px-6 min-w-[130px]">
                    <motion.div
                      className={`w-16 h-16 bg-gradient-to-br ${leader.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4`}
                      whileHover={{ scale: 1.15, rotate: 5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <i className={`${leader.icon} text-2xl text-white`} />
                    </motion.div>
                    <h4 className="text-sm font-semibold text-text-dark m-0">{leader.title}</h4>
                  </HoverCard>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="container">
            <Animated animation="scaleIn">
              <div className="cta-card" style={{ background: 'linear-gradient(135deg, #b91c1c 0%, #ef4444 100%)' }}>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  Ready to Transform Citizen Engagement?
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  Join elected representatives who are building stronger connections with their constituents using AI.
                </motion.p>
                <motion.div
                  className="flex gap-3 justify-center flex-wrap"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                >
                  <Button variant="ctaWhite" asChild>
                    <a href="https://janseva.site" target="_blank" rel="noopener noreferrer">
                      <span>Visit JanSeva</span>
                      <i className="ri-external-link-line" />
                    </a>
                  </Button>
                  <Button variant="ghost" asChild>
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
