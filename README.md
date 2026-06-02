# PIC Akademi - Gömülü Sistemler ve PIC Programlama Platformu

PIC Akademi, PIC 16F84 ve PIC 16F877A mikrodenetleyicileri için interaktif animasyonlar, kod simülatörü, gelişmiş görsel şemalar ve ders notları sunan modern bir web uygulamasıdır. Kullanıcıların gömülü sistemler mantığını görsel ve deneysel olarak kavramasını hedefler.

## Özellikler

- PIC 16F84 ve PIC 16F877A mikrodenetleyici simülasyonları
- İnteraktif kod simülatörü ve adım adım kod yürütme
- Görsel devre şemaları ve sinyal takipleri
- Kapsamlı gömülü sistemler ders notları ve pratik rehberler
- Yapay zeka destekli kod analizi ve asistan desteği

## Teknoloji Yığını

- Framework: Next.js (App Router)
- Kütüphane: React
- Stil: Tailwind CSS
- Animasyonlar: Motion (Framer Motion)
- Geliştirme Dili: TypeScript
- Paket Yöneticisi: pnpm

## Başlangıç

Projeyi yerel bilgisayarınızda çalıştırmak için aşağıdaki adımları takip edebilirsiniz.

### Gereksinimler

- Node.js (Sürüm 18 veya üzeri)
- pnpm paket yöneticisi

### Kurulum

1. Depoyu bilgisayarınıza indirin.
2. Bağımlılıkları kurmak için terminalde aşağıdaki komutu çalıştırın:
   ```bash
   pnpm install
   ```
3. Kök dizinde `.env.local` adında bir dosya oluşturun ve Gemini API anahtarınızı ekleyin:
   ```env
   GEMINI_API_KEY=api_anahtariniz
   ```

### Geliştirme Sunucusunu Başlatma

Yerel geliştirme sunucusunu çalıştırmak için:
```bash
pnpm dev
```
Sunucu hazır olduğunda tarayıcınızdan http://localhost:3000 adresine giderek uygulamaya erişebilirsiniz.

### Yapı ve Derleme

Üretim sürümünü derlemek ve test etmek için:
```bash
pnpm build
pnpm start
```

## Mimari Yapı

Proje, Feature-Sliced Design (FSD) metodolojisi kurallarına göre yapılandırılmıştır:

- app: Global sağlayıcılar (providers), router yapılandırması ve global stiller.
- pages: Uygulama sayfaları ve birleştirici katman.
- widgets: Sayfalarda kullanılan bağımsız büyük UI blokları (Header, Sidebar vb.).
- features: Kullanıcı etkileşimleri ve iş mantığı özellikleri (Kod simülasyonu başlatma, AI analizi vb.).
- entities: İş alanı (domain) modelleri ve bunlarla ilgili kartlar/bileşenler (PIC mimarisi, register modelleri).
- shared: Proje genelinde tekrar kullanılabilir UI bileşenleri, yardımcı fonksiyonlar ve API istemcileri.
