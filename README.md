# Bắn Bóng - Chrome Extension Game

Trò chơi bắn bóng đơn giản và vui nhộn cho Chrome.

## Tính Năng

- 🎮 Trò chơi bắn bóng theo thời gian thực
- 🎯 Hệ thống điểm số
- ❤️ Hệ thống sức khỏe
- 🕹️ Điều khiển bằng bàn phím (← → ) và chuột
- ⚡ Độ khó tăng dần theo điểm
- 🎨 Giao diện đẹp và bắt mắt

## Cài Đặt

1. Tải xuống hoặc clone dự án
2. Mở Chrome và truy cập `chrome://extensions/`
3. Bật "Developer mode" ở góc phải trên
4. Nhấn "Load unpacked" và chọn thư mục dự án
5. Tiện ích sẽ xuất hiện trong danh sách extensions

## Hướng Dẫn Chơi

- **Di chuyển**: Dùng mũi tên trái (←) và phải (→) hoặc di chuột
- **Bắn**: Nhấn phím cách (SPACE)
- **Mục đích**: Bắn hạ các bóng rơi xuống trước khi chúng chạm đất
- **Điểm**: +10 điểm khi bắn hạ bóng, +5 điểm khi bóng chạm người chơi
- **Sức khỏe**: Bạn có 3 mạng, mỗi bóng chạm đất sẽ mất 1 mạng

## Cấu Trúc Tệp

```
ball/
├── manifest.json     # Cấu hình tiện ích Chrome
├── popup.html        # Giao diện HTML
├── styles.css        # Kiểu CSS
├── game.js           # Logic trò chơi
└── images/           # Thư mục icon (tùy chọn)
```

## Tác Giả

Created with ❤️ for fun gaming

## Phiên Bản

v1.0.0
