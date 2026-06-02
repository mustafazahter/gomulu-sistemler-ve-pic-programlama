"use client";

import { useState, useEffect, useRef } from "react";
import {
  Cpu,
  Clock,
  Zap,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  ChevronRight,
  Info,
  Layers,
  Sparkles,
  RefreshCw,
  Lightbulb,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SimulatorHubProps {
  initialWidget?: string;
}

export default function SimulatorHub({ initialWidget = "pinout" }: SimulatorHubProps) {
  const [activeTab, setActiveTab] = useState<string>(initialWidget);

  useEffect(() => {
    if (initialWidget) {
      setTimeout(() => {
        setActiveTab(initialWidget);
      }, 0);
    }
  }, [initialWidget]);

  // --- WIDGET 1: PIC Pinout & Registers ---
  const [selectedPin, setSelectedPin] = useState<number | null>(4);
  const pinDetails: Record<number, { name: string; type: string; desc: string; extra?: string }> = {
    1: { name: "RA2", type: "I/O", desc: "PORTA'nın 2. pini. Genel amaçlı dijital giriş/çıkış olarak kullanılır." },
    2: { name: "RA3", type: "I/O", desc: "PORTA'nın 3. pini. Genel amaçlı dijital giriş/çıkış." },
    3: { name: "RA4 / T0CKI", type: "I/O / Timer", desc: "PORTA'nın 4. pini. Açık kollektör (open-drain) çıkışına sahiptir. Aynı zamanda Timer0 modülüne dışarıdan pals (sayıcı girişi) beslemek için kullanılır.", extra: "Açık kollektörlü olduğu için çıkış modunda pull-up direnci bağlanmalıdır." },
    4: { name: "MCLR", type: "Input", desc: "Master Clear (Ana Sıfırlama) pini. Aktif-Düşüktür (Active-low). Dijital lojik-0 (GND) uygulanırsa mikrodenetleyici donanımsal olarak sıfırlanıp 0x0000 adresinden çalışmaya başlar.", extra: "Hatalı sıfırlanmaları önlemek için çalışma anında 10K direnç ile +5V VDD seviyesinde tutulması şarttır." },
    5: { name: "VSS", type: "Power", desc: "Sistem toprağı (GND, 0V) ortak eksi bağlantısı." },
    6: { name: "RB0 / INT", type: "I/O / Interrupt", desc: "PORTB'nin 0. pini. Genel amaçlı I/O olmasının yanı sıra, harici kesme (external hardware interrupt) pimi olarak kullanılır.", extra: "74C922 gibi keypad dekoder parçalarının DA (veri hazır) pimi buraya bağlanarak kesmeli çalışma kurulur." },
    7: { name: "RB1", type: "I/O", desc: "PORTB'nin 1. pini. Genel amaçlı dijital giriş/çıkış." },
    8: { name: "RB2", type: "I/O", desc: "PORTB'nin 2. pini. Genel amaçlı dijital giriş/çıkış." },
    9: { name: "RB3", type: "I/O", desc: "PORTB'nin 3. pini. Genel amaçlı dijital giriş/çıkış." },
    10: { name: "RB4", type: "I/O", desc: "PORTB'nin 4. pini. Genel amaçlı I/O ve durum kesmeli (interrupt-on-change) pin." },
    11: { name: "RB5", type: "I/O", desc: "PORTB'nin 5. pini. Genel amaçlı I/O ve durum kesmeli." },
    12: { name: "RB6 / PGC", type: "I/O / ICSP", desc: "PORTB'nin 6. pini. ICSP (In-Circuit Serial Programming) seri saati girişi." },
    13: { name: "RB7 / PGD", type: "I/O / ICSP", desc: "PORTB'nin 7. pini. ICSP seri veri giriş/çıkış hattı." },
    14: { name: "VDD", type: "Power", desc: "Sistem artı beslemesi (+5V gerilim girişi)." },
    15: { name: "OSC2 / CLKOUT", type: "Clock", desc: "Osilatör çıkış pini. Kristal osilatörün veya rezonatörün bir ayağı buraya bağlanır." },
    16: { name: "OSC1 / CLKIN", type: "Clock", desc: "Osilatör dış saat giriş pini." },
    17: { name: "RA0", type: "I/O", desc: "PORTA'nın 0. pini. Genel amaçlı dijital giriş/çıkış." },
    18: { name: "RA1", type: "I/O", desc: "PORTA'nın 1. pini. Genel amaçlı dijital giriş/çıkış." },
  };

  // --- WIDGET 2: STATUS & RAM BANK EXPLORER ---
  const [statusBits, setStatusBits] = useState<number[]>([0, 0, 0, 1, 1, 0, 0, 0]); // IRP, RP1, RP0, TO, PD, Z, DC, C
  const bitNames = ["IRP", "RP1", "RP0", "TO", "PD", "Z", "DC", "C"];
  const isBank1 = statusBits[2] === 1;

  const toggleStatusBit = (idx: number) => {
    // Treat Read-Only Status bits TO/PD as non-switchable for absolute fidelity
    if (idx === 3 || idx === 4) return;
    const next = [...statusBits];
    next[idx] = next[idx] === 1 ? 0 : 1;
    setStatusBits(next);
  };

  // --- WIDGET 3: CYCLES & DELAY GENERATOR ---
  const [fosc, setFosc] = useState<number>(4); // Default 4 MHz
  const [delayMs, setDelayMs] = useState<number>(50); // Default 50 ms
  const [delayType, setDelayType] = useState<"single" | "nested">("nested");

  const tcyc = 4 / fosc; // in microseconds
  const clicksPerMs = 1000 / tcyc;

  // Let's compute custom loop values for delay
  // For nested delay loop matching 100 ms or similar
  const calcDelayAsmCode = () => {
    const totalCyclesNeeded = (delayMs * 1000) / tcyc;
    let n1 = 250;
    // t_total = 1 + 1 + [(N1-1)*3] + 2 + 2 for single
    // For nested, approx cycle is: N1 * N2 * 3 (machine cycles)
    let n2 = Math.min(255, Math.ceil(totalCyclesNeeded / (n1 * 3)));
    if (n2 <= 1) n2 = 1;

    return `; ---- YAZILIMSAL HASSAS GECİKME SUBROUTINE PANELİ ----
; Saat Frekansı (Fosc): ${fosc} MHz | Tcyc: ${tcyc.toFixed(2)} µs
; İstenen Bekleme Süresi: ${delayMs} ms | Toplam Komut Çevrimi: ${Math.round(totalCyclesNeeded)}

GECIKME_${delayMs}MS
    movlw d'${n2}'       ; Dış sayaç yükleme değeri
    movwf SAYAC1
OUTER_LOOP
    movlw d'${n1}'       ; İç sayaç yükleme değeri
    movwf SAYAC2
INNER_LOOP
    decfsz SAYAC2, F    ; [1 Çevrim] İç sayaç sıfırlandı mı?
    goto INNER_LOOP     ; [2 Çevrim] Hayırsa iç döngüde dön.
    decfsz SAYAC1, F    ; [1 Çevrim] Dış sayaç bitti mi?
    goto OUTER_LOOP     ; [2 Çevrim] Hayırsa başa dön.
    return              ; [2 Çevrim] Geri dön.`;
  };

  // --- WIDGET 4: KNIGHT RIDER LED SCROLLER ---
  const [leds, setLeds] = useState<number[]>([1, 0, 0, 0, 0, 0, 0, 0]);
  const [speed, setSpeed] = useState<number>(100); // 100ms
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [scrollMode, setScrollMode] = useState<"knight" | "rlf">("knight");
  const directionRef = useRef<"left" | "right">("left");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setLeds((prev) => {
          const size = prev.length;
          const currIdx = prev.indexOf(1);

          if (scrollMode === "rlf") {
            // Circular rotation left
            const nextIdx = (currIdx + 1) >= size ? 0 : (currIdx + 1);
            const nextLeds = Array(size).fill(0);
            nextLeds[nextIdx] = 1;
            return nextLeds;
          } else {
            // Knight rider back and forth
            let nextIdx = currIdx;
            if (directionRef.current === "left") {
              if (currIdx === size - 1) {
                directionRef.current = "right";
                nextIdx = currIdx - 1;
              } else {
                nextIdx = currIdx + 1;
              }
            } else {
              if (currIdx === 0) {
                directionRef.current = "left";
                nextIdx = currIdx + 1;
              } else {
                nextIdx = currIdx - 1;
              }
            }
            const nextLeds = Array(size).fill(0);
            nextLeds[nextIdx >= 0 && nextIdx < size ? nextIdx : 0] = 1;
            return nextLeds;
          }
        });
      }, speed);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, speed, scrollMode]);

  const togglePlayLeads = () => setIsPlaying(!isPlaying);
  const resetLedsState = () => {
    setIsPlaying(false);
    setLeds([1, 0, 0, 0, 0, 0, 0, 0]);
    directionRef.current = "left";
  };

  // Binary and Hex calculation of the LED array representation
  const ledValue = leds.reduce((acc, curr, i) => acc + (curr ? Math.pow(2, i) : 0), 0);
  const binaryRepresentation = leds
    .slice()
    .reverse()
    .map((l) => (l ? "1" : "0"))
    .join("");

  // --- WIDGET 5: MULTIPLEXING PERSISTENCE VISUALIZER ---
  const [multiplexFreq, setMultiplexFreq] = useState<number>(3); // 3 Hz to start
  const [currentHane, setCurrentHane] = useState<number>(0);
  const targetChars = ["2", "0", "0", "6"];
  const multiplexIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Rapidly alternate active display digit to show POV concept
    const pulseInterval = 1000 / multiplexFreq;
    multiplexIntervalRef.current = setInterval(() => {
      setCurrentHane((prev) => (prev + 1) % 4);
    }, pulseInterval);

    return () => {
      if (multiplexIntervalRef.current) clearInterval(multiplexIntervalRef.current);
    };
  }, [multiplexFreq]);

  // --- WIDGET 6: 4x4 KEYPAD & DECODER INTERRUPTS ---
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [decodedHex, setDecodedHex] = useState<string>("0");
  const keypadKeys = [
    ["1", "2", "3", "A"],
    ["4", "5", "6", "B"],
    ["7", "8", "9", "C"],
    ["*", "0", "#", "D"],
  ];

  const handleKeypadPress = (key: string) => {
    setActiveKey(key);
    // Decode characters to representations
    const asciiMap: Record<string, string> = {
      "1": "1", "2": "2", "3": "3", "A": "A",
      "4": "4", "5": "5", "6": "6", "B": "B",
      "7": "7", "8": "8", "9": "9", "C": "C",
      "*": "E", "0": "0", "#": "F", "D": "D",
    };
    setDecodedHex(asciiMap[key] || "0");
  };

  // Binary equivalent of active key digit index for OUT A-D representational mapping
  const getBinaryForHex = (hex: string) => {
    const val = parseInt(hex, 16);
    if (isNaN(val)) return ["0", "0", "0", "0"];
    return val
      .toString(2)
      .padStart(4, "0")
      .split("")
      .reverse(); // index 0 is least significant bit OUT A
  };

  const keyBinary = getBinaryForHex(decodedHex);

  // --- WIDGET 7: ADC LEVEL MONITOR ---
  const [analogVoltage, setAnalogVoltage] = useState<number>(2.5); // Default 2.5V
  // convert analog value to 8-bit quantized ADRESH value
  const adreshVal = Math.round((analogVoltage / 5.0) * 255);

  const getLedCountForAdc = () => {
    if (adreshVal >= 230) return 5;
    if (adreshVal >= 180) return 4;
    if (adreshVal >= 130) return 3;
    if (adreshVal >= 80) return 2;
    if (adreshVal >= 30) return 1;
    return 0;
  };

  const activeAdcLevel = getLedCountForAdc();

  // --- WIDGET 8: STEP MOTOR SIMULATOR ---
  const [motorPlaying, setMotorPlaying] = useState(false);
  const [motorSpeed, setMotorSpeed] = useState(60); // ms per step
  const [motorDir, setMotorDir] = useState<"CW" | "CCW">("CW");
  const [motorMode, setMotorMode] = useState<"wave" | "full">("wave");
  const [motorStep, setMotorStep] = useState(0);
  const motorIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (motorPlaying) {
      motorIntervalRef.current = setInterval(() => {
        setMotorStep((prev) => {
          if (motorDir === "CW") {
            return prev + 1;
          } else {
            return prev - 1;
          }
        });
      }, motorSpeed);
    } else {
      if (motorIntervalRef.current) clearInterval(motorIntervalRef.current);
    }
    return () => {
      if (motorIntervalRef.current) clearInterval(motorIntervalRef.current);
    };
  }, [motorPlaying, motorSpeed, motorDir]);

  // Determine which motor coils are active
  const isActiveCoil = (coilIndex: number) => {
    // Coil index: 0 = A, 1 = B, 2 = C, 3 = D
    const step = (motorStep % 4 + 4) % 4;
    if (motorMode === "wave") {
      // Wave Drive sequences: step 0 -> A, step 1 -> B, step 2 -> C, step 3 -> D
      return step === coilIndex;
    } else {
      // Full Step (double) sequences: AB, BC, CD, DA
      // Step 0 -> A & B active (0, 1)
      // Step 1 -> B & C active (1, 2)
      // Step 2 -> C & D active (2, 3)
      // Step 3 -> D & A active (3, 0)
      if (step === 0) return coilIndex === 0 || coilIndex === 1;
      if (step === 1) return coilIndex === 1 || coilIndex === 2;
      if (step === 2) return coilIndex === 2 || coilIndex === 3;
      if (step === 3) return coilIndex === 3 || coilIndex === 0;
    }
    return false;
  };

  return (
    <div className="bg-[#141618] rounded-3xl border border-white/10 p-5 md:p-8 flex flex-col lg:h-[calc(100vh-140px)] h-auto min-h-[500px] shadow-xl">
      {/* Visual Workspace Tabbar Menu */}
      <div className="flex border-b border-white/10 pb-3 mb-6 gap-2 overflow-x-auto select-none no-scrollbar shrink-0">
        {[
          { id: "pinout", label: "PIC Pin Yapısı", icon: Cpu },
          { id: "registers", label: "RAM & STATUS", icon: Layers },
          { id: "delay", label: "Saat & Delay", icon: Clock },
          { id: "led-scroller", label: "Bit Kaydırma", icon: Zap },
          { id: "seven-segment", label: "POV Tarama", icon: RefreshCw },
          { id: "adc", label: "ADC Monitor", icon: Sliders },
          { id: "step-motor", label: "Step Motor", icon: Sparkles },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/5"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Workspace Display Area */}
      <div className="flex-1 overflow-y-auto pr-1">
        <AnimatePresence mode="wait">
          {activeTab === "pinout" && (
            <motion.div
              key="pinout"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
            >
              <div className="flex flex-col items-center justify-center p-4 bg-white/5 rounded-2xl border border-white/10 relative shadow-inner min-h-[350px] overflow-hidden w-full">
                {/* Visual IC PIC representation */}
                <div className="text-[10px] uppercase font-bold tracking-widest text-white/40 absolute top-3 font-display text-center w-full px-2">
                  PIC 16F84 / 16F84A Entegre Şeması
                </div>

                <div className="scale-[0.82] min-[375px]:scale-95 sm:scale-100 transition-all origin-center flex items-center justify-center w-full py-4 mt-4">
                  <div className="w-52 bg-[#0B0C0E] border-4 border-[#181A1C] rounded-2xl py-6 px-1.5 flex justify-between gap-1 relative shadow-xl shrink-0">
                  {/* Notch notch marker top center of IC */}
                  <div className="w-8 h-4 bg-[#181A1C] rounded-b-xl absolute top-0 left-1/2 -translate-x-1/2 border-x border-b border-white/5" />

                  {/* Pin list column Left (Pins 1 - 9) */}
                  <div className="flex flex-col justify-between h-64 w-12 gap-1.5 z-10">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((pinNum) => {
                      const pin = pinDetails[pinNum];
                      const isHovered = selectedPin === pinNum;
                      return (
                        <button
                          key={pinNum}
                          onClick={() => setSelectedPin(pinNum)}
                          className={`group relative h-6 rounded flex items-center pr-1.5 justify-start text-[10px] font-mono font-bold transition-all border outline-none ${
                            isHovered
                              ? "bg-indigo-600 text-white border-indigo-500 scale-105 shadow-md"
                              : "bg-stone-800/80 text-white/60 border-stone-750 hover:bg-stone-700 hover:text-white"
                          }`}
                        >
                          {/* Pin Metallic physical pad */}
                          <div
                            className={`w-3.5 h-[5px] absolute right-full top-1/2 -translate-y-1/2 rounded-l ${
                              isHovered ? "bg-indigo-400" : "bg-stone-600 shadow-sm"
                            }`}
                          />
                          <span className="text-[8px] opacity-40 ml-1.5 mr-1 block text-left">
                            {pinNum}
                          </span>
                          <span className="truncate">{pin.name.split("/")[0]}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Pin Register values or center title */}
                  <div className="flex flex-col justify-center items-center flex-1 text-center select-none text-[11px] text-white/20 font-mono font-bold">
                    <span className="text-white tracking-widest text-[9px] font-display">16F84A</span>
                    <span className="text-[8px] opacity-30 mt-1 uppercase font-semibold font-sans">
                      18-PIN DIP
                    </span>
                  </div>

                  {/* Pin list column Right (Pins 18 to 10 mapped bottom) */}
                  <div className="flex flex-col justify-between h-64 w-12 gap-1.5 z-10">
                    {[18, 17, 16, 15, 14, 13, 12, 11, 10].map((pinNum) => {
                      const pin = pinDetails[pinNum];
                      const isHovered = selectedPin === pinNum;
                      return (
                        <button
                          key={pinNum}
                          onClick={() => setSelectedPin(pinNum)}
                          className={`group relative h-6 rounded flex items-center pl-1.5 justify-end text-[10px] font-mono font-bold transition-all border outline-none ${
                            isHovered
                              ? "bg-indigo-600 text-white border-indigo-500 scale-105 shadow-md"
                              : "bg-stone-800/80 text-white/60 border-stone-750 hover:bg-stone-700 hover:text-white"
                          }`}
                        >
                          {/* Pin Metallic physical pad */}
                          <div
                            className={`w-3.5 h-[5px] absolute left-full top-1/2 -translate-y-1/2 rounded-r ${
                              isHovered ? "bg-indigo-400" : "bg-stone-600 shadow-sm"
                            }`}
                          />
                          <span className="truncate">{pin.name.split("/")[0]}</span>
                          <span className="text-[8px] opacity-40 ml-1 mr-1.5 block text-right">
                            {pinNum}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

              {/* Pin Details descriptions panel */}
              <div className="flex flex-col justify-center h-full min-h-[300px]">
                {selectedPin ? (
                  <div>
                    <div className="flex items-center gap-3.5 mb-4">
                      <div className="h-12 w-12 bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 rounded-2xl flex items-center justify-center font-bold text-lg font-mono">
                        {selectedPin}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white font-display">
                          {pinDetails[selectedPin].name}
                        </h3>
                        <span className="inline-block bg-white/5 border border-white/10 text-white/60 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider font-display">
                          {pinDetails[selectedPin].type}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-white/70 leading-relaxed font-sans mb-4">
                      {pinDetails[selectedPin].desc}
                    </p>

                    {pinDetails[selectedPin].extra && (
                      <div className="info-callout p-3.5 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl flex items-start gap-2.5 text-indigo-300 text-xs">
                        <Info className="h-4 w-4 shrink-0 mt-0.5" />
                        <span className="leading-relaxed font-sans">
                          {pinDetails[selectedPin].extra}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-white/40">
                    <Lightbulb className="h-10 w-10 mx-auto mb-3 opacity-30 text-indigo-400" />
                    <p className="text-xs">
                      Detaylı donanım kuralları ve pin bilgilerini görmek için entegre üzerindeki
                      pin bacaklarından birine tıklayın.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "registers" && (
            <motion.div
              key="registers"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-6"
            >
              {/* Status Register Grid Editor */}
              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                <div className="flex items-center justify-between mb-3.5">
                  <span className="text-xs font-semibold text-white/80 tracking-wider uppercase font-display">
                    STATUS Kaydedicisi (0x03) Bit Kontrolü
                  </span>
                  <span className="text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-bold px-2 py-0.5 rounded-full font-display">
                    İNTERAKTİF BİTLER
                  </span>
                </div>

                <div className="grid grid-cols-8 gap-2 mb-4">
                  {bitNames.map((name, i) => {
                    const val = statusBits[i];
                    const isReadOnly = i === 3 || i === 4; // TO, PD are read only
                    return (
                      <button
                        key={name}
                        onClick={() => toggleStatusBit(i)}
                        className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all ${
                          val === 1
                            ? "bg-indigo-600 text-white border-indigo-500 shadow-sm shadow-indigo-500/15"
                            : "bg-white/5 text-[#E5E7EB] border-white/10 hover:border-white/25"
                        } ${isReadOnly ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        <span className="text-[10px] font-bold font-mono">{name}</span>
                        <span className="text-lg font-mono font-bold mt-1">{val}</span>
                        <span className="text-[8px] opacity-40 mt-0.5 font-mono">B{7 - i}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="text-[11px] text-white/60 leading-relaxed flex items-start gap-2 bg-white/5 p-3 rounded-xl border border-white/10">
                  <Info className="h-4 w-4 shrink-0 mt-0.5 text-indigo-400" />
                  <div>
                    <span className="font-bold text-white">RP0 biti (Bit 5) tıklandığında</span>{" "}
                    bellek bankaları otomatik değiştirilir. Şemalarda aktifleşen GPR/SFR bölgeleri
                    canlı güncellenmektedir.
                  </div>
                </div>
              </div>

              {/* RAM Banks graphical view map representation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Bank 0 */}
                <div
                  className={`p-4 border rounded-2xl transition-all duration-300 ${
                    !isBank1
                      ? "bg-indigo-500/10 border-indigo-500/30 shadow-md ring-1 ring-indigo-500/20"
                      : "bg-[#181A1C] border-white/5 opacity-40"
                  }`}
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-white font-display">
                      BANK 0 (RP0 = 0)
                    </span>
                    {!isBank1 && (
                      <span className="text-[9px] bg-indigo-600 text-white rounded-full px-2 py-0.5 font-bold uppercase font-display">
                        Aktif Alan
                      </span>
                    )}
                  </div>
                  <div className="space-y-1.5 font-mono text-[10px] overflow-hidden rounded-xl bg-white/5 border border-white/10 p-2.5">
                    <div className="bg-white/5 text-white/80 px-2 py-1.5 rounded flex justify-between font-bold">
                      <span>00h: INDF</span>
                      <span className="text-white/40">Özel SFR</span>
                    </div>
                    <div className="bg-white/5 text-white/80 px-2 py-1.5 rounded flex justify-between font-bold">
                      <span>03h: STATUS</span>
                      <span className="text-white/40">Bitler: IRP | RP1 | RP0...</span>
                    </div>
                    <div className="bg-white/5 text-white/80 px-2 py-1.5 rounded flex justify-between font-bold">
                      <span>05h: PORTA</span>
                      <span className="text-white/40">I/O Değerleri</span>
                    </div>
                    <div className="bg-white/5 text-white/80 px-2 py-1.5 rounded flex justify-between font-bold">
                      <span>06h: PORTB</span>
                      <span className="text-white/40">I/O Değerleri</span>
                    </div>
                    <div className="bg-blue-900/10 border border-blue-800/20 text-blue-300 px-2 py-3 rounded flex flex-col justify-center font-bold">
                      <div className="flex justify-between">
                        <span>0Ch - 4Fh: GPR</span>
                        <span>Bellek Hücreleri</span>
                      </div>
                      <span className="text-[9px] text-white/40 font-sans font-normal mt-1">
                        Değişkenlerin ve kullanıcı verilerinin muhafaza edildiği 68 byte alan
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bank 1 */}
                <div
                  className={`p-4 border rounded-2xl transition-all duration-300 ${
                    isBank1
                      ? "bg-indigo-500/10 border-indigo-500/30 shadow-md ring-1 ring-indigo-500/20"
                      : "bg-[#181A1C] border-white/5 opacity-40"
                  }`}
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-white font-display">
                      BANK 1 (RP0 = 1)
                    </span>
                    {isBank1 && (
                      <span className="text-[9px] bg-indigo-600 text-white rounded-full px-2 py-0.5 font-bold uppercase font-display">
                        Aktif Alan
                      </span>
                    )}
                  </div>
                  <div className="space-y-1.5 font-mono text-[10px] overflow-hidden rounded-xl bg-white/5 border border-white/10 p-2.5">
                    <div className="bg-[#181A1C] text-white/50 px-2 py-1.5 rounded flex justify-between font-bold">
                      <span>80h: INDF</span>
                      <span>Özel SFR</span>
                    </div>
                    <div className="bg-[#181A1C] text-white/50 px-2 py-1.5 rounded flex justify-between font-bold">
                      <span>83h: STATUS</span>
                      <span>Aynalanmış SFR</span>
                    </div>
                    <div className="bg-indigo-500/10 text-indigo-300 px-2 py-1.5 rounded flex justify-between font-bold border border-indigo-500/20">
                      <span>85h: TRISA</span>
                      <span>Yönlendirme Kaydı</span>
                    </div>
                    <div className="bg-indigo-500/10 text-indigo-300 px-2 py-1.5 rounded flex justify-between font-bold border border-indigo-500/20">
                      <span>86h: TRISB</span>
                      <span>Yönlendirme Kaydı</span>
                    </div>
                    <div className="bg-[#181A1C] text-white/50 px-2 py-1.5 rounded flex justify-between font-bold">
                      <span>81h: OPTION_REG</span>
                      <span>Kesmeler & Prescaler</span>
                    </div>
                    <div className="bg-[#181A1C] text-white/30 px-2 py-1 rounded flex justify-between font-bold opacity-30">
                      <span>GPR (Aynalanmış)</span>
                      <span>Bank 0 eşdeğeri</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "delay" && (
            <motion.div
              key="delay"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-6"
            >
              {/* Calculation Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/5 border border-white/10 p-5 rounded-2xl">
                <div>
                  <label className="block text-xs font-bold text-white/80 tracking-wider uppercase mb-2 font-display">
                    Osilatör Frekansı (fosc)
                  </label>
                  <div className="flex gap-2 mb-3">
                    {[
                      { l: "32 kHz (LP)", v: 0.032 },
                      { l: "1 MHz (XT)", v: 1 },
                      { l: "4 MHz (XT)", v: 4 },
                      { l: "20 MHz (HS)", v: 20 },
                    ].map((btn) => (
                      <button
                        key={btn.l}
                        onClick={() => setFosc(btn.v)}
                        className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold flex-1 transition-all ${
                          fosc === btn.v
                            ? "bg-indigo-600 text-white border-indigo-500"
                            : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10"
                        }`}
                      >
                        {btn.l}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0.1"
                      max="20"
                      step="0.1"
                      value={fosc}
                      onChange={(e) => setFosc(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                    <span className="text-xs font-mono font-bold shrink-0 w-16 text-right">
                      {fosc.toFixed(1)} MHz
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/80 tracking-wider uppercase mb-2 font-display">
                    Bekleme Süresi (milisaniye)
                  </label>
                  <div className="flex gap-2 mb-3">
                    {[10, 50, 100, 200].map((ms) => (
                      <button
                        key={ms}
                        onClick={() => setDelayMs(ms)}
                        className={`px-3 py-1.5 rounded-lg border text-[11px] font-semibold flex-1 transition-all ${
                          delayMs === ms
                            ? "bg-indigo-600 text-white border-indigo-500"
                            : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10"
                        }`}
                      >
                        {ms} ms
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="1"
                      max="500"
                      step="1"
                      value={delayMs}
                      onChange={(e) => setDelayMs(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                    <span className="text-xs font-mono font-bold shrink-0 w-16 text-right">
                      {delayMs} ms
                    </span>
                  </div>
                </div>
              </div>

              {/* Real-time Tcyc math outputs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Osilatör Frekansı", val: `${fosc} MHz` },
                  { label: "Dahili Saat Frekansı", val: `${(fosc / 4).toFixed(3)} MHz` },
                  { label: "Komut Çevrimi Tcyc", val: `${tcyc.toFixed(2)} µs`, highlight: true },
                  { label: "Mil saniyede Çevrim", val: Math.round(clicksPerMs).toLocaleString() },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className={`p-3.5 border rounded-xl flex flex-col justify-center text-center ${
                      stat.highlight
                        ? "bg-indigo-500/10 border-indigo-500/25 text-indigo-300"
                        : "bg-white/5 border-white/10 text-[#E5E7EB]"
                    }`}
                  >
                    <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold font-display">
                      {stat.label}
                    </span>
                    <span className="text-sm font-bold font-mono mt-1">{stat.val}</span>
                  </div>
                ))}
              </div>

              {/* Generated commented delay Assembly block output */}
              <div className="rounded-2xl overflow-hidden border border-white/10 shadow-sm mt-2">
                <div className="bg-[#181A1C] px-4 py-2 border-b border-white/10 flex items-center justify-between text-xs text-white/45 font-mono">
                  <span>Hesaplanan Gecikme Alt Program Kodu</span>
                  <span className="text-[10px] text-white/30 font-sans">Otomatik Hesaplanır</span>
                </div>
                <pre className="p-4 bg-[#0B0C0E] overflow-x-auto text-[11px] text-[#BCC4CD] font-mono leading-relaxed select-all">
                  <code>{calcDelayAsmCode()}</code>
                </pre>
              </div>
            </motion.div>
          )}

          {activeTab === "led-scroller" && (
            <motion.div
              key="led-scroller"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-6"
            >
              {/* LED array diagram indicator */}
              <div className="bg-[#0B0C0E] rounded-3xl p-6 border border-white/5 shadow-xl">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xs uppercase font-bold tracking-widest text-white/40 font-display">
                    PORTB (RB7 - RB0) Fiziksel LED Barç
                  </span>
                  <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                    <span className="h-2 w-2 rounded-full bg-emerald-450 animate-pulse" />
                    <span className="text-[9px] text-[#E5E7EB] font-bold uppercase font-mono">
                      PORTB = {ledValue.toString(16).toUpperCase()}h
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto pb-1 no-scrollbar -mx-2 px-2">
                  <div className="flex justify-between gap-1.5 sm:gap-2.5 md:gap-4 flex-row-reverse mb-6 min-w-[290px]">
                    {leds.map((val, idx) => (
                      <div key={idx} className="flex flex-col items-center flex-1 min-w-[28px]">
                        {/* LED active visual glow */}
                        <div
                          className={`w-6.5 h-6.5 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center transition-all duration-150 shrink-0 ${
                            val === 1
                              ? "bg-red-650 bg-red-600 border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.85)]"
                              : "bg-[#181A1C] border-[#2F3336]"
                          }`}
                        >
                          {val === 1 && (
                            <div className="h-2 w-2 sm:h-2.5 sm:w-2.5 bg-white rounded-full opacity-60 filter blur-[0.5px]" />
                          )}
                        </div>
                        <span className="text-[8px] sm:text-[9px] text-white/60 font-mono font-bold mt-2 whitespace-nowrap">
                          RB{idx}
                        </span>
                        <span className="text-[7.5px] sm:text-[8px] opacity-30 text-white/40 font-mono">
                          {val}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Live values */}
                <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4 text-xs font-mono">
                  <div className="text-white/40 flex flex-col">
                    <span>Binlik (Binary):</span>
                    <span className="text-white font-bold mt-0.5">b&apos;{binaryRepresentation}&apos;</span>
                  </div>
                  <div className="text-white/40 flex flex-col text-right">
                    <span>Hexadecimal:</span>
                    <span className="text-white font-bold mt-0.5">
                      0x{ledValue.toString(16).toUpperCase().padStart(2, "0")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl">
                <div className="flex items-center gap-2">
                  <button
                    onClick={togglePlayLeads}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all text-white cursor-pointer ${
                      isPlaying ? "bg-indigo-700" : "bg-indigo-650 hover:bg-indigo-600"
                    }`}
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    {isPlaying ? "Durdur" : "Animasyonu Başlat"}
                  </button>

                  <button
                    onClick={resetLedsState}
                    className="p-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl transition-all cursor-pointer"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>

                {/* Adjust Speed */}
                <div className="flex items-center gap-3 w-full sm:w-auto text-white/70">
                  <span className="text-xs text-white/60 font-sans font-semibold shrink-0">
                    Kayma Hızı:
                  </span>
                  <input
                    type="range"
                    min="20"
                    max="500"
                    step="10"
                    value={speed}
                    onChange={(e) => setSpeed(parseInt(e.target.value))}
                    className="w-28 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-550"
                  />
                  <span className="text-xs font-mono font-bold shrink-0">{speed}ms</span>
                </div>

                {/* Scroll Mode */}
                <div className="flex gap-1.5 bg-[#181A1C] p-1 rounded-xl border border-white/10">
                  <button
                    onClick={() => setScrollMode("knight")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                      scrollMode === "knight" ? "bg-indigo-600 text-white shadow-sm" : "text-white/50 hover:text-white"
                    }`}
                  >
                    Karaşimşek (Knight)
                  </button>
                  <button
                    onClick={() => setScrollMode("rlf")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                      scrollMode === "rlf" ? "bg-indigo-600 text-white shadow-sm" : "text-white/50 hover:text-white"
                    }`}
                  >
                    RLF (Sola Kayma)
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "seven-segment" && (
            <motion.div
              key="seven-segment"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-6"
            >
              {/* POV Multiplexing demo */}
              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xs font-bold text-white/85 tracking-wider uppercase font-display">
                      Çoklu Display Sürme ve İnsan Göz Entegrasyonu (Tarama)
                    </h3>
                    <p className="text-[11px] text-white/40 mt-0.5">
                      Frekans azaldıkça hane seçim bacaklarının tek tek yandığını görebilirsiniz.
                    </p>
                  </div>
                  <span className="text-[9px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-bold px-2 py-0.5 rounded-full font-display">
                    BÖLÜM 8.4
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-6 justify-center">
                  {[0, 1, 2, 3].map((idx) => {
                    const isActive = currentHane === idx;
                    // POV effect works by lighting only active digit fast.
                    // If frequency is high (>= 40), display all digits together to mimic eye integration
                    const showPOVGlow = isActive || multiplexFreq >= 40;

                    return (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl border flex flex-col items-center transition-all ${
                          isActive
                            ? "bg-indigo-500/5 border-indigo-500/30 shadow-inner"
                            : "bg-[#181A1C] border-white/5"
                        }`}
                      >
                        {/* Hane header pin selection */}
                        <span className="text-[10px] font-mono mb-2 text-white/40 uppercase tracking-widest font-bold">
                          Digit {idx + 1}
                        </span>

                        <div
                          className={`w-14 h-20 bg-[#0B0C0E] border-4 rounded-lg flex items-center justify-center font-mono text-3xl font-bold transition-all relative ${
                            showPOVGlow
                              ? "text-red-500 border-red-950 shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                              : "text-stone-800 border-transparent"
                          }`}
                        >
                          {targetChars[idx]}
                          <div
                            className={`w-1.5 h-1.5 rounded-full bg-red-500 absolute bottom-1 right-1 transition-opacity ${
                              showPOVGlow ? "opacity-100 animate-pulse" : "opacity-15"
                            }`}
                          />
                        </div>

                        {/* Transistor trigger flag */}
                        <div className="mt-3 flex items-center gap-1">
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${
                              isActive ? "bg-emerald-500 animate-pulse" : "bg-stone-800"
                            }`}
                          />
                          <span className="text-[9px] font-mono uppercase text-[#E5E7EB]/40">
                            RA{idx} = {isActive ? "1" : "0"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* POV Speed Slider control */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5 pt-4">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <span className="text-xs text-white/60 font-sans font-bold whitespace-nowrap">
                      Tarama Frekansı:
                    </span>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      step="1"
                      value={multiplexFreq}
                      onChange={(e) => setMultiplexFreq(parseInt(e.target.value))}
                      className="w-full sm:w-48 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-550"
                    />
                    <span className="text-xs font-mono font-bold shrink-0 w-16 text-right">
                      {multiplexFreq === 100 ? "100 Hz (Max)" : `${multiplexFreq} Hz`}
                    </span>
                  </div>

                  {/* Persistence evaluation tag */}
                  <div className="text-xs text-white/55 font-sans leading-relaxed flex items-center gap-2">
                    {multiplexFreq < 15 ? (
                      <span className="bg-red-950/20 text-red-400 px-3 py-1 rounded-xl font-semibold border border-red-900/20 self-stretch flex items-center">
                        Yavaş Tarama: Titreşimler Gözle Fark Ediliyor
                      </span>
                    ) : multiplexFreq < 40 ? (
                      <span className="bg-amber-950/20 text-amber-300 px-3 py-1 rounded-xl font-semibold border border-amber-900/20 self-stretch flex items-center">
                        Orta Tarama: Titreşim Kaybolmaya Başlıyor
                      </span>
                    ) : (
                      <span className="bg-emerald-950/20 text-emerald-450 px-3 py-1 rounded-xl font-semibold border border-emerald-900/20 self-stretch flex items-center">
                        Hızlı Tarama: Göz Entegrasyonu Kusursuz! (2006)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Interactive Grid Keypad input connected to DA */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                {/* 4x4 matrix click board */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <span className="block text-xs font-bold text-white/80 tracking-wider uppercase mb-3 font-display">
                    74C922 Matris Tuş Takımı Okuma (Bölüm 10)
                  </span>

                  <div className="grid grid-cols-4 gap-2.5">
                    {keypadKeys.map((row, rIdx) =>
                      row.map((key) => (
                        <button
                          key={key}
                          onClick={() => handleKeypadPress(key)}
                          className={`p-3.5 rounded-xl border font-bold text-xs font-mono transition-all outline-none cursor-pointer ${
                            activeKey === key
                              ? "bg-indigo-650 text-white border-indigo-500 shadow-md scale-95 shadow-indigo-500/20"
                              : "bg-white/5 text-[#E5E7EB] border-white/10 hover:bg-white/10"
                          }`}
                        >
                          {key}
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* Keypad values decoder representation */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
                  <div>
                    <span className="block text-xs font-bold text-white/80 tracking-wider uppercase mb-3.5 font-display">
                      Entegre Kod Çözücü Çıkış Değerleri
                    </span>

                    <div className="space-y-2 font-mono text-[11px]">
                      <div className="flex justify-between items-center bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                        <span className="text-white/40">DA (Data Available - Kesme pimi RB0):</span>
                        <span className="text-emerald-450 font-bold">1 (Yüksek Pals)</span>
                      </div>
                      <div className="flex justify-between items-center bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                        <span className="text-white/40">OUT A-D Binary (PORTB Üst 4-Bit):</span>
                        <span className="text-white/80 font-bold">
                          D:{keyBinary[3]} | C:{keyBinary[2]} | B:{keyBinary[1]} | A:{keyBinary[0]}
                        </span>
                      </div>
                      <div className="flex justify-between items-center bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                        <span className="text-white/40">Decoded Hexadecimal Değer:</span>
                        <span className="text-indigo-300 font-bold">{decodedHex}</span>
                      </div>
                    </div>
                  </div>

                  <div className="info-description text-[11px] text-indigo-300/80 italic font-sans leading-relaxed mt-4 bg-indigo-500/5 p-3 rounded-xl border border-indigo-505/10">
                    Tuş takımından herhangi bir tuşa bastığınızda, 74C922 entegresi anında tuşu
                    çözer, DA bacağını yüksek yaparak PIC modeline RB0 harici kesme (hardware INT)
                    gönderir ve PIC en üst 4 bacaktan değeri okur.
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "adc" && (
            <motion.div
              key="adc"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                {/* Voltaj slider input */}
                <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col justify-between">
                  <div>
                    <span className="block text-xs font-bold text-white/80 tracking-wider uppercase mb-1 font-display">
                      AN0 Potansiyometre Analog Giriş Sinyali
                    </span>
                    <p className="text-[11px] text-white/40 mb-4 font-sans">
                      Analog gerilimi değiştirerek 10-bit ve 8-bit quantization oranını görün.
                    </p>

                    {/* Voltaj gauge widget bar */}
                    <div className="h-28 flex items-end gap-1 mb-5 bg-[#0B0C0E] rounded-xl p-3 relative overflow-hidden shadow-inner border border-white/5">
                      <div className="absolute top-2 left-3 text-[9px] text-[#E5E7EB]/40 font-mono">
                        ANALOG GIRIŞ: {analogVoltage.toFixed(2)} Volts
                      </div>

                      <div
                        className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded transition-all duration-150 shadow-[0_0_10px_rgba(99,102,241,0.6)]"
                        style={{ height: `${(analogVoltage / 5.0) * 100}%` }}
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="5.0"
                        step="0.05"
                        value={analogVoltage}
                        onChange={(e) => setAnalogVoltage(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-550"
                      />
                      <span className="text-xs font-mono font-bold shrink-0 w-16 text-right">
                        {analogVoltage.toFixed(2)} V
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 font-mono text-[11px] border-t border-white/5 pt-4 mt-4">
                    <div className="flex justify-between">
                      <span className="text-white/40">10-Bit Değer (0 - 1023):</span>
                      <span className="text-white/80 font-bold">
                        {Math.round((analogVoltage / 5.0) * 1023)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">ADRESH (Sola Hizalı - 8-Bit):</span>
                      <span className="text-indigo-300 font-bold">{adreshVal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">ADRESH İkili (Binary):</span>
                      <span className="text-white/45 font-semibold">
                        b&apos;{adreshVal.toString(2).padStart(8, "0")}&apos;
                      </span>
                    </div>
                  </div>
                </div>

                {/* Subroutine Comparative Outputs */}
                <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col justify-between">
                  <div>
                    <span className="block text-xs font-bold text-white/80 tracking-wider uppercase mb-1.5 font-display">
                      Assembly Komut Seviye Tetikleyicileri
                    </span>
                    <p className="text-[11px] text-white/40 mb-4 font-sans">
                      Sola hizalama (ADFM=0) ile sadece ADRESH okunarak seviyeler test edilir.
                    </p>

                    <div className="space-y-1.5 font-mono">
                      {[
                        { level: 5, compText: "LEVEL5_COMP (SAYI >= 230)", voltage: ">= 4.5V", ledsCount: 5 },
                        { level: 4, compText: "LEVEL4_COMP (SAYI >= 180)", voltage: "3.5V - 4.5V", ledsCount: 4 },
                        { level: 3, compText: "LEVEL3_COMP (SAYI >= 130)", voltage: "2.5V - 3.5V", ledsCount: 3 },
                        { level: 2, compText: "LEVEL2_COMP (SAYI >= 80)", voltage: "1.5V - 2.5V", ledsCount: 2 },
                        { level: 1, compText: "LEVEL1_COMP (SAYI >= 30)", voltage: "0.5V - 1.5V", ledsCount: 1 },
                        { level: 0, compText: "SIFIR_LED (SAYI < 30)", voltage: "< 0.5V", ledsCount: 0 },
                      ].map((lvl) => {
                        const isCurrentActive =
                          lvl.level === 0
                            ? activeAdcLevel === 0
                            : activeAdcLevel === lvl.level;

                        return (
                          <div
                            key={lvl.level}
                            className={`px-3 py-1.5 rounded-xl border text-[10px] flex justify-between items-center transition-all ${
                              isCurrentActive
                                ? "bg-indigo-600 border-indigo-500 text-white font-bold shadow-sm shadow-indigo-500/10"
                                : "bg-white/5 border-white/5 text-white/50 opacity-65"
                            }`}
                          >
                            <span>{lvl.compText}</span>
                            <span>{lvl.voltage}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Visual LED output bar representing PORTB */}
                  <div className="border-t border-white/5 pt-4 mt-4">
                    <span className="block text-[10px] font-mono uppercase text-[#E5E7EB]/40 mb-2 font-semibold">
                      Fiziksel Çıkış Sütun Grafik (PORTB):
                    </span>
                    <div className="flex gap-2">
                      {[0, 1, 2, 3, 4].map((idx) => {
                        const ledOn = idx < activeAdcLevel;
                        return (
                          <div
                            key={idx}
                            className={`h-5 flex-1 rounded-lg border transition-all duration-300 ${
                              ledOn
                                ? "bg-emerald-600 border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                                : "bg-[#181A1C] border-[#2F3336]"
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "step-motor" && (
            <motion.div
              key="step-motor"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* Step motor physical stator coils visual simulation */}
                <div className="flex flex-col items-center justify-center p-6 py-10 bg-[#0B0C0E] rounded-3xl border border-white/5 shadow-xl relative min-h-[300px] overflow-hidden w-full">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#E5E7EB]/40 absolute top-3 font-display">
                    Step Motor & Shaft Rotor simülasyonu
                  </span>

                  {/* Physical rotating element */}
                  <div className="relative w-44 h-44 my-4 border-4 border-[#181A1C] rounded-full flex items-center justify-center bg-[#151719] shadow-inner">
                    {/* Coils representations around stator */}
                    <div
                      className={`absolute -top-3.5 left-1/2 -translate-x-1/2 text-[9px] sm:text-[10px] font-bold font-mono px-2 py-0.5 rounded-lg border transition-all z-10 whitespace-nowrap ${
                        isActiveCoil(0)
                          ? "bg-indigo-600 text-white border-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.85)] scale-105"
                          : "bg-stone-900 border-white/10 text-white/40"
                      }`}
                    >
                      COIL A (RB0)
                    </div>
                    <div
                      className={`absolute -right-[46px] top-1/2 -translate-y-1/2 text-[9px] sm:text-[10px] font-bold font-mono px-2 py-0.5 rounded-lg border transition-all z-10 whitespace-nowrap ${
                        isActiveCoil(1)
                          ? "bg-indigo-600 text-white border-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.85)] scale-105"
                          : "bg-stone-900 border-white/10 text-white/40"
                      }`}
                    >
                      COIL B (RB1)
                    </div>
                    <div
                      className={`absolute -bottom-3.5 left-1/2 -translate-x-1/2 text-[9px] sm:text-[10px] font-bold font-mono px-2 py-0.5 rounded-lg border transition-all z-10 whitespace-nowrap ${
                        isActiveCoil(2)
                          ? "bg-indigo-600 text-white border-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.85)] scale-105"
                          : "bg-stone-900 border-white/10 text-white/40"
                      }`}
                    >
                      COIL C (RB2)
                    </div>
                    <div
                      className={`absolute -left-[46px] top-1/2 -translate-y-1/2 text-[9px] sm:text-[10px] font-bold font-mono px-2 py-0.5 rounded-lg border transition-all z-10 whitespace-nowrap ${
                        isActiveCoil(3)
                          ? "bg-indigo-600 text-white border-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.85)] scale-105"
                          : "bg-stone-900 border-white/10 text-white/40"
                      }`}
                    >
                      COIL D (RB3)
                    </div>

                    {/* Armature rotor rotating dial */}
                    <motion.div
                      animate={{ rotate: motorStep * 90 }}
                      transition={{ type: "spring", stiffness: 100 }}
                      className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-650 rounded-full border-4 border-indigo-400 flex items-center justify-center shadow-lg relative z-0"
                    >
                      {/* Shaft center indicator pin */}
                      <div className="w-4 h-4 bg-[#0B0C0E] rounded-full border-2 border-indigo-300 shadow-sm" />
                      {/* Pointer strip indicator */}
                      <div className="w-1.5 h-7 bg-red-500 absolute bottom-1/2 left-1/2 -translate-x-1/2 rounded-full shadow-[0_0_5px_rgba(239,68,68,0.7)]" />
                    </motion.div>
                  </div>
                </div>

                {/* Motor sweep settings menu */}
                <div className="flex flex-col justify-between h-full min-h-[300px]">
                  <div>
                    <span className="block text-xs font-bold text-white/80 tracking-wider uppercase mb-3 font-display">
                      Step Sürme Mod ve Hız Ayarları
                    </span>

                    {/* Mode selection links */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <button
                        onClick={() => setMotorMode("wave")}
                        className={`p-3.5 rounded-xl border text-left flex flex-col justify-center transition-all cursor-pointer ${
                          motorMode === "wave"
                            ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-300 shadow-sm"
                            : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                        }`}
                      >
                        <span className="text-xs font-bold font-display">Tek Fazlı (Wave Drive)</span>
                        <span className="text-[9px] text-[#E5E7EB]/40 font-sans font-normal mt-0.5">
                          Uç sıralama: 01h - 02h - 04h - 08h
                        </span>
                      </button>

                      <button
                        onClick={() => setMotorMode("full")}
                        className={`p-3.5 rounded-xl border text-left flex flex-col justify-center transition-all cursor-pointer ${
                          motorMode === "full"
                            ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-300 shadow-sm"
                            : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                        }`}
                      >
                        <span className="text-xs font-bold font-display">Çift Fazlı (Full Step)</span>
                        <span className="text-[9px] text-[#E5E7EB]/40 font-sans font-normal mt-0.5">
                          Uç sıralama: 03h - 06h - 0Ch - 09h
                        </span>
                      </button>
                    </div>

                    {/* Rotate Controls */}
                    <div className="flex items-center gap-2 mb-4 bg-white/5 border border-white/10 px-3 py-2 rounded-xl">
                      <button
                        onClick={() => setMotorPlaying(!motorPlaying)}
                        className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-550 text-white rounded-lg text-xs font-bold shadow-sm transition-all whitespace-nowrap cursor-pointer"
                      >
                        {motorPlaying ? "Motoru Durdur" : "Motoru Başlat"}
                      </button>

                      <div className="flex gap-1.5 bg-[#181A1C] p-1 rounded-lg border border-white/10 text-xs flex-1">
                        <button
                          onClick={() => setMotorDir("CW")}
                          className={`px-2.5 py-1 rounded font-semibold flex-1 transition-all text-center cursor-pointer ${
                            motorDir === "CW" ? "bg-indigo-600 text-white shadow-sm" : "text-white/40"
                          }`}
                        >
                          İleri (CW)
                        </button>
                        <button
                          onClick={() => setMotorDir("CCW")}
                          className={`px-2.5 py-1 rounded font-semibold flex-1 transition-all text-center cursor-pointer ${
                            motorDir === "CCW" ? "bg-indigo-600 text-white shadow-sm" : "text-white/40"
                          }`}
                        >
                          Geri (CCW)
                        </button>
                      </div>
                    </div>

                    {/* Speed Control */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/5 border border-white/10 p-3.5 rounded-xl text-white/70 w-full overflow-hidden">
                      <div className="flex justify-between items-center sm:block shrink-0">
                        <span className="text-xs text-white/60 font-sans font-semibold">
                          Adım Gecikmesi:
                        </span>
                        <span className="text-xs font-mono font-bold sm:hidden">
                          {motorSpeed}ms
                        </span>
                      </div>
                      <div className="flex items-center gap-3 flex-1 w-full">
                        <input
                          type="range"
                          min="20"
                          max="200"
                          step="10"
                          value={motorSpeed}
                          onChange={(e) => setMotorSpeed(parseInt(e.target.value))}
                          className="flex-1 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-550"
                        />
                        <span className="text-xs font-mono font-bold shrink-0 w-12 text-right hidden sm:inline-block">
                          {motorSpeed}ms
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="info-description text-[11px] text-indigo-300/80 leading-relaxed italic mt-4 bg-indigo-500/5 p-3.5 rounded-xl border border-indigo-505/10">
                    Bölüm 12&apos;de ifade edilen step motor donanım bağlantısı uyarınca, RB0-RB3 çıkışları
                    ULN2003 sürücü kartından geçirilerek bobin sargılarını sırasıyla tetikler, her faz
                    adım yönünü besler.
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
