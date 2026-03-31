# AI-Powered Scene Authoring (AI Co-pilot Integration)

- **Mevcut durum analizi**: 
  VibeEngine hiện tại có cấu trúc ECS mạnh mẽ, hệ thống Prefab và trình soạn thảo trực quan (Visual Editor) dựa trên React/Three.js. Tuy nhiên, việc xây dựng cảnh (scene) và gán logic (components/scripts) vẫn phải thực hiện thủ công qua Inspector hoặc viết code.

- **Önerilen değişiklik**: 
  Thêm một **"AI Co-pilot Panel"** vào trình soạn thảo. Panel này sẽ cho phép người dùng nhập các câu lệnh tự nhiên (như trong STEM Studio) để:
  1. Tự động thêm thực thể (Entities) từ thư viện asset.
  2. Gán các Component (Physics, Script, Health) dựa trên yêu cầu.
  3. Thiết lập thuộc tính Transform và mối quan hệ phân cấp (Hierarchy).
  4. Tạo các kịch bản trò chơi cơ bản (Battle Royale, Racing) thông qua "Game Manager" logic.

- **Beklanan fayda**: 
  - Tăng tốc độ prototype lên gấp 10 lần.
  - Xóa bỏ rào cản "không biết bắt đầu từ đâu" của người dùng mới.
  - Mang lại trải nghiệm "AAA Engine" hiện đại như STEM Studio hay Rosebud AI.

- **Uygulama zorluğu**: 
  - **Trung bình**: Cần tích hợp API LLM (như Gemini/OpenAI) và xây dựng một hệ thống "Function Calling" để AI có thể tương tác trực tiếp với `useEditorStore` và `scene` API của VibeEngine.
