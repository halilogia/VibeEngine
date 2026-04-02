# MobRunner Runtime Exporter — Kullanım Rehberi

## Ne İşe Yarar?

MobRunner3D oyununu çalışırken, Three.js sahnesindeki tüm objeleri (binalar, yollar, çitler, ağaçlar, kapılar, düşmanlar vb.) okuyup **VibeEngine'in anlayabileceği `scene.json` formatına** dönüştürür.

## Nasıl Kullanılır?

### Yöntem 1: Browser Console (En Kolay)

1. **MobRunner'ı çalıştır** (oyun açılsın, level yüklensin)
2. **F12** ile DevTools'u aç
3. **Console** sekmesine git
4. `mobrunner-exporter-plain.js` dosyasının **tüm içeriğini** kopyala-console'a yapıştır
5. Enter'a bas
6. Şunu görürsen başarılı: `✅ Runtime Exporter loaded. Call exportToVibeEngine() in console to export.`
7. `exportToVibeEngine()` yaz ve Enter'a bas
8. `mobrunner_scene.json` otomatik indirilir

### Yöntem 2: Geçici Script Tag

1. MobRunner'ın `index.html` dosyasını aç
2. `</body>` kapanış etiketinden önce şunu ekle:
   ```html
   <script src="../scripts/mobrunner-exporter-plain.js"></script>
   ```
3. Oyunu çalıştır
4. Console'da `exportToVibeEngine()` çağır

### Yöntem 3: Bookmarklet (Sık Kullanacaksan)

1. Browser'ında yeni bookmark oluştur
2. URL kısmına şunu yapıştır (minified versiyonu kullan):
   ```javascript
   javascript:(function(){var s=document.createElement('script');s.src='file:///path/to/scripts/mobrunner-exporter-plain.js';document.head.appendChild(s)})();
   ```
3. MobRunner açıkken bookmark'a tıkla, sonra console'da `exportToVibeEngine()` çağır

## Ne Export Edilir?

| Obje Tipi | Components | Not |
|-----------|-----------|-----|
| **Binalar** | Transform + Render (model) | GLB model yolu otomatik eşlenir |
| **Yollar** | Transform + Render (model) | Road segment'leri |
| **Kaldırımlar** | Transform + Render (plane) | Geometry-based |
| **Çitler** | Transform + Render (model) | |
| **Ağaçlar** | Transform + Render (model) | |
| **Sokak Lambaları** | Transform + Render (model) | |
| **Kapılar (Gates)** | Transform + Render + Collision + Script | Trigger collider + placeholder script |
| **Düşmanlar** | Transform + Render + Collision + Script | Box collider + placeholder script |
| **Boss'lar** | Transform + Render + Collision + Script | Box collider + placeholder script |

## Ne Export Edilmez?

- ❌ Işıklar (ambient, directional, hemisphere)
- ❌ Bulutlar (dekoratif)
- ❌ Görünmez plane (raycasting helper)
- ❌ Player/mob'lar (dinamik, runtime'da spawn oluyor)
- ❌ Mermiler, patlamalar, VFX (geçici efektler)

## VibeEngine'e Import Etme

Export edilen `mobrunner_scene.json` dosyasını VibeEngine'e aktarmak için:

1. **VibeEngine editor'ünü aç**
2. **Assets Panel** → sol alt köşedeki **Import** butonuna tıkla
3. `mobrunner_scene.json` dosyasını seç
4. **VEYA** dosyayı doğrudan **Viewport** paneline sürükle-bırak
5. Sahne otomatik yüklenir

### Manuel Import (Eğer UI'dan yapılamazsa)

VibeEngine console'unda (browser DevTools):

```javascript
// JSON dosyasını oku (fetch ile local server'dan)
fetch('/path/to/mobrunner_scene.json')
    .then(r => r.json())
    .then(data => {
        // VibeEngine'in scene store'unu kullan
        const store = useSceneStore.getState();
        store.loadScene(data);
        console.log('✅ Scene imported!');
    });
```

## Sonraki Adımlar

Export ettikten sonra yapman gerekenler:

1. ✅ **Sahneyi kontrol et** — Tüm objeler doğru pozisyonda mı?
2. 🔧 **Model yollarını düzelt** — Exporter base path'leri koyar (`assets/models/environment/buildings/`), spesifik dosya isimlerini manuel eklemen gerekebilir
3. 🔧 **ScriptComponent'leri doldur** — Enemy, Gate, Boss için placeholder script'ler oluşturuldu. Bunları MobRunner'ın orijinal logic kodlarıyla doldur
4. 🔧 **Collider boyutlarını ayarla** — Tüm game objects için `[1,1,1]` default box collider verildi. Gerçek boyutlara göre ayarla
5. 🎮 **Game logic'i bağla** — MobRunner'ın `MobManager`, `WeaponManager` gibi saf mantık modüllerini VibeEngine'e port et

## Sorun Giderme

### `window.scene not found!`
- MobRunner'ın tam olarak yüklendiğinden emin ol
- Oyun başlamış olmalı (loading screen geçilmiş olmalı)
- `window.scene` ve `window.gameLayer` MobRunner'ın `SceneSetup.ts`'inde tanımlı

### Export boş geliyor
- Z range ayarını kontrol et: `EXPORT_CONFIG.zRange`
- Oyun objeleri `gameLayer` içinde mi? Console'da `window.gameLayer.children.length` kontrol et

### Model yolları yanlış
- `EXPORT_CONFIG.modelPathMap` dizisini MobRunner'ın gerçek asset yapısına göre güncelle
- Export sonrası JSON'daki `modelPath` değerlerini manuel düzelt
