export interface ChapterSection {
  id: string;
  title: string;
  content: string;
  code?: string;
  widgetType?: "pinout" | "registers" | "instruction-set" | "math" | "delay" | "led-scroller" | "seven-segment" | "adc" | "step-motor";
}

export interface Chapter {
  id: number;
  title: string;
  subtitle: string;
  sections: ChapterSection[];
}

export const LECTURE_NOTES: Chapter[] = [
  {
    id: 1,
    title: "BÖLÜM 1: PIC MİKRODENETLEYİCİLERİNİN DONANIMSAL TEMELLERİ",
    subtitle: "PIC 16F84 ve PIC 16F877A Donanım, Yazılım ve Uygulama El Kitabı",
    sections: [
      {
        id: "1.1",
        title: "1.1 PIC 16F84 ve PIC 16F877A Genel Tanıtımı ve Mimari Karşılaştırması",
        content: `PIC (Peripheral Interface Controller) mikrodenetleyicileri, Harvard mimarisine dayanan, veri ve program bellekleri fiziksel olarak birbirinden ayrılmış, RISC (Reduced Instruction Set Computer) yapısına sahip entegrelerdir.

• **Flaş Program Belleği (Flash Program Memory):** Elektrikle yazılıp silinebilen, enerji kesildiğinde içindeki kodları kaybetmeyen bellektir. PIC 16F84'te programın kesildiği yerden devam etmesini sağlayan ve elektrik kesintilerinden etkilenmeyen kalıcı flaş bellek bulunur.
• **CMOS Teknolojisi:** PIC serisi mikrodenetleyiciler CMOS (Complementary Metal-Oxide Semiconductor) teknolojisi kullanılarak üretilmiştir. Bu teknoloji sayesinde statik enerji tüketimleri son derece düşüktür (bütünleşik düşük enerji harcanımı).`,
        widgetType: "registers"
      },
      {
        id: "1.2",
        title: "1.2 PIC 16F84 Pin Yapısı ve Temel Bağlantı Kuralları",
        content: `PIC 16F84 18 pinli (bacaklı) DIP kılıf yapısına sahiptir. Giriş/Çıkış işlemleri ve harici bağlantılar bu pinler üzerinden gerçekleştirilir.

**Kritik Donanım Kuralları:**
1. **Boşta Bacak Bırakmama:** Aşırı akım çekilmesini engellemek amacıyla boşta pin bırakılmamalıdır. Kullanılmayan tüm pinler çıkış olarak tanımlanmalı veya kararlı bir lojik seviyeye (giriş ise pulldown/pullup ile) bağlanmalıdır.
2. **Besleme Gerilimi:** Çalışma gerilimi tipik olarak +5V'tur. Enerji beslemesi VDD (+) pinine (14. pin) +5V ve VSS (-) pinine (5. pin) toprak (GND) verilerek sağlanır.
3. **Gürültü Engelleme (Decoupling Kondansatörü):** Mikrodenetleyiciye ilk enerji verildiğinde veya anlık yük değişimlerinde kararsızlıkları (parazitleri) engellemek için VDD ile VSS pinleri arasına fiziksel olarak entegreye olabildiğince yakın konumlandırılmış 0.1 µF'lık dekuplaj kondansatörü bağlanması zorunludur.`,
        widgetType: "pinout"
      },
      {
        id: "1.3",
        title: "1.3 Osilatör Çeşitleri ve Saat (Clock) Frekansı İlişkisi",
        content: `Mikrodenetleyicinin içerisindeki işlem adımlarının senkronize çalışabilmesi için bir kare dalga sinyaline (saat sinyali / clock sinyali) ihtiyaç vardır. Bu sinyal PIC'in 15 (OSC2) ve 16 (OSC1) nolu pinlerine bağlanan osilatör devresiyle üretilir.

**Genel amaçlı kullanılan 4 farklı osilatör tipi mevcuttur:**
1. **RC (Resistor-Capacitor):** Direnç ve kondansatörden oluşan düşük maliyetli, hassas olmayan osilatör tipidir.
2. **XT (Crystal):** Standart kristal osilatördür (100 kHz - 4 MHz aralığı).
3. **HS (High Speed):** Yüksek hızlı kristal osilatördür (4 MHz - 20 MHz aralığı).
4. **LP (Low Power):** Düşük güç tüketimi gerektiren durumlarda kullanılan düşük frekanslı (32 kHz) kristal osilatör tipidir.

**Komut Çevrim Süresi (Tcyc) Hesabı:**
PIC mikrodenetleyicileri dahili olarak dış osilatör frekansını (fosc) dörde böler. Yani 1 komutun işletilmesi için 4 saat çevrimi (clock cycle) gerekir.

• fcom = fosc / 4
• Tcyc = 1 / fcom = 4 / fosc

**Örnek:** fosc = 4 MHz değerinde bir kristal kullanıldığında:
• Tcyc = 4 / 4 MHz = 1 µs

Yani standart tek çevrimlik bir komut tam olarak **1 µs** sürede çalıştırılır. GOTO, CALL gibi program akışını değiştiren çift çevrimlik komutlar ise **2 µs** sürede işletilir.`,
        widgetType: "delay"
      },
      {
        id: "1.4",
        title: "1.4 Reset (MCLR) Devresi",
        content: `MCLR (Master Clear - Pin 4) ucu mikrodenetleyiciyi donanımsal olarak sıfırlamak (resetlemek) için kullanılır. Bu pin aktif-düşük (active-low) çalışan bir pindir. Normal çalışmada sürekli lojik-1 (+5V) seviyesinde tutulmalıdır. Sıfırlanma istendiğinde anlık olarak lojik-0 (Toprak) seviyesine çekilir. Programın bellek üzerindeki başlangıç adresi olan 0x0000 adresinden yeniden başlamasını sağlar.

**I/O Port Yapısı:**
PIC 16F84'te iki adet I/O (Giriş/Çıkış) portu bulunur:
• **PORTA:** 5 bacaklıdır (RA0-RA4). RA4 pini açık kollektörlüdür (open-drain). Bu yüzden çıkış olarak kullanıldığında harici bir pull-up direnci bağlanmalıdır. Ayrıca RA4 pini dışarıdan gelen palsleri saymak için Timer0 dış saat girişi (T0CKI) olarak da kullanılabilir.
• **PORTB:** 8 bacaklıdır (RB0-RB7). RB0 pini harici kesme (INT) girişi olarak da görev yapar. PORTB pucker/weak pull-up dirençlerine sahiptir. Yazılımsal olarak aktif edildiğinde giriş yapılan bacaklar için harici direnç ihtiyacını ortadan kaldırır.

**TRIS Kaydedicileri:**
Her bir portun giriş mi yoksa çıkış mı olacağını belirleyen yönlendirme kaydedicileri mevcuttur.
• **0 (Çıkış - Output):** İlgili pini çıkış yapar (Akılda kalma yöntemi: Output → 0).
• **1 (Giriş - Input):** İlgili pini giriş yapar (Akılda kalma yöntemi: Input → 1).
Port bacakları maksimum 20 mA seviyesinde akım verebilir veya çekebilir. Giriş çalışma gerilimi limitleri ise [0V - 5V] aralığındadır.`
      }
    ]
  },
  {
    id: 2,
    title: "BÖLÜM 2: BELLEK YAPISI VE ASSEMBLY PROGRAMLAMA TEMELLERİ",
    subtitle: "Program, Veri Belleği, Bank Kavramı ve STATUS Kaydedicisi",
    sections: [
      {
        id: "2.1",
        title: "2.1 Program ve Veri Belleği Yapısı",
        content: `Harvard mimarisinin bir gereği olarak PIC işlemcisinde program kodlarının yazıldığı yer ile değişkenlerin/verilerin tutulduğu bellek alanları birbirinden tamamen bağımsızdır.

1. **Program Belleği (Flash):** 16F84 modelinde 1024 satırlık (1K) bir alandır. Her bellek gözü 14 bit uzunluğundadır, dolayısıyla tek bir komut 14 bitlik veri olarak saklanır. Programın başlangıç adresi (ORG 0x00) ve kesme (interrupt) alt programının başlangıç adresi (ORG 0x04) bu bellektedir. Normal şartlarda bu belleğe çalışma anında veri yazılamaz, sadece RETLW komut tablosu yöntemiyle istisnai veri okumaları yapılabilir.
2. **Veri Belleği (RAM):** Değişkenlerin ve donanımsal kontrol kaydedicilerinin tutulduğu yerdir. 8-bit uzunluğundadır. İki kısma ayrılır:
• **SFR (Special Function Registers):** Donanımı kontrol etmek amacıyla ayrılmış özel amaçlı kaydedicilerdir (PORTA, PORTB, TRISA, TRISB, STATUS, INTCON vb.).
• **GPR (General Purpose Registers):** Kullanıcının kendi tanımladığı değişkenleri sakladığı genel amaçlı bellek bölgesidir. 16F84'te 0x0C adresi ile 0x4F adresi arasındaki bölge bu amaçla ayrılmıştır.`
      },
      {
        id: "2.2",
        title: "2.2 Bellek Bankları ve STATUS Kaydedicisi",
        content: `Veri belleği (RAM) fiziksel olarak **Bank 0** ve **Bank 1** olmak üzere iki gruba ayrılmıştır. Bu banklar arasında geçiş yapmak için STATUS kaydedicisinin 5. biti olan **RP0 (Register Bank Select 0)** biti kullanılır.

**STATUS Kaydedicisi (0x03) Bit Yapısı:**
• **IRP (Bit 7):** Dolaylı adresleme bank seçimi.
• **RP1, RP0 (Bit 6, 5):** Doğrudan adresleme bank seçimi (16F84 için sadece RP0 aktiftir).
• **TO (Bit 4):** Watchdog durum biti (Zaman aşımı).
• **PD (Bit 3):** Güç kesilme biti (Power-down).
• **Z (Bit 2):** Sıfır biti (Zero flag). Bir matematiksel işlemin sonucu 0 olmuşsa otomatik 1 olur.
• **DC (Bit 1):** Yarım elde biti (Digit Carry). İlk 4 bitten 5. bite taşma varsa 1 olur.
• **C (Bit 0):** Elde biti (Carry flag). 8. bitten 9. bite taşma/elde varsa 1 olur.

**Bank Geçiş Kuralları:**
• **RP0 = 1 (Bank 1):** Yönlendirme (TRIS) ayarlarının yapıldığı banktır (TRISA ve TRISB buradadır).
• **RP0 = 0 (Bank 0):** Port durumlarının kontrol edildiği veya değişken verilerinin okunduğu banktır (PORTA ve PORTB buradadır).`,
        code: `; BANK 1'e Geçiş Yapmak İçin:
bsf STATUS, 5      ; STATUS kaydedicisinin 5. bitini (RP0) '1' yap.

; BANK 0'a Geçiş Yapmak İçin:
bcf STATUS, 5      ; STATUS kaydedicisinin 5. bitini (RP0) '0' yap.`
      },
      {
        id: "2.3",
        title: "2.3 Assembly (ASM) Kod Yapısı ve Derleyici Bildirimleri",
        content: `Bir Assembly kaynak kodunun derlenebilmesi için belirli bir şablonda yazılması gerekir. ASM programları 4 ana bloktan oluşur:

1. **Başlık/Bildirim Bloğu:** Kullanılan işlemci modelinin ve tanımlama kütüphanelerinin sisteme çağrıldığı yerdir.
• \`LIST P=16F84A\` : Kullanılacak işlemci modeli tanımlanır.
• \`INCLUDE \"P16F84A.INC\"\` : Kaydedici adres tanımlamalarını içeren kütüphaneyi dahil eder.
2. **Atama/Tanımlama Bloğu (EQU):** Değişken tanımlamaları ve adres eşleştirmeleri yapılır. EQU (Equal) direktifi sabit tanımlamaya ve RAM hücresi isimlendirmeye yarar.
• \`SAYAC EQU 0x0C\` : RAM'deki 0x0C adresindeki genel amaçlı hücreye SAYAC adı verilir.
• \`SAYI1 EQU 0x0D\` : RAM'deki 0x0D hücresine SAYI1 adı verilir.
3. **Kod Bloğu:** Programın başlangıç adresi belirtilir. Program sayacı (PC) sıfır adresine daldığı için program \`ORG 0x00\` ile başlatılır.
• \`ORG 0x00\` : Programın başlangıç adresi belirtilir.
• \`GOTO START\` : Ana program başlangıç etiketine dallan.
4. **Sonlandırma (END):** Derleyiciye kod yazımının bittiğini bildiren zorunlu ifadedir.
• \`END\` : Programın sonu.`,
        code: `LIST P=16F84A
INCLUDE "P16F84A.INC"

SAYAC EQU 0x0C       ; RAM adres tanımlamaları
SAYI1 EQU 0x0D

ORG 0x00             ; Reset vektörü
GOTO START

START
    ; Ana program kodları buraya gelecektir
    NOP
    GOTO START

END                  ; Zorunlu sonlandırma`
      }
    ]
  },
  {
    id: 3,
    title: "BÖLÜM 3: 35 KOMUTLUK ASSEMBLY KOMUT SETİ VE ANALİZİ",
    subtitle: "PIC 16F84 Mikrodenetleyicisinin Tüm Komut Seti ve Detaylı Çalışma Kuralları",
    sections: [
      {
        id: "3.1",
        title: "3.1 Byte Yönlendirmeli Komutlar (Byte-Oriented)",
        content: `Bu komutlar, belirlenen bir kaydedicinin (file register) tamamı (8-bit) üzerinde işlem yaparlar.

**Kullanılan parametreler:**
• **f:** RAM'deki bellek adresi ($0x00 - $0x7F aralığı).
• **d:** Hedef belirteci (Destination). d = 0 (veya W) ise sonuç **W kaydedicisine** yazılır. d = 1 (veya F) ise sonuç **ilgili bellek adresine (f)** geri yazılır.

| Komut | Sözdizimi | Açıklama | Bayrak | Örnek |
| :--- | :--- | :--- | :---: | :--- |
| **ADDWF** | ADDWF f, d | W ile f içeriğini toplar, hedef d 'ye yazar. | C, DC, Z | ADDWF SAYI, F (SAYI = SAYI + W) |
| **ANDWF** | ANDWF f, d | W ile f içeriğini mantıksal AND işlemine sokar. | Z | ANDWF PORTB, W (W = PORTB AND W) |
| **CLRF** | CLRF f | Belirtilen f kaydedicisinin içeriğini sıfırlar ($0x00$). | Z | CLRF PORTB (PORTB = 0) |
| **CLRW** | CLRW | W kaydedicisinin içeriğini sıfırlar ($0x00$). | Z | CLRW (W = 0) |
| **COMF** | COMF f, d | f içeriğinin tümleyenini (bit tersini) alır. | Z | COMF DEGER, F (DEGER = NOT DEGER) |
| **DECF** | DECF f, d | f içeriğini 1 azaltır. | Z | DECF SAYAC, F (SAYAC = SAYAC - 1) |
| **DECFSZ** | DECFSZ f, d | f 'yi 1 azaltır, sonuç 0 ise bir sonraki komutu atlar. | Yok | DECFSZ SAYAC, F (Sayıp sıfıra ulaşınca atlar) |
| **INCF** | INCF f, d | f içeriğini 1 artırır. | Z | INCF SAYAC, F (SAYAC = SAYAC + 1) |
| **INCFSZ** | INCFSZ f, d | f 'yi 1 artırır, sonuç 0 ise sonraki komutu atlar (taşma). | Yok | INCFSZ SAYAC, F (Sayıp taşma olunca atlar) |
| **IORWF** | IORWF f, d | W ile f içeriğini mantıksal OR işlemine sokar. | Z | IORWF PORTA, F |
| **MOVF** | MOVF f, d | f içeriğini test eder veya taşır. (d = 0 ise W'ye, d = 1 ise f'ye). | Z | MOVF SAYI, W (W = SAYI) |
| **MOVWF** | MOVWF f | W içindeki değeri f kaydedicisine yükler. | Yok | MOVWF PORTB (PORTB = W) |
| **NOP** | NOP | Boş işlem yürütür (1 komut çevrimi bekler). | Yok | NOP (1 micro saniye gecikme) |
| **RLF** | RLF f, d | f içeriğini Carry bayrağı üzerinden sola kaydırır. | C | RLF PORTB, F |
| **RRF** | RRF f, d | f içeriğini Carry bayrağı üzerinden sağa kaydırır. | C | RRF PORTB, F |
| **SUBWF** | SUBWF f, d | f değerinden W değerini çıkarır (f - W). | C, DC, Z | SUBWF SAYI, F (SAYI = SAYI - W) |
| **SWAPF** | SWAPF f, d | f kaydedicisinin üst 4 biti ile alt 4 bitinin yerini değiştirir. | Yok | SWAPF PORTB, W |
| **XORWF** | XORWF f, d | W ile f içeriğini mantıksal XOR işlemine sokar. | Z | XORWF DEGER, F |`,
        widgetType: "instruction-set"
      },
      {
        id: "3.2",
        title: "3.2 Bit Yönlendirmeli Komutlar (Bit-Oriented)",
        content: `Bu komutlar, bir kaydedicinin belirlenen tek bir biti üzerinde işlem yapar.

**Kullanılan parametreler:**
• **f:** RAM adresi.
• **b:** Bit numarası (0 — 7 aralığı).

| Komut | Sözdizimi | Açıklama | Bayrak | Örnek |
| :--- | :--- | :--- | :---: | :--- |
| **BCF** | BCF f, b | f kaydedicisinin b. bitini sıfırlar (0). | Yok | BCF PORTB, 3 (PORTB'nin 3. bitini söndürür) |
| **BSF** | BSF f, b | f kaydedicisinin b. bitini bir yapar (1). | Yok | BSF PORTB, 3 (PORTB'nin 3. bitini yakar) |
| **BTFSC** | BTFSC f, b | f 'nin b . bitini test eder, lojik 0 ise sonraki komutu atlar. | Yok | BTFSC PORTA, 0 (Giriş 0 ise atlama yapar) |
| **BTFSS** | BTFSS f, b | f 'nin b . bitini test eder, lojik 1 ise sonraki komutu atlar. | Yok | BTFSS PORTA, 1 (Giriş 1 ise atlama yapar) |`
      },
      {
        id: "3.3",
        title: "3.3 Sabit (Literal) ve Kontrol Komutları",
        content: `Bu komutlar, doğrudan bir sabit değer (W veya PC) üzerinde işlem yürütür.

**Kullanılan parametreler:**
• **k:** Sabit sayı (Literal / Constant).

| Komut | Sözdizimi | Açıklama | Bayrak | Örnek |
| :--- | :--- | :--- | :---: | :--- |
| **ADDLW** | ADDLW k | W kaydedicisine k sabitini ekler. | C, DC, Z | ADDLW d'25' (W = W + 25) |
| **ANDLW** | ANDLW k | W ile k sabitini mantıksal AND işlemine sokar. | Z | ANDLW b'00001111' (Alt 4 biti maskeler) |
| **CALL** | CALL adr | Belirtilen alt program etiketine dallanır. | Yok | CALL GECIKME (Alt programı çağırır) |
| **CLRWDT** | CLRWDT | Watchdog Timer (Bekçi Köpeği) sayacını sıfırlar. | TO, PD | CLRWDT |
| **GOTO** | GOTO adr | Belirtilen etiket adresine koşulsuz dallanır. | Yok | GOTO DONGU |
| **IORLW** | IORLW k | W ile k sabitini mantıksal OR işlemine sokar. | Z | IORLW 0x0F |
| **MOVLW** | MOVLW k | W kaydedicisine k sabit sayısını yükler. | Yok | MOVLW h'20' (W = 32) |
| **RETFIE** | RETFIE | Kesme (Interrupt) alt programından geri dönmeyi sağlar. | Yok | RETFIE (Global Interrupt etkinleşerek döner) |
| **RETLW** | RETLW k | W kaydedicisine k sabitini yükleyerek alt programdan döner. | Yok | RETLW h'3F' (Display kod tablosunda kullanılır) |
| **RETURN** | RETURN | Alt programdan ana programa koşulsuz geri döner. | Yok | RETURN |
| **SLEEP** | SLEEP | İşlemciyi düşük güç tüketimli uyku moduna geçirir. | TO, PD | SLEEP |
| **SUBLW** | SUBLW k | k sabit değerinden W değerini çıkarır (k - W). | C, DC, Z | SUBLW d'10' (W = 10 - W) |
| **XORLW** | XORLW k | W ile k sabitini mantıksal XOR işlemine sokar. | Z | XORLW d'5' |`
      }
    ]
  },
  {
    id: 4,
    title: "BÖLÜM 4: TEMEL I/O VE BUTON KONTROLLÜ UYGULAMALAR",
    subtitle: "LED Sürme, Buton Okuma ve Yazılımsal Kontak Arkı Engelleme",
    sections: [
      {
        id: "4.1",
        title: "4.1 Tek LED Yakma Uygulaması",
        content: `Aşağıdaki program, PORTB'nin 3. pinine bağlı olan bir LED'i yakar ve işlemciyi sonsuz döngüde tutar. Port kurulumundan önce port çıkışlarının temizlenmesi gürültülü başlangıçları önler. Ardından Bank 1'e geçilerek \`TRISB\` kaydedicisi ayarlanır.`,
        code: `LIST P=16F84A
INCLUDE "P16F84A.INC"

; Donanım Kurulumu
; PORTB,3 pininde bir LED ve seri 330 ohm direnç bağlıdır.

ORG 0x00
GOTO START

START
    clrf PORTB      ; PORTB çıkışlarını temizle.
    bsf STATUS, 5   ; Bank 1'e geçiş yap.
    bcf TRISB, 3    ; PORTB'nin 3. pinini çıkış (0) yap.
    bcf STATUS, 5   ; Bank 0'a geri dön.

YAK
    bsf PORTB, 3    ; PORTB,3 pinini lojik-1 yaparak LED'i yak.

SONSUZ_DONGU
    goto SONSUZ_DONGU ; İşlemciyi kilitle.
    END`,
        widgetType: "led-scroller"
      },
      {
        id: "4.2",
        title: "4.2 Buton Kontrolü ile LED Yakma (Temel Giriş-Çıkış)",
        content: `Aşağıdaki örnekte PORTA'nın 1. pinine bağlı butona basıldığında PORTB'nin 0. pinindeki LED yanar, basılmadığı sürece LED söner. Bu şemada btfsc (Bit Test File Skip if Clear) komutu butona basılıp basılmadığını denetler (aktif-düşük buton tasarımı).`,
        code: `LIST P=16F84A
INCLUDE "P16F84A.INC"

ORG 0x00
GOTO INIT

INIT
    clrf PORTB      ; PORTB'yi sıfırla.
    clrf PORTA      ; PORTA'yı sıfırla.
    bsf STATUS, 5   ; Bank 1'e geç.
    bsf TRISA, 1    ; PORTA,1 pini Giriş yapıldı (Buton bağlanacak).
    bcf TRISB, 0    ; PORTB,0 pini Çıkış yapıldı (LED bağlanacak).
    bcf STATUS, 5   ; Bank 0'a geç.

DONGU
    btfss PORTA, 1  ; PORTA,1 lojik 1 mi? (Butona basılmadıysa skip et)
    goto LED_YAK    ; Hayır, lojik 0 ise (butona basıldıysa) LED_YAK etiketine git
    goto LED_SONDUR ; Evet, lojik 1 ise (butona basılmadıysa) LED_SONDUR'e git.

LED_YAK
    bsf PORTB, 0    ; LED'i yak.
    goto DONGU

LED_SONDUR
    bcf PORTB, 0    ; LED'i söndür.
    goto DONGU
    END`
      },
      {
        id: "4.3",
        title: "4.3 Alternatif Toggle/Durum Kontrollü Buton-LED Algoritması",
        content: `Buton basıldığında LED'in durumunun kalıcı olarak değişmesi (basınca yanıp, tekrar basınca sönmesi) isteniyorsa, butondan elin çekilmesini bekleyen bir kilit kontrol yapısı kurulmalıdır. Ayrıca butonların basılma anında oluşan mekanik titreşimlerin (button bounce) yaratacağı kararsızlığı önlemek amacıyla bir bekleme ve denetleme döngüsü eklenmesi kritiktir.`,
        code: `; RB1'deki butona basıldığında RB0'daki LED durumunu değiştiren program
LIST P=16F84A
INCLUDE "P16F84A.INC"

ORG 0x00
GOTO SETUP

SETUP
    clrf PORTB
    bsf STATUS, 5
    bsf TRISB, 1    ; RB1 Giriş (Buton)
    bcf TRISB, 0    ; RB0 Çıkış (LED)
    bcf STATUS, 5

MAIN
    btfsc PORTB, 1  ; Butona basıldı mı? (Lojik 0)
    goto MAIN       ; Basılmadıysa döngüde bekle.

    ; Buton arkı engelleme ve el çekme testi
EL_CEK_BEKLE
    btfsc PORTB, 1  ; El çekildi mi?
    goto EL_CEK_BEKLE ; El çekilene kadar bekle.

    ; LED Durumunu Tersle (XOR mantığı ile)
    movlw b'00000001'
    xorwf PORTB, F  ; RB0 bitini tersle.
    goto MAIN
    END`
      }
    ]
  },
  {
    id: 5,
    title: "BÖLÜM 5: ASSEMBLY DİLİNDE GELİŞMİŞ MATEMATİKSEL VE KARŞILAŞTIRMA MANTIĞI",
    subtitle: "Çıkarma Yoluyla Karşılaştırma Mantığı, 16-Bit Çift Duyarlıklı Aritmetik İşlemler",
    sections: [
      {
        id: "5.1",
        title: "5.1 Çıkarma Yoluyla Karşılaştırma Mantığı",
        content: `PIC mikrodenetleyicilerinde doğrudan bir \"büyük mü, eşit mi\" karşılaştırma komutu yoktur. Karşılaştırma işlemleri \`SUBWF\` (f - W) veya \`SUBLW\` (k - W) çıkarma komutları kullanılarak ve bu işlemin sonucuna göre STATUS kaydedicisindeki **Z (Zero)** ve **C (Carry)** bayrakları test edilerek gerçekleştirilir.

• **Z (Zero) Bayrağı:** İşlem sonucu tam olarak 0 ise $Z = 1$, sıfırdan farklı ise $Z = 0$ olur.
• **C (Carry) Bayrağı:** Çıkarma işleminde borç (borrow) alınmadıysa $C = 1$ (yani sonuç pozitif veya sıfırdır), borç alındıysa $C = 0$ (yani sonuç negatiftir) olur.

**Karşılaştırma Karar Tablosu (f değeri ile W değerinin karşılaştırılması):**

| Karşılaştırma Durumu | Z Bayrağı | C Bayrağı | Açıklama |
| :--- | :---: | :---: | :--- |
| $f = W$ | 1 | 1 | Sonuç sıfırdır, borç yoktur. |
| $f > W$ | 0 | 1 | Sonuç pozitif ve sıfırdan büyüktür, borç yoktur. |
| $f < W$ | 0 | 0 | Sonuç negatiftir, borç alınmıştır. |`,
        widgetType: "math"
      },
      {
        id: "5.2",
        title: "5.2 16-Bit Çift Duyarlıklı (Double Precision) Toplama Algoritması",
        content: `PIC 16F serisinde kaydediciler 8-bitlik olduğu için maksimum 255 değerine kadar işlem yapılabilir. Daha büyük sayılarla (65535'e kadar) işlem yapabilmek için 16-bitlik çift duyarlıklı matematik kullanılmalıdır. Sayılar yüksek anlamlı byte (High Byte) ve düşük anlamlı byte (Low Byte) olarak iki ayrı bellek hücresinde tutulur.

• **Toplanacak Sayılar:** Sayı 1 (AH : AL), Sayı 2 (BH : BL)
• **İşlem:** $AL + BL$ toplanır. Eğer bu toplamda bir taşma olursa (> 255), Carry bayrağı set edilir ($C = 1$). Yüksek anlamlı byte'ların toplamına ($AH + BH$) bu taşma değeri (Carry) eklenmelidir.`,
        code: `; 16-Bit Toplama Programı (AH:AL + BH:BL)
LIST P=16F84A
INCLUDE "P16F84A.INC"

; Bellek Tanımlamaları
AH  EQU 0x10
AL  EQU 0x11
BH  EQU 0x12
BL  EQU 0x13

ORG 0x00
    ; Başlangıç Değerleri (Decimal olarak)
    ; Sayı 1 = 500 (AH:AL = d'1':d'244')
    movlw d'1'
    movwf AH
    movlw d'244'
    movwf AL

    ; Sayı 2 = 300 (BH:BL = d'1':d'44')
    movlw d'1'
    movwf BH
    movlw d'44'
    movwf BL

    bcf STATUS, C   ; Carry temizle.

    ; Düşük anlamlı byte'ları topla
    movf  BL, W
    addwf AL, F     ; AL = AL + BL

    ; Taşma kontrolü (Carry test)
    btfsc STATUS, C ; Carry oluştu mu?
    incf  AH, F     ; Evet oluştuysa, AH (Sayı1 Yüksek byte) 1 artır.

    ; Yüksek anlamlı byte'ları topla
    movf  BH, W
    addwf AH, F     ; AH = AH + BH (Sonuç AH:AL içinde oluşur)
    END`
      },
      {
        id: "5.3",
        title: "5.3 16-Bit Çift Duyarlıklı Çıkarma Algoritması",
        content: `Çıkarma işleminde ise düşük anlamlı byte'lar çıkarılır ($AL - BL$). Eğer borç oluşursa ($AL < BL \\implies C = 0$), yüksek anlamlı byte'tan ($AH$) 1 eksiltilir (borç düşülür). Ardından yüksek byte'lar çıkarılır.`,
        code: `; 16-Bit Çıkarma Programı (AH:AL - BH:BL)
LIST P=16F84A
INCLUDE "P16F84A.INC"

AH  EQU 0x10
AL  EQU 0x11
BH  EQU 0x12
BL  EQU 0x13

ORG 0x00
    ; Başlangıç Değerleri (Decimal olarak)
    ; Sayı 1 = 500 (AH:AL = d'1':d'244')
    movlw d'1'
    movwf AH
    movlw d'244'
    movwf AL

    ; Sayı 2 = 300 (BH:BL = d'1':d'44')
    movlw d'1'
    movwf BH
    movlw d'44'
    movwf BL

    bsf STATUS, C   ; Çıkarma öncesi Carry (borrow) bitini 1 yap.

    ; Düşük anlamlı byte'ların çıkarılması
    movf  BL, W
    subwf AL, F     ; AL = AL - BL

    ; Borç kontrolü (Çıkarma işleminde Borç varsa C=0 olur)
    btfss STATUS, C ; C=1 ise borç yoktur, atla.
    decf  AH, F     ; C=0 ise borç vardır, AH'ı 1 azalt.

    ; Yüksek anlamlı byte'ların çıkarılması
    movf  BH, W
    subwf AH, F     ; AH = AH - BH
    END`
      }
    ]
  },
  {
    id: 6,
    title: "BÖLÜM 6: ZAMAN GECİKMESİ (DELAY) YAZILIMSAL HESAPLAMALARI",
    subtitle: "Tekli ve İçiçe Geçmeli Zaman Gecikmesi Döngü Tasarımları",
    sections: [
      {
        id: "6.1",
        title: "6.1 Tekli Gecikme Döngüsü Hesaplama Mantığı",
        content: `PIC mikrodenetleyicilerinde gecikmeler yaratabilmek, örneğin LED'in görünebilecek kadar yanması veya ekran tarama sürelerini ayarlamak amacıyla milisaniyeler mertebesinde beklemeler yapılması gerekir. Bu işlem işlemciye boş döngüler yaptırılarak gerçekleştirilir.

fosc = 4 MHz olan bir sistemde komut çevrim süresi 1 µs'dir.

**Toplam Çevrim Süresi Hesabı:**
Döngü her çalıştığında:
• \`decfsz\` (1 µs) ve \`goto\` (2 µs) komutları toplamda **3 µs** harcar.
• Döngü N = 200 kez dönecektir. Son çevrimde \`decfsz\` atlama yapacağı için 2 çevrim harcar, \`goto\` ise işletilmez.

• Toplam Çevrim = 1 + 1 + [(N - 1) × 3] + 2 + 2
• Toplam Çevrim (200 için) = 2 + [199 × 3] + 4 = 603 µs`,
        code: `; Tekli Gecikme Alt Programı
GECIKME_TEK
    movlw d'200'    ; [1 Çevrim] W = 200 yükle
    movwf SAYAC     ; [1 Çevrim] SAYAC = 200
BEKLE
    decfsz SAYAC, F ; [1 Çevrim - Sıfıra ulaştığında 2 Çevrim]
    goto BEKLE      ; [2 Çevrim]
    return          ; [2 Çevrim]`,
        widgetType: "delay"
      },
      {
        id: "6.2",
        title: "6.2 İçiçe (Nested) Gecikme Döngüleri (Hassas ms ve sn Gecikmeleri)",
        content: `Daha uzun beklemeler için iki veya daha fazla kayıtçı içiçe döngü kurularak işletilir.

Yukarıda verilen programda iç döngü adım süresi yaklaşık 300 çevrim yapar. Bu iç döngü de dış döngü de 100 kez tekrar ettiğinde, toplam gecikme süresi yaklaşık:
• **Toplam Süre ≈ 100 × 300 µs = 30,000 µs = 30 ms**`,
        code: `; Yaklaşık 30 ms (Milisaniye) Gecikme Alt Programı
GECIKME_30MS
    movlw d'100'    ; [1 Çevrim]
    movwf SAYAC1    ; [1 Çevrim] DIŞ DÖNGÜ
D1
    movlw d'100'    ; [1 Çevrim]
    movwf SAYAC2    ; [1 Çevrim] İÇ DÖNGÜ
D2
    decfsz SAYAC2, F ; [1 Çevrim] \\ İç döngü adım süresi
    goto D2         ; [2 Çevrim] / (Yaklaşık 300 çevrim yapar)
    decfsz SAYAC1, F ; [1 Çevrim]
    goto D1         ; [2 Çevrim]
    return          ; [2 Çevrim]`
      }
    ]
  },
  {
    id: 7,
    title: "BÖLÜM 7: BİT KAYDIRMA KOMUTLARI VE UYGULAMALARI",
    subtitle: "RLF/RRF ve Meşhur Karaşimşek (Knight Rider) Efekt Tasarımı",
    sections: [
      {
        id: "7.1",
        title: "7.1 Sola ve Sağa Kaydırma (RLF - RRF) ve Carry İlişkisi",
        content: `Bit kaydırma komutları, bir kaydedicinin içindeki 8-bitlik veriyi sağa veya sola 1 bit kaydırır. Bu kaydırma işlemi **Carry (C) bayrağı üzerinden dairesel olarak** gerçekleştirilir.

**RLF (Sola Kaydırma):**
Kaydırma esnasında Bit 7 değeri Carry bayrağına aktarılır. Önceki Carry değeri ise Bit 0 hücresine yüklenir.
\`[Önceki C Değeri] -> [Bit 0]...[Bit 7] -> [Yeni C Değeri]\`

**RRF (Sağa Kaydırma):**
Kaydırma esnasında Bit 0 değeri Carry bayrağına aktarılır. Önceki Carry değeri ise Bit 7 hücresine yüklenir.
\`[Önceki C Değeri] -> [Bit 7]...[Bit 0] -> [Yeni C Değeri]\``,
        widgetType: "led-scroller"
      },
      {
        id: "7.2",
        title: "7.2 Karaşimşek (Knight Rider) LED Uygulaması",
        content: `Aşağıdaki program, PORTB'ye bağlı 8 adet LED'i soldan sağa ve sağdan sola kesintisiz olarak kaydırarak meşhur \"Karaşimşek\" efektini oluşturur. Sola kaydırma esnasında MSB (Bit 7) test edilir, sağa kaydırma esnasında ise LSB (Bit 0) test edilir.`,
        code: `LIST P=16F84A
INCLUDE "P16F84A.INC"

SAYAC1 EQU 0x0C
SAYAC2 EQU 0x0D

ORG 0x00
GOTO BASLA

BASLA
    clrf PORTB
    bsf STATUS, 5
    clrf TRISB      ; PORTB tamamen çıkış.
    bcf STATUS, 5

    ; Başlangıçta 1. LED'i yak
    movlw b'00000001'
    movwf PORTB

SOLA_KAYDIR
    call GECIKME    ; LED'lerin görünmesi için bekle
    bcf STATUS, C   ; Taşıma bitini temizle
    rlf PORTB, F    ; Sola kaydır
    btfss PORTB, 7  ; En son LED'e ulaşıldı mı?
    goto SOLA_KAYDIR

SAGA_KAYDIR
    call GECIKME
    bcf STATUS, C
    rrf PORTB, F    ; Sağa kaydır
    btfss PORTB, 0  ; En başa ulaşıldı mı?
    goto SAGA_KAYDIR
    goto SOLA_KAYDIR ; Başa dön.

GECIKME             ; Yaklaşık 100ms gecikme
    movlw d'150'
    movwf SAYAC1
L1  movlw d'220'
    movwf SAYAC2
L2  decfsz SAYAC2, F
    goto L2
    decfsz SAYAC1, F
    goto L1
    return
    END`
      },
      {
        id: "7.3",
        title: "7.3 Buton Kontrollü Çift Yönlü Kayan LED Uygulaması",
        content: `PORTA'nın 0. bitine basıldığında sola, 1. bitine basıldığında ise sağa doğru kayma hareketini gerçekleştiren kararlı durum algoritmasıdır. Kullanıcının elini basılı tutma sırasındaki durumu denetleyen kilit yapısı barındırır.`,
        code: `LIST P=16F84A
INCLUDE "P16F84A.INC"

VERI   EQU 0x0C
SAYAC1 EQU 0x0D
SAYAC2 EQU 0x0E

ORG 0x00
GOTO BASLA

BASLA
    clrf PORTB
    bcf STATUS, C
    bsf STATUS, 5
    movlw b'00000011' ; RA0 ve RA1 buton girişleri
    movwf TRISA
    clrf TRISB       ; PORTB çıkış
    bcf STATUS, 5
    movlw 0x01       ; İlk LED datası
    movwf VERI
    movwf PORTB

MAIN
    btfsc PORTA, 0   ; Sola butonu basıldı mı? (Aktif-0)
    goto SOL_TEST
    goto SOL_KAYDIR
SOL_TEST
    btfsc PORTA, 1   ; Sağa butonu basıldı mı? (Aktif-0)
    goto MAIN
    goto SAG_KAYDIR

SOL_KAYDIR
    bcf STATUS, C
    rlf VERI, W     ; W'ye kaydırıp taşıma testi yap
    btfsc STATUS, C  ; Taşma oldu mu?
    movlw 0x01       ; Evet ise başa döndür.
    movwf VERI
    movwf PORTB
    call GECIKME
    goto MAIN

SAG_KAYDIR
    bcf STATUS, C
    rrf VERI, W
    btfsc STATUS, C
    movlw 0x80       ; Sınır aşımında en sağa at
    movwf VERI
    movwf PORTB
    call GECIKME
    goto MAIN

GECIKME
    movlw d'100'
    movwf SAYAC1
L3  movlw d'100'
    movwf SAYAC2
L4  decfsz SAYAC2, F
    goto L4
    decfsz SAYAC1, F
    goto L3
    return
    END`
      }
    ]
  },
  {
    id: 8,
    title: "BÖLÜM 8: SEVEN-SEGMENT DISPLAY VE ÇEVRİM TABLOLARI",
    subtitle: "7-Segment İç Yapısı, PCL Yardımıyla Çevrim Tablosu Sürücüleri ve Çoklu Tarama",
    sections: [
      {
        id: "8.1",
        title: "8.1 7-Segment Display Yapısı ve Karakter Kodları",
        content: `7-segment display, içinde 8 adet LED barındıran (7 segment + 1 nokta pini) bir göstergedir. Ortak Katot (GND ortak) veya Ortak Anot (VCC ortak) olarak iki tipi bulunur.

**Ortak Katot Hex Değerleri (0-9):**
• 0 → **0x3F**
• 1 → **0x06**
• 2 → **0x5B**
• 3 → **0x4F**
• 4 → **0x66**
• 5 → **0x6D**
• 6 → **0x7D**
• 7 → **0x07**
• 8 → **0x7F**
• 9 → **0x6F**`,
        widgetType: "seven-segment"
      },
      {
        id: "8.2",
        title: "8.2 Çevrim Tablosu (addwf PCL, F ve RETLW) Mantığı",
        content: `Tablo okuma işlemlerinde, W kaydedicisindeki indeks değeri program sayacının alt byte'ı olan PCL'e eklenerek ilgili satırdaki RETLW k komutunun çalışması sağlanır. \`RETLW k\` komutu, W kaydedicisine k sabit değerini yükleyerek alt programdan geri döner.`,
        code: `; Karakter Kod Çevrim Tablosu
TABLO
    addwf PCL, F    ; PC = PC + W (Dallanma adresi hesaplanır)
    retlw 0x3F      ; W = 0x3F ile dön (0 Karakteri)
    retlw 0x06      ; W = 0x06 ile dön (1 Karakteri)
    retlw 0x5B      ; W = 0x5B ile dön (2 Karakteri)
    retlw 0x4F      ; W = 0x4F ile dön (3 Karakteri)
    retlw 0x66      ; W = 0x66 ile dön (4 Karakteri)
    retlw 0x6D      ; W = 0x6D ile dön (5 Karakteri)
    retlw 0x7D      ; W = 0x7D ile dön (6 Karakteri)
    retlw 0x07      ; W = 0x07 ile dön (7 Karakteri)
    retlw 0x7F      ; W = 0x7F ile dön (8 Karakteri)
    retlw 0x6F      ; W = 0x6F ile dön (9 Karakteri)`
      },
      {
        id: "8.3",
        title: "8.3 Display ile 0-9 İleri Sayıcı Uygulaması",
        content: `Display'de saniyede bir sırasıyla 0'dan 9'a kadar olan sayıları yazdıran ve ardından tekrar sıfırlanan program kodudur. Sayacın taşma kontrolü \`SUBLW d'10'\` veya komut karşılaştırma bloğuyla yapılır.`,
        code: `LIST P=16F84A
INCLUDE "P16F84A.INC"

SAYAC  EQU 0x0C
SAYAC1 EQU 0x0D
SAYAC2 EQU 0x0E

ORG 0x00
GOTO INIT

INIT
    clrf PORTB
    bsf STATUS, 5
    clrf TRISB      ; PORTB çıkış
    bcf STATUS, 5
    clrf SAYAC      ; Sayacı sıfırla

DONGU
    movf  SAYAC, W  ; W = Sayac
    call  TABLO     ; Tabloya git, ilgili display kodunu al.
    movwf PORTB     ; Display'e gönder.
    call  SANIYELIK_GEC ; Bekle

    incf  SAYAC, F  ; Sayacı artır.
    movlw d'10'
    subwf SAYAC, W  ; Sayac == 10 mu?
    btfsc STATUS, Z
    clrf  SAYAC     ; Sayac 10 ise sıfırla.
    goto  DONGU

TABLO
    addwf PCL, F
    retlw 0x3F      ; 0
    retlw 0x06      ; 1
    retlw 0x5B      ; 2
    retlw 0x4F      ; 3
    retlw 0x66      ; 4
    retlw 0x6D      ; 5
    retlw 0x7D      ; 6
    retlw 0x07      ; 7
    retlw 0x7F      ; 8
    retlw 0x6F      ; 9

SANIYELIK_GEC       ; Çoklu iç içe döngülü saniyelik gecikme
    movlw d'5'
    movwf SAYAC1
B1  movlw d'250'
    movwf SAYAC2
B2  decfsz SAYAC2, F
    goto B2
    decfsz SAYAC1, F
    goto B1
    return
    END`
      },
      {
        id: "8.4",
        title: "8.4 Çoklu Display Sürme (Tarama - Multiplexing) Yöntemi",
        content: `Eğer çok haneli (örneğin 4 haneli) bir gösterge sürülecekse, her gösterge için ayrı port kullanmak yerine tüm göstergelerin veri hatları (a-g segment bacakları) birbirine paralel bağlanır. Sadece displaylerin ortak uçları (anot veya katotları) transistör anahtarlaması (örn: BC237 NPN transistör) üzerinden sırayla tetiklenir. İnsan gözünün algılama eşiği (persistence of vision) kullanılarak her gösterge hızlıca (yaklaşık 1 ms — 5 ms aralıklarla) sırayla yakılır. Bu işleme **Tarama (Multiplexing)** denir.

**Tarama Yöntemi Devre Yapısı ve PIC Bağlantısı:**
• **PORTB:** Segment Veri Hatları (a-g) -> Tüm Displaylere Paralel.
• **PORTA:** Hane seçim hatları:
  - RA0 ---> [10K R] ---> [BC237 Transistör] ---> Display 1 Katot (Binler)
  - RA1 ---> [10K R] ---> [BC237 Transistör] ---> Display 2 Katot (Yüzler)
  - RA2 ---> [10K R] ---> [BC237 Transistör] ---> Display 3 Katot (Onlar)
  - RA3 ---> [10K R] ---> [BC237 Transistör] ---> Display 4 Katot (Birler)`,
        code: `; Örnek Uygulama: 4 Haneli Ortak Katot Displayde "2006" Yazdırma Kodu
LIST P=16F84A
INCLUDE "P16F84A.INC"

SAYAC_GEC EQU 0x0C

ORG 0x00
GOTO BASLA

BASLA
    clrf PORTB
    clrf PORTA
    bsf STATUS, 5
    clrf TRISB      ; PORTB (Segment veri bacakları) çıkış
    clrf TRISA      ; PORTA (Hane seçme bacakları) çıkış
    bcf STATUS, 5

START
    ; --- 1. Hane (Binler Basamağı: '2') ---
    movlw b'00000001' ; Sadece RA0 aktif (Binler hanesi transistörü iletimde)
    movwf PORTA
    movlw 0x5B      ; '2' karakteri segment datası
    movwf PORTB
    call GECIKME_3MS

    ; --- 2. Hane (Yüzler Basamağı: '0') ---
    movlw b'00000010' ; Sadece RA1 aktif
    movwf PORTA
    movlw 0x3F      ; '0' karakteri segment datası
    movwf PORTB
    call GECIKME_3MS

    ; --- 3. Hane (Onlar Basamağı: '0') ---
    movlw b'00000100' ; Sadece RA2 aktif
    movwf PORTA
    movlw 0x3F      ; '0' karakteri
    movwf PORTB
    call GECIKME_3MS

    ; --- 4. Hane (Birler Basamağı: '6') ---
    movlw b'00001000' ; Sadece RA3 aktif
    movwf PORTA
    movlw 0x7D      ; '6' karakteri
    movwf PORTB
    call GECIKME_3MS

    goto START

GECIKME_3MS
    movlw d'10'
    movwf SAYAC_GEC
D_LOOP
    decfsz SAYAC_GEC, F
    goto D_LOOP
    return
    END`
      }
    ]
  },
  {
    id: 9,
    title: "BÖLÜM 9: KESMELER (INTERRUPTS) VE TIMER0 MODÜLÜ",
    subtitle: "Kesme Mekanizması, INTCON Kaydedicisi, Context Saving ve Donanımsal Timer0",
    sections: [
      {
        id: "9.1",
        title: "9.1 Kesme (Interrupt) Mekanizması ve INTCON Kaydedicisi",
        content: `Kesme, ana program yürütülürken donanımsal bir olay gerçekleştiğinde (buton basılması, sayıcının taşması vb.) işlemcinin anlık olarak mevcut işini durdurup, program belleğindeki **0x0004** adresine daldığı donanımsal mekanizmadır. Alt program bittiğinde \`RETFIE\` komutuyla otomatik olarak ana programa kaldığı adresten devam eder.

Kesme ayarları ve bayrakları **INTCON (Interrupt Control - Adres: 0x0B)** kaydedicisi üzerinden yönetilir.

**INTCON Kaydedicisi Bit Haritası:**
• **GIE (Bit 7):** Global Interrupt Enable. Tüm kesmeleri genel olarak aktif/pasif yapar (1 = Aktif).
• **EEIE (Bit 6):** EEPROM Write Complete Interrupt Enable.
• **T0IE (Bit 5):** Timer0 Overflow Interrupt Enable. Timer0 taşma kesmesi izin biti.
• **INTE (Bit 4):** INT External Interrupt Enable. RB0 harici kesme izin biti.
• **RBIE (Bit 3):** PORTB Change Interrupt Enable. PORTB.4-PORTB.7 pin değişim kesmesi izin biti.
• **T0IF (Bit 2):** Timer0 Overflow Interrupt Flag. Timer0 taşma bayrağı. Sayıcı taşınca otomatikman 1 olur. Yazılımla tekrar sıfırlanmalıdır.
• **INTF (Bit 1):** INT External Interrupt Flag. RB0 harici kesme bayrağı.
• **RBIF (Bit 0):** PORTB Change Interrupt Flag. PORTB değişim kesmesi bayrağı.`
      },
      {
        id: "9.2",
        title: "9.2 Kesme Esnasında Kaydedici Durumunun Korunması (Context Saving)",
        content: `Kesme meydana geldiğinde, alt programın içinde W ve STATUS kaydedicileri değişebilir. Ana programa dönüldüğünde veri kaybı veya kararsızlık yaşanmaması için kesme anında bu kaydediciler geçici olarak saklanmalı, kesmeden çıkarken de geri yüklenmelidir (Context Restore).`,
        code: `; Context Saving (Kesme Yedekleme Şablonu)
W_YEDEK      EQU 0x1A
STATUS_YEDEK EQU 0x1B

ORG 0x04              ; Kesme Vektör Başlangıcı
    ; Yedekleme İşlemi (Context Saving)
    movwf W_YEDEK     ; W kaydedicisini yedekle.
    swapf STATUS, W   ; Status'ü swapf ile W'ye al (Z etkilenmez).
    movwf STATUS_YEDEK ; Status'ü yedekle.

KESME_ISLEMI
    ; ... Kesme Alt Programı Kodları Buraya Yazılır ...
    ; Önemli: Tetiklenen Kesme Bayrağı Yazılımsal Olarak Sıfırlanmalıdır!
    bcf INTCON, T0IF  ; Örneğin Timer0 Kesme Bayrağı Temizlenir.

KESME_CIKIS
    ; Geri Yükleme İşlemi (Context Restore)
    swapf STATUS_YEDEK, W
    movwf STATUS      ; Status eski haline getirildi.
    swapf W_YEDEK, F  ; W eski durumuna getiriliyor (Swapf bayrakları etkilemez)
    swapf W_YEDEK, W
    retfie            ; Kesmeden ana programa geri dön.`,
        widgetType: "registers"
      },
      {
        id: "9.3",
        title: "9.3 Timer0 Modülü ve Zaman Hesabı",
        content: `Timer0, 8-bitlik ($0 — 255$ arası sayabilen) yukarı yönlü çalışan donanımsal bir zamanlayıcı/sayıcı modülüdür. İçindeki değer 255 ($FFh$) değerinden tekrar sıfıra geçerken bir taşma (overflow) oluşturur ve \`T0IF\` bayrağını lojik-1 yapar.

Zamanlama parametreleri **OPTION_REG (Adres: 0x81)** üzerinden ayarlanır:
• **T0CS (Bit 5):** Timer0 Clock Source. 0 → Dahili komut saat sinyali ($f_{osc}/4$), 1 → Harici pals giriş pini (RA4/T0CKI).
• **PSA (Bit 3):** Prescaler Assignment. 0 → Prescaler Timer0'a atanır, 1 → WDT'ye atanır.
• **PS2:PS0 (Bit 2-0):** Bölme oranı seçim bitleridir. (1:2'den 1:256'ya kadar).

**Timer0 Zaman Hesabı Formülü:**
\`Zaman (Süre) = (256 — Başlangıç Değeri) × Prescaler Oranı × Tcyc\`

**Örnek Hesap:** fosc = 4 MHz ($T_{cyc} = 1\ \mu s$), Prescaler oranı 1:2 seçilsin. Her kesmede tam olarak $500\ \mu s$ (0.5 ms) gecikme elde etmek istiyoruz. TMR0 başlangıç değeri ne olmalıdır?
• $500\ \mu s = (256 — X) × 2 × 1\ \mu s$
• $250 = 256 — X \\implies X = 6$
Her kesmeden sonra TMR0 kaydedicisinin içine **6** değeri yeniden yüklenmelidir.`
      }
    ]
  },
  {
    id: 10,
    title: "BÖLÜM 10: 4x4 MATRİS TUŞ TAKIMI (KEYPAD) OKUMA",
    subtitle: "74C922 Kod Çözücü ile Keypad Bağlantısı ve Kesmeli Okuma Sistemi",
    sections: [
      {
        id: "10.1",
        title: "10.1 74C922 Entegresi ile Keypad Bağlantısı",
        content: `4x4 tuş takımı (16 tuş) tarama yöntemiyle doğrudan mikrodenetleyici portları üzerinden okunabileceği gibi, işlemci bacaklarında tasarruf sağlamak ve yazılım karmaşıklığını azaltmak amacıyla **74C922 tuş takımı kod çözücü entegresi** kullanılabilir.

Entegre, basılan tuşu algılayarak doğrudan ikilik (binary) çıkış üretir ($0 — 15$). Ayrıca herhangi bir tuşa basıldığı anda 12 nolu pini olan **Data Available (DA)** çıkışından lojik-1 palsi gönderir. Bu pals mikrodenetleyicinin RB0 (kesme) pinine bağlanarak tuşa basıldığı anda donanımsal kesme oluşmasını ve işlemcinin anında veriyi okumasını sağlar.

**74C922 Entegre Arabirimi Bağlantı Diyagramı:**
• **74C922 DA (Pin 12)** ---> PIC16F84 **RB0 (INT)**
• **74C922 OUT A** ---> PIC16F84 **RB4**
• **74C922 OUT B** ---> PIC16F84 **RB5**
• **74C922 OUT C** ---> PIC16F84 **RB6**
• **74C922 OUT D** ---> PIC16F84 **RB7**`,
        widgetType: "seven-segment"
      },
      {
        id: "10.2",
        title: "10.2 Tuş Takımından Okunan Değeri 7-Segment Display'de Gösteren Uygulama",
        content: `Entegrenin binary çıkışları PORTB'nin üst 4 bitine (RB4-RB7) bağlanmıştır. RB0 pini de harici kesme olarak ayarlanmıştır. Her tuşa basıldığında tetiklenen harici kesme programı, üst bitlerdeki veriyi \`SWAPF\` ile alt bitlere alıp, tablo yardımıyla displayde basılan tuşun numarasını ($0 — F$) gösterir.`,
        code: `LIST P=16F84A
INCLUDE "P16F84A.INC"

TUS EQU 0x0C

ORG 0x00
GOTO START

ORG 0x04
GOTO KESME_TUS

START
    clrf PORTA
    clrf PORTB
    bsf STATUS, 5
    clrf TRISA       ; PORTA tamamen çıkış (Display segmentleri için)
    movlw b'11110001' ; RB4-RB7 giriş, RB0 kesme pini giriş.
    movwf TRISB
    bcf STATUS, 5

    ; Kesme Kurulumu (INTE ve GIE aktif)
    movlw b'10010000' ; GIE ve INTE bitleri 1 yapılıyor.
    movwf INTCON

ANA_DONGU
    goto ANA_DONGU    ; Kesme bekleyen ana döngü.

KESME_TUS
    bcf INTCON, INTF ; Dış kesme bayrağını temizle.

    ; PORTB'den veriyi oku
    movf  PORTB, W
    andlw b'11110000' ; Üst 4 biti maskele.
    movwf TUS

    ; Swapf ile bitlerin yerini değiştir (Alt bitlere aktar)
    swapf TUS, W
    andlw b'00001111' ; Alt 4 biti temizle ve doğrula.

    ; Tablodan segment kodunu al ve PORTA'ya gönder.
    call  TABLO_KEYPAD
    movwf PORTA
    retfie

TABLO_KEYPAD
    addwf PCL, F
    retlw 0x3F      ; '0' tuşu
    retlw 0x06      ; '1' tuşu
    retlw 0x5B      ; '2'
    retlw 0x4F      ; '3'
    retlw 0x66      ; '4'
    retlw 0x6D      ; '5'
    retlw 0x7D      ; '6'
    retlw 0x07      ; '7'
    retlw 0x7F      ; '8'
    retlw 0x6F      ; '9'
    retlw 0x77      ; 'A'
    retlw 0x7C      ; 'b'
    retlw 0x39      ; 'C'
    retlw 0x5E      ; 'd'
    retlw 0x79      ; 'E'
    retlw 0x71      ; 'F'
    END`
      }
    ]
  },
  {
    id: 11,
    title: "BÖLÜM 11: PIC 16F877A MİKRODENETLEYİCİSİ VE ANALOG-DİJİTAL DÖNÜŞTÜRÜCÜ (ADC)",
    subtitle: "10-Bit ADC Modülü, Kontrol Kaydedicileri (ADCON0/ADCON1) ve Seviye Karşılaştırmalı Led Bar Sürücü Projesi",
    sections: [
      {
        id: "11.1",
        title: "11.1 ADC Kontrol Kaydedicileri",
        content: `PIC 16F877A, analog sensörlerle (ısı, ışık, potansiyometre vb.) doğrudan çalışabilmek için dahili bir **Analog-Dijital Dönüştürücü (ADC)** modülüne sahiptir. Modül, analog voltaj sinyalini ($0V — 5V$ arası) 10-bit çözünürlükte dijital bir sayıya ($0 — 1023$ aralığına) dönüştürür.

**1. ADRESH ve ADRESL:** 10-bitlik sonucun saklandığı iki adet 8-bitlik kaydedicidir. Hizalama ayarı **ADFM** biti ile belirlenir.
**2. ADCON0 (A/D Control Register 0 - Adres: 0x1F):**
• **ADCS1:ADCS0 (Bit 7-6):** Çevrim saati seçim bitleri.
• **CHS2:CHS0 (Bit 5-3):** Analog kanal seçim bitleri ($AN0 — AN7$).
• **GO/DONE (Bit 2):** Çevrim kontrol biti. Manuel olarak lojik-1 yapılarak çevrim başlatılır. Çevrim bittiğinde donanım tarafından otomatik olarak sıfırlanır ($0$).
• **ADON (Bit 0):** ADC modülünü açma/kapama biti ($1 = Açık$).

**3. ADCON1 (A/D Control Register 1 - Adres: 0x9F):**
• **ADFM (Bit 7):** Çevrim Sonucu Hizalama Biti.
  - **ADFM = 1 (Sağa Hizalı):** 10 bitlik sonucun 8 biti ADRESL içinde, kalan 2 biti ADRESH içindedir.
  - **ADFM = 0 (Sola Hizalı):** 10 bitlik sonucun üst 8 biti doğrudan ADRESH içindedir. Alt 2 biti ise ADRESL'dedir. Hassas olmayan 8-bitlik uygulamalarda bu mod seçilerek sadece ADRESH kaydedicisi doğrudan okunabilir ve pratik şekilde 8-bit çözünürlükte ($0 - 255$) çalışılabilir!
• **PCFG3:PCFG0 (Bit 3-0):** Pin Konfigürasyon Seçim Bitleri. Hangi pinlerin analog, hangilerinin dijital çalışacağını belirler.`,
        widgetType: "adc"
      },
      {
        id: "11.2",
        title: "11.2 Çözünürlük ve Karşılaştırma Eşikleri (Hizalama ve Hesap Detayları)",
        content: `Potansiyometreden gelen analog voltaj seviyesine göre çıkıştaki 5 adet LED'i kademeli olarak yakan komple projenin analizi ve hesap detayları:

• **Giriş Voltajı:** $0V — 5V$.
• **ADC Çözünürlüğü:** 10-bit ($0 — 1023$ aralığı).
• **Çevrim Sonucu Sola Hizalı** ($ADFM = 0$) seçilmiştir. Bu sayede sadece **ADRESH** kaydedicisi okunarak işlem 8-bit ($0 — 255$ aralığı) hassasiyetinde pratik bir şekilde çözülür.

Vstep = 5V / 255 ≈ 0.0196 V/adım

**Sütun grafiğindeki LED tetikleme voltaj sınırları ve 8-bit ADRESH karşılıkları şöyledir:**
• **Seviye 5:** $\ge 4.5V$ | ADRESH $\ge 230$ | 5 LED Açık (RB0-RB4)
• **Seviye 4:** $3.5V — 4.5V$ | ADRESH $180 — 229$ | 4 LED Açık (RB0-RB3)
• **Seviye 3:** $2.5V — 3.5V$ | ADRESH $130 — 179$ | 3 LED Açık (RB0-RB2)
• **Seviye 2:** $1.5V — 2.5V$ | ADRESH $80 — 129$ | 2 LED Açık (RB0-RB1)
• **Seviye 1:** $0.5V — 1.5V$ | ADRESH $30 — 79$ | 1 LED Açık (RB0)
• **Seviye 0:** $< 0.5V$ | ADRESH $< 30$ | Tüm LED'ler Sönük (0)`,
        code: `; Komple Assembly Program Kodu
LIST P=16F877A
INCLUDE "P16F877A.INC"

SAYI   EQU 0x0C
SAYAC1 EQU 0x0D
SAYAC2 EQU 0x0E

ORG 0x0000
GOTO INIT

INIT
    clrf PORTB      ; PORTB çıkışlarını temizle.
    bsf STATUS, 5   ; Bank 1'e geçiş yap.
    clrf TRISB      ; PORTB portunu tamamen çıkış (LED'ler için) yap.

    ; ADCON1 Konfigürasyonu
    ; ADFM=0 (Sola dayalı), Analog Pin Konfigürasyonu: AN0 analog, referanslar VDD-VSS
    movlw b'00001110'
    movwf ADCON1
    bcf STATUS, 5   ; Bank 0'a geri dön.

    ; ADCON0 Konfigürasyonu
    ; Fosc/2 saat hızı, AN0 Kanalı seçili (CHS=000), ADC açık (ADON=1)
    movlw b'00000001'
    movwf ADCON0

MAIN_LOOP
    call GECIKME    ; ADC Şarj (Acquisition) süresi için bekle.
    bsf ADCON0, GO  ; A/D Çevrimini Başlat (GO/DONE = 1)

WAIT_ADC
    btfsc ADCON0, GO ; Çevrim bitti mi? (GO/DONE pini 0 oldu mu?)
    goto WAIT_ADC   ; Hayır, bitene kadar bekle.

    ; Çevrim bitti, sola dayalı olduğu için üst 8-bit ADRESH'ten okunur
    movf  ADRESH, W
    movwf SAYI      ; Okunan değeri geçici değişkene aktar.

; --- Kademeli Karşılaştırma Blokları (SUBWF) ---
LEVEL5_COMP
    bcf STATUS, C
    movlw d'230'    ; W = 230
    subwf SAYI, W   ; W = SAYI - 230
    btfsc STATUS, C ; Sonuç >= 0 ise Carry set (1) olur.
    goto BES_LED    ; Evet ise 5 LED yakmaya git.

LEVEL4_COMP
    bcf STATUS, C
    movlw d'180'    ; W = 180
    subwf SAYI, W   ; W = SAYI - 180
    btfsc STATUS, C
    goto DORT_LED

LEVEL3_COMP
    bcf STATUS, C
    movlw d'130'    ; W = 130
    subwf SAYI, W   ; W = SAYI - 130
    btfsc STATUS, C
    goto UC_LED

LEVEL2_COMP
    bcf STATUS, C
    movlw d'80'     ; W = 80
    subwf SAYI, W   ; W = SAYI - 80
    btfsc STATUS, C
    goto IKI_LED

LEVEL1_COMP
    bcf STATUS, C
    movlw d'30'     ; W = 30
    subwf SAYI, W   ; W = SAYI - 30
    btfsc STATUS, C
    goto BIR_LED

SIFIR_LED
    clrf PORTB      ; Giriş voltajı < 0.5V ise tüm LED'leri söndür.
    goto MAIN_LOOP

; --- Çıkış LED Sütun Grafik Atamaları ---
BIR_LED
    movlw b'00000001'
    movwf PORTB
    goto MAIN_LOOP

IKI_LED
    movlw b'00000011'
    movwf PORTB
    goto MAIN_LOOP

UC_LED
    movlw b'00000111'
    movwf PORTB
    goto MAIN_LOOP

DORT_LED
    movlw b'00001111'
    movwf PORTB
    goto MAIN_LOOP

BES_LED
    movlw b'00011111'
    movwf PORTB
    goto MAIN_LOOP

; --- Yazılımsal Gecikme Alt Programı ---
GECIKME
    movlw d'50'
    movwf SAYAC1
L_G1
    movlw d'100'
    movwf SAYAC2
L_G2
    decfsz SAYAC2, F
    goto L_G2
    decfsz SAYAC1, F
    goto L_G1
    return
    END`
      }
    ]
  },
  {
    id: 12,
    title: "BÖLÜM 12: STEP MOTOR KONTROLÜ VE ADIM SÜRME TEKNİKLERİ",
    subtitle: "Step Motor Çalışma Yapısı, ULN2003 Sürücü Entegresi, Tek ve Çift Fazlı Sürme Tabloları",
    sections: [
      {
        id: "12.1",
        title: "12.1 Sürücü Kartı (ULN2003) İhtiyacı ve Bağlantılar",
        content: `Step motorlar, bobinlerine uygulanan elektriksel palsler vasıtasıyla milini belirli sabit açılarda (adım adım) döndüren fırçasız DC motorlardır.

Mikrodenetleyici portları step motorun dönmesi için gerekli yüksek akım gücünü (bobin akımlarını) doğrudan sağlayamaz. Portları korumak ve motoru sürmek için yüksek akımlı darlington sürücü entegresi olan **ULN2003** kullanılır.

**Step Motor Donanım Bağlantısı:**
• **PIC 16F877A RB0**  ---> ULN2003 IN1 ---> OUT1 ---> Step Motor Bobin A
• **PIC 16F877A RB1**  ---> ULN2003 IN2 ---> OUT2 ---> Step Motor Bobin B
• **PIC 16F877A RB2**  ---> ULN2003 IN3 ---> OUT3 ---> Step Motor Bobin C
• **PIC 16F877A RB3**  ---> ULN2003 IN4 ---> OUT4 ---> Step Motor Bobin D`,
        widgetType: "step-motor"
      },
      {
        id: "12.2",
        title: "12.2 Sürme Yöntemleri ve Adım Tabloları",
        content: `**1. Tek Fazlı Sürme (Wave Drive):**
Aynı anda sadece tek bir bobinin enerjilendirildiği düşük güç tüketimli sürme yöntemidir.

| Adım | RB3 (D) | RB2 (C) | RB1 (B) | RB0 (A) | Hex Değeri |
| :---: | :---: | :---: | :---: | :---: | :---: |
| 1 | 0 | 0 | 0 | 1 | **01h** |
| 2 | 0 | 0 | 1 | 0 | **02h** |
| 3 | 0 | 1 | 0 | 0 | **04h** |
| 4 | 1 | 0 | 0 | 0 | **08h** |

• **İleri Yön Sırası:** $01h \rightarrow 02h \rightarrow 04h \rightarrow 08h$
• **Geri Yön Sırası:** $08h \rightarrow 04h \rightarrow 02h \rightarrow 01h$

**2. Çift Fazlı Sürme (Full Step Drive):**
Aynı anda iki bobinin birden enerjilendirildiği, yüksek tork elde etmek için kullanılan en yaygın sürme yöntemidir.

| Adım | RB3 (D) | RB2 (C) | RB1 (B) | RB0 (A) | Hex Değeri |
| :---: | :---: | :---: | :---: | :---: | :---: |
| 1 | 0 | 0 | 1 | 1 | **03h** |
| 2 | 0 | 1 | 1 | 0 | **06h** |
| 3 | 1 | 1 | 0 | 0 | **0Ch** |
| 4 | 1 | 0 | 0 | 1 | **09h** |

• **İleri Yön Sırası:** $03h \rightarrow 06h \rightarrow 0Ch \rightarrow 09h$
• **Geri Yön Sırası:** $09h \rightarrow 0Ch \rightarrow 06h \rightarrow 03h$`,
        code: `; 12.3 Tek Fazlı İleri Yönlü Step Motor Kontrol Programı
; Aşağıdaki program, tek fazlı sürme yöntemini kullanarak motoru sürekli ileri yönde döndürür.
; Adımlar arası zaman gecikmesi motor milinin dönüş hızını belirler.

LIST P=16F877A
INCLUDE "P16F877A.INC"

; Gecikme Kaydedicileri
SAYAC1 EQU 0x20
SAYAC2 EQU 0x21

ORG 0x00
GOTO START

START
    clrf PORTB      ; Port çıkışlarını temizle.
    bsf STATUS, 5   ; Bank 1'e geçiş yap.
    clrf TRISB      ; PORTB portunu tamamen çıkış yap.
    bcf STATUS, 5   ; Bank 0'a geri dön.

MOTOR_RUN
    ; --- Adım 1 ---
    movlw 0x01      ; Bobin A'yı enerjilendir (01h)
    movwf PORTB
    call GECIKME_MOTOR

    ; --- Adım 2 ---
    movlw 0x02      ; Bobin B'yi enerjilendir (02h)
    movwf PORTB
    call GECIKME_MOTOR

    ; --- Adım 3 ---
    movlw 0x04      ; Bobin C'yi enerjilendir (04h)
    movwf PORTB
    call GECIKME_MOTOR

    ; --- Adım 4 ---
    movlw 0x08      ; Bobin D'yi enerjilendir (08h)
    movwf PORTB
    call GECIKME_MOTOR

    goto MOTOR_RUN  ; Adım döngüsünü tekrarla.

GECIKME_MOTOR       ; Motor adımları arası milisaniyelik gecikme
    movlw d'50'
    movwf SAYAC1
L_M1
    movlw d'100'
    movwf SAYAC2
L_M2
    decfsz SAYAC2, F
    goto L_M2
    decfsz SAYAC1, F
    goto L_M1
    return
    END`
      }
    ]
  }
];

