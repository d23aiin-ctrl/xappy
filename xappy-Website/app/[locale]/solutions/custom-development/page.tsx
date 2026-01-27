'use client';

import Link from 'next/link';
import { Header, Footer, Badge, Button } from '@/components';
import { Animated, Stagger, StaggerItem, HoverCard, Counter, motion } from '@/components/ui';

const features = [
  { icon: 'ri-brain-line', title: 'Custom Model Training', desc: 'Train models on your proprietary data for domain-specific tasks. From classification to generation, we build what you need.' },
  { icon: 'ri-settings-3-line', title: 'Fine-Tuning & RAG', desc: 'Customize pre-trained models with your data using fine-tuning or retrieval-augmented generation (RAG) approaches.' },
  { icon: 'ri-git-merge-line', title: 'MLOps & CI/CD', desc: 'Automated pipelines for model training, testing, deployment, and monitoring. Production-grade ML infrastructure.' },
  { icon: 'ri-computer-line', title: 'Edge Deployment', desc: 'Deploy AI models on edge devices, mobile phones, or IoT hardware with optimized inference.' },
  { icon: 'ri-database-2-line', title: 'Data Engineering', desc: 'Data collection, cleaning, labeling, and pipeline setup. We prepare your data for AI success.' },
  { icon: 'ri-service-line', title: 'Ongoing Support', desc: 'Model monitoring, retraining, and optimization. We keep your AI systems performing at their best.' },
];

const industries = [
  { name: 'Healthcare', icon: 'ri-heart-pulse-line', desc: 'Medical imaging, diagnostics, patient monitoring', color: '#ec4899' },
  { name: 'Finance', icon: 'ri-bank-line', desc: 'Fraud detection, risk assessment, trading', color: '#f59e0b' },
  { name: 'Manufacturing', icon: 'ri-settings-line', desc: 'Quality control, predictive maintenance', color: '#6366f1' },
  { name: 'Retail', icon: 'ri-store-line', desc: 'Demand forecasting, personalization', color: '#22c55e' },
];

const techStack = [
  { name: 'PyTorch', desc: 'Deep Learning' },
  { name: 'TensorFlow', desc: 'ML Framework' },
  { name: 'Hugging Face', desc: 'Transformers' },
  { name: 'AWS SageMaker', desc: 'ML Platform' },
  { name: 'MLflow', desc: 'MLOps' },
  { name: 'Kubernetes', desc: 'Orchestration' },
];

const process = [
  { num: 1, title: 'Requirements', desc: 'Define objectives, success metrics, and constraints', icon: 'ri-file-list-3-line', color: '#6366f1' },
  { num: 2, title: 'Data Strategy', desc: 'Assess data quality, plan collection and labeling', icon: 'ri-database-line', color: '#22c55e' },
  { num: 3, title: 'Development', desc: 'Build, train, and validate models iteratively', icon: 'ri-code-s-slash-line', color: '#f59e0b' },
  { num: 4, title: 'Production', desc: 'Deploy, monitor, and continuously improve', icon: 'ri-rocket-2-line', color: '#ec4899' },
];

