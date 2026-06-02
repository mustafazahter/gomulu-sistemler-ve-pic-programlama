"use client";

import { useState } from "react";
import { LECTURE_NOTES, Chapter } from "@/data/notes";
import { BookOpen, Search, CheckCircle, ChevronRight, Copy, Check, Info } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const renderContent = (content: string) => {
  const lines = content.split('\n');
  const renderedElements = [];
  let currentTableLines: string[] = [];
  let paragraphAccumulator: string[] = [];

  const flushParagraphs = (key: string) => {
    if (paragraphAccumulator.length > 0) {
      const text = paragraphAccumulator.join('\n');
      renderedElements.push(
        <div key={key} className="text-[13px] leading-relaxed text-white/70 space-y-2 prose-invert my-2">
          {text.split("\n\n").map((paragraph, pIdx) => {
            if (paragraph.trim().startsWith("•")) {
              return (
                <ul key={pIdx} className="list-disc pl-5 space-y-1.5 my-2">
                  {paragraph.split("\n").map((li, liIdx) => (
                    <li key={liIdx} className="text-[13px] text-white/70">
                      {li.replace("•", "").trim().split("**").map((textPart, tIndex) => {
                        return tIndex % 2 === 1 ? <strong key={tIndex} className="font-semibold text-white">{textPart}</strong> : textPart;
                      })}
                    </li>
                  ))}
                </ul>
              );
            }
            return (
              <p key={pIdx} className="my-2 whitespace-pre-line">
                {paragraph.split("**").map((textPart, tIndex) => {
                  return tIndex % 2 === 1 ? <strong key={tIndex} className="font-semibold text-white">{textPart}</strong> : textPart;
                })}
              </p>
            );
          })}
        </div>
      );
      paragraphAccumulator = [];
    }
  };

  const parseTable = (tableLines: string[], key: string) => {
    if (tableLines.length < 3) return null;
    const headers = tableLines[0].split('|').map(s => s.trim()).filter(s => s !== '');
    const alignments = tableLines[1].split('|').map(s => s.trim()).filter(s => s !== '');
    const rows = tableLines.slice(2).map(line => {
      return line.split('|').map(s => s.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1);
    });

    return (
      <div key={key} className="my-6 overflow-x-auto rounded-2xl border border-white/10 shadow-lg bg-[#141618]/60 backdrop-blur-sm">
        <table className="min-w-full divide-y divide-white/10 text-[12px] text-left">
          <thead className="bg-white/[0.02]">
            <tr>
              {headers.map((h, i) => {
                let alignClass = "text-left";
                if (alignments[i]?.includes(':---:')) alignClass = "text-center";
                else if (alignments[i]?.endsWith(':')) alignClass = "text-right";
                const title = h.replace(/\*\*/g, '');
                return (
                  <th key={i} className={`px-4 py-3.5 font-bold text-white/50 tracking-wider font-display ${alignClass}`}>
                    {title}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 bg-transparent">
            {rows.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-white/[0.01] transition-colors duration-150">
                {row.map((cell, cIdx) => {
                  let alignClass = "text-left";
                  if (alignments[cIdx]?.includes(':---:')) alignClass = "text-center";
                  else if (alignments[cIdx]?.endsWith(':')) alignClass = "text-right";

                  return (
                    <td key={cIdx} className={`px-4 py-3 text-white/80 font-medium whitespace-pre-wrap ${alignClass}`}>
                      {cell.split("**").map((textPart, tIndex) => {
                        // Eğer ilk sütun (komut), örnek veya özel bit alanlarıysa kod bloğu gibi gösterelim
                        const isHighlight = (cIdx === 0 || cIdx === 1 || cIdx === 4 || cell.startsWith('0x') || cell.endsWith('h')) && tIndex % 2 === 1;
                        if (isHighlight) {
                          return (
                            <code key={tIndex} className="bg-indigo-500/10 text-indigo-300 font-mono px-2 py-0.5 rounded border border-indigo-500/20 text-[11px]">
                              {textPart}
                            </code>
                          );
                        }
                        return tIndex % 2 === 1 ? <strong key={tIndex} className="font-semibold text-white">{textPart}</strong> : textPart;
                      })}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('|')) {
      flushParagraphs(`p-${i}`);
      currentTableLines.push(lines[i]);
    } else {
      if (currentTableLines.length > 0) {
        const table = parseTable(currentTableLines, `t-${i}`);
        if (table) renderedElements.push(table);
        currentTableLines = [];
      }
      paragraphAccumulator.push(lines[i]);
    }
  }

  flushParagraphs(`p-end`);
  if (currentTableLines.length > 0) {
    const table = parseTable(currentTableLines, `t-end`);
    if (table) renderedElements.push(table);
  }

  return renderedElements;
};

interface NotesReaderProps {
  onSelectWidget: (type: string) => void;
  completedChapters: number[];
  toggleChapterComplete: (id: number) => void;
}

export default function NotesReader({
  onSelectWidget,
  completedChapters,
  toggleChapterComplete,
}: NotesReaderProps) {
  const [selectedChapterId, setSelectedChapterId] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const selectedChapter = LECTURE_NOTES.find((c) => c.id === selectedChapterId) || LECTURE_NOTES[0];

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => {
      setCopiedCodeId(null);
    }, 2000);
  };

  // Search filter across chapters and sections
  const filteredChapters = LECTURE_NOTES.filter((chap) => {
    const titleMatch = chap.title.toLowerCase().includes(searchQuery.toLowerCase());
    const subtitleMatch = chap.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
    const contentMatch = chap.sections.some((sec) =>
      sec.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return titleMatch || subtitleMatch || contentMatch;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full items-stretch">
      {/* Sidebar Navigation */}
      <div className="lg:col-span-4 bg-[#141618] rounded-3xl border border-white/10 p-5 flex flex-col h-[320px] lg:h-[calc(100vh-140px)]">
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/40" />
          <input
            type="text"
            placeholder="Konu veya komut ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-[#E5E7EB] placeholder-white/30"
          />
        </div>

        {/* Chapter List */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-1">
          {filteredChapters.map((chapter) => {
            const isSelected = chapter.id === selectedChapterId;
            const isCompleted = completedChapters.includes(chapter.id);

            return (
              <button
                key={chapter.id}
                onClick={() => setSelectedChapterId(chapter.id)}
                className={`w-full text-left p-3.5 rounded-2xl transition-all duration-200 border group flex items-start gap-3 ${
                  isSelected
                    ? "bg-indigo-600/15 border-indigo-500/30 text-white shadow-sm"
                    : "bg-transparent border-transparent text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <div className="mt-0.5">
                  {isCompleted ? (
                    <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                  ) : (
                    <div
                      className={`h-4 w-4 rounded-full border-2 shrink-0 transition-all ${
                        isSelected
                          ? "border-indigo-400 bg-indigo-500/20"
                          : "border-white/20 group-hover:border-white/40"
                      }`}
                    />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-white/40 font-display">
                      {chapter.id}. Bölüm
                    </span>
                    {chapter.sections.some((s) => s.widgetType) && (
                      <span className="text-[9px] bg-indigo-500/15 text-indigo-300 rounded-full px-1.5 py-0.5 font-medium shrink-0 border border-indigo-500/10">
                        İnteraktif
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-semibold leading-relaxed line-clamp-2 mt-0.5 font-display text-white/90 group-hover:text-white">
                    {chapter.title.split(":").slice(1).join(":").trim() || chapter.title}
                  </h4>
                  <p className="text-[10px] text-white/40 line-clamp-1 mt-0.5">
                    {chapter.subtitle}
                  </p>
                </div>

                <ChevronRight
                  className={`h-4 w-4 mt-2 transition-transform shrink-0 ${
                    isSelected ? "translate-x-0.5 text-indigo-400" : "text-white/20 opacity-0 group-hover:opacity-100"
                  }`}
                />
              </button>
            );
          })}

          {filteredChapters.length === 0 && (
            <div className="text-center py-8 text-white/40">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-xs">Arama kriterine uygun not bulunamadı.</p>
            </div>
          )}
        </div>

        {/* Progress summary inside navigation */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between text-xs mb-1.5 text-white/40">
            <span>Bölüm Tamamlama</span>
            <span className="font-semibold text-white/80">
              {completedChapters.length} / {LECTURE_NOTES.length}
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${(completedChapters.length / LECTURE_NOTES.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Chapter Reader */}
      <div className="lg:col-span-8 bg-[#141618] rounded-3xl border border-white/10 p-6 md:p-8 flex flex-col h-auto min-h-[350px] lg:h-[calc(100vh-140px)] lg:overflow-y-auto">
        {/* Header toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-5 mb-6 gap-3 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="h-4 w-4 text-indigo-400" />
              <span className="text-xs uppercase tracking-widest font-semibold text-white/40 font-display">
                DERS KİTAPÇIĞI
              </span>
            </div>
            <h1 className="text-lg md:text-xl font-bold tracking-tight text-white font-display">
              {selectedChapter.title}
            </h1>
            <p className="text-xs text-white/40 mt-1 font-sans">{selectedChapter.subtitle}</p>
          </div>

          <button
            onClick={() => toggleChapterComplete(selectedChapter.id)}
            className={`px-3.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
              completedChapters.includes(selectedChapter.id)
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-white/5 hover:bg-white/10 border-white/10 text-white/90"
            }`}
          >
            <CheckCircle className={`h-4 w-4 ${completedChapters.includes(selectedChapter.id) ? "text-emerald-400" : "text-white/40"}`} />
            {completedChapters.includes(selectedChapter.id) ? "Tamamlandı" : "Okundu Olarak İşaretle"}
          </button>
        </div>

        {/* Reading Body */}
        <div className="flex-1 space-y-8 text-white/85 lead-relaxed max-w-none text-sm font-sans pr-1">
          {selectedChapter.sections.map((section, index) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border-b border-white/10 pb-8 last:border-b-0"
            >
              <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2 font-display">
                <span className="text-indigo-450 font-light font-display">#{section.id}</span>
                {section.title.split(" ").slice(1).join(" ")}
              </h3>

              {/* Formatting content, lists and tables dynamically */}
              <div className="text-[13px] leading-relaxed text-white/70 space-y-2 prose-invert">
                {renderContent(section.content)}
              </div>

              {/* Lab Trigger Quick Access */}
              {section.widgetType && (
                <div className="mt-4 bg-indigo-500/5 border border-indigo-500/20 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-indigo-500/15 flex items-center justify-center text-indigo-400 shrink-0">
                      <Info className="h-4 w-4" />
                    </div>
                    <div>
                      <h5 className="text-[11px] uppercase tracking-wider font-bold text-indigo-300 font-display">
                        İnteraktif Laboratuvar Modülü
                      </h5>
                      <p className="text-[11px] text-white/50 mt-0.5">
                        Bu konuyu pekiştirmek için hazırlanmış görsel simülatörü çalıştırın.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (section.widgetType) onSelectWidget(section.widgetType);
                    }}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-all hover:shadow shrink-0 font-display"
                  >
                    Simülatörü Aç
                  </button>
                </div>
              )}

              {/* Code Snippet */}
              {section.code && (
                <div className="mt-4 rounded-2xl overflow-hidden border border-white/10">
                  <div className="bg-[#181A1C] px-4 py-2 border-b border-white/10 flex items-center justify-between text-xs text-white/40 font-mono">
                    <span>Assembly (PIC 16F84A / 16F877A)</span>
                    <button
                      onClick={() => handleCopyCode(section.code || "", section.id)}
                      className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      {copiedCodeId === section.id ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-sans font-medium">Kopyalandı</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span className="font-sans">Kodu Kopyala</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-4 bg-[#0B0C0E] overflow-x-auto text-[11px] text-[#BCC4CD] font-mono leading-relaxed select-all">
                    <code>{section.code}</code>
                  </pre>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