export interface Flashcard {
  id: number;
  question: string;
  answer: string;
  chapterId: number;
}

export const STUDY_FLASHCARDS: Flashcard[] = [
  {
    id: 1,
    question: "Harvard Mimarisi nedir?",
    answer: "Veri ve program belleklerinin fiziksel olarak birbirlerinden ayrılmış olduğu, böylece veri ve komut yollarına aynı anda erişilerek işlem hızının artırıldığı mimari yapıdır.",
    chapterId: 1
  },
  {
    id: 2,
    question: "RISC mimarisinin temel özelliği nedir?",
    answer: "Reduced Instruction Set Computer (Azaltılmış Komut Kümeli Bilgisayar). Komut sayısı azdır (PIC16F84'te 35 komut) ve komutların neredeyse tamamı tek bir makine çevriminde yürütülür.",
    chapterId: 1
  },
  {
    id: 3,
    question: "PIC mikrodenetleyicilerde dekuplaj kondansatörü niçin ve nasıl bağlanır?",
    answer: "Yüksek hızlı anahtarlama sırasında VDD ve VSS hattında oluşan gerilim dalgalanmalarını (gürültüleri) önlemek amacıyla, entegrenin besleme bacaklarına (pin 14-5) olabildiğince yakın ve paralel bağlanan 0.1 µF'lık bir kondansatördür.",
    chapterId: 1
  },
  {
    id: 4,
    question: "Osilatör frekansı (fosc) ile Komut Çevrim Süresi (Tcyc) arasındaki ilişki nedir?",
    answer: "İşlemci her bir komutu çalıştırmak için osilatör sinyalini dörde böler (Tcyc = 4 / fosc). Örneğin, 4 MHz saat frekansında her bir komut adım süresi 1 µs'dir.",
    chapterId: 1
  },
  {
    id: 5,
    question: "PIC16F84'teki Program Belleği (Flash) ve Veri Belleğinin (RAM) boyutları ve kelime uzunlukları nedir?",
    answer: "Program Belleği 1024 satır (1K) uzunluğunda ve her hücre 14 byte değil, 14-bit'tir. Veri Belleği (RAM) ise 8-bit genişliğindedir ve 16F84'te 68 byte genel amaçlı alan mevcuttur.",
    chapterId: 2
  },
  {
    id: 6,
    question: "STATUS kaydedicisi üzerindeki RP0 biti ne işe yarar?",
    answer: "Register Bank Select 0. RAM bellek bankları arasında geçiş sağlar. Eğer RP0 = 1 ise Bank 1 aktifleşir (TRIS ayarları yapılır), RP0 = 0 ise Bank 0 aktifleşir (PORT kontrolü yapılır).",
    chapterId: 2
  },
  {
    id: 7,
    question: "Assembly komut parametrelerindeki 'd' harfi ne anlama gelir?",
    answer: "Destination (Hedef belirteci). İşlem sonucunun yazılacağı yeri belirler. d=0 (veya W) ise sonuç akümülatör (W) kaydedicisine yazılır; d=1 (veya F) ise sonuç işlem yapılan file (RAM) hücresine yazılır.",
    chapterId: 3
  },
  {
    id: 8,
    question: "Button bounce (Buton Titreşimi) nedir ve yazılımla nasıl çözülür?",
    answer: "Mekanik butonlara basılma ve el çekilme anında pin seviyesinin mikrosaniyeler mertebesinde lojik-0 ve lojik-1 arasında gidip gelmesidir. Yazılımsal olarak basılma algılandıktan sonra kısa bir gecikme (örn: 10ms-20ms) verilerek ve elin çekilmesi denetlenerek çözülür.",
    chapterId: 4
  },
  {
    id: 9,
    question: "Toplama ve çıkarma işlemlerinde STATUS Carry (C) bayrağının yorumlanmasındaki fark nedir?",
    answer: "Normal toplamada iki 8-bit sayı 255'i taşarsa C=1 olur (elde var). Çıkarmada (A - B) ise borç alınmadıysa C=1 kalır (pozitif sonuç veya eşitlik), borç alındıysa (B > A) Carry bayrağı C=0 olur (borç oluştu).",
    chapterId: 5
  },
  {
    id: 10,
    question: "İçiçe (Nested) gecikme döngüsü neden kullanılır?",
    answer: "Tek bir 8-bitlik sayaç en fazla 255 kez sayabilir ve 4MHz'de en fazla ~770 µs gecikme üretebilir. Çoklu milisaniye veya saniye seviyesinde gecikme elde etmek için sayaçlar içiçe döngüler şeklinde çalıştırılır.",
    chapterId: 6
  },
  {
    id: 11,
    question: "PCL (Program Counter Low) yardımıyla tablo okuma nasıl gerçekleştirilir?",
    answer: "W register'da bulunan indis değeri, program sayacının alt byte'ı olan PCL f register'ına 'addwf PCL, F' şeklinde eklenir. Program hesaplanan satıra sıçrar ve oradaki 'retlw sabiti' komutuyla akümülatörde dönen değeri geri yükleyerek döner.",
    chapterId: 8
  },
  {
    id: 12,
    question: "Kesme (Interrupt) anında Context Saving (Durum Kaydetme) neden zorunludur?",
    answer: "Kesmeyi tetikleyen donanımsal olay her an gerçekleşebilir. Kesme alt programında W veya STATUS register'lar değişeceği için, kesmeden çıkıp ana programa dönerken önceki W ve STATUS değerleri geri yüklenmezse ana program kararsızlaşır veya çöker.",
    chapterId: 9
  },
  {
    id: 13,
    question: "Step motor sürme tekniklerinden Wave Drive ve Full Step Drive arasındaki temel fark nedir?",
    answer: "Wave Drive modunda tek bir bobin enerjilendirilir (düşük akım ve düşük tork); Full Step modunda ise her adımda iki bobin birden enerjilendirilir (iki kat tork ve daha kararlı adım adımlama).",
    chapterId: 12
  }
];

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  chapterId: number;
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "4 MHz saat frekansına sahip (XT osilatörlü) bir PIC16F84'te, 'GOTO BASLA' komutu kaç mikrosaniyede yürütülür?",
    options: ["1 µs", "2 µs", "4 µs", "0.5 µs"],
    correctIndex: 1,
    explanation: "4 MHz kristal frekansında komut çevrim süresi Tcyc = 4 / fosc = 1 µs'dir. GOTO ve CALL gibi program akışını/sayaç adresini değiştiren komutlar 2 çevrim süresi aldığından, yürütülmesi tam olarak 2 µs sürecektir.",
    chapterId: 1
  },
  {
    id: 2,
    question: "PIC16F84 pin yapısında 'açık kollektörlü (open-drain)' olan ve çıkış olarak kullanıldığında harici bir pull-up direncine ihtiyaç duyan pin hangisidir?",
    options: ["RA0", "RA4", "RB0", "MCLR"],
    correctIndex: 1,
    explanation: "PORTA'nın 4. pini olan RA4 pini açık kollektörlüdür. Çıkış yapıldığında akım süzebilir ancak mantıksal 1 seviyesine çıkamaz, bu yüzden harici bir pull-up direnciyle bağlanması zorunludur.",
    chapterId: 1
  },
  {
    id: 3,
    question: "RAM üzerindeki TRISA ve TRISB yönlendirme kaydedicilerine ulaşmak için hangi STATUS biti ayarlanmalıdır ve değeri ne olmalıdır?",
    options: ["RP0 biti lojik-0 olmalıdır.", "RP0 biti lojik-1 olmalıdır.", "IRP biti lojik-1 olmalıdır.", "C biti lojik-1 olmalıdır."],
    correctIndex: 1,
    explanation: "TRIS kaydedicileri Bank 1'de yer alır. Bank 1'e geçiş yapabilmek için STATUS kaydedicisinin 5. biti olan RP0 biti lojik-1 (bsf STATUS, 5) yapılmalıdır.",
    chapterId: 2
  },
  {
    id: 4,
    question: "'SUBLW d'15'' komutu W akümülatöründeki değer 15 iken işletildiğinde STATUS register sıfır (Z) ve elde (C) bayrakları hangi konumu alır?",
    options: ["Z = 1, C = 1", "Z = 0, C = 0", "Z = 1, C = 0", "Z = 0, C = 1"],
    correctIndex: 0,
    explanation: "SUBLW k - W işlemini gerçekleştirir. k = 15 ve W = 15 olduğundan, sonuç 15 - 15 = 0 olur. Sonuç sıfır olduğundan Z = 1 olur. Borç oluşmadığından Carry C = 1 olur.",
    chapterId: 3
  },
  {
    id: 5,
    question: "Aşağıdaki assembly komutlarından hangisi işletildiğinde STATUS kaydedicisinin Z (Zero) bayrağını etkilemez?",
    options: ["ADDWF", "INCF", "MOVF", "MOVWF"],
    correctIndex: 3,
    explanation: "MOVWF (akümülatörden f register hücresine veri taşıma) komutu hiçbir STATUS bayrağını etkilemeyen nadir taşıma komutlarından biridir. MOVF komutu ise Z bayrağını etkiler.",
    chapterId: 3
  },
  {
    id: 6,
    question: "16-bitlik iki sayının toplamında düşük byte'lar toplandıktan sonra oluşan eldenin yüksek byte'a eklenmesi için hangi komut dizisi kullanılır?",
    options: ["addwf AL, F", "btfss STATUS, C / incf BH, F", "btfsc STATUS, C / incf BH, F", "movf AL, W"],
    correctIndex: 2,
    explanation: "btfsc STATUS, C (Bit Test File Skip if Clear). Eğer Carry bayrağı set (1) ise, bir sonraki komutu atlamaz ve yüksek anlamlı byte'ı (BH) bir artırır (incf BH, F).",
    chapterId: 5
  },
  {
    id: 7,
    question: "7-segment ortak katot bir displayde '3' rakamını görüntülemek için port çıkışına gönderilmesi gereken hex data hangisidir?",
    options: ["0x3F", "0x5B", "0x4F", "0x6D"],
    correctIndex: 2,
    explanation: "Sıfır için 0x3F, 1 için 0x06, 2 için 0x5B ve 3 rakamı için ise 7-segment ortak katot display sürücü hex verisi 0x4F'dur.",
    chapterId: 8
  },
  {
    id: 8,
    question: "Timer0 donanımsal taşma kesmesi (T0IE) izin verilmişken, sayıcı hangi değer geçişinde kesme (interrupt) üretir?",
    options: ["0x7F'den 0x80'e geçerken", "0xFF'den 0x00'a geçerken (taşma)", "0x00'dan 0x01'e geçerken", "Her bir komut adımı bitişinde"],
    correctIndex: 1,
    explanation: "Timer0 8-bitlik yukarı sayıcıdır. En büyük değeri olan 255'ten (0xFF) sıfıra (0x00) geçerken donanımsal overflow (taşma) oluşur, INTCON'daki T0IF bayrağı 1 olur ve kesme oluşur.",
    chapterId: 9
  },
  {
    id: 9,
    question: "Step motorun yüksek torklu ve kararlı bir şekilde sürmesi için iki bobinin eşzamanlı aktif edildiği sürme tekniği hangisidir?",
    options: ["Wave Drive (Tek Fazlı)", "Full Step Drive (Çift Fazlı)", "Half Step Drive (Daimi Mıknatıslı)", "Direct Drive"],
    correctIndex: 1,
    explanation: "Full Step Drive (Çift Fazlı) sürmede her adımda 2 bobine birden enerji verilir. Bu durum motor milinin yüksek tork ve mükemmel bir adım kararlılığı ile dönmesini garanti eder.",
    chapterId: 12
  }
];
