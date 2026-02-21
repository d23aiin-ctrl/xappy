"use client";

import { HelpCircle, MessageCircle, Phone, Mail, FileText, ChevronRight, ExternalLink, BookOpen, Users, Shield, Building2, ClipboardList, HardHat } from "lucide-react";

const faqs = [
  {
    question: "How do I submit a progress report?",
    answer: "You can submit progress reports through the Chat Assistant by saying 'report progress' or visit the Progress Reports page to fill out the detailed form.",
  },
  {
    question: "How do I report a defect or snag?",
    answer: "Use the Chat Assistant and say 'report defect' or go to the Defects & Snags section. Provide details like location, category, and severity for proper tracking.",
  },
  {
    question: "How do I log a site inspection?",
    answer: "Visit the Inspections page or ask the Chat Assistant to 'log inspection'. Include inspection type, findings, and any issues discovered during the walkthrough.",
  },
  {
    question: "How do I submit a shift handover?",
    answer: "Go to Shift Handovers or ask Xappy to help with 'shift handover'. Document pending tasks, safety concerns, and important updates for the next shift.",
  },
  {
    question: "How do I report a safety incident?",
    answer: "For safety incidents, use the Incidents page or Chat Assistant. Document what happened, who was involved, and any immediate actions taken. Critical incidents should also be reported to your supervisor.",
  },
  {
    question: "How can I view my submitted reports?",
    answer: "Go to the Reports page to see all your submissions. You can filter by report type, status, and date range to find specific reports.",
  },
];

const contactOptions = [
  {
    icon: MessageCircle,
    title: "Chat Support",
    description: "Talk to Xappy AI Assistant",
    action: "Start Chat",
    href: "/supervisor/chat",
    color: "from-blue-500 to-indigo-500",
  },
  {
    icon: Phone,
    title: "Phone Support",
    description: "Call our helpline",
    action: "+91 98765 43210",
    href: "tel:+919876543210",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: Mail,
    title: "Email Support",
    description: "Send us an email",
    action: "support@xappy.property",
    href: "mailto:support@xappy.property",
    color: "from-purple-500 to-pink-500",
  },
];

const resources = [
  { icon: BookOpen, title: "User Guide", description: "Learn how to use Xappy Property" },
  { icon: FileText, title: "Reporting Guidelines", description: "Best practices for site reports" },
  { icon: Users, title: "Team Directory", description: "Find contacts across sites" },
  { icon: Shield, title: "Safety Manual", description: "Site safety guidelines & protocols" },
];

export default function HelpPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-white/20 flex items-center justify-center">
            <HelpCircle className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Help & Support</h1>
            <p className="text-blue-100 mt-1">Get help with using Xappy Property</p>
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
            <p className="text-blue-600 font-semibold mt-3 flex items-center gap-1 group-hover:gap-2 transition-all">
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
      <div className="bg-blue-50 rounded-xl p-5">
        <h3 className="font-bold text-blue-800 mb-3">Quick Tips</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-lg bg-blue-200 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="h-4 w-4 text-blue-700" />
            </div>
            <div>
              <p className="font-medium text-blue-900">Use Chat Assistant</p>
              <p className="text-sm text-blue-700">Ask Xappy to help with any site report or query</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-lg bg-blue-200 flex items-center justify-center flex-shrink-0">
              <HardHat className="h-4 w-4 text-blue-700" />
            </div>
            <div>
              <p className="font-medium text-blue-900">Safety First</p>
              <p className="text-sm text-blue-700">Report any safety concerns immediately</p>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-bold text-slate-900 mb-2">Share Your Feedback</h3>
        <p className="text-sm text-slate-600 mb-4">Help us improve Xappy Property by sharing your experience</p>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
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
