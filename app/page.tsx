"use client";

import { useState, useEffect } from "react";
import { BookOpen, Cpu, Award, GraduationCap, Sun, Moon, Menu, X } from "lucide-react";
import NotesReader from "@/components/NotesReader";
import SimulatorHub from "@/components/SimulatorHub";
import StudyAssessment from "@/components/StudyAssessment";
import { motion, AnimatePresence } from "motion/react";

const getParamsFromURL = () => {
  if (typeof window === "undefined") return { tab: "notes" as const, chapter: 1, widget: "pinout" };
  const params = new URLSearchParams(window.location.search);
  const tab = (params.get("tab") || "notes") as "notes" | "simulation" | "assessment";
  const chapter = parseInt(params.get("chapter") || "1", 10);
  const widget = params.get("widget") || "pinout";
  return { tab, chapter, widget };
};

const updateURLParams = (tab: string, chapter: number, widget: string) => {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams();
  params.set("tab", tab);
  if (tab === "notes") {
    params.set("chapter", chapter.toString());
  } else if (tab === "simulation") {
    params.set("widget", widget);
  }
  const newRelativePathQuery = window.location.pathname + '?' + params.toString();
  window.history.pushState({ tab, chapter, widget }, "", newRelativePathQuery);
};

export default function Page() {
  const [activeTab, setActiveTab] = useState<"notes" | "simulation" | "assessment">("notes");
  const [activeWidget, setActiveWidget] = useState<string>("pinout");
  const [selectedChapterId, setSelectedChapterId] = useState<number>(1);
  const [completedChapters, setCompletedChapters] = useState<number[]>([]);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Sync state from URL params on load and set popstate listener
  useEffect(() => {
    const { tab, chapter, widget } = getParamsFromURL();
    setActiveTab(tab);
    setSelectedChapterId(chapter);
    setActiveWidget(widget);

    // Write initial state to history so back button works correctly on first page load
    window.history.replaceState({ tab, chapter, widget }, "");

    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      if (state) {
        setActiveTab(state.tab || "notes");
        setSelectedChapterId(state.chapter || 1);
        setActiveWidget(state.widget || "pinout");
      } else {
        const parsed = getParamsFromURL();
        setActiveTab(parsed.tab);
        setSelectedChapterId(parsed.chapter);
        setActiveWidget(parsed.widget);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // Load saved theme and completion logs via localstorage securely
  useEffect(() => {
    const saved = localStorage.getItem("completed_chapters");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTimeout(() => {
          setCompletedChapters(parsed);
        }, 0);
      } catch (e) {
        console.error("Failed to parse completion logs", e);
      }
    }

    const savedTheme = localStorage.getItem("theme") as "dark" | "light" | null;
    if (savedTheme) {
      setTimeout(() => {
        setTheme(savedTheme);
      }, 0);
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
  };

  const toggleChapterComplete = (id: number) => {
    let updated;
    if (completedChapters.includes(id)) {
      updated = completedChapters.filter((cIdx) => cIdx !== id);
    } else {
      updated = [...completedChapters, id];
    }
    setCompletedChapters(updated);
    localStorage.setItem("completed_chapters", JSON.stringify(updated));
  };

  const handleTabChange = (tab: "notes" | "simulation" | "assessment") => {
    setActiveTab(tab);
    updateURLParams(tab, selectedChapterId, activeWidget);
  };

  const handleChapterChange = (id: number) => {
    setSelectedChapterId(id);
    updateURLParams(activeTab, id, activeWidget);
  };

  const handleWidgetChange = (widget: string) => {
    setActiveWidget(widget);
    updateURLParams(activeTab, selectedChapterId, widget);
  };

  // Callback to focus active simulation directly from notes embedded triggers
  const handleSelectWidget = (type: string) => {
    setActiveWidget(type);
    setActiveTab("simulation");
    updateURLParams("simulation", selectedChapterId, type);
  };

  return (
    <div className={`min-h-screen bg-[#0F1113] text-[#E5E7EB] flex flex-col justify-between selection:bg-indigo-500/30 selection:text-white transition-colors duration-250 ${theme}`}>
      {/* Premium Elegant Header navbar */}
      <header className="border-b border-white/10 bg-[#0F1113]/80 backdrop-blur-md sticky top-0 z-50 shrink-0 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <div className="h-9 w-9 bg-indigo-650 text-white rounded-xl flex items-center justify-center border border-indigo-500/30 shadow-md shadow-indigo-500/10 shrink-0">
              <Cpu className="h-4.5 w-4.5" />
            </div>
            <div>
              <h1 className="text-xs sm:text-sm font-bold tracking-tight text-white font-display">
                MTU
              </h1>
              <p className="text-[9px] sm:text-[10px] text-white/40 font-sans tracking-wide uppercase font-semibold">
                GÖMÜLÜ SİSTEMLER
              </p>
            </div>
          </div>

          {/* Navigation Controls tabs (Desktop only) */}
          <nav className="hidden md:flex bg-white/5 border border-white/10 rounded-2xl p-1 gap-1">
            <button
              onClick={() => handleTabChange("notes")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all outline-none whitespace-nowrap cursor-pointer ${
                activeTab === "notes" ? "bg-indigo-600 text-white shadow-sm" : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <BookOpen className="h-3.5 w-3.5 shrink-0" />
              Notlar
            </button>
            <button
              onClick={() => handleTabChange("simulation")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all outline-none whitespace-nowrap cursor-pointer ${
                activeTab === "simulation" ? "bg-indigo-600 text-white shadow-sm" : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <Cpu className="h-3.5 w-3.5 shrink-0" />
              Simülasyon
            </button>
            <button
              onClick={() => handleTabChange("assessment")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all outline-none whitespace-nowrap cursor-pointer ${
                activeTab === "assessment" ? "bg-indigo-600 text-white shadow-sm" : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <Award className="h-3.5 w-3.5 shrink-0" />
              Çalışma & Sınav
            </button>
          </nav>

          {/* Theme Switch & User Progress Stats Tag */}
          <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 rounded-xl transition-all cursor-pointer outline-none"
              title={theme === "dark" ? "Aydınlık Tema" : "Karanlık Tema"}
              id="theme-toggle-btn"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Progress counter (desktop/tablet) */}
            <div className="hidden sm:flex items-center gap-3">
              <div className="h-2 w-14 lg:w-16 bg-white/10 rounded-full overflow-hidden border border-white/10">
                <div
                  className="bg-indigo-505 h-full rounded-full transition-all duration-300"
                  style={{ width: `${(completedChapters.length / 12) * 100}%` }}
                />
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[9px] text-white/40 font-sans font-bold uppercase tracking-wider leading-none">
                  İlerleme
                </span>
                <span className="text-xs font-bold text-white font-mono mt-0.5">
                  {Math.round((completedChapters.length / 12) * 100)}%
                </span>
              </div>
            </div>

            {/* Hamburger Button (mobile only) */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl transition-all cursor-pointer outline-none"
              title="Menü"
              id="hamburger-btn"
            >
              {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <>
              {/* Dark Overlay Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 top-16 bg-black z-40 md:hidden"
                onClick={() => setIsMenuOpen(false)}
              />

              {/* Panel Menu Content */}
              <motion.div
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute top-16 left-0 right-0 bg-[#0F1113] border-b border-white/10 shadow-2xl p-4 flex flex-col gap-3 z-50 md:hidden"
              >
                <div className="text-[10px] text-white/40 font-bold uppercase tracking-wider mb-1 px-1">
                  NAVİGASYON
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      handleTabChange("notes");
                      setIsMenuOpen(false);
                    }}
                    className={`w-full px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all outline-none cursor-pointer ${
                      activeTab === "notes"
                        ? "bg-indigo-600 text-white"
                        : "bg-white/5 text-white/80 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <BookOpen className="h-4 w-4 shrink-0" />
                      <span>PIC Programlama Notları</span>
                    </div>
                    {activeTab === "notes" && <div className="h-1.5 w-1.5 bg-white rounded-full" />}
                  </button>

                  <button
                    onClick={() => {
                      handleTabChange("simulation");
                      setIsMenuOpen(false);
                    }}
                    className={`w-full px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all outline-none cursor-pointer ${
                      activeTab === "simulation"
                        ? "bg-indigo-600 text-white"
                        : "bg-white/5 text-white/80 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Cpu className="h-4 w-4 shrink-0" />
                      <span>İnteraktif Simülatörler</span>
                    </div>
                    {activeTab === "simulation" && <div className="h-1.5 w-1.5 bg-white rounded-full" />}
                  </button>

                  <button
                    onClick={() => {
                      handleTabChange("assessment");
                      setIsMenuOpen(false);
                    }}
                    className={`w-full px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all outline-none cursor-pointer ${
                      activeTab === "assessment"
                        ? "bg-indigo-600 text-white"
                        : "bg-white/5 text-white/80 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Award className="h-4 w-4 shrink-0" />
                      <span>Çalışma Kartları & Quiz</span>
                    </div>
                    {activeTab === "assessment" && <div className="h-1.5 w-1.5 bg-white rounded-full" />}
                  </button>
                </div>

                {/* Progress bar inside the menu */}
                <div className="border-t border-white/5 pt-3.5 mt-1 flex flex-col gap-2">
                  <div className="flex justify-between items-center text-[10px] text-white/40 font-bold uppercase tracking-wider px-1">
                    <span>Eğitim İlerleme Oranı</span>
                    <span className="font-mono text-xs text-white">{Math.round((completedChapters.length / 12) * 100)}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5">
                    <div
                      className="bg-indigo-505 h-full rounded-full transition-all duration-300"
                      style={{ width: `${(completedChapters.length / 12) * 100}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>

      {/* Main Workspace Frame container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full relative">
        <AnimatePresence mode="wait">
          {activeTab === "notes" && (
            <motion.div
              key="notes"
              className="h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <NotesReader
                selectedChapterId={selectedChapterId}
                setSelectedChapterId={handleChapterChange}
                onSelectWidget={handleSelectWidget}
                completedChapters={completedChapters}
                toggleChapterComplete={toggleChapterComplete}
              />
            </motion.div>
          )}

          {activeTab === "simulation" && (
            <motion.div
              key="simulation"
              className="h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <SimulatorHub initialWidget={activeWidget} onWidgetChange={handleWidgetChange} />
            </motion.div>
          )}

          {activeTab === "assessment" && (
            <motion.div
              key="assessment"
              className="h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <StudyAssessment />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Humble craft Footer under frame constraints */}
      <footer className="border-t border-white/5 bg-[#0F1113]/50 py-4 shrink-0 text-center text-[10px] text-white/40 select-none">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5 font-sans font-medium text-white/60">
            <GraduationCap className="h-4.5 w-4.5 text-indigo-400" />
            <span>Gömülü Sistemler ve PIC Programlama Akademik El Kitabı Platformu</span>
          </div>
          <div>Ders notlarına sadık kalınarak etkileşimli görsel modüllerle güçlendirilmiştir.</div>
        </div>
      </footer>
    </div>
  );
}
