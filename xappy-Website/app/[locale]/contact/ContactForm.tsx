'use client';

import { useState, FormEvent } from 'react';
import { Input, Textarea, Select, Button } from '@/components';
import { motion } from '@/components/ui';

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
}

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  function validateForm(formData: FormData): FormErrors {
    const newErrors: FormErrors = {};

    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const subject = formData.get('subject') as string;
    const message = formData.get('message') as string;

    // Name validation
    if (!name || name.trim().length < 2) {
      newErrors.name = 'Please enter a valid name (at least 2 characters)';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation (optional but must be valid if provided)
    if (phone && phone.trim()) {
      const phoneRegex = /^[+]?[\d\s-]{10,15}$/;
      if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
        newErrors.phone = 'Please enter a valid phone number (10-15 digits)';
      }
    }

    // Subject validation
    if (!subject) {
      newErrors.subject = 'Please select a subject';
    }

    // Message validation
    if (!message || message.trim().length < 10) {
      newErrors.message = 'Please enter a message (at least 10 characters)';
    }

    return newErrors;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // Validate form
    const validationErrors = validateForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 500));

    alert('Thank you for your message! We will get back to you within 24 hours.');
    (e.target as HTMLFormElement).reset();
    setErrors({});
    setIsSubmitting(false);
  }

  return (
    <motion.form
      className="contact-form"
      id="contactForm"
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="form-grid">
        <motion.div
          className="form-col"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <Input
            id="name"
            name="name"
            label="Full Name"
            placeholder="Enter your name"
            required
            error={errors.name}
          />
        </motion.div>
        <motion.div
          className="form-col"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          <Input
            type="email"
            id="email"
            name="email"
            label="Email Address"
            placeholder="Enter your email"
            required
            error={errors.email}
          />
        </motion.div>
        <motion.div
          className="form-col"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <Input
            type="tel"
            id="phone"
            name="phone"
            label="Phone Number"
            placeholder="Enter your phone number"
            error={errors.phone}
          />
        </motion.div>
        <motion.div
          className="form-col"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
        >
          <Input
            id="company"
            name="company"
            label="Company Name"
            placeholder="Enter your company name"
          />
        </motion.div>
        <motion.div
          className="form-col-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <Select
            id="subject"
            name="subject"
            label="Subject"
            placeholder="Select a subject"
            required
            error={errors.subject}
            options={[
              { value: 'general', label: 'General Inquiry' },
              { value: 'project', label: 'Start a Project' },
              { value: 'products', label: 'Product Information' },
              { value: 'partnership', label: 'Partnership Opportunity' },
              { value: 'support', label: 'Technical Support' },
            ]}
          />
        </motion.div>
        <motion.div
          className="form-col-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
        >
          <Textarea
            id="message"
            name="message"
            label="Message"
            rows={5}
            placeholder="Tell us about your project or question..."
            required
            error={errors.message}
          />
        </motion.div>
        <motion.div
          className="form-col-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button type="submit" variant="cta" size="lg" disabled={isSubmitting} className="w-full">
              <i className="ri-send-plane-line" />
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </motion.form>
  );
}
