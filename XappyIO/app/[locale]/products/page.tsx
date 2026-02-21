'use client';

import Link from 'next/link';
import { Header, Footer, StatCard, Badge, Button } from '@/components';
import { Animated, Stagger, StaggerItem, HoverCard, Float, GradientText, motion } from '@/components/ui';

const products = [
  {
    slug: 'roboguru',
    icon: 'ri-graduation-cap-line',
    gradient: 'bg-gradient-green',
    title: 'RoboGuru',
    subtitle: 'AI-Powered Education',
    color: 'text-accent-green',
    desc: 'Intelligent tutoring system using computer vision and AI to help students learn. Take a photo of any problem and get step-by-step solutions instantly.',
    features: ['Photo-to-solution AI technology', 'Adaptive learning paths', 'Math, Science & more subjects'],
  },
  {
    slug: 'ohgrt',
    icon: 'ri-voiceprint-line',
    gradient: 'bg-gradient-purple',
    title: 'OHGRT',
    subtitle: 'AI Voice Generation Studio',
    color: 'text-accent-purple',
    desc: 'Professional AI voice generation platform for content creators and enterprises. Create natural-sounding voices with voice cloning and video dubbing.',
    features: ['Text-to-speech generation', 'AI video dubbing', 'Voice cloning technology'],
    badges: ['4.8★ Rating', '2M+ Downloads'],
  },
  {
    slug: 'xappy',
    icon: 'ri-heart-pulse-line',
    gradient: 'bg-gradient-cyan',
    title: 'Xappy',
    subtitle: 'Healthcare Management Platform',
    color: 'text-cyan-600',
    desc: 'Comprehensive healthcare management for government health departments. Digitize patient records and streamline health services delivery at scale.',
    features: ['Electronic health records (EHR)', 'Multi-facility support', 'Health analytics dashboard'],
    badges: ['Gov Grade', 'Deployed in Sri Lanka'],
  },
  {
    slug: 'janseva',
    icon: 'ri-government-line',
    gradient: 'bg-gradient-red',
    title: 'JanSeva',
    subtitle: 'AI Citizen Engagement Platform',
    color: 'text-red-600',
    desc: 'AI-powered engagement platform for elected representatives. Connect with constituents via WhatsApp, manage grievances, and build digital presence—all automated.',
    features: ['24/7 WhatsApp bot automation', 'Voice message support', 'Analytics & sentiment tracking'],
    badges: ['95% Resolution Rate', '6 Languages'],
  },
  {
    slug: 'whatsapp-commerce',
    icon: 'ri-shopping-bag-3-line',
    gradient: 'bg-gradient-whatsapp',
    title: 'WhatsApp Commerce',
    subtitle: 'Sell on WhatsApp',
    color: 'text-green-600',
    desc: 'Turn WhatsApp into your storefront. Product catalogs, native payments, automated checkout, and CRM integrations - sell where 500M+ Indians already are.',
    features: ['Product catalogs in WhatsApp', 'Native payment integrations', 'Automated checkout flows'],
    badges: ['98% Open Rate', '45% Higher Conv.'],
  },
];

const useCases = [
  { icon: 'ri-government-line', gradient: 'bg-gradient-blue', title: 'Government', desc: 'Citizen engagement, grievance management, and healthcare digitization for public sector.' },
  { icon: 'ri-book-open-line', gradient: 'bg-gradient-green', title: 'Education', desc: 'AI tutoring, homework assistance, and adaptive learning for students of all ages.' },
  { icon: 'ri-heart-pulse-line', gradient: 'bg-gradient-pink', title: 'Healthcare', desc: 'Patient management, EHR systems, and health analytics for hospitals and clinics.' },
  { icon: 'ri-movie-2-line', gradient: 'bg-gradient-purple', title: 'Media & Content', desc: 'Voice generation, video dubbing, and content creation for creators and enterprises.' },
];

