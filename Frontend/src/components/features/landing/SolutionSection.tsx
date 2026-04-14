"use client";

import { motion } from "framer-motion";
import { Brain, LineChart, Bell } from "lucide-react";

const solutions = [
    {
        icon: Brain,
        title: "AI Coaching",
        desc: "Get personalized advice based on your dog's unique behavior patterns.",
        color: "bg-purple-100 text-purple-600",
    },
    {
        icon: LineChart,
        title: "Data Reports",
        desc: "Visualize progress with easy-to-read charts and behavior maps.",
        color: "bg-blue-100 text-blue-600",
    },
    {
        icon: Bell,
        title: "Smart Alerts",
        desc: "Get timely reminders via KakaoTalk so you never miss a training session.",
        color: "bg-yellow-100 text-yellow-600",
    },
];

export function SolutionSection() {
    return (
        <section className="py-24 bg-gray-50">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
                        Data meets Empathy.
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        We combine advanced behavioral science with an interface you'll actually enjoy using.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {solutions.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-shadow"
                        >
                            <div className={`w-14 h-14 rounded-xl ${item.color} flex items-center justify-center mb-6`}>
                                <item.icon className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-slate-800">{item.title}</h3>
                            <p className="text-gray-600">{item.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
