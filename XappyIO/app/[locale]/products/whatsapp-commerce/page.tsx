'use client';

import Link from 'next/link';
import { Header, Footer, Badge, Button } from '@/components';
import { Animated, Stagger, StaggerItem, HoverCard, Counter, motion } from '@/components/ui';

const features = [
  { icon: 'ri-store-2-line', gradient: 'bg-gradient-whatsapp', title: 'Product Catalogs', desc: 'Showcase your products with rich catalogs inside WhatsApp. Categories, images, descriptions, and pricing - all browsable in chat.' },
  { icon: 'ri-bank-card-line', gradient: 'bg-gradient-primary', title: 'Native Payments', desc: 'Accept payments directly in WhatsApp with UPI, cards, net banking, and WhatsApp Pay. No redirects, no friction.' },
  { icon: 'ri-robot-line', gradient: 'bg-gradient-purple', title: 'Automated Checkout', desc: 'AI-powered chatbot collects shipping details, applies discounts, and sends payment links automatically. 24/7 sales on autopilot.' },
  { icon: 'ri-broadcast-line', gradient: 'bg-gradient-orange', title: 'Bulk Campaigns', desc: 'Send promotional messages, new arrivals, and offers to thousands of customers. Segment by purchase history and preferences.' },
  { icon: 'ri-truck-line', gradient: 'bg-gradient-blue', title: 'Order Tracking', desc: 'Automated order confirmations, shipping updates, and delivery notifications. Keep customers informed at every step.' },
  { icon: 'ri-pie-chart-line', gradient: 'bg-gradient-pink', title: 'Analytics Dashboard', desc: 'Track sales, conversions, popular products, and customer behavior. Data-driven insights to grow your business.' },
];

const howItWorks = [
  { num: 1, title: 'Browse Catalog', desc: 'Customer sends "Hi" or clicks your WhatsApp link. Bot shows product categories and catalog for easy browsing.' },
  { num: 2, title: 'Add to Cart', desc: 'Customer selects products, chooses variants (size, color), and adds to cart. Bot collects shipping address.' },
  { num: 3, title: 'Pay & Track', desc: 'Secure payment via UPI/cards. Order confirmed instantly. Real-time shipping updates until delivery.' },
];

const useCases = [
  { icon: 'ri-t-shirt-line', gradient: 'from-pink-500 to-pink-400', title: 'Fashion & Apparel', desc: 'Size guides, new arrivals alerts, and personalized recommendations.' },
  { icon: 'ri-restaurant-line', gradient: 'from-orange-500 to-orange-400', title: 'Food & Restaurant', desc: 'Menu browsing, order taking, and delivery tracking.' },
  { icon: 'ri-smartphone-line', gradient: 'from-blue-500 to-blue-400', title: 'Electronics', desc: 'Specs comparison, warranty info, and support requests.' },
  { icon: 'ri-leaf-line', gradient: 'from-green-500 to-green-400', title: 'Grocery & FMCG', desc: 'Quick reorders, subscription deliveries, and freshness updates.' },
  { icon: 'ri-sparkling-line', gradient: 'from-purple-500 to-purple-400', title: 'Beauty & Cosmetics', desc: 'Product recommendations, tutorials, and restock reminders.' },
  { icon: 'ri-medicine-bottle-line', gradient: 'from-teal-500 to-teal-400', title: 'Pharmacy', desc: 'Prescription uploads, medicine orders, and refill reminders.' },
  { icon: 'ri-gem-line', gradient: 'from-yellow-500 to-yellow-400', title: 'Jewelry', desc: 'Catalog sharing, custom orders, and appointment booking.' },
  { icon: 'ri-book-open-line', gradient: 'from-red-500 to-red-400', title: 'Education', desc: 'Course enrollment, material delivery, and doubt resolution.' },
];

