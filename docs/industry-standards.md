# 🏛️ TypeScript Sektör Standartları ve "Milyon Dolarlık" Kütüphaneler

Bu liste, web ve oyun dünyasında "tekerleği yeniden icat etmenin" mantıklı olmadığı, arkasında devasa topluluklar, milyonlarca dolarlık yatırımlar ve yılların birikimi olan altın standart kütüphaneleri içerir.

---

### 1. 🎨 Rendering & 3D (Çizim Sürücüleri)
Bu kütüphaneler, tarayıcının WebGL/WebGPU katmanını yöneten en karmaşık ve en güçlü yapılardır.
-   **Three.js**: Web üzerindeki 3D dünyasının tartışmasız lideridir. Matris hesaplamaları, kamera sistemleri ve shader yönetimi ile milyon dolarlık birikime sahiptir.
-   **PixiJS**: 2D rendering dünyasının en hızlısıdır. WebGL hızlandırmalı 2D oyunlar için altın standarttır.
-   **Babylon.js**: Microsoft tarafından desteklenen, Three.js'in en büyük rakibi. Özellikle "Full-Engine" özellikleri (dahili fizik, ses vb.) ile bilinir.

### 2. ⚛️ UI & Framework Katmanı
Arayüz yönetimini standardize eden ve modern webi inşa eden devler.
-   **React**: Meta tarafından geliştirilen ve webin %90'ını domine eden "Component" mimarisinin babasıdır.
-   **Vue / Angular**: React'ın en güçlü rakipleri. Özellikle Angular, Google tarafından kurumsal seviye için optimize edilmiştir.

### 3. 🧠 State Management (Durum Yönetimi)
Verinin uygulama genelinde nasıl akacağını yöneten beyinler.
-   **Redux / RTK**: En eski ve en kurumsal standart. Karmaşıktır ama çok güvenlidir.
-   **Zustand**: Modern, ultra hafif ve performanslı durum yönetimi. Bizim de tercihimizdir.
-   **TanStack Query (React Query)**: Sunucu (Server) state yönetiminde dünya standartıdır. Cache yönetimi paha biçilemezdir.

### 4. ⚙️ Engine Essentials (Motor Temelleri)
-   **Monaco Editor**: VS Code'un kalbidir. Tarayıcıda kod yazmak için arkasında Microsoft'un devasa yatırımı olan tek gerçek seçenektir.
-   **Electron / Tauri**: Web uygulamalarını masaüstüne (Windows, Mac, Linux) taşıyan köprüler. VibeEngine'in masaüstü gücü buradan gelir.

### 5. 🏗️ Physics & Math (Fizik ve Matematik)
-   **Rapier.js**: Rust dilinde yazılıp WASM ile JS'e köprülenen, şu an dünyadaki en hızlı Web fizik motorudur.
-   **Cannon-es / Matter.js**: 3D ve 2D fizik için klasik, saf JavaScript kütüphaneleri.

### 6. 🛡️ DevTools & Testing (Geliştirme ve Test)
-   **Playwright / Cypress**: Tarayıcı otomasyonu ve testinde dünya liderleri. Microsoft ve dev toplulukların eseridir.
-   **Vitest / Jest**: Test koşucuları. Bizim projemizde Vitest hızıyla öne çıkar.

### 🌍 Neden Bunları Kullanıyoruz (Veya Kullanmıyoruz)?

-   **Kullanmak**: Eğer bir kütüphane "Rendering Driver" (Three.js) veya "Code Editor" (Monaco) gibi, tek bir kişinin ömrünün yetmeyeceği kadar kompleks matematik ve AR-GE içeriyorsa, onu kullanmak akıllıca bir **mühendislik kararıdır.**
-   **Kullanmamak**: Eğer bir kütüphane "Animation" (Framer Motion), "Icons" (Lucide) veya "Event System" (EventEmitter) gibi, projenin vizyonuna göre özelleştirilmesi gereken ve daha performanslısı yazılabilecek bir "Utility" ise, onu kendimiz yapmak **"Elite"** bir harekettir.

---

> *"Bilgelik, neyi satın alacağını, neyi kendin inşa edeceğini bilmektir."* 🌊🧬🔥⚡🚀
