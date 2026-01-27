"use client";

import { HeartPulse, Droplets, Apple, Moon, Dumbbell, Brain, Sun, Shield, ChevronRight } from "lucide-react";

const healthTips = [
  {
    id: 1,
    category: "Nutrition",
    icon: Apple,
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-50",
    textColor: "text-green-700",
    title: "Balanced Diet",
    tips: [
      "Eat at least 5 portions of fruits and vegetables daily",
      "Choose whole grains over refined carbohydrates",
      "Include lean proteins in every meal",
      "Limit processed foods and added sugars",
      "Practice portion control for weight management",
    ],
  },
  {
    id: 2,
    category: "Hydration",
    icon: Droplets,
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    title: "Stay Hydrated",
    tips: [
      "Drink 8-10 glasses of water daily",
      "Start your day with a glass of warm water",
      "Carry a water bottle wherever you go",
      "Eat water-rich fruits like watermelon and cucumber",
      "Limit caffeine and sugary drinks",
    ],
  },
  {
    id: 3,
    category: "Exercise",
    icon: Dumbbell,
    color: "from-orange-500 to-red-500",
    bgColor: "bg-orange-50",
    textColor: "text-orange-700",
    title: "Physical Activity",
    tips: [
      "Aim for 30 minutes of moderate exercise daily",
      "Include both cardio and strength training",
      "Take breaks from sitting every hour",
      "Walk at least 10,000 steps daily",
      "Stretch before and after workouts",
    ],
  },
  {
    id: 4,
    category: "Sleep",
    icon: Moon,
    color: "from-indigo-500 to-purple-500",
    bgColor: "bg-indigo-50",
    textColor: "text-indigo-700",
    title: "Quality Sleep",
    tips: [
      "Get 7-9 hours of sleep each night",
      "Maintain a consistent sleep schedule",
      "Avoid screens 1 hour before bedtime",
      "Keep your bedroom cool and dark",
      "Limit caffeine intake after 2 PM",
    ],
  },
  {
    id: 5,
    category: "Mental Health",
    icon: Brain,
    color: "from-pink-500 to-rose-500",
    bgColor: "bg-pink-50",
    textColor: "text-pink-700",
    title: "Mental Wellness",
    tips: [
      "Practice mindfulness or meditation daily",
      "Stay connected with friends and family",
      "Take breaks when feeling stressed",
      "Seek professional help when needed",
      "Engage in hobbies you enjoy",
    ],
  },
  {
    id: 6,
    category: "Prevention",
    icon: Shield,
    color: "from-teal-500 to-cyan-500",
    bgColor: "bg-teal-50",
    textColor: "text-teal-700",
    title: "Disease Prevention",
    tips: [
      "Get regular health check-ups",
      "Keep vaccinations up to date",
      "Wash hands frequently",
      "Maintain good oral hygiene",
      "Avoid smoking and limit alcohol",
    ],
  },
];

const dailyRoutine = [
  { time: "6:00 AM", activity: "Wake up, drink warm water with lemon", icon: Sun },
  { time: "6:30 AM", activity: "Morning exercise or yoga (30 mins)", icon: Dumbbell },
  { time: "7:30 AM", activity: "Healthy breakfast with protein", icon: Apple },
  { time: "12:30 PM", activity: "Balanced lunch, short walk after", icon: HeartPulse },
  { time: "3:00 PM", activity: "Healthy snack, stay hydrated", icon: Droplets },
  { time: "7:00 PM", activity: "Light dinner, family time", icon: Apple },
  { time: "9:00 PM", activity: "Wind down, no screens", icon: Brain },
  { time: "10:00 PM", activity: "Sleep time for optimal rest", icon: Moon },
];

export default function HealthTipsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Health Tips & Wellness</h1>
        <p className="text-slate-600 mt-1">Daily tips for a healthier lifestyle</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl p-4 text-white">
          <Droplets className="h-8 w-8 mb-2 opacity-80" />
          <p className="text-2xl font-bold">8+</p>
          <p className="text-sm opacity-80">Glasses of Water</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-4 text-white">
          <Dumbbell className="h-8 w-8 mb-2 opacity-80" />
          <p className="text-2xl font-bold">30</p>
          <p className="text-sm opacity-80">Min Exercise Daily</p>
        </div>
        <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl p-4 text-white">
          <Moon className="h-8 w-8 mb-2 opacity-80" />
          <p className="text-2xl font-bold">7-9</p>
          <p className="text-sm opacity-80">Hours of Sleep</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl p-4 text-white">
          <Apple className="h-8 w-8 mb-2 opacity-80" />
          <p className="text-2xl font-bold">5+</p>
          <p className="text-sm opacity-80">Fruits & Veggies</p>
        </div>
      </div>

      {/* Health Tips Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {healthTips.map((category) => (
          <div
            key={category.id}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className={`bg-gradient-to-r ${category.color} p-4`}>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <category.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-white/80 text-sm">{category.category}</p>
                  <h3 className="text-lg font-bold text-white">{category.title}</h3>
                </div>
              </div>
            </div>
            <div className="p-4">
              <ul className="space-y-3">
                {category.tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
                    <ChevronRight className={`h-4 w-4 ${category.textColor} mt-0.5 flex-shrink-0`} />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Daily Routine */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Recommended Daily Routine</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {dailyRoutine.map((item, index) => (
            <div key={index} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50">
              <div className="h-10 w-10 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0">
                <item.icon className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <p className="font-semibold text-teal-600">{item.time}</p>
                <p className="text-sm text-slate-600">{item.activity}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        <p className="font-medium">Disclaimer:</p>
        <p>These tips are for general wellness purposes only. Please consult a healthcare professional for personalized medical advice.</p>
      </div>
    </div>
  );
}