export default function CustomDevelopmentPage() {
  return (
    <>
      <Header activePage="solutions" />

      {/* Page Header */}
      <section className="page-header" style={{ background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 50%, #fbbf24 100%)' }}>
        <div className="container">
          <Animated animation="fadeInUp">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <i className="ri-code-s-slash-line text-3xl text-white" />
              </div>
              <div>
                <h1 className="mb-1">Custom Development</h1>
                <p className="m-0 opacity-90">Tailored AI Solutions</p>
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
              <li className="breadcrumb-item active" aria-current="page">Custom Development</li>
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
                  <Badge icon="ri-tools-line" className="mb-4" style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(251, 191, 36, 0.1) 100%)', color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.2)' }}>
                    Bespoke Solutions
                  </Badge>
                </Animated>
                <Animated animation="fadeInUp" delay={0.1}>
                  <h2 className="text-3xl md:text-4xl font-bold text-text-dark mb-6">Your Vision, Our Expertise</h2>
                </Animated>
                <Animated animation="fadeInUp" delay={0.2}>
                  <p className="text-lg text-text-muted leading-relaxed mb-5">
                    When off-the-shelf solutions don&apos;t fit, we build custom. From computer vision to NLP, from recommendation engines to predictive analytics—we develop AI solutions tailored to your exact requirements.
                  </p>
                </Animated>
                <Animated animation="fadeInUp" delay={0.3}>
                  <p className="text-lg text-text-muted leading-relaxed mb-8">
                    Our team handles the complete AI lifecycle: data collection, model development, deployment, and ongoing optimization. You own the IP, we provide the expertise.
                  </p>
                </Animated>
                <Animated animation="fadeInUp" delay={0.4}>
                  <div className="flex gap-3 flex-wrap">
                    <Button variant="cta" asChild style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)' }}>
                      <Link href="/contact">
                        <span>Start Your Project</span>
                        <i className="ri-arrow-right-line" />
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/products">
                        <span>View Our Products</span>
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
                      { value: 100, suffix: '+', label: 'Custom Models Built' },
                      { value: 10, suffix: '+', label: 'Years Experience' },
                      { icon: 'ri-award-line', label: 'Full IP Ownership' },
                      { icon: 'ri-refresh-line', label: 'Continuous Support' },
                    ].map((stat, i) => (
                      <StaggerItem key={i}>
                        <HoverCard className="service-card text-center p-7">
                          <div className="text-4xl font-extrabold text-amber-500 mb-2">
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
                <Badge icon="ri-star-line">What We Build</Badge>
              </Animated>
              <Animated animation="fadeInUp" delay={0.1}>
                <h2 className="section-title">Development Services</h2>
              </Animated>
              <Animated animation="fadeInUp" delay={0.2}>
                <p className="section-subtitle">End-to-end custom AI development capabilities</p>
              </Animated>
            </div>
            <Stagger className="grid-3-col" staggerDelay={0.1}>
              {features.map((feature, i) => (
                <StaggerItem key={i} className="grid-item">
                  <HoverCard className="service-card p-7 h-full">
                    <motion.div
                      className="w-14 h-14 bg-gradient-orange rounded-2xl flex items-center justify-center mb-5"
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

        {/* Industry Solutions */}
        <section className="section bg-white">
          <div className="container">
            <div className="section-header">
              <Animated animation="fadeInUp">
                <Badge icon="ri-building-2-line">Industry Solutions</Badge>
              </Animated>
              <Animated animation="fadeInUp" delay={0.1}>
                <h2 className="section-title">Domain Expertise</h2>
              </Animated>
              <Animated animation="fadeInUp" delay={0.2}>
                <p className="section-subtitle">Custom AI solutions across key industries</p>
              </Animated>
            </div>
            <Stagger className="grid-2-col" staggerDelay={0.15}>
              {industries.map((industry, i) => (
                <StaggerItem key={i} className="grid-item">
                  <HoverCard className="service-card p-8 h-full">
                    <div className="flex items-start gap-5">
                      <motion.div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${industry.color}20` }}
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <i className={`${industry.icon} text-2xl`} style={{ color: industry.color }} />
                      </motion.div>
                      <div>
                        <h3 className="text-xl font-bold mb-2">{industry.name}</h3>
                        <p className="text-text-muted leading-relaxed">{industry.desc}</p>
                      </div>
                    </div>
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
                <h2 className="section-title text-white">How We Deliver</h2>
              </Animated>
            </div>
            <Stagger className="grid-4-col" staggerDelay={0.1}>
              {process.map((step) => (
                <StaggerItem key={step.num} className="grid-item">
                  <div className="relative h-full p-8 rounded-2xl border border-white/10" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
                    <div className="absolute top-6 right-6 w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg font-bold" style={{ background: step.color }}>
                      {step.num}
                    </div>
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5" style={{ background: `${step.color}30` }}>
                      <i className={`${step.icon} text-3xl`} style={{ color: step.color }} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                    <p className="text-sm text-white/70 leading-relaxed m-0">{step.desc}</p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* Tech Stack Section */}
        <section className="section bg-white">
          <div className="container">
            <div className="section-header">
              <Animated animation="fadeInUp">
                <Badge icon="ri-stack-line">Tech Stack</Badge>
              </Animated>
              <Animated animation="fadeInUp" delay={0.1}>
                <h2 className="section-title">Tools We Use</h2>
              </Animated>
            </div>
            <Stagger className="industries-grid" staggerDelay={0.08}>
              {techStack.map((tech, i) => (
                <StaggerItem key={i} className="grid-item">
                  <HoverCard className="service-card hover-lift text-center py-6 px-4">
                    <h4 className="text-base font-bold text-text-dark mb-1">{tech.name}</h4>
                    <span className="text-xs text-text-muted">{tech.desc}</span>
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
              <div className="cta-card" style={{ background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)' }}>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  Have a Unique AI Challenge?
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  Let&apos;s discuss your requirements and explore how custom AI can solve it.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                >
                  <Button variant="ctaWhite" asChild>
                    <Link href="/contact">
                      <span>Share Your Requirements</span>
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