export default function ProductsPage() {
  return (
    <>
      <Header activePage="products" />

      {/* Hero Section */}
      <section className="relative bg-gradient-hero py-24">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1518770660439-4636190af475?w=1920&q=80')" }}
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
              <li className="breadcrumb-item active text-white" aria-current="page">Products</li>
            </ol>
          </motion.nav>
          <div className="hero-two-col">
            <div className="hero-content-col">
              <Animated animation="fadeInUp">
                <Badge icon="ri-apps-2-line" variant="white" className="mb-5">Our Products</Badge>
              </Animated>
              <Animated animation="fadeInUp" delay={0.1}>
                <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-5 leading-tight">
                  AI Products Built for <GradientText>Real-World Impact</GradientText>
                </h1>
              </Animated>
              <Animated animation="fadeInUp" delay={0.2}>
                <p className="text-lg text-white/80 leading-relaxed max-w-xl mb-8">
                  From WhatsApp assistants to healthcare platforms, our products serve millions of
                  users across government, education, and enterprise sectors.
                </p>
              </Animated>
              <Animated animation="fadeInUp" delay={0.3}>
                <div className="flex gap-3 flex-wrap">
                  <Button variant="ctaWhite" asChild>
                    <Link href="/products/d23-ai">
                      <span>Try D23.ai Free</span>
                      <i className="ri-arrow-right-line" />
                    </Link>
                  </Button>
                  <Button variant="ghost" className="text-white border-white/30 hover:bg-white/10" asChild>
                    <Link href="/contact">
                      <span>Request Demo</span>
                      <i className="ri-calendar-line" />
                    </Link>
                  </Button>
                </div>
              </Animated>
            </div>
            <div className="hero-image-col">
              <Animated animation="fadeInRight" delay={0.3}>
                <div className="flex gap-4 justify-end">
                  <motion.div
                    className="glass-card p-6 text-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="text-3xl font-extrabold text-white">6</div>
                    <div className="text-sm text-white/70">Live Products</div>
                  </motion.div>
                  <motion.div
                    className="glass-card p-6 text-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="text-3xl font-extrabold text-white">2M+</div>
                    <div className="text-sm text-white/70">Users Served</div>
                  </motion.div>
                </div>
              </Animated>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main id="main-content" role="main">
        {/* Products Philosophy Section */}
        <section className="py-20 bg-white">
          <div className="container">
            <div className="two-col-section">
              <div className="col-left">
                <Animated animation="fadeInUp">
                  <Badge icon="ri-lightbulb-line" className="mb-5">Our Approach</Badge>
                </Animated>
                <Animated animation="fadeInUp" delay={0.1}>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-text-dark mb-6 leading-tight">
                    Products That <span className="text-primary-blue">Solve Real Problems</span>
                  </h2>
                </Animated>
                <Animated animation="fadeInUp" delay={0.2}>
                  <p className="text-lg text-text-muted leading-relaxed mb-6">
                    We don&apos;t build products for the sake of technology. Each product in our
                    portfolio was born from a genuine need—whether it&apos;s making AI accessible via
                    WhatsApp, revolutionizing education, or digitizing healthcare for governments.
                  </p>
                </Animated>
                <Animated animation="fadeInUp" delay={0.3}>
                  <p className="text-lg text-text-muted leading-relaxed mb-8">
                    Our products are battle-tested in production environments, serving real users at
                    scale. They represent our commitment to building AI that works reliably,
                    ethically, and delivers measurable value.
                  </p>
                </Animated>
                <Animated animation="fadeInUp" delay={0.4}>
                  <div className="flex gap-6 flex-wrap">
                    <motion.div
                      className="flex items-center gap-3"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <div className="w-12 h-12 bg-gradient-green rounded-xl flex items-center justify-center">
                        <i className="ri-global-line text-white text-2xl" />
                      </div>
                      <div>
                        <div className="font-bold text-text-dark">Production Ready</div>
                        <div className="text-sm text-text-muted">Serving millions daily</div>
                      </div>
                    </motion.div>
                    <motion.div
                      className="flex items-center gap-3"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                        <i className="ri-shield-check-line text-white text-2xl" />
                      </div>
                      <div>
                        <div className="font-bold text-text-dark">Enterprise Grade</div>
                        <div className="text-sm text-text-muted">Secure & compliant</div>
                      </div>
                    </motion.div>
                  </div>
                </Animated>
              </div>
              <div className="col-right">
                <Animated animation="fadeInRight" delay={0.2}>
                  <div className="relative">
                    <Float intensity={8} duration={5}>
                      <img
                        src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&q=80"
                        alt="Team building products"
                        className="rounded-3xl shadow-card-hover"
                      />
                    </Float>
                    <motion.div
                      className="absolute -bottom-4 -left-4 bg-white p-5 rounded-2xl shadow-card z-10"
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                    >
                      <div className="text-3xl font-extrabold text-primary-blue">4.8★</div>
                      <div className="text-sm text-text-muted">Average Rating</div>
                    </motion.div>
                  </div>
                </Animated>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="section">
          <div className="container">
            <div className="section-header">
              <Animated animation="fadeInUp">
                <Badge icon="ri-star-line">Featured</Badge>
              </Animated>
              <Animated animation="fadeInUp" delay={0.1}>
                <h2 className="section-title">Our Product Portfolio</h2>
              </Animated>
              <Animated animation="fadeInUp" delay={0.2}>
                <p className="section-subtitle">AI-powered solutions serving diverse industries</p>
              </Animated>
            </div>

            {/* D23.ai - Featured Product */}
            <Animated animation="scaleIn" delay={0.1}>
              <motion.div
                className="bg-gradient-whatsapp rounded-3xl p-12 mb-8 relative overflow-hidden"
                whileHover={{ scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <div
                  className="absolute top-0 right-0 w-2/5 h-full bg-cover bg-center opacity-20"
                  style={{ backgroundImage: "url('https://images.unsplash.com/photo-1611746872915-64382b5c76da?w=600&q=80')" }}
                />
                <div className="hero-two-col relative z-10">
                  <div className="hero-content-col">
                    <motion.div
                      className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full mb-5"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 }}
                    >
                      <i className="ri-whatsapp-line text-white text-lg" />
                      <span className="text-white text-sm font-semibold">WhatsApp Native</span>
                    </motion.div>
                    <motion.h3
                      className="text-4xl font-extrabold text-white mb-4"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 }}
                    >
                      D23.ai
                    </motion.h3>
                    <motion.p
                      className="text-lg text-white/90 leading-relaxed mb-6 max-w-xl"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4 }}
                    >
                      India&apos;s first WhatsApp-native AI assistant that understands and responds in
                      11+ Indian languages. Send voice messages, generate images, check train PNR
                      status, search the web—all within WhatsApp.
                    </motion.p>
                    <motion.div
                      className="flex gap-8 flex-wrap mb-6"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 }}
                    >
                      {[
                        { value: '5000+', label: 'Active Users' },
                        { value: '1M+', label: 'Messages Processed' },
                        { value: '11+', label: 'Languages' },
                      ].map((stat, i) => (
                        <motion.div
                          key={stat.label}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.5 + i * 0.1 }}
                        >
                          <div className="text-3xl font-extrabold text-white">{stat.value}</div>
                          <div className="text-sm text-white/80">{stat.label}</div>
                        </motion.div>
                      ))}
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.8 }}
                    >
                      <Button variant="ctaWhite" asChild>
                        <Link href="/products/d23-ai">
                          <span>Explore D23.ai</span>
                          <i className="ri-arrow-right-line" />
                        </Link>
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </Animated>

            {/* Other Products Grid */}
            <Stagger className="grid-2-col" staggerDelay={0.15}>
              {products.map((prod) => (
                <StaggerItem key={prod.slug} className="grid-item">
                  <HoverCard className="service-card hover-lift p-0 h-full overflow-hidden">
                    <div className={`${prod.gradient} p-8`}>
                      <div className="flex items-center gap-4 mb-4">
                        <motion.div
                          className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ type: 'spring', stiffness: 300 }}
                        >
                          <i className={`${prod.icon} text-3xl text-white`} />
                        </motion.div>
                        <div>
                          <h3 className="text-2xl font-bold text-white m-0">{prod.title}</h3>
                          <span className="text-white/90 text-sm">{prod.subtitle}</span>
                        </div>
                      </div>
                      {prod.badges && (
                        <div className="flex gap-4">
                          {prod.badges.map((badge, i) => (
                            <motion.div
                              key={i}
                              className="bg-white/20 px-4 py-2 rounded-lg"
                              initial={{ opacity: 0, scale: 0.8 }}
                              whileInView={{ opacity: 1, scale: 1 }}
                              viewport={{ once: true }}
                              transition={{ delay: i * 0.1 }}
                            >
                              <span className="text-white text-sm font-semibold">{badge}</span>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="p-8">
                      <p className="text-text-muted leading-relaxed mb-5">{prod.desc}</p>
                      <ul className="space-y-2 mb-5">
                        {prod.features.map((f, i) => (
                          <motion.li
                            key={i}
                            className="flex items-center gap-2.5 text-text-muted py-2"
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                          >
                            <i className={`ri-check-double-line ${prod.color}`} /> {f}
                          </motion.li>
                        ))}
                      </ul>
                      <motion.div
                        whileHover={{ x: 5 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <Link
                          href={`/products/${prod.slug}`}
                          className={`inline-flex items-center gap-2 ${prod.color} font-semibold hover:opacity-80 transition-opacity`}
                        >
                          Learn More <i className="ri-arrow-right-line" />
                        </Link>
                      </motion.div>
                    </div>
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
                <Badge icon="ri-building-2-line">Use Cases</Badge>
              </Animated>
              <Animated animation="fadeInUp" delay={0.1}>
                <h2 className="section-title">Built for Diverse Industries</h2>
              </Animated>
              <Animated animation="fadeInUp" delay={0.2}>
                <p className="section-subtitle">Our products serve organizations across multiple sectors</p>
              </Animated>
            </div>
            <Stagger className="grid-4-col" staggerDelay={0.1}>
              {useCases.map((uc, i) => (
                <StaggerItem key={i} className="grid-item">
                  <HoverCard className="service-card hover-lift text-center py-8 px-5 h-full">
                    <motion.div
                      className={`w-16 h-16 ${uc.gradient} rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-card`}
                      whileHover={{ scale: 1.15, rotate: 10 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <i className={`${uc.icon} text-3xl text-white`} />
                    </motion.div>
                    <h3 className="text-lg font-bold mb-3">{uc.title}</h3>
                    <p className="text-text-muted text-sm leading-relaxed m-0">{uc.desc}</p>
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
                <StatCard value="6" label="Live Products" />
              </StaggerItem>
              <StaggerItem>
                <StatCard value="2M+" label="Total Users" />
              </StaggerItem>
              <StaggerItem>
                <StatCard value="11+" label="Languages Supported" />
              </StaggerItem>
              <StaggerItem>
                <StatCard value="4.8★" label="Average Rating" />
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
                  Want to Build a Custom Product?
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  We can help you create AI-powered products tailored to your specific needs. From
                  concept to production, we handle the complete journey.
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
                      <span>Start a Conversation</span>
                      <i className="ri-arrow-right-line" />
                    </Link>
                  </Button>
                  <Button variant="ghost" asChild>
                    <Link href="/solutions">
                      <span>Explore Solutions</span>
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
