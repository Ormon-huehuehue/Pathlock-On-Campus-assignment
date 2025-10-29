"use client"
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserCheck,
  User,
  CheckCircle,
  ClipboardList,
  MessageSquare,
  Home,
  BookOpen,
  Coffee,
  BarChart2,
  UserCircle,
} from "lucide-react";

type ChecklistItem = {
  id: string;
  title: string;
  subtitle?: string;
  done: boolean;
  icon?: React.ReactNode;
};

const checklistData: ChecklistItem[] = [
  { id: "1", title: "Verify Your Identity", done: false, icon: <User /> },
  { id: "2", title: "Finish Onboarding", done: false, icon: <ClipboardList /> },
  { id: "3", title: "Complete Medical Intake", done: true, icon: <CheckCircle /> },
  { id: "4", title: "Upload Your Body Compositions", done: true, icon: <UserCheck /> },
];

const careTeam = [
  { id: "c1", name: "Carlos Ramirez", title: "Services Manager" },
  { id: "c2", name: "Matthew Smith", title: "Lead Physician" },
  { id: "c3", name: "Luis Martinez", title: "Care Specialist" },
  { id: "c4", name: "Antonio Gonzalez", title: "Wellness Coordinator" },
];

const cardIn = {
  hidden: { opacity: 0, y: 10 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.05 * i } }),
};

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-amber-50 flex items-start justify-center p-6">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Welcome, Nick</h1>
              <p className="text-sm text-slate-500">We’re very excited to get started with you!</p>
            </div>
            <button
              aria-label="help"
              className="text-sm px-3 py-2 rounded-md bg-white/60 backdrop-blur border border-white/30 shadow-sm"
            >
              Need help?
            </button>
          </div>
        </motion.header>

        {/* Onboarding Card */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl bg-gradient-to-br from-emerald-50/80 to-emerald-100/70 p-6 shadow-lg border border-white/30"
        >
          <h2 className="font-semibold text-lg mb-3">Finish Onboarding</h2>
          <p className="text-sm text-slate-600 mb-4">Please ensure the following items are complete so that your Measured clinician can start your virtual visit:</p>

          <div className="space-y-3">
            <AnimatePresence>
              {checklistData.map((it, i) => (
                <motion.button
                  key={it.id}
                  initial="hidden"
                  animate="show"
                  exit={{ opacity: 0, scale: 0.98 }}
                  variants={cardIn}
                  custom={i}
                  whileHover={{ scale: 1.01 }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl bg-white/80 border border-white/40 shadow-sm hover:shadow-md transition focus:outline-none`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-md grid place-items-center ${it.done ? 'bg-emerald-100' : 'bg-white'}`}>
                      <span className="text-slate-700">{it.icon}</span>
                    </div>
                    <div className="text-left">
                      <div className={`font-medium ${it.done ? 'text-slate-800' : 'text-slate-700'}`}>{it.title}</div>
                      {it.subtitle && <div className="text-xs text-slate-500">{it.subtitle}</div>}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                  <motion.div
                    initial={{ scale: it.done ? 1 : 0.9, opacity: it.done ? 1 : 0.7 }}
                    animate={{ scale: it.done ? 1.03 : 1, rotate: it.done ? [0, -6, 0] : 0 }}
                    transition={{ type: "tween", duration: 0.4, ease: "easeInOut" }}
                    >

                      {it.done ? (
                        <CheckCircle className="w-6 h-6 text-emerald-500" />
                      ) : (
                        <div className="w-6 h-6 rounded-full border border-slate-300" />
                      )}
                    </motion.div>

                    <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </motion.section>

        {/* Care Team */}
        <motion.section className="mt-6 rounded-2xl bg-white p-5 shadow-md border border-white/30">
          <motion.h3 initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="font-semibold mb-3">Your Care Team</motion.h3>
          <p className="text-sm text-slate-500 mb-4">Feel free to chat and ask questions with our experts</p>

          <div className="grid grid-cols-2 gap-3">
            {careTeam.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.06 * i }}
                className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-white/40"
              >
                <div className="w-12 h-12 rounded-full bg-white grid place-items-center text-slate-700 shadow-sm">{c.name.split(" ")[0][0]}</div>
                <div className="flex-1">
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-slate-500">{c.title}</div>
                </div>
                <button className="w-9 h-9 rounded-full bg-white shadow-sm grid place-items-center border border-white/40">
                  <MessageSquare className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Bottom Nav Mock */}
        <motion.nav initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="mt-6">
          <div className="rounded-2xl bg-white p-3 shadow-lg border border-white/40 flex justify-between items-center">
            <NavItem icon={<Home />} label="Home" active />
            <NavItem icon={<MessageSquare />} label="Chat" />
            <NavItem icon={<BookOpen />} label="Learn" />
            <NavItem icon={<Coffee />} label="Food" />
            <NavItem icon={<BarChart2 />} label="Progress" />
            <NavItem icon={<UserCircle />} label="Profile" />
          </div>
        </motion.nav>
      </div>
    </div>
  );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <button className={`flex flex-col items-center gap-1 text-xs px-3 py-2 rounded-md ${active ? 'text-emerald-600' : 'text-slate-500'}`}>
      <motion.div whileTap={{ scale: 0.92 }} whileHover={{ y: -3 }} className="p-1">
        {icon}
      </motion.div>
      <div className="text-[10px]">{label}</div>
    </button>
  );
}
