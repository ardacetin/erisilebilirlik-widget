# Erişilebilirlik Widget'ı

Harici web sitelerine `<script>` etiketiyle eklenebilen, erişilebilirliği artırmaya yönelik yeniden kullanılabilir bir arayüz sunar. Bileşen; yüksek kontrast, metin boyutu, satır aralığı, renk filtreleri, animasyonları durdurma gibi kontroller içerir ve odak yönetimi, ARIA etiketleri ile yerelleştirme desteği sağlar. Kontrast ve renk filtreleri birlikte kullanıldığında dahi görsel ayarlar aynı anda uygulanır.

## Hızlı Başlangıç

```html
<link rel="stylesheet" href="https://cdn.example.com/widget.css" />
<script src="https://cdn.example.com/widget.bundle.js"></script>
<script>
  window.initAccessibilityWidget({ locale: 'tr' });
</script>
```

> Varsayılan locale Türkçe'dir (`tr`). İngilizce için `locale: 'en'` parametresini iletebilirsiniz.

Widget ilk çağrıldığında `<html>` etiketine gerekli sınıfları enjekte eder ve durumunu `localStorage` üzerinden saklar. Panel, `Ctrl + Alt + A` kısayoluyla açılıp kapatılabilir.

## Geliştirme

```bash
npm install
npm run build
```

Derleme sonucunda `dist/widget.bundle.js` ve `dist/widget.css` dosyaları oluşur. `widget.bundle.js` dosyası IIFE formatında üretildiği için doğrudan `<script>` etiketiyle eklenebilir.

## Manuel Test Senaryoları

- `examples/light-theme.html`: Açık temalı pazarlama sayfasında widget'ın davranışı.
- `examples/dark-theme.html`: Karanlık tema uygulama görünümünde bileşen testi.

Detaylar için [docs/manual-testing.md](docs/manual-testing.md) dosyasına göz atın.
