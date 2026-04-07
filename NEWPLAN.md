Edited MeshUtils.ts

Ne yapmak istediğini çok iyi anladım! Sen aslında **"Editor Odaklı"** değil, **"Framework (Altyapı) Odaklı" bir Oyun Motoru** inşa etmek istiyorsun. 

Buna profesyonel dünyada **"Modular Component-Based Subsystem Architecture" (Modüler Bileşen Tabanlı Alt Sistem Mimarisi)** diyoruz. 

Senin istediğin şey tam olarak şu:
"Bana karmaşık UI panelleriyle vakit kaybettirme. Ben motorun içine **'Okyanus Modülü'**, **'Trafik Modülü'**, **'Ses Fizik Modülü'** gibi mikro-motorlar yerleştireyim. Sonra hiyerarşiden bir nesneye 'Sen okyanussun' (SeaComponent) dediğimde, o devasa dalga fiziği motoru arka planda zaten hazır olan kodunu kullanarak çalışmaya başlasın."

### Bu Sistemin Avantajları:
1.  **Hafiftir:** UI ile uğraşmadığımız için motor uçak gibi hızlı çalışır.
2.  **Genişletilebilirdir:** Yarın bir gün "Rüzgar Motoru" eklemek istediğinde sadece bir dosya (`WindSystem.ts`) yazarsın ve biter.
3.  **Sahne Odaklıdır:** Senin dediğin gibi sadece **Hiyerarşi (Neler var?)** ve **Viewport (Nasıllar?)** ile koca bir dünyayı Lego gibi birleştirebilirsin.

### Şimdi Ne Yapmalıyız? (VibeEngine "Core Power" Planı)
Senin bu isteğine göre motoru şu **"Mikro-Motor"** yapılarına bölmeye başlayalım:

1.  **Ocean Core (Dalga Fiziği):** Su yüzeyi, köpük ve dalga simülasyonunu yöneten mikro sistem.
2.  **Traffic Core (Yol İzleme):** Arabaların ve yayaların pathfinding (yol bulma) ve takip sistemini yöneten mikro sistem.
3.  **Audio Core (3D Mekansal Ses):** Sesin duvardan sekmesi veya uzaklaştıkça yankılanmasını yöneten mikro sistem.

**Hemen aksiyona geçelim mi?**
İstersen ilk mikro özelliğimiz olan **"Ocean/Wave Core" (Dalga Motoru)** ile başlayalım. Ben sana kod tarafında bu dalga fiziği altyapısını kurarım, sen hiyerarşiden bir Plane (Düzlem) ekleyip ona `SeaComponent` verdiğinde okyanusun canlandığını Viewport'ta görürsün. 

Bu yönde ilerleyelim mi? Yoksa önce hangi mikro özelliği eklemek istersin? (Yol izleme sistemi de çok kritik!)