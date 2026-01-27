'use client';

import Link from 'next/link';
import { Header, Footer, Badge, Button } from '@/components';
import { Animated, Stagger, StaggerItem, HoverCard, Counter, motion } from '@/components/ui';

const features = [
  { icon: 'ri-camera-lens-line', gradient: 'bg-gradient-green', title: 'Photo Recognition', desc: 'Advanced computer vision recognizes handwritten or printed problems from textbooks, worksheets, or the board.' },
  { icon: 'ri-file-list-3-line', gradient: 'bg-gradient-primary', title: 'Step-by-Step Solutions', desc: 'Get detailed explanations for every step, not just the final answer. Understand the "why" behind each solution.' },
  { icon: 'ri-route-line', gradient: 'bg-gradient-orange', title: 'Adaptive Learning', desc: 'AI identifies your strengths and weaknesses, creating personalized practice problems to address knowledge gaps.' },
  { icon: 'ri-book-open-line', gradient: 'bg-gradient-purple', title: 'Multi-Subject Support', desc: 'Covers Math, Physics, Chemistry, Biology, and more. From basic arithmetic to advanced calculus.' },
  { icon: 'ri-bar-chart-2-line', gradient: 'bg-gradient-blue', title: 'Progress Tracking', desc: 'Detailed analytics show learning progress, time spent, and areas that need more attention.' },
  { icon: 'ri-user-voice-line', gradient: 'bg-gradient-pink', title: 'Voice Explanations', desc: 'Listen to explanations in your preferred language for better understanding of complex concepts.' },
];

const subjects = [
  { icon: 'ri-calculator-line', name: 'Mathematics', gradient: 'bg-gradient-blue' },
  { icon: 'ri-flask-line', name: 'Chemistry', gradient: 'bg-gradient-green' },
  { icon: 'ri-lightbulb-flash-line', name: 'Physics', gradient: 'bg-gradient-orange' },
  { icon: 'ri-plant-line', name: 'Biology', gradient: 'bg-gradient-purple' },
  { icon: 'ri-english-input', name: 'English', gradient: 'bg-gradient-pink' },
  { icon: 'ri-translate', name: 'Languages', gradient: 'bg-gradient-teal' },
];

export default function RoboGuruPage() {
  return (
    <>
      <Header activePage="products" />

      {/* Page Header */}
      <section className="page-header bg-gradient-hero">
        <div className="container">
          <Animated animation="fadeInUp">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <i className="ri-graduation-cap-line text-3xl text-white" />
              </div>
              <div>
                <h1 className="mb-1">RoboGuru</h1>
                <p className="m-0 opacity-90">AI-Powered Education Platform</p>
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
              <li className="breadcrumb-item active" aria-current="page">RoboGuru</li>
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
                  <Badge icon="ri-graduation-cap-line" className="mb-4" style={{ background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(74, 222, 128, 0.1) 100%)', color: '#22c55e', borderColor: 'rgba(34, 197, 94, 0.2)' }}>
                    EdTech AI
                  </Badge>
                </Animated>
                <Animated animation="fadeInUp" delay={0.1}>
                  <h2 className="text-3xl md:text-4xl font-bold text-text-dark mb-6">Your Personal AI Tutor</h2>
                </Animated>
                <Animated animation="fadeInUp" delay={0.2}>
                  <p className="text-lg text-text-muted leading-relaxed mb-5">
                    RoboGuru is an intelligent tutoring platform that uses computer vision and AI to help students learn. Simply take a photo of any math, science, or language problem, and get step-by-step solutions instantly.
                  </p>
                </Animated>
                <Animated animation="fadeInUp" delay={0.3}>
                  <p className="text-lg text-text-muted leading-relaxed mb-8">
                    With adaptive learning paths, RoboGuru identifies knowledge gaps and creates personalized study plans to help every student succeed at their own pace.
                  </p>
                </Animated>
                <Animated animation="fadeInUp" delay={0.4}>
                  <div className="flex gap-3 flex-wrap">
                    <Button variant="cta" asChild style={{ background: 'linear-gradient(135deg, #22c55e 0%, #4ade80 100%)' }}>
                      <a href="https://roboguru.in" target="_blank" rel="noopener noreferrer">
                        <span>Try RoboGuru</span>
                        <i className="ri-external-link-line" />
                      </a>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/contact">
                        <span>Enterprise Demo</span>
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
                      { icon: 'ri-camera-line', label: 'Photo-to-Solution' },
                      { value: 10, suffix: '+', label: 'Subjects Covered' },
                      { icon: 'ri-brain-line', label: 'Adaptive Learning' },
                      { text: '24/7', label: 'Available' },
                    ].map((stat, i) => (
                      <StaggerItem key={i}>
                        <HoverCard className="service-card text-center p-7">
                          <div className="text-4xl font-extrabold text-green-500 mb-2">
                            {stat.icon ? (
                              <i className={stat.icon} />
                            ) : stat.text ? (
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
                <h2 className="section-title">How RoboGuru Helps Students</h2>
              </Animated>
              <Animated animation="fadeInUp" delay={0.2}>
                <p className="section-subtitle">Intelligent features designed for effective learning.</p>
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

        {/* Subjects Section */}
        <section className="section bg-white">
          <div className="container">
            <div className="section-header">
              <Animated animation="fadeInUp">
                <Badge icon="ri-book-2-line">Subjects</Badge>
              </Animated>
              <Animated animation="fadeInUp" delay={0.1}>
                <h2 className="section-title">Subjects We Cover</h2>
              </Animated>
              <Animated animation="fadeInUp" delay={0.2}>
                <p className="section-subtitle">Comprehensive coverage across STEM and language subjects.</p>
              </Animated>
            </div>
            <Stagger className="industries-grid" staggerDelay={0.08}>
              {subjects.map((subject, i) => (
                <StaggerItem key={i} className="grid-item">
                  <HoverCard className="service-card text-center py-6 px-4">
                    <motion.div
                      className={`w-14 h-14 ${subject.gradient} rounded-2xl flex items-center justify-center mx-auto mb-3`}
                      whileHover={{ scale: 1.15, rotate: 5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <i className={`${subject.icon} text-2xl text-white`} />
                    </motion.div>
                    <h4 className="text-sm font-semibold text-text-dark">{subject.name}</h4>
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
              <div className="cta-card" style={{ background: 'linear-gradient(135deg, #15803d 0%, #22c55e 100%)' }}>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  Transform Education with AI
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  Partner with us to bring RoboGuru to your school, coaching center, or ed-tech platform.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                >
                  <Button variant="ctaWhite" asChild>
                    <Link href="/contact">
                      <span>Get in Touch</span>
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