const integrations = [
  { icon: 'ri-shopping-bag-line', name: 'Shopify', color: '#96bf48' },
  { icon: 'ri-wordpress-line', name: 'WooCommerce', color: '#21759b' },
  { icon: 'ri-store-line', name: 'Magento', color: '#7b68ee' },
  { icon: 'ri-database-2-line', name: 'Zoho CRM', color: '#00a4e4' },
  { icon: 'ri-cloud-line', name: 'Salesforce', color: '#00a1e0' },
  { icon: 'ri-mail-send-line', name: 'HubSpot', color: '#f06b22' },
  { icon: 'ri-secure-payment-line', name: 'Razorpay', color: '#528ff0' },
  { icon: 'ri-bank-card-line', name: 'Paytm', color: '#002e6e' },
  { icon: 'ri-google-line', name: 'Google Sheets', color: '#4285f4' },
  { icon: 'ri-webhook-line', name: 'Zapier', color: '#ff4a00' },
];

const pricingPlans = [
  {
    name: 'Starter',
    subtitle: 'For small businesses getting started',
    price: 'Free',
    period: '',
    features: ['Up to 100 conversations/month', '1 WhatsApp number', 'Product catalog (50 items)', 'Basic chatbot flows', 'Order notifications', 'Email support'],
    cta: 'Get Started',
    ctaStyle: 'bg-bg-light text-text-dark hover:bg-gray-200',
    featured: false,
  },
  {
    name: 'Growth',
    subtitle: 'For growing businesses',
    price: '₹2,499',
    period: '/month',
    features: ['Unlimited conversations', '2 WhatsApp numbers', 'Unlimited products', 'Advanced chatbot with AI', 'Bulk campaigns (5000/month)', 'Payment integrations', 'Analytics dashboard', 'Priority support'],
    cta: 'Start Free Trial',
    ctaStyle: 'bg-gradient-whatsapp text-white',
    featured: true,
  },
  {
    name: 'Enterprise',
    subtitle: 'For large-scale operations',
    price: 'Custom',
    period: '',
    features: ['Unlimited everything', 'Multiple WhatsApp numbers', 'Custom integrations', 'Dedicated account manager', 'SLA guarantees', 'On-premise deployment', '24/7 phone support'],
    cta: 'Contact Sales',
    ctaStyle: 'bg-bg-light text-text-dark hover:bg-gray-200',
    featured: false,
  },
];

