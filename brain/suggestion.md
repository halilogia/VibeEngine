# Project Evolution & Ar-Ge Suggestions (VibeEngine)

## 1. Universal Asset Registry & Drag-Drop Integration
- **Mevcut durum analizi**: 
  VibeEngine hiện tại có cấu trúc ECS mạnh mẽ, hệ thống Prefab và trình soạn thảo trực quan (Visual Editor) dựa trên React/Three.js. Tuy nhiên, việc xây dựng cảnh (scene) và gán logic (components/scripts) vẫn phải thực hiện thủ công qua Inspector hoặc viết code.
  
- **Önerilen değişiklik**: 
  Thêm một **"Universal Asset Registry"** cho phép người dùng đăng ký các asset 3D từ các nguồn bên ngoài (tương tự như Unity Asset Store). Hệ thống này hỗ trợ kéo-thả (Drag-Drop) mô hình trực tiếp từ Panel Assets vào Viewport.

- **Beklanan fayda**: 
  - Tăng tốc độ xây dựng cấp độ (Level Design) lên gấp nhiều lần.
  - Mang lại trải nghiệm "Unity-like" thực sự cho người dùng.
  - Dễ dàng mở rộng thư viện prefab công khai.

- **Uygulama zorluğu**: 
  - **Trung bình**: Cần tích hợp hệ thống quản lý asset của Three.js với state store của React.

---

## 2. Play Mode Sandbox & Script Runtime
- **Mevcut durum analizi**: 
  Hiện tại, "Script Editor" đã được tích hợp nhưng các script vẫn ở dạng code tĩnh, chưa thể thực thi trực tiếp trong sandbox (ngoại trừ qua cơ chế Play Mode toàn cục).

- **Önerilen değişiklik**: 
  Phát triển một hệ thống "Script Runtime" sử dụng Web Workers hoặc JS Sandboxing (như iFrame tách biệt) để cho phép AI hoặc người dùng thực thi các hành vi logic (bouncing, follow target) mà không gây treo Engine chính.

- **Beklanan fayda**: 
  - Trải nghiệm lập trình thời gian thực (Live Coding).
  - Tăng độ tin cậy và khả năng debug script riêng biệt.

- **Uygulama zorluğu**: 
  - **Cao**: Cần xây dựng một bridge an toàn giữa main thread và sandbox logic.

---

## 3. Advanced AI Function Calling (TBD)
- **Mevcut durum analizi**: 
  Hiện tại, "AICopilot" đã được tích hợp thành công với Ollama và thực thi JSON commands cơ bản.
  
- **Önerilen değişiklik**: 
  Mở rộng AI Copilot để hỗ trợ các kịch bản phức tạp hơn như "Tự viết script và gắn trực tiếp vào entity vừa tạo". AI không chỉ tạo ra object mà còn tạo ra logic tương tác cho nó.

- **Beklanan fayda**: 
  - Đạt đến trình độ "Vibe Coding" thực sự của năm 2025.
  - Tự động hóa toàn bộ luồng phát triển trò chơi từ ý tưởng đến thực thi.

- **Uygulama zorluğu**: 
  - **Cao**: Cần cấu trúc hóa engine API thành một "Tools interface" cho LLM.
