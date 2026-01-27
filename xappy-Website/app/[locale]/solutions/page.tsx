'use client';

import Link from 'next/link';
import { Header, Footer, Badge, Button } from '@/components';
import { Animated, Stagger, StaggerItem, HoverCard, Counter, motion } from '@/components/ui';

const solutions = [
  {
    id: 'agentic',
    icon: 'ri-robot-2-line',
    gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    title: 'Agentic AI',
    subtitle: 'Autonomous AI Systems',
    color: '#6366f1',
    desc: 'Build autonomous AI agents that can reason, plan, and execute complex multi-step tasks with minimal human intervention. From customer support to workflow automation, our agentic systems work 24/7.',
    features: ['Multi-step reasoning and planning', 'Tool use and API integration', 'Human-in-the-loop workflows', 'Self-correcting behavior'],
  },
  {
    id: 'conversational',
    icon: 'ri-chat-3-line',
    gradient: 'linear-gradient(135deg, #22c55e 0%, #4ade80 100%)',
    title: 'Conversational AI',
    subtitle: 'Chatbots & Voice Assistants',
    color: '#22c55e',
    desc: 'Build intelligent chatbots and voice assistants that understand context, handle complex queries, and integrate seamlessly with your systems. Available on WhatsApp, web, mobile, and voice platforms.',
    features: ['Natural language understanding', 'Multi-turn conversation handling', 'Multi-language support (11+ languages)', 'CRM, ERP & system integration'],
  },
  {
    id: 'integration',
    icon: 'ri-plug-line',
    gradient: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
    title: 'AI Integration',
    subtitle: 'Seamless System Integration',
    color: '#a855f7',
    desc: 'Seamlessly integrate AI capabilities into your existing workflows, applications, and business processes. Leverage the latest AI models without disrupting your current operations.',
    features: ['API development and integration', 'Legacy system modernization', 'Data pipeline setup', 'Model deployment & monitoring'],
  },
  {
    id: 'custom',
    icon: 'ri-code-s-slash-line',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
    title: 'Custom AI Development',
    subtitle: 'Bespoke AI Solutions',
    color: '#f59e0b',
    desc: 'Bespoke AI solutions tailored to your unique requirements. From data collection and model training to production deployment and ongoing maintenance—the complete AI lifecycle.',
    features: ['Custom model training', 'Fine-tuning existing models', 'MLOps and DevOps', 'Ongoing support & maintenance'],
  },
];

const processSteps = [
  {
    num: 1,
    icon: 'ri-search-eye-line',
    title: 'Discovery',
    desc: 'We understand your business, challenges, and goals to define the right AI solution. Deep dive into requirements and constraints.',
    gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    iconBg: 'rgba(99, 102, 241, 0.2)',
    iconColor: '#a5b4fc',
  },
  {
    num: 2,
    icon: 'ri-pencil-ruler-2-line',
    title: 'Design',
    desc: 'We architect the solution, select the right technologies, and create a detailed roadmap. Prototype and validate approach.',
    gradient: 'linear-gradient(135deg, #22c55e 0%, #4ade80 100%)',
    iconBg: 'rgba(34, 197, 94, 0.2)',
    iconColor: '#86efac',
  },
  {
    num: 3,
    icon: 'ri-code-box-line',
    title: 'Build',
    desc: 'We develop, test, and iterate rapidly with continuous feedback. Agile sprints with regular demos and quality assurance.',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
    iconBg: 'rgba(245, 158, 11, 0.2)',
    iconColor: '#fcd34d',
  },
  {
    num: 4,
    icon: 'ri-rocket-2-line',
    title: 'Deploy & Support',
    desc: 'We deploy to production with monitoring, support, and continuous improvement. Ongoing maintenance and optimization.',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
    iconBg: 'rgba(236, 72, 153, 0.2)',
    iconColor: '#f9a8d4',
  },
];

const technologies = [
  { icon: 'ri-brain-fill', name: 'OpenAI', desc: 'GPT-4, GPT-4o', color: '#10a37f' },
  { icon: 'ri-sparkling-2-fill', name: 'Anthropic', desc: 'Claude 3.5, Claude 4', color: '#d97757' },
  { icon: 'ri-google-fill', name: 'Google AI', desc: 'Gemini, Vertex AI', color: '#4285f4' },
  { icon: 'ri-amazon-fill', name: 'AWS', desc: 'Bedrock, SageMaker', color: '#ff9900' },
  { icon: 'ri-facebook-fill', name: 'Meta AI', desc: 'LLaMA, WhatsApp', color: '#0668e1' },
  { icon: 'ri-terminal-box-fill', name: 'Python', desc: 'FastAPI, LangChain', color: '#3776ab' },
];

