"use client";

import { useState } from "react";
import { STUDY_FLASHCARDS, QUIZ_QUESTIONS, Flashcard, QuizQuestion } from "@/data/notes";
import {
  Sparkles,
  HelpCircle,
  Award,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function StudyAssessment() {
  const [studyMode, setStudyMode] = useState<"flashcards" | "quiz">("flashcards");

  // --- FLASHCARDS STATES ---
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [learnedCards, setLearnedCards] = useState<number[]>([]);

  const currentCard = STUDY_FLASHCARDS[cardIndex];

  const handleNextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCardIndex((prev) => (prev + 1) % STUDY_FLASHCARDS.length);
    }, 150);
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCardIndex((prev) => (prev - 1 + STUDY_FLASHCARDS.length) % STUDY_FLASHCARDS.length);
    }, 150);
  };

  const toggleLearned = (id: number) => {
    if (learnedCards.includes(id)) {
      setLearnedCards(learnedCards.filter((cId) => cId !== id));
    } else {
      setLearnedCards([...learnedCards, id]);
    }
  };

  // --- QUIZ STATES ---
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [quizFinished, setQuizFinished] = useState(false);

  const currentQuestion = QUIZ_QUESTIONS[quizIndex];

  const handleSelectOption = (index: number) => {
    if (isQuizSubmitted) return;
    setSelectedOption(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || isQuizSubmitted) return;
    setIsQuizSubmitted(true);

    const updatedAnswers = { ...userAnswers, [currentQuestion.id]: selectedOption };
    setUserAnswers(updatedAnswers);

    if (selectedOption === currentQuestion.correctIndex) {
      setQuizScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (quizIndex === QUIZ_QUESTIONS.length - 1) {
      setQuizFinished(true);
    } else {
      setQuizIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsQuizSubmitted(false);
    }
  };

  const handleRestartQuiz = () => {
    setQuizIndex(0);
    setSelectedOption(null);
    setIsQuizSubmitted(false);
    setQuizScore(0);
    setUserAnswers({});
    setQuizFinished(false);
  };

  return (
    <div className="study-assessment-container bg-white/5 rounded-3xl border border-white/10 p-5 md:p-8 flex flex-col lg:h-[calc(100vh-140px)] min-h-[500px] h-auto shadow-xl">
      {/* Assessment Mode selection Tabs */}
      <div className="flex flex-col sm:flex-row gap-4 border-b border-white/5 pb-3 mb-6 items-start sm:items-center justify-between shrink-0">
        <div className="flex gap-2">
          <button
            onClick={() => setStudyMode("flashcards")}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              studyMode === "flashcards"
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/15"
                : "bg-white/5 text-white/70 hover:bg-white/10 border border-white/5"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            Çalışma Kartları
          </button>
          <button
            onClick={() => setStudyMode("quiz")}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              studyMode === "quiz"
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/15"
                : "bg-white/5 text-white/70 hover:bg-white/10 border border-white/5"
            }`}
          >
            <HelpCircle className="h-4 w-4" />
            Sınav Provası
          </button>
        </div>

        {/* Progress counter */}
        {studyMode === "flashcards" ? (
          <span className="text-[10px] uppercase font-bold tracking-wider text-white/40 font-display">
            Öğrenilen: {learnedCards.length} / {STUDY_FLASHCARDS.length} Kart
          </span>
        ) : (
          <span className="text-[10px] uppercase font-bold tracking-wider text-white/40 font-display">
            Soru: {quizFinished ? QUIZ_QUESTIONS.length : quizIndex + 1} / {QUIZ_QUESTIONS.length}
          </span>
        )}
      </div>

      {/* Main Study assessment Display Panel */}
      <div className="flex-1 overflow-y-auto pr-1">
        <AnimatePresence mode="wait">
          {studyMode === "flashcards" ? (
            <motion.div
              key="flashcards"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex flex-col items-center justify-between h-full max-w-xl mx-auto py-4 min-h-[380px]"
            >
              {/* Card visual wrapper */}
              <div className="w-full max-w-md mx-auto min-h-[220px] md:min-h-[260px] cursor-pointer relative mb-6">
                <AnimatePresence mode="wait">
                  {!isFlipped ? (
                    <motion.div
                      key="front"
                      initial={{ opacity: 0, rotateY: -90 }}
                      animate={{ opacity: 1, rotateY: 0 }}
                      exit={{ opacity: 0, rotateY: 90 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => setIsFlipped(true)}
                      className="flashcard-front w-full min-h-[220px] md:min-h-[260px] bg-gradient-to-br from-[#181A1C] to-[#1E2124] border border-white/10 p-6 md:p-8 rounded-3xl flex flex-col justify-between shadow-sm hover:border-indigo-500/30 transition-all"
                    >
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-400 font-display">
                          BÖLÜM {currentCard.chapterId} • SORU
                        </span>
                        <h3 className="text-sm md:text-base font-bold text-[#E5E7EB] mt-4 leading-relaxed font-display">
                          {currentCard.question}
                        </h3>
                      </div>

                      <div className="flex items-center justify-between text-xs text-white/40 mt-4 border-t border-white/5 pt-4">
                        <span>Cevabı Göstermek İçin Tıklayın</span>
                        <Sparkles className="h-4 w-4 text-indigo-400 animate-pulse" />
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="back"
                      initial={{ opacity: 0, rotateY: 90 }}
                      animate={{ opacity: 1, rotateY: 0 }}
                      exit={{ opacity: 0, rotateY: -90 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => setIsFlipped(false)}
                      className="flashcard-back w-full min-h-[220px] md:min-h-[260px] bg-indigo-950/20 border border-indigo-500/20 p-6 md:p-8 rounded-3xl flex flex-col justify-between shadow-sm hover:border-indigo-500/40 transition-all"
                    >
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-300 font-display block mb-3">
                          CEVAP ANAHTARI
                        </span>
                        <p className="text-xs md:text-sm text-[#E5E7EB]/80 leading-relaxed font-sans">
                          {currentCard.answer}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-xs text-white/40 border-t border-indigo-505/10 pt-4">
                        <span className="font-medium">Soruya Dönmek İçin Tıklayın</span>
                        <Check className="h-4 w-4 text-indigo-400" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Navigation controls */}
              <div className="w-full flex items-center justify-between gap-4 mt-auto">
                <button
                  onClick={handlePrevCard}
                  className="p-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl transition-all flex items-center justify-center cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>

                <button
                  onClick={() => toggleLearned(currentCard.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 cursor-pointer ${
                    learnedCards.includes(currentCard.id)
                      ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-450"
                      : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
                  }`}
                >
                  <CheckCircle2 className={`h-4 w-4 ${learnedCards.includes(currentCard.id) ? "text-emerald-450" : "text-white/30"}`} />
                  {learnedCards.includes(currentCard.id) ? "Öğrendim!" : "Öğrendim Olarak İşaretle"}
                </button>

                <button
                  onClick={handleNextCard}
                  className="p-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl transition-all flex items-center justify-center cursor-pointer"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="max-w-2xl mx-auto py-2 h-full flex flex-col min-h-[385px]"
            >
              {!quizFinished ? (
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    {/* Question header */}
                    <div className="flex items-center gap-2 mb-2">
                      <HelpCircle className="h-4 w-4 text-indigo-400" />
                      <span className="text-[11px] uppercase tracking-wider font-bold text-indigo-300 font-display">
                        Bölüm {currentQuestion.chapterId} Değerlendirme
                      </span>
                    </div>

                    <h3 className="text-sm md:text-base font-bold text-[#E5E7EB] leading-snug mb-5 font-display">
                      {currentQuestion.question}
                    </h3>

                    {/* Multi-choice options list */}
                    <div className="space-y-2.5 mb-6">
                      {currentQuestion.options.map((opt, oIdx) => {
                        const isSelected = selectedOption === oIdx;
                        const isCorrect = oIdx === currentQuestion.correctIndex;

                        let styleClass = "bg-white/5 border-white/10 text-[#E5E7EB]/85 hover:bg-white/10";
                        if (isSelected) {
                          styleClass = "bg-indigo-950/40 border-indigo-500/80 text-white font-semibold";
                        }
                        if (isQuizSubmitted) {
                          if (isCorrect) {
                            styleClass = "bg-emerald-950/40 border-emerald-500/50 text-emerald-300 font-bold shadow-sm shadow-emerald-500/10";
                          } else if (isSelected) {
                            styleClass = "bg-red-950/45 border-red-500/50 text-red-300 opacity-90";
                          } else {
                            styleClass = "bg-white/5 border-white/5 text-white/30 opacity-40";
                          }
                        }

                        return (
                          <button
                            key={oIdx}
                            disabled={isQuizSubmitted}
                            onClick={() => handleSelectOption(oIdx)}
                            className={`quiz-option w-full text-left p-3.5 rounded-2xl border text-xs leading-relaxed transition-all flex items-start gap-3 outline-none cursor-pointer ${styleClass}`}
                          >
                            <span className="quiz-option-badge bg-white/5 border border-white/15 h-5 w-5 rounded-md flex items-center justify-center text-[10px] font-bold font-mono text-[#E5E7EB]/60 shrink-0">
                              {String.fromCharCode(65 + oIdx)}
                            </span>
                            <span className="quiz-option-text flex-1 font-sans">{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Submission and explanations block */}
                  <div className="mt-auto">
                    {/* Academic Explanation alert upon submission */}
                    {isQuizSubmitted && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`quiz-feedback-box p-4 rounded-2xl mb-4 border flex items-start gap-3 text-xs leading-relaxed ${
                          selectedOption === currentQuestion.correctIndex
                            ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                            : "bg-red-950/20 border-red-500/30 text-red-300"
                        }`}
                      >
                        {selectedOption === currentQuestion.correctIndex ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-450 shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <span className="font-bold underline block mb-1">Akademik Değerlendirme</span>
                          {currentQuestion.explanation}
                        </div>
                      </motion.div>
                    )}

                    <div className="flex justify-end gap-3 border-t border-white/5 pt-4">
                      {!isQuizSubmitted ? (
                        <button
                          disabled={selectedOption === null}
                          onClick={handleSubmitAnswer}
                          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-550 disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
                        >
                          Cevabı Gönder
                        </button>
                      ) : (
                        <button
                          onClick={handleNextQuestion}
                          className="px-5 py-2.5 bg-indigo-650 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 font-display cursor-pointer"
                        >
                          {quizIndex === QUIZ_QUESTIONS.length - 1 ? "Sınavı Bitir" : "Sıradaki Soru"}
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-10">
                  <div className="h-16 w-16 bg-indigo-950/30 border border-indigo-500/20 text-indigo-400 rounded-3xl flex items-center justify-center font-bold text-3xl mb-4 shadow-sm">
                    <Award className="h-8 w-8 text-indigo-400" />
                  </div>

                  <h3 className="text-base font-bold text-white font-display">
                    Sınav Provanız Tamamlandı!
                  </h3>
                  <p className="text-xs text-white/40 max-w-sm mt-1 mb-6">
                    Sorulardan doğru yanıtladığınız miktara göre başarı durumunuz ölçülmüştür.
                  </p>

                  <div className="bg-white/5 border border-white/10 px-6 py-4 rounded-2xl mb-8 font-mono">
                    <span className="text-[10px] text-white/40 block uppercase font-display font-semibold">
                      Toplam Başarı Puanı
                    </span>
                    <span className="text-3xl font-bold text-indigo-300">
                      {Math.round((quizScore / QUIZ_QUESTIONS.length) * 100)}%
                    </span>
                    <span className="text-xs text-white/40 block mt-1">
                      {quizScore} Doğru / {QUIZ_QUESTIONS.length} Soru
                    </span>
                  </div>

                  <button
                    onClick={handleRestartQuiz}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-550 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Sınavı Yeniden Başlat
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
