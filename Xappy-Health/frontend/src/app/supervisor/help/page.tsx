"use client";

import { HelpCircle, MessageCircle, Phone, Mail, FileText, ChevronRight, ExternalLink, BookOpen, Users, Shield } from "lucide-react";

const faqs = [
  {
    question: "How do I book an appointment with a doctor?",
    answer: "You can book appointments through our Chat Assistant by saying 'find doctors' or visit the Doctors page to browse available physicians and their schedules.",
  },
  {
    question: "How can I find nearby hospitals?",
    answer: "Use the Chat Assistant and ask 'find hospitals near me' or go to the Hospitals section to see a list of healthcare facilities with contact details.",
  },
  {
    question: "Is the ambulance service free?",
    answer: "Yes, Suwa Seriya (1990) provides free 24/7 ambulance service across Sri Lanka. Simply call 1990 in case of emergency.",
  },
  {
    question: "How do I get medicine information?",
    answer: "Ask our Chat Assistant about any medicine, or visit the Pharmacy section for common medicine references and nearby pharmacy locations.",
  },
  {
    question: "Can I get health tips and advice?",
    answer: "Yes! Our Health Tips section provides wellness advice, daily routines, and preventive care information. The Chat Assistant can also provide personalized health guidance.",
  },
  {
    question: "What should I do in a medical emergency?",
    answer: "Call 1990 (Suwa Seriya) immediately for ambulance service. Visit our Emergency section for all emergency contacts and first aid guidance.",
  },
];

const contactOptions = [
  {
    icon: MessageCircle,
    title: "Chat Support",
    description: "Talk to Xappy AI Assistant",
    action: "Start Chat",
    href: "/supervisor/chat",
    color: "from-teal-500 to-cyan-500",
  },
  {
    icon: Phone,
    title: "Phone Support",
    description: "Call our helpline",
    action: "+94 11 123 4567",
    href: "tel:+94111234567",
    color: "from-blue-500 to-indigo-500",
  },
  {
    icon: Mail,
    title: "Email Support",
    description: "Send us an email",
    action: "support@xappy.health",
    href: "mailto:support@xappy.health",
    color: "from-purple-500 to-pink-500",
  },
];

const resources = [
  { icon: BookOpen, title: "User Guide", description: "Learn how to use Xappy Health" },
  { icon: FileText, title: "Health Resources", description: "Articles and health information" },
  { icon: Users, title: "Community", description: "Join health discussions" },
  { icon: Shield, title: "Privacy Policy", description: "How we protect your data" },
];

export default function HelpPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-white/20 flex items-center justify-center">
            <HelpCircle className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Help & Support</h1>
            <p className="text-teal-100 mt-1">Get help with using Xappy Health</p>
          </div>
        </div>
      </div>

      {/* Contact Options */}
      <div className="grid md:grid-cols-3 gap-4">
        {contactOptions.map((option) => (
          <a
            key={option.title}
            href={option.href}
            className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg transition-all group"
          >
            <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${option.color} flex items-center justify-center mb-4`}>
              <option.icon className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-bold text-slate-900">{option.title}</h3>
            <p className="text-sm text-slate-500 mt-1">{option.description}</p>
            <p className="text-teal-600 font-semibold mt-3 flex items-center gap-1 group-hover:gap-2 transition-all">
              {option.action}
              <ChevronRight className="h-4 w-4" />
            </p>
          </a>
        ))}
      </div>

      {/* FAQ Section */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
          {faqs.map((faq, index) => (
            <details key={index} className="group">
              <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
                <span className="font-medium text-slate-900 pr-4">{faq.question}</span>
                <ChevronRight className="h-5 w-5 text-slate-400 group-open:rotate-90 transition-transform" />
              </summary>
              <div className="px-4 pb-4 text-sm text-slate-600">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* Resources */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Resources</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {resources.map((resource) => (
            <div
              key={resource.title}
              className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                <resource.icon className="h-6 w-6 text-slate-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">{resource.title}</h3>
                <p className="text-sm text-slate-500">{resource.description}</p>
              </div>
              <ExternalLink className="h-5 w-5 text-slate-400" />
            </div>
          ))}
        </div>
      </div>

      {/* Quick Tips */}
      <div className="bg-teal-50 rounded-xl p-5">
        <h3 className="font-bold text-teal-800 mb-3">Quick Tips</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-lg bg-teal-200 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="h-4 w-4 text-teal-700" />
            </div>
            <div>
              <p className="font-medium text-teal-900">Use Chat Assistant</p>
              <p className="text-sm text-teal-700">Ask Xappy anything about healthcare in Sri Lanka</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-lg bg-teal-200 flex items-center justify-center flex-shrink-0">
              <Phone className="h-4 w-4 text-teal-700" />
            </div>
            <div>
              <p className="font-medium text-teal-900">Emergency? Call 1990</p>
              <p className="text-sm text-teal-700">Free ambulance service available 24/7</p>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-bold text-slate-900 mb-2">Share Your Feedback</h3>
        <p className="text-sm text-slate-600 mb-4">Help us improve Xappy Health by sharing your experience</p>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors">
            Give Feedback
          </button>
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50 transition-colors">
            Report an Issue
          </button>
        </div>
      </div>
    </div>
  );
}
