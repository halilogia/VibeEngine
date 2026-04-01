# 🌊 VibeMotion: Pure Tech Interaction Engine

VibeMotion, VibeEngine için özel olarak geliştirilmiş, düşük seviyeli (low-level), fizik tabanlı bir animasyon ve etkileşim kütüphanesidir. Dış bağımlılıkları (Framer Motion, @use-gesture vb.) minimize etmek ve "Sovereign UI" vizyonunu gerçekleştirmek için tasarlanmıştır.

---

## 🏗️ Mimari (Architecture)

VibeMotion, **Mass-Spring-Damper** (Kütle-Yay-Sönümleyici) fizik modelini temel alır. Geleneksel zaman tabanlı (duration-based) animasyonlar yerine, hedef konuma "akışkan" bir şekilde yerleşen bir sistem kullanır.

### Çekirdek Bileşenler:

1.  **`VibeSpring.ts`**: Matematiksel yay çözücü.
    -   `target`: Ulaşılmak istenen değer.
    -   `tension`: Yayın gerginliği (hız).
    -   `friction`: Sürtünme (yumuşaklık).
    -   `mass`: Kütle (ağırlık).
2.  **`VibeMotionManager.ts`**: Merkezi RAF (RequestAnimationFrame) yöneticisi. Tüm aktif yayları tek bir döngüde güncelleyerek performansı maksimize eder.
3.  **`VibeMotion.tsx`**: React bileşeni (`motion.div` alternatifi).
4.  **`useVibeDrag.ts`**: Paneller ve objeler için fizik tabanlı sürükleme kancası (hook).

---

## 🚀 Kullanım Rehberi

### 1. Basit Animasyon (VibeMotion)

```tsx
import { VibeMotion } from './lib/vibe-motion/VibeMotion';

const MyComponent = () => (
    <VibeMotion 
        animate={{ scale: 1.1, opacity: 1 }}
        initial={{ scale: 0.9, opacity: 0 }}
        transition={{ tension: 170, friction: 26 }}
    >
        VibeEngine Rocks!
    </VibeMotion>
);
```

### 2. Sürükleme Etkileşimi (useVibeDrag)

```tsx
import { useVibeDrag } from './lib/vibe-motion/useVibeDrag';

const DraggablePanel = () => {
    const { targetRef, dragProps } = useVibeDrag({ 
        initialX: 100, 
        initialY: 100 
    });

    return (
        <div ref={targetRef} {...dragProps} className="panel">
            Drag Me!
        </div>
    );
};
```

---

## 🛠️ Geliştirme ve Genişletme (Extension Guide)

VibeMotion'ı geliştirmek için şu adımları izleyin:

### Yeni Bir Fizik Modeli Eklemek:
1.  `VibeSpring.ts` içine yeni bir fiziksel formül (örn. `decay`, `inertia`) ekleyin.
2.  `update(deltaTime)` metodunda bu formülü uygulayın.

### Yeni Bir Hook Oluşturmak:
1.  PointerEvent'leri dinleyen bir React hook'u yazın.
2.  Bu olaylardan gelen değerleri (deltaX, deltaY vb.) `VibeSpring` hedef değerlerine (`setTarget`) yönlendirin.
3.  Animasyonun akıcılığı için `VibeMotionManager` üzerinden bir callback kaydedin.

### Performans Kuralları:
-   Doğrudan DOM API'lerini (`element.style.transform`) kullanın.
-   Mümkünse React state güncellemelerinden (re-render) kaçının, RAF callback'lerini tercih edin.
-   Aynı anda çok fazla objeyi canlandırırken `VibeMotionManager.getInstance().unregister()` ile işi biten yayları temizleyin.

---

> [!TIP]
> **Tavsiye Edilen Yay Ayarları:**
> - **Snappy (Hızlı)**: `{ tension: 210, friction: 20 }`
> - **Smooth (Yumuşak)**: `{ tension: 170, friction: 26 }`
> - **Bouncy (Esnek)**: `{ tension: 180, friction: 12 }`

*Pure Tech, Pure Vibe.* 🧬✨