export default function SolutionsPage() {
  return (
    <>
      <Header activePage="solutions" />

      {/* Hero Section */}
      <section className="relative py-24" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)' }}>
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1920&q=80')" }}
        />
        <div className="container relative z-10">
          <motion.nav
            aria-label="breadcrumb"
            className="mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ol className="breadcrumb bg-white/10 px-5 py-2.5 rounded-lg inline-flex m-0">
              <li className="breadcrumb-item">
                <Link href="/" className="text-white/70 hover:text-white transition-colors">Home</Link>
              </li>
              <li className="breadcrumb-item active text-white" aria-current="page">Solutions</li>
            </ol>
          </motion.nav>
          <div className="flex flex-wrap items-center gap-10">
            <div className="flex-1 min-w-[300px]">
              <Animated animation="fadeInUp">
                <Badge icon="ri-service-line" variant="white" className="mb-5">Our Solutions</Badge>
              </Animated>
              <Animated animation="fadeInUp" delay={0.1}>
                <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-5 leading-tight">
                  End-to-End AI Solutions <span className="gradient-text gradient-text-animated">That Deliver Results</span>
                </h1>
              </Animated>
              <Animated animation="fadeInUp" delay={0.2}>
                <p className="text-lg text-white/80 leading-relaxed max-w-[600px]">
                  From concept to production, we build AI systems that deliver real business value. Strategy, development, integration, and ongoing support—all under one roof.
                </p>
              </Animated>
            </div>
            <div className="flex gap-4 justify-end">
              <Animated animation="fadeInRight" delay={0.3}>
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl text-center border border-white/10">
                  <div className="text-3xl font-extrabold text-white">
                    <Counter from={0} to={1000} duration={2} suffix="+" />
                  </div>
                  <div className="text-sm text-white/70">Projects Delivered</div>
                </div>
              </Animated>
              <Animated animation="fadeInRight" delay={0.4}>
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl text-center border border-white/10">
                  <div className="text-3xl font-extrabold text-white">
                    <Counter from={0} to={98} duration={2} suffix="%" />
                  </div>
                  <div className="text-sm text-white/70">Client Satisfaction</div>
                </div>
              </Animated>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main id="main-content" role="main">
        {/* Our Approach Section */}
        <section className="section bg-white">
          <div className="container">
            <div className="two-col-section">
              <div className="col-left">
                <Animated animation="fadeInUp">
                  <Badge icon="ri-compass-3-line" className="mb-5">Our Approach</Badge>
                </Animated>
                <Animated animation="fadeInUp" delay={0.1}>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-text-dark mb-6 leading-tight">
                    AI That Actually <span className="text-primary-blue">Works For You</span>
                  </h2>
                </Animated>
                <Animated animation="fadeInUp" delay={0.2}>
                  <p className="text-lg text-text-muted leading-relaxed mb-6">
                    We don&apos;t just throw AI at problems. We take the time to understand your business, identify where AI can create genuine value, and build solutions that integrate seamlessly into your operations.
                  </p>
                </Animated>
                <Animated animation="fadeInUp" delay={0.3}>
                  <p className="text-lg text-text-muted leading-relaxed mb-8">
                    Our team combines deep technical expertise with real-world implementation experience. We&apos;ve deployed AI systems for governments, enterprises, and startups—each with unique challenges and requirements.
                  </p>
                </Animated>
                <Animated animation="fadeInUp" delay={0.4}>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[calc(50%-8px)]">
                      <div className="p-5 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)' }}>
                        <i className="ri-focus-3-line text-3xl text-primary-blue block mb-3" />
                        <div className="font-bold text-text-dark mb-1">Results Focused</div>
                        <div className="text-sm text-text-muted">ROI-driven solutions</div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-[calc(50%-8px)]">
                      <div className="p-5 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(74, 222, 128, 0.1) 100%)' }}>
                        <i className="ri-loop-left-line text-3xl text-green-500 block mb-3" />
                        <div className="font-bold text-text-dark mb-1">Iterative Process</div>
                        <div className="text-sm text-text-muted">Rapid feedback loops</div>
                      </div>
                    </div>
                  </div>
                </Animated>
              </div>
              <div className="col-right">
                <Animated animation="fadeInRight" delay={0.2}>
                  <div className="relative">
                    <img
                      src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&q=80"
                      alt="AI Strategy Session"
                      className="rounded-3xl shadow-card-hover w-full"
                    />
                    <motion.div
                      className="absolute -top-4 -right-4 bg-white p-5 rounded-2xl shadow-card z-10"
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                    >
                      <div className="text-3xl font-extrabold text-green-500">10+</div>
                      <div className="text-sm text-text-muted">Years Experience</div>
                    </motion.div>
                  </div>
                </Animated>
              </div>
            </div>
          </div>
        </section>

        {/* Core Solutions */}
        <section className="section" id="agentic">
          <div className="container">
            <div className="section-header">
              <Animated animation="fadeInUp">
                <Badge icon="ri-lightbulb-line">Core Solutions</Badge>
              </Animated>
              <Animated animation="fadeInUp" delay={0.1}>
                <h2 className="section-title">What We Build</h2>
              </Animated>
              <Animated animation="fadeInUp" delay={0.2}>
                <p className="section-subtitle">Specialized AI solutions tailored to your business needs</p>
              </Animated>
            </div>
            <Stagger className="grid-2-col" staggerDelay={0.15}>
              {solutions.map((sol) => (
                <StaggerItem key={sol.id} className="grid-item" id={sol.id}>
                  <HoverCard className="service-card hover-lift p-0 h-full overflow-hidden">
                    <div style={{ background: sol.gradient, padding: '32px' }}>
                      <div className="flex items-center gap-4">
                        <motion.div
                          className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ type: 'spring', stiffness: 300 }}
                        >
                          <i className={`${sol.icon} text-3xl text-white`} />
                        </motion.div>
                        <div>
                          <h3 className="text-2xl font-bold text-white m-0">{sol.title}</h3>
                          <span className="text-white/90 text-sm">{sol.subtitle}</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-8">
                      <p className="text-text-muted leading-relaxed mb-5">{sol.desc}</p>
                      <h4 className="text-sm font-semibold text-text-dark mb-4">Key Capabilities:</h4>
                      <ul className="space-y-0 m-0 p-0 list-none mb-5">
                        {sol.features.map((f, i) => (
                          <motion.li
                            key={i}
                            className="flex items-center gap-2.5 text-text-muted py-2"
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                          >
                            <i className="ri-check-double-line" style={{ color: sol.color }} /> {f}
                          </motion.li>
                        ))}
                      </ul>
                      <Link href="/contact" className="inline-flex items-center gap-2 font-semibold no-underline" style={{ color: sol.color }}>
                        Learn More <i className="ri-arrow-right-line" />
                      </Link>
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
                <h2 className="section-title text-white">How We Work</h2>
              </Animated>
              <Animated animation="fadeInUp" delay={0.2}>
                <p className="section-subtitle text-white/70">A proven methodology that delivers results</p>
              </Animated>
            </div>
            <Stagger className="grid-4-col" staggerDelay={0.1}>
              {processSteps.map((step) => (
                <StaggerItem key={step.num} className="grid-item">
                  <div className="relative h-full p-8 rounded-2xl border border-white/10" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
                    <div
                      className="absolute top-6 right-6 w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg font-bold"
                      style={{ background: step.gradient }}
                    >
                      {step.num}
                    </div>
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                      style={{ background: step.iconBg }}
                    >
                      <i className={`${step.icon} text-3xl`} style={{ color: step.iconColor }} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                    <p className="text-sm text-white/70 leading-relaxed m-0">{step.desc}</p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* Technologies Section */}
        <section className="section bg-white">
          <div className="container">
            <div className="section-header">
              <Animated animation="fadeInUp">
                <Badge icon="ri-stack-line">Technologies</Badge>
              </Animated>
              <Animated animation="fadeInUp" delay={0.1}>
                <h2 className="section-title">Powered by Leading AI</h2>
              </Animated>
              <Animated animation="fadeInUp" delay={0.2}>
                <p className="section-subtitle">We work with the best tools and platforms to deliver exceptional results</p>
              </Animated>
            </div>
            <Stagger className="industries-grid" staggerDelay={0.08}>
              {technologies.map((tech, i) => (
                <StaggerItem key={i} className="grid-item">
                  <HoverCard className="service-card hover-lift text-center py-6 px-4">
                    <i className={`${tech.icon} text-4xl block mb-3`} style={{ color: tech.color }} />
                    <h4 className="text-sm font-semibold text-text-dark m-0">{tech.name}</h4>
                    <span className="text-xs text-text-muted">{tech.desc}</span>
                  </HoverCard>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* Stats Section */}
        <section className="stats-section relative">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-15"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80')" }}
          />
          <div className="container relative z-10">
            <Stagger className="stats-grid" staggerDelay={0.1}>
              <StaggerItem>
                <div className="stat-card">
                  <div className="stat-value"><Counter from={0} to={1000} duration={2} suffix="+" /></div>
                  <div className="stat-label">Projects Delivered</div>
                </div>
              </StaggerItem>
              <StaggerItem>
                <div className="stat-card">
                  <div className="stat-value"><Counter from={0} to={500} duration={2} suffix="+" /></div>
                  <div className="stat-label">Happy Clients</div>
                </div>
              </StaggerItem>
              <StaggerItem>
                <div className="stat-card">
                  <div className="stat-value"><Counter from={0} to={98} duration={2} suffix="%" /></div>
                  <div className="stat-label">Client Satisfaction</div>
                </div>
              </StaggerItem>
              <StaggerItem>
                <div className="stat-card">
                  <div className="stat-value">24/7</div>
                  <div className="stat-label">Support Available</div>
                </div>
              </StaggerItem>
            </Stagger>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="container">
            <Animated animation="scaleIn">
              <div className="cta-card">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  Ready to Transform Your Business with AI?
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  Get a free consultation and AI readiness assessment. Let&apos;s discuss how AI can drive efficiency and growth for your organization.
                </motion.p>
                <motion.div
                  className="flex gap-3 justify-center flex-wrap"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                >
                  <Button variant="ctaWhite" asChild>
                    <Link href="/contact">
                      <span>Get Free Consultation</span>
                      <i className="ri-arrow-right-line" />
                    </Link>
                  </Button>
                  <a
                    href="tel:+919810503222"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 text-white font-semibold rounded-xl no-underline hover:bg-white/30 transition-all"
                  >
                    <i className="ri-phone-line" />
                    <span>+91 9810503222</span>
                  </a>
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
