import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

// Dynamic configuration to allow streaming and prevent build-time failures
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "GEMINI_API_KEY sistemde ayarlanmamış. Lütfen AI Studio Secrets panelinden anahtarınızı tanımlayın.",
        },
        { status: 400 }
      );
    }

    const { messages, userCode } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Geçersiz mesaj formatı veya boş istek." },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const systemInstruction = `Sen Gömülü Sistemler ve PIC Mikrodenetleyicileri (özellikle PIC 16F84 ve PIC 16F877A) konusunda uzmanlaşmış akademik bir "Ders Danışmanı ve Mentor" yapay zeka asistanısın. 
Kullanıcılara ders notlarındaki tüm konular, PIC donanımı, pin bacakları, STATUS/INTCON/OPTION_REG/ADCON0/ADCON1 kaydedicileri, 35 temel Assembly komutu (SUBWF, MOVLW, BTFSS vb.), zaman gecikmesi (delay) yazılımsal mikrosaniye hesaplamaları, 16-bit toplama/çıkarma algoritmaları, 7-segment ortak katot/anot ve multiplexing tarama mantığı, 74C922 keypad okuma, ADC karşılaştırmaları ve step motor sürme teknikleri hakkında yardımcı oluyorsun.

Yanıtlarında her zaman akademik, son derece açıklayıcı, net, özgüvenli ve yardımsever bir Türkçe kullanmalısın. 
Kullanıcılar kod gönderdiğinde veya soru sorduysa, her zaman doğruluğunu kontrol et ve yanlışlıkları gidermek için pratik tavsiyeler ver.

Kullanıcının üzerinde çalıştığı mevcut kod:
${userCode ? `\`\`\`assembly\n${userCode}\n\`\`\`` : "Şu an paylaşılan aktif bir kod yok."}

Gerektiğinde Assembly dillerinde örnekler sun ve çevrim sürelerini (C, DC, Z bayrakları, Tcyc = 4/fosc) formülleriyle anlat. 
Her zaman açıklayıcı ve temiz Markdown formatında çıktı ver.`;

    // Map chat history messages to the expected content format for @google/genai SDK
    const formattedContents = messages.map((m: any) => {
      return {
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      };
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const textResponse = response.text || "Asistandan geçerli bir yanıt alınamadı.";

    return NextResponse.json({
      role: "assistant",
      content: textResponse,
    });
  } catch (error: any) {
    console.error("Gemini API error:", error);
    return NextResponse.json(
      {
        error: `Yapay Zeka bağlantısında bir hata meydana geldi: ${error.message || error}`,
      },
      { status: 500 }
    );
  }
}