export default function WhatsAppCommercePage() {
  return (
    <>
      <Header activePage="products" />

      {/* Page Header */}
      <section className="page-header bg-gradient-hero">
        <div className="container">
          <Animated animation="fadeInUp">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <i className="ri-shopping-bag-3-line text-3xl text-white" />
              </div>
              <div>
                <h1 className="mb-1">WhatsApp Commerce</h1>
                <p className="m-0 opacity-90">Turn WhatsApp into Your Storefront</p>
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
              <li className="breadcrumb-item active" aria-current="page">WhatsApp Commerce</li>
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
                  <Badge icon="ri-whatsapp-line" className="mb-4" style={{ background: 'linear-gradient(135deg, rgba(37, 211, 102, 0.1) 0%, rgba(37, 211, 102, 0.15) 100%)', color: '#25d366', borderColor: 'rgba(37, 211, 102, 0.2)' }}>
                    WhatsApp Business API
                  </Badge>
                </Animated>
                <Animated animation="fadeInUp" delay={0.1}>
                  <h2 className="text-3xl md:text-4xl font-bold text-text-dark mb-6">Sell Where Your Customers Already Are</h2>
                </Animated>
                <Animated animation="fadeInUp" delay={0.2}>
                  <p className="text-lg text-text-muted leading-relaxed mb-5">
                    Transform WhatsApp into a powerful sales channel. Enable customers to discover, browse, and purchase your products without ever leaving the chat. With 500M+ Indians on WhatsApp, meet your customers where they spend their time.
                  </p>
                </Animated>
                <Animated animation="fadeInUp" delay={0.3}>
                  <p className="text-lg text-text-muted leading-relaxed mb-8">
                    Our WhatsApp Commerce platform combines product catalogs, native payments, automated checkout, and CRM integrations - everything you need to run a complete storefront on WhatsApp.
                  </p>
                </Animated>
                <Animated animation="fadeInUp" delay={0.4}>
                  <div className="flex gap-3 flex-wrap">
                    <Button variant="cta" asChild style={{ background: 'linear-gradient(135deg, #128C7E 0%, #25d366 100%)' }}>
                      <Link href="/contact">
                        <span>Start Selling Free</span>
                        <i className="ri-arrow-right-line" />
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/contact">
                        <span>Book Demo</span>
                        <i className="ri-calendar-line" />
                      </Link>
                    </Button>
                  </div>
                </Animated>
              </div>
              <div className="col-right">
                <Animated animation="fadeInRight" delay={0.3}>
                  <Stagger className="grid grid-cols-2 gap-5" staggerDelay={0.1}>
                    {[
                      { value: 500, suffix: 'M+', label: 'Indians on WhatsApp' },
                      { value: 98, suffix: '%', label: 'Message Open Rate' },
                      { value: 45, suffix: '%', label: 'Higher Conversion' },
                      { text: '3x', label: 'Customer Engagement' },
                    ].map((stat, i) => (
                      <StaggerItem key={i}>
                        <HoverCard className="service-card text-center p-7">
                          <div className="text-4xl font-extrabold text-green-500 mb-2">
                            {stat.text ? stat.text : <Counter from={0} to={stat.value as number} duration={2} suffix={stat.suffix} />}
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
                <h2 className="section-title">Complete Commerce Solution</h2>
              </Animated>
              <Animated animation="fadeInUp" delay={0.2}>
                <p className="section-subtitle">Everything you need to sell on WhatsApp, in one platform.</p>
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

        {/* How It Works Section */}
        <section className="section bg-white">
          <div className="container">
            <div className="section-header">
              <Animated animation="fadeInUp">
                <Badge icon="ri-flow-chart">How It Works</Badge>
              </Animated>
              <Animated animation="fadeInUp" delay={0.1}>
                <h2 className="section-title">From Browse to Buy in 3 Steps</h2>
              </Animated>
              <Animated animation="fadeInUp" delay={0.2}>
                <p className="section-subtitle">Seamless shopping experience without leaving WhatsApp.</p>
              </Animated>
            </div>
            <Stagger className="grid-3-col" staggerDelay={0.15}>
              {howItWorks.map((step, i) => (
                <StaggerItem key={i} className="grid-item">
                  <HoverCard className="service-card text-center py-10 px-8 h-full">
                    <motion.div
                      className="w-20 h-20 bg-gradient-whatsapp rounded-full flex items-center justify-center mx-auto mb-6 text-white text-3xl font-extrabold"
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      {step.num}
                    </motion.div>
                    <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                    <p className="text-text-muted m-0">{step.desc}</p>
                  </HoverCard>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="section">
          <div className="container">
            <div className="section-header">
              <Animated animation="fadeInUp">
                <Badge icon="ri-store-3-line">Industries</Badge>
              </Animated>
              <Animated animation="fadeInUp" delay={0.1}>
                <h2 className="section-title">Built for Every Business</h2>
              </Animated>
              <Animated animation="fadeInUp" delay={0.2}>
                <p className="section-subtitle">From local shops to enterprise brands.</p>
              </Animated>
            </div>
            <Stagger className="grid-4-col" staggerDelay={0.08}>
              {useCases.map((useCase, i) => (
                <StaggerItem key={i} className="grid-item">
                  <HoverCard className="value-card h-full text-center py-8 px-6">
                    <motion.div
                      className={`w-16 h-16 bg-gradient-to-br ${useCase.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <i className={`${useCase.icon} text-[28px] text-white`} />
                    </motion.div>
                    <h4 className="text-lg font-semibold mb-2">{useCase.title}</h4>
                    <p className="text-sm text-text-muted m-0">{useCase.desc}</p>
                  </HoverCard>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* Integrations Section */}
        <section className="section bg-white">
          <div className="container">
            <div className="section-header">
              <Animated animation="fadeInUp">
                <Badge icon="ri-links-line">Integrations</Badge>
              </Animated>
              <Animated animation="fadeInUp" delay={0.1}>
                <h2 className="section-title">Connect Your Existing Tools</h2>
              </Animated>
              <Animated animation="fadeInUp" delay={0.2}>
                <p className="section-subtitle">Seamless integrations with platforms you already use.</p>
              </Animated>
            </div>
            <Animated animation="fadeInUp" delay={0.3}>
              <div className="flex flex-wrap gap-4 justify-center items-center">
                {integrations.map((integration, i) => (
                  <motion.div
                    key={i}
                    className="bg-white rounded-xl py-4 px-6 shadow-sm flex items-center gap-2.5 font-semibold text-text-dark"
                    whileHover={{ y: -4, boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <i className={`${integration.icon} text-2xl`} style={{ color: integration.color }} />
                    <span>{integration.name}</span>
                  </motion.div>
                ))}
              </div>
            </Animated>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="section">
          <div className="container">
            <div className="section-header">
              <Animated animation="fadeInUp">
                <Badge icon="ri-price-tag-3-line">Pricing</Badge>
              </Animated>
              <Animated animation="fadeInUp" delay={0.1}>
                <h2 className="section-title">Simple, Transparent Pricing</h2>
              </Animated>
              <Animated animation="fadeInUp" delay={0.2}>
                <p className="section-subtitle">Start free, scale as you grow. No hidden fees.</p>
              </Animated>
            </div>
            <Stagger className="flex flex-wrap gap-6 justify-center" staggerDelay={0.15}>
              {pricingPlans.map((plan, i) => (
                <StaggerItem key={i}>
                  <HoverCard
                    className={`bg-white rounded-3xl p-8 shadow-card min-w-[280px] max-w-[380px] flex-1 relative ${plan.featured ? 'border-2 border-green-500' : 'border-2 border-transparent'}`}
                    hoverY={-4}
                  >
                    {plan.featured && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-whatsapp text-white text-xs font-semibold px-4 py-1 rounded-full">
                        Most Popular
                      </div>
                    )}
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-text-muted text-sm mb-4">{plan.subtitle}</p>
                    <div className="text-4xl font-extrabold text-green-500 mb-4">
                      {plan.price}<span className="text-base font-medium text-text-muted">{plan.period}</span>
                    </div>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, j) => (
                        <li key={j} className="flex items-center gap-2.5 text-text-muted text-sm">
                          <i className="ri-check-line text-green-500 text-lg" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button className={`w-full justify-center ${plan.ctaStyle}`} asChild>
                      <Link href="/contact">
                        {plan.cta}
                      </Link>
                    </Button>
                  </HoverCard>
                </StaggerItem>
              ))}
            </Stagger>
            <Animated animation="fadeInUp" delay={0.4}>
              <p className="text-center text-text-muted mt-8 text-sm">
                * WhatsApp conversation charges apply as per Meta pricing. Marketing: ~₹0.94/msg, Utility: ~₹0.14/msg, Service: Free
              </p>
            </Animated>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="container">
            <Animated animation="scaleIn">
              <div className="cta-card" style={{ background: 'linear-gradient(135deg, #075e54 0%, #25d366 100%)' }}>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  Ready to Sell on WhatsApp?
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  Join thousands of businesses already selling on WhatsApp. Start free today.
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
                      <span>Start Free Trial</span>
                      <i className="ri-arrow-right-line" />
                    </Link>
                  </Button>
                  <Button variant="ghost" asChild>
                    <Link href="/contact">
                      <span>Schedule Demo</span>
                      <i className="ri-calendar-line" />
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
