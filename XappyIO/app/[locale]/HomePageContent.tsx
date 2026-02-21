'use client';

import Link from 'next/link';
import {
  Button,
  Badge,
  Animated,
  Stagger,
  StaggerItem,
  Float,
  GradientText,
  HoverCard,
  motion,
  Counter,
  AtomLogo,
  FloatingParticles,
  GradientMesh,
  ChatBubbles,
  ChannelIcons,
  TrustBadges,
} from '@/components';

export function HomePageContent() {
  return (
    <>
      {/* Hero Section - Immersive Full Screen */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-hero">
        {/* Animated background elements */}
        <GradientMesh />
        <FloatingParticles count={30} />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="container relative z-10 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left - Content */}
            <div>
              <Animated animation="fadeInUp" delay={0}>
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 mb-8">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-green opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-green"></span>
                  </span>
                  <span className="text-sm text-white/90 font-medium">AI-First Customer Experience Platform</span>
                </div>
              </Animated>

              <Animated animation="fadeInUp" delay={0.1}>
                <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-[1.1] mb-8">
                  Conversations that
                  <span className="block mt-2 bg-gradient-to-r from-accent-green via-accent-yellow to-accent-orange bg-clip-text text-transparent">
                    convert.
                  </span>
                </h1>
              </Animated>

              <Animated animation="fadeInUp" delay={0.2}>
                <p className="text-xl text-white/70 mb-10 leading-relaxed max-w-lg">
                  Xappy helps businesses automate, personalize, and scale customer interactions
                  across channels using AI-powered conversational experiences.
                </p>
              </Animated>

              <Animated animation="fadeInUp" delay={0.3}>
                <div className="flex gap-4 flex-wrap mb-12">
                  <Button variant="ctaWhite" size="lg" asChild className="group">
                    <Link href="/contact">
                      <span>Book a Demo</span>
                      <motion.span
                        className="inline-block ml-2"
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <i className="ri-arrow-right-line" />
                      </motion.span>
                    </Link>
                  </Button>
                  <Button variant="ghost" size="lg" asChild>
                    <Link href="#how-it-works">
                      <i className="ri-play-circle-line mr-2" />
                      <span>Watch Demo</span>
                    </Link>
                  </Button>
                </div>
              </Animated>

              <Animated animation="fadeInUp" delay={0.4}>
                <TrustBadges />
              </Animated>
            </div>

            {/* Right - Visual */}
            <div className="relative hidden lg:block">
              <Float intensity={20} duration={6}>
                <div className="relative">
                  {/* Main visual card */}
                  <motion.div
                    className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl"
                    initial={{ opacity: 0, y: 50, rotateY: -10 }}
                    animate={{ opacity: 1, y: 0, rotateY: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                  >
                    {/* Atom logo */}
                    <div className="absolute -top-16 -right-16">
                      <AtomLogo size={150} />
                    </div>

                    {/* Chat interface mockup */}
                    <div className="bg-gradient-to-br from-white/20 to-white/5 rounded-2xl p-6">
                      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                        <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                          <i className="ri-robot-line text-white" />
                        </div>
                        <div>
                          <div className="text-white font-semibold text-sm">Xappy Assistant</div>
                          <div className="text-white/50 text-xs flex items-center gap-1">
                            <span className="w-2 h-2 bg-accent-green rounded-full"></span>
                            Online
                          </div>
                        </div>
                      </div>
                      <ChatBubbles />
                    </div>
                  </motion.div>

                  {/* Floating stats cards */}
                  <motion.div
                    className="absolute -left-12 top-1/4 bg-white rounded-2xl p-4 shadow-xl"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1, duration: 0.5 }}
                  >
                    <div className="text-2xl font-bold text-primary-blue">60%</div>
                    <div className="text-xs text-text-muted">Cost Reduction</div>
                  </motion.div>

                  <motion.div
                    className="absolute -right-8 bottom-1/4 bg-white rounded-2xl p-4 shadow-xl"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2, duration: 0.5 }}
                  >
                    <div className="text-2xl font-bold text-accent-green">95%</div>
                    <div className="text-xs text-text-muted">CSAT Score</div>
                  </motion.div>
                </div>
              </Float>
            </div>
          </div>

          {/* Bottom stats */}
          <Animated animation="fadeInUp" delay={0.6}>
            <div className="mt-20 pt-12 border-t border-white/10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                  { value: 5, suffix: 'M+', label: 'Conversations Powered' },
                  { value: 60, suffix: '%', label: 'Cost Savings' },
                  { value: 24, suffix: '/7', label: 'Availability' },
                  { value: 50, suffix: '+', label: 'Enterprise Clients' },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + i * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="text-4xl md:text-5xl font-extrabold text-white mb-2">
                      <Counter from={0} to={stat.value} duration={2.5} suffix={stat.suffix} />
                    </div>
                    <div className="text-sm text-white/60">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </Animated>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <motion.div
              className="w-1.5 h-3 bg-white/50 rounded-full"
              animate={{ y: [0, 12, 0], opacity: [1, 0, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* Main Content */}
      <main id="main-content" role="main">
        {/* What is Xappy - Clean Two Column */}
        <section className="py-32 bg-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary-blue/5 to-transparent" />

          <div className="container relative">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div>
                <Animated animation="fadeInLeft">
                  <Badge icon="ri-question-line" className="mb-6">
                    About Xappy
                  </Badge>
                  <h2 className="text-4xl md:text-5xl font-extrabold text-text-dark mb-8 leading-tight">
                    The smartest way to
                    <span className="text-primary-blue"> talk to customers</span>
                  </h2>
                  <p className="text-lg text-text-muted leading-relaxed mb-8">
                    Xappy is an end-to-end conversational AI platform that enables businesses to build
                    intelligent virtual assistants and workflows. Understand users, take actions,
                    resolve queries instantly — all while maintaining your brand voice.
                  </p>

                  <div className="space-y-4 mb-10">
                    {[
                      'Natural language understanding across 50+ languages',
                      'Visual flow builder — no coding required',
                      'Seamless human handoff with full context',
                      'Enterprise-grade security & compliance',
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        className="flex items-center gap-3"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + i * 0.1 }}
                        viewport={{ once: true }}
                      >
                        <div className="w-6 h-6 bg-accent-green/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <i className="ri-check-line text-accent-green text-sm" />
                        </div>
                        <span className="text-text-dark">{item}</span>
                      </motion.div>
                    ))}
                  </div>

                  <Button variant="cta" asChild>
                    <Link href="/contact">
                      Learn More <i className="ri-arrow-right-line ml-2" />
                    </Link>
                  </Button>
                </Animated>
              </div>

              <Animated animation="fadeInRight">
                <div className="relative">
                  {/* Feature grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { icon: 'ri-message-3-line', label: 'Smart Conversations', color: 'from-primary-blue to-primary-light' },
                      { icon: 'ri-global-line', label: 'Omnichannel', color: 'from-accent-green to-accent-teal' },
                      { icon: 'ri-robot-line', label: 'AI-Powered', color: 'from-accent-orange to-accent-yellow' },
                      { icon: 'ri-shield-check-line', label: 'Enterprise Ready', color: 'from-purple-500 to-pink-500' },
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        className="group"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + i * 0.1 }}
                        viewport={{ once: true }}
                      >
                        <HoverCard className="bg-white rounded-3xl p-8 shadow-card border border-gray-100 text-center h-full">
                          <motion.div
                            className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                          >
                            <i className={`${item.icon} text-3xl text-white`} />
                          </motion.div>
                          <span className="font-semibold text-text-dark">{item.label}</span>
                        </HoverCard>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </Animated>
            </div>
          </div>
        </section>

        {/* Capabilities - Full Width Cards */}
        <section className="py-32 bg-bg-light relative">
          <div className="container">
            <Animated animation="fadeInUp" className="text-center mb-16">
              <Badge icon="ri-magic-line" className="mb-4">Capabilities</Badge>
              <h2 className="text-4xl md:text-5xl font-extrabold text-text-dark mb-6">
                What You Can Build
              </h2>
              <p className="text-lg text-text-muted max-w-2xl mx-auto">
                Powerful AI tools to transform every customer touchpoint
              </p>
            </Animated>

            <Stagger className="grid md:grid-cols-2 lg:grid-cols-4 gap-6" staggerDelay={0.1}>
              {[
                {
                  icon: 'ri-robot-2-line',
                  title: 'AI Virtual Assistants',
                  desc: 'Intelligent AI that handles queries, transactions, and complex workflows 24/7.',
                  gradient: 'from-primary-blue to-cyan-500',
                  glow: 'shadow-blue-glow',
                },
                {
                  icon: 'ri-loop-left-line',
                  title: 'End-to-End Automation',
                  desc: 'Automate lead qualification, bookings, payments, and support workflows.',
                  gradient: 'from-accent-orange to-red-500',
                  glow: 'shadow-orange-glow',
                },
                {
                  icon: 'ri-global-line',
                  title: 'Omnichannel Presence',
                  desc: 'Deploy across WhatsApp, Instagram, Messenger, Web, Mobile & more.',
                  gradient: 'from-accent-green to-emerald-500',
                  glow: 'shadow-green-glow',
                },
                {
                  icon: 'ri-team-line',
                  title: 'Human + AI Collab',
                  desc: 'Smart handoff to agents with full context for seamless experiences.',
                  gradient: 'from-purple-500 to-pink-500',
                  glow: 'shadow-purple-glow',
                },
              ].map((item, i) => (
                <StaggerItem key={i}>
                  <motion.div
                    className="group h-full"
                    whileHover={{ y: -8 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <div className={`bg-white rounded-3xl p-8 h-full border border-gray-100 hover:border-transparent hover:${item.glow} transition-all duration-300`}>
                      <motion.div
                        className={`w-16 h-16 bg-gradient-to-br ${item.gradient} rounded-2xl flex items-center justify-center mb-6`}
                        whileHover={{ scale: 1.1, rotate: -5 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <i className={`${item.icon} text-3xl text-white`} />
                      </motion.div>
                      <h3 className="text-xl font-bold text-text-dark mb-3">{item.title}</h3>
                      <p className="text-text-muted leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* Omnichannel Section */}
        <section className="py-32 bg-white">
          <div className="container">
            <div className="max-w-4xl mx-auto text-center">
              <Animated animation="fadeInUp">
                <Badge icon="ri-apps-line" className="mb-4">Channels</Badge>
                <h2 className="text-4xl md:text-5xl font-extrabold text-text-dark mb-6">
                  Meet Customers Where They Are
                </h2>
                <p className="text-lg text-text-muted mb-12">
                  Deploy your AI assistant across every channel your customers use
                </p>
              </Animated>

              <Animated animation="fadeInUp" delay={0.2}>
                <ChannelIcons />
              </Animated>

              <Animated animation="fadeInUp" delay={0.4}>
                <div className="mt-16 p-8 bg-gradient-to-br from-primary-blue/5 to-accent-green/5 rounded-3xl">
                  <div className="grid md:grid-cols-3 gap-8">
                    {[
                      { value: '98%', label: 'Message Open Rate' },
                      { value: '<3s', label: 'Response Time' },
                      { value: '50+', label: 'Languages Supported' },
                    ].map((stat, i) => (
                      <motion.div
                        key={i}
                        className="text-center"
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                        viewport={{ once: true }}
                      >
                        <div className="text-3xl font-extrabold text-primary-blue mb-1">{stat.value}</div>
                        <div className="text-sm text-text-muted">{stat.label}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </Animated>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-32 bg-bg-light">
          <div className="container">
            <Animated animation="fadeInUp" className="text-center mb-16">
              <Badge icon="ri-stack-line" className="mb-4">Features</Badge>
              <h2 className="text-4xl md:text-5xl font-extrabold text-text-dark mb-6">
                Enterprise-Grade Platform
              </h2>
              <p className="text-lg text-text-muted max-w-2xl mx-auto">
                Everything you need to deliver exceptional customer experiences at scale
              </p>
            </Animated>

            <Stagger className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.08}>
              {[
                { icon: 'ri-brain-line', title: 'Natural Language AI', desc: 'Understand intent, context, and sentiment across languages and dialects.' },
                { icon: 'ri-drag-drop-line', title: 'Visual Flow Builder', desc: 'Design conversations visually. No coding required. Launch in hours.' },
                { icon: 'ri-plug-line', title: 'Deep Integrations', desc: 'Connect to CRMs, ERPs, payment gateways, and any API.' },
                { icon: 'ri-bar-chart-box-line', title: 'Real-time Analytics', desc: 'Track CSAT, resolution rates, conversion, and ROI metrics.' },
                { icon: 'ri-shield-keyhole-line', title: 'Enterprise Security', desc: 'SOC2, GDPR, HIPAA compliant. Your data stays protected.' },
                { icon: 'ri-translate-2', title: 'Multilingual', desc: 'Auto-detect and respond in 50+ languages seamlessly.' },
              ].map((item, i) => (
                <StaggerItem key={i}>
                  <HoverCard className="bg-white rounded-2xl p-6 h-full border border-gray-100">
                    <div className="flex items-start gap-4">
                      <motion.div
                        className="w-12 h-12 bg-primary-blue/10 rounded-xl flex items-center justify-center flex-shrink-0"
                        whileHover={{ scale: 1.1 }}
                      >
                        <i className={`${item.icon} text-xl text-primary-blue`} />
                      </motion.div>
                      <div>
                        <h3 className="font-bold text-text-dark mb-2">{item.title}</h3>
                        <p className="text-sm text-text-muted leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  </HoverCard>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* Results Section - Dark */}
        <section className="py-32 bg-gradient-stats relative overflow-hidden">
          <FloatingParticles count={15} />

          <div className="container relative z-10">
            <Animated animation="fadeInUp" className="text-center mb-16">
              <Badge icon="ri-line-chart-line" variant="white" className="mb-4">Results</Badge>
              <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
                Proven Business Impact
              </h2>
              <p className="text-lg text-white/70 max-w-2xl mx-auto">
                Real results from real businesses using Xappy
              </p>
            </Animated>

            <Stagger className="grid md:grid-cols-2 lg:grid-cols-4 gap-6" staggerDelay={0.1}>
              {[
                { icon: 'ri-money-dollar-circle-line', value: '60%', label: 'Reduce Support Costs', desc: 'Average cost savings' },
                { icon: 'ri-timer-line', value: '3s', label: 'Response Time', desc: 'Instant 24/7 support' },
                { icon: 'ri-emotion-happy-line', value: '95%', label: 'CSAT Score', desc: 'Customer satisfaction' },
                { icon: 'ri-arrow-up-circle-line', value: '3x', label: 'Conversion Rate', desc: 'Sales improvement' },
              ].map((stat, i) => (
                <StaggerItem key={i}>
                  <motion.div
                    className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 text-center border border-white/10"
                    whileHover={{ y: -5, backgroundColor: 'rgba(255,255,255,0.15)' }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <motion.div
                      className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <i className={`${stat.icon} text-2xl text-white`} />
                    </motion.div>
                    <div className="text-4xl font-extrabold text-white mb-1">{stat.value}</div>
                    <div className="text-white font-medium mb-1">{stat.label}</div>
                    <div className="text-sm text-white/50">{stat.desc}</div>
                  </motion.div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* Industries */}
        <section className="py-32 bg-white">
          <div className="container">
            <Animated animation="fadeInUp" className="text-center mb-16">
              <Badge icon="ri-building-line" className="mb-4">Industries</Badge>
              <h2 className="text-4xl md:text-5xl font-extrabold text-text-dark mb-6">
                Solutions for Every Industry
              </h2>
            </Animated>

            <Stagger className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.08}>
              {[
                { icon: 'ri-bank-card-line', title: 'Fintech & Banking', desc: 'KYC, account support, transactions, and onboarding.', color: 'blue' },
                { icon: 'ri-shopping-bag-line', title: 'E-commerce', desc: 'Orders, returns, product discovery, and support.', color: 'orange' },
                { icon: 'ri-heart-pulse-line', title: 'Healthcare', desc: 'Appointments, reminders, patient engagement.', color: 'red' },
                { icon: 'ri-graduation-cap-line', title: 'Education', desc: 'Admissions, courses, and student support.', color: 'purple' },
                { icon: 'ri-taxi-line', title: 'On-Demand Services', desc: 'Bookings, cancellations, and real-time updates.', color: 'green' },
                { icon: 'ri-government-line', title: 'Government', desc: 'Citizen services and information access.', color: 'slate' },
              ].map((item, i) => (
                <StaggerItem key={i}>
                  <HoverCard className="bg-white rounded-2xl p-6 h-full border border-gray-100 hover:border-gray-200">
                    <div className={`w-12 h-12 bg-${item.color}-50 rounded-xl flex items-center justify-center mb-4`}>
                      <i className={`${item.icon} text-xl text-${item.color}-600`} />
                    </div>
                    <h3 className="font-bold text-text-dark mb-2">{item.title}</h3>
                    <p className="text-sm text-text-muted">{item.desc}</p>
                  </HoverCard>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-32 bg-bg-light">
          <div className="container">
            <Animated animation="fadeInUp" className="text-center mb-16">
              <Badge icon="ri-route-line" className="mb-4">Process</Badge>
              <h2 className="text-4xl md:text-5xl font-extrabold text-text-dark mb-6">
                Go Live in Days, Not Months
              </h2>
            </Animated>

            <div className="max-w-4xl mx-auto">
              <div className="relative">
                {/* Progress line */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-blue via-accent-green to-accent-orange hidden md:block" />

                {[
                  { step: '01', title: 'Design', desc: 'Create conversation flows with our visual builder', icon: 'ri-palette-line', color: 'primary-blue' },
                  { step: '02', title: 'Train', desc: 'Teach your AI with examples and knowledge bases', icon: 'ri-brain-line', color: 'accent-green' },
                  { step: '03', title: 'Integrate', desc: 'Connect your systems, CRMs, and channels', icon: 'ri-link', color: 'accent-orange' },
                  { step: '04', title: 'Launch', desc: 'Deploy to production with one click', icon: 'ri-rocket-line', color: 'purple-500' },
                  { step: '05', title: 'Optimize', desc: 'Improve continuously with real-time analytics', icon: 'ri-line-chart-line', color: 'pink-500' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    className="relative flex items-start gap-8 mb-12 last:mb-0"
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.15 }}
                    viewport={{ once: true }}
                  >
                    <motion.div
                      className={`w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center z-10 border-2 border-${item.color}`}
                      whileHover={{ scale: 1.1 }}
                    >
                      <i className={`${item.icon} text-2xl text-${item.color}`} />
                    </motion.div>
                    <div className="flex-1 pt-3">
                      <span className="text-xs font-bold text-primary-blue bg-primary-blue/10 px-2 py-1 rounded mb-2 inline-block">
                        STEP {item.step}
                      </span>
                      <h3 className="text-xl font-bold text-text-dark mb-2">{item.title}</h3>
                      <p className="text-text-muted">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-32 bg-white">
          <div className="container">
            <Animated animation="fadeInUp" className="text-center mb-16">
              <Badge icon="ri-chat-quote-line" className="mb-4">Testimonials</Badge>
              <h2 className="text-4xl md:text-5xl font-extrabold text-text-dark mb-6">
                Loved by Teams Worldwide
              </h2>
            </Animated>

            <Stagger className="grid md:grid-cols-3 gap-8" staggerDelay={0.15}>
              {[
                {
                  quote: "Xappy reduced our support costs by 65% while improving customer satisfaction. The AI understands context perfectly.",
                  author: "Priya Sharma",
                  role: "Head of CX, TechCorp",
                  avatar: "PS",
                },
                {
                  quote: "We launched our WhatsApp bot in just 3 days. The visual builder is incredibly intuitive. Our team loves it.",
                  author: "Rahul Verma",
                  role: "Product Manager, FinStart",
                  avatar: "RV",
                },
                {
                  quote: "The seamless handoff to human agents with full context has transformed our support operations completely.",
                  author: "Anita Desai",
                  role: "VP Operations, RetailMax",
                  avatar: "AD",
                },
              ].map((testimonial, i) => (
                <StaggerItem key={i}>
                  <motion.div
                    className="bg-white rounded-3xl p-8 shadow-card border border-gray-100 h-full"
                    whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                  >
                    <div className="flex mb-4">
                      {[...Array(5)].map((_, j) => (
                        <i key={j} className="ri-star-fill text-accent-yellow" />
                      ))}
                    </div>
                    <p className="text-text-dark leading-relaxed mb-6">"{testimonial.quote}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <div className="font-semibold text-text-dark">{testimonial.author}</div>
                        <div className="text-sm text-text-muted">{testimonial.role}</div>
                      </div>
                    </div>
                  </motion.div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-32 bg-gradient-hero relative overflow-hidden">
          <GradientMesh />
          <FloatingParticles count={20} />

          <div className="container relative z-10">
            <motion.div
              className="max-w-4xl mx-auto text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <AtomLogo size={100} className="mx-auto mb-8" />
              <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6">
                Ready to Transform Your
                <span className="block bg-gradient-to-r from-accent-green via-accent-yellow to-accent-orange bg-clip-text text-transparent">
                  Customer Experience?
                </span>
              </h2>
              <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto">
                Join leading businesses using Xappy to deliver exceptional
                conversational experiences at scale.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Button variant="ctaWhite" size="lg" asChild>
                  <Link href="/contact">
                    <span>Book a Demo</span>
                    <i className="ri-arrow-right-line ml-2" />
                  </Link>
                </Button>
                <Button variant="ghost" size="lg" asChild>
                  <Link href="/contact">
                    <i className="ri-phone-line mr-2" />
                    <span>Talk to Sales</span>
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </>
  );
}
