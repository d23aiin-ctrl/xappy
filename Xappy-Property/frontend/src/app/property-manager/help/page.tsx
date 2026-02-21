"use client";

import {
  HelpCircle,
  Book,
  MessageCircle,
  Phone,
  Mail,
  FileText,
  Video,
  ExternalLink,
  ChevronRight,
  Search,
} from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    question: "How do I add a new property?",
    answer: "Navigate to Properties > Click 'Add Property' button > Fill in the property details including address, type, and landlord information > Save.",
  },
  {
    question: "How do I move a tenant through the pipeline?",
    answer: "Go to Tenant Pipeline > Drag and drop the tenant card to the next stage, or click on the tenant and use the 'Advance Stage' button.",
  },
  {
    question: "How do I upload compliance documents?",
    answer: "Go to Compliance > Select the property > Click 'Upload Evidence' on the relevant compliance item > Select the certificate file and set the expiry date.",
  },
  {
    question: "How do I assign a maintenance job?",
    answer: "Go to Maintenance > Click on the issue > Select 'Assign Job' > Choose a supplier from the directory > Set the scheduled date and confirm.",
  },
  {
    question: "How do I generate a tenancy agreement?",
    answer: "Go to Contracts > Select a template > Click 'Generate Agreement' > Fill in tenant and property details > Send for signing.",
  },
  {
    question: "How do I track costs and approve invoices?",
    answer: "Go to Costs > View pending approvals > Review the cost details and attached invoice > Click 'Approve' or 'Reject' with a reason.",
  },
];

const guides = [
  { title: "Getting Started Guide", icon: Book, href: "#" },
  { title: "Tenant Onboarding Workflow", icon: FileText, href: "#" },
  { title: "Compliance Management", icon: FileText, href: "#" },
  { title: "Maintenance & Repairs", icon: FileText, href: "#" },
  { title: "Video Tutorials", icon: Video, href: "#" },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Help & Support</h1>
        <p className="text-sm text-gray-500 mt-1">
          Find answers, guides, and contact support
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search for help..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* FAQs */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Frequently Asked Questions</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {filteredFaqs.map((faq, index) => (
                <div key={index} className="px-6 py-4">
                  <button
                    className="w-full flex items-center justify-between text-left"
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  >
                    <span className="font-medium text-gray-900">{faq.question}</span>
                    <ChevronRight
                      className={`h-5 w-5 text-gray-400 transition-transform ${
                        expandedFaq === index ? "rotate-90" : ""
                      }`}
                    />
                  </button>
                  {expandedFaq === index && (
                    <p className="mt-3 text-gray-600 text-sm">{faq.answer}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Guides */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Guides & Documentation</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {guides.map((guide, index) => (
                <a
                  key={index}
                  href={guide.href}
                  className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition"
                >
                  <div className="flex items-center">
                    <guide.icon className="h-5 w-5 text-indigo-500 mr-3" />
                    <span className="text-gray-900">{guide.title}</span>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Support */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Support</h3>
            <div className="space-y-4">
              <a
                href="mailto:support@xappy.io"
                className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition"
              >
                <Mail className="h-5 w-5 text-indigo-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Email Support</p>
                  <p className="text-xs text-gray-500">support@xappy.io</p>
                </div>
              </a>
              <a
                href="tel:+441onal1234567"
                className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition"
              >
                <Phone className="h-5 w-5 text-indigo-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Phone Support</p>
                  <p className="text-xs text-gray-500">Mon-Fri, 9am-6pm</p>
                </div>
              </a>
              <a
                href="#"
                className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition"
              >
                <MessageCircle className="h-5 w-5 text-indigo-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Live Chat</p>
                  <p className="text-xs text-gray-500">Usually responds in minutes</p>
                </div>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-indigo-50 rounded-xl p-6">
            <HelpCircle className="h-8 w-8 text-indigo-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Need more help?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Our support team is here to help you get the most out of Xappy.
            </p>
            <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium">
              Schedule a Call
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
