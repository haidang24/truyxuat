# Tài liệu API - Hệ thống Truy xuất Nguồn gốc Nông sản

## Tổng quan

Hệ thống truy xuất nguồn gốc nông sản sử dụng công nghệ blockchain để đảm bảo tính minh bạch và không thể thay đổi của dữ liệu. API cung cấp các endpoint để quản lý sản phẩm nông nghiệp và lịch sử truy xuất.

**Base URL:** `http://localhost:4000`

**Công nghệ sử dụng:**
- Backend: Node.js + Express
- Blockchain: Ethereum (Hardhat local network)
- Smart Contract: Solidity
- Database: Blockchain (không sử dụng database truyền thống)

---

## Cấu trúc Dữ liệu

### Product (Sản phẩm)

```json
{
  "id": "string",              // Mã định danh sản phẩm (bắt buộc)
  "name": "string",            // Tên sản phẩm (bắt buộc)
  "description": "string",     // Mô tả sản phẩm
  "variety": "string",         // Giống/Loại (bắt buộc)
  "origin": "string",          // Nguồn gốc xuất xứ (bắt buộc)
  "farmName": "string",        // Tên trang trại/nhà vườn (bắt buộc)
  "farmAddress": "string",     // Địa chỉ trang trại
  "farmerId": "string",        // Mã số nông hộ (bắt buộc)
  "farmerName": "string",      // Tên chủ trang trại (bắt buộc)
  "plantingDate": "string",    // Ngày gieo trồng (YYYY-MM-DD) (bắt buộc)
  "harvestDate": "string",     // Ngày thu hoạch (YYYY-MM-DD)
  "packagingDate": "string",   // Ngày đóng gói (YYYY-MM-DD)
  "expiryDate": "string",      // Hạn sử dụng (YYYY-MM-DD)
  "storageTemp": "string",     // Nhiệt độ bảo quản
  "storageInstr": "string",    // Hướng dẫn bảo quản
  "quantity": "string",        // Số lượng/Khối lượng
  "unit": "string",            // Đơn vị tính
  "grade": "string",           // Phân hạng chất lượng
  "certifications": "string",  // Chứng nhận (VietGAP, GlobalGAP, Organic...)
  "images": "string",          // URL hình ảnh sản phẩm
  "creator": "string",         // Địa chỉ blockchain của người tạo (auto)
  "timestamp": "string"        // Thời gian tạo trên blockchain (auto)
}
```

### HistoryEntry (Lịch sử)

```json
{
  "productId": "string",       // Mã sản phẩm (bắt buộc)
  "stage": "string",           // Giai đoạn (bắt buộc)
  "action": "string",          // Hành động cụ thể (auto-generated)
  "description": "string",     // Mô tả chi tiết
  "actor": "string",           // Người thực hiện (bắt buộc)
  "actorRole": "string",       // Vai trò người thực hiện (bắt buộc)
  "location": "string",        // Địa điểm (bắt buộc)
  "temperature": "string",     // Nhiệt độ (nếu có)
  "humidity": "string",        // Độ ẩm (nếu có)
  "timestamp": "string",       // Thời gian thực hiện (ISO string)
  "recorder": "string",        // Địa chỉ blockchain người ghi (auto)
  "blockTimestamp": "string"   // Thời gian block (auto)
}
```

### Các giai đoạn hỗ trợ (Stage)

- `gieo_trong` - Gieo trồng
- `cham_soc` - Chăm sóc
- `phun_thuoc` - Phun thuốc/Bảo vệ thực vật
- `bon_phan` - Bón phân
- `thu_hoach` - Thu hoạch
- `van_chuyen` - Vận chuyển đến kho

---

## API Endpoints

### 1. Thêm sản phẩm mới

**POST** `/product`

Thêm một sản phẩm nông nghiệp mới vào blockchain.

#### Request Body

```json
{
  "id": "SP2023001",
  "name": "Gạo ST25",
  "description": "Gạo thơm cao cấp",
  "variety": "ST25",
  "origin": "An Giang, Việt Nam",
  "farmName": "Trang trại Xanh",
  "farmAddress": "Xã Tân Phú, Huyện Tịnh Biên, An Giang",
  "farmerId": "AGR001",
  "farmerName": "Nguyễn Văn A",
  "plantingDate": "2023-01-15",
  "harvestDate": "2023-05-20",
  "packagingDate": "2023-05-25",
  "expiryDate": "2024-05-25",
  "storageTemp": "15-25°C",
  "storageInstr": "Bảo quản nơi khô ráo, thoáng mát",
  "quantity": "1000",
  "unit": "kg",
  "grade": "Premium",
  "certifications": "VietGAP, Organic",
  "images": "https://example.com/gao-st25.jpg"
}
```

#### Response

**Success (201 Created):**
```json
{
  "message": "Đã thêm sản phẩm vào blockchain",
  "product": {
    "id": "SP2023001",
    "name": "Gạo ST25"
  },
  "txHash": "0x1234567890abcdef..."
}
```

**Error (400 Bad Request):**
```json
{
  "message": "Thiếu thông tin bắt buộc: id, name, variety"
}
```

#### Validation

Các trường bắt buộc:
- `id`, `name`, `variety`, `origin`, `farmName`, `farmerId`, `farmerName`, `plantingDate`

---

### 2. Lấy thông tin sản phẩm

**GET** `/product/{id}`

Lấy thông tin chi tiết của một sản phẩm và lịch sử truy xuất.

#### Parameters

- `id` (path parameter): Mã sản phẩm

#### Response

**Success (200 OK):**
```json
{
  "id": "SP2023001",
  "name": "Gạo ST25",
  "description": "Gạo thơm cao cấp",
  "variety": "ST25",
  "origin": "An Giang, Việt Nam",
  "farmName": "Trang trại Xanh",
  "farmAddress": "Xã Tân Phú, Huyện Tịnh Biên, An Giang",
  "farmerId": "AGR001",
  "farmerName": "Nguyễn Văn A",
  "plantingDate": "2023-01-15",
  "harvestDate": "2023-05-20",
  "packagingDate": "2023-05-25",
  "expiryDate": "2024-05-25",
  "storageTemp": "15-25°C",
  "storageInstr": "Bảo quản nơi khô ráo, thoáng mát",
  "quantity": "1000",
  "unit": "kg",
  "grade": "Premium",
  "certifications": "VietGAP, Organic",
  "images": "https://example.com/gao-st25.jpg",
  "creator": "0x1234567890abcdef...",
  "timestamp": "1640995200",
  "history": [
    {
      "productId": "SP2023001",
      "stage": "gieo_trong",
      "action": "Gieo trồng",
      "description": "Gieo hạt giống ST25\nLoại giống: ST25 F1\nNhà cung cấp: Công ty Giống cây trồng An Giang",
      "actor": "Nguyễn Văn A",
      "actorRole": "Nông dân",
      "location": "Ruộng A1, Trang trại Xanh",
      "temperature": "28°C",
      "humidity": "75%",
      "timestamp": "2023-01-15T08:00:00.000Z",
      "recorder": "0x1234567890abcdef...",
      "blockTimestamp": "1673769600"
    }
  ],
  "dataSource": "blockchain"
}
```

**Error (404 Not Found):**
```json
{
  "message": "Không tìm thấy sản phẩm trên blockchain"
}
```

---

### 3. Thêm lịch sử sản phẩm

**POST** `/product/{id}/history`

Thêm một giai đoạn mới vào lịch sử truy xuất của sản phẩm.

#### Parameters

- `id` (path parameter): Mã sản phẩm

#### Request Body

```json
{
  "stage": "phun_thuoc",
  "action": "Phun thuốc bảo vệ thực vật",
  "description": "Phun thuốc trừ sâu theo lịch\nLoại thuốc: Imidacloprid 200SL\nNhà cung cấp: Công ty TNHH Bảo vệ thực vật",
  "actor": "Nguyễn Văn B",
  "actorRole": "Kỹ thuật viên",
  "location": "Ruộng A1, Trang trại Xanh",
  "temperature": "30°C",
  "humidity": "70%",
  "timestamp": "2023-03-01T14:30:00.000Z"
}
```

#### Response

**Success (201 Created):**
```json
{
  "message": "Đã thêm lịch sử sản phẩm vào blockchain",
  "entry": {
    "productId": "SP2023001",
    "stage": "phun_thuoc",
    "action": "Phun thuốc bảo vệ thực vật"
  },
  "txHash": "0x1234567890abcdef..."
}
```

#### Validation

Các trường bắt buộc:
- `stage`, `actor`, `actorRole`, `location`

---

### 4. Lấy danh sách tất cả sản phẩm

**GET** `/products`

Lấy danh sách tất cả sản phẩm đã được đăng ký trên blockchain.

#### Response

**Success (200 OK):**
```json
{
  "products": [
    {
      "id": "SP2023001",
      "name": "Gạo ST25",
      "variety": "ST25",
      "origin": "An Giang, Việt Nam",
      "farmName": "Trang trại Xanh",
      "farmerName": "Nguyễn Văn A"
    }
  ],
  "count": 1,
  "dataSource": "blockchain"
}
```

---

### 5. Kiểm tra trạng thái blockchain

**GET** `/blockchain/status`

Kiểm tra trạng thái kết nối và thông tin về blockchain.

#### Response

**Success (200 OK):**
```json
{
  "status": "connected",
  "contractAddress": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  "productCount": "15"
}
```

**Error (503 Service Unavailable):**
```json
{
  "status": "disconnected",
  "message": "Blockchain không khả dụng"
}
```

---

## Mã lỗi HTTP

| Mã lỗi | Ý nghĩa | Mô tả |
|---------|---------|-------|
| 200 | OK | Yêu cầu thành công |
| 201 | Created | Tạo mới thành công |
| 400 | Bad Request | Dữ liệu đầu vào không hợp lệ |
| 404 | Not Found | Không tìm thấy tài nguyên |
| 500 | Internal Server Error | Lỗi server nội bộ |
| 503 | Service Unavailable | Dịch vụ blockchain không khả dụng |

---

## Ví dụ sử dụng với cURL

### Thêm sản phẩm mới

```bash
curl -X POST http://localhost:4000/product \
  -H "Content-Type: application/json" \
  -d '{
    "id": "SP2023001",
    "name": "Gạo ST25",
    "description": "Gạo thơm cao cấp",
    "variety": "ST25",
    "origin": "An Giang, Việt Nam",
    "farmName": "Trang trại Xanh",
    "farmAddress": "Xã Tân Phú, Huyện Tịnh Biên, An Giang",
    "farmerId": "AGR001",
    "farmerName": "Nguyễn Văn A",
    "plantingDate": "2023-01-15"
  }'
```

### Lấy thông tin sản phẩm

```bash
curl http://localhost:4000/product/SP2023001
```

### Thêm lịch sử

```bash
curl -X POST http://localhost:4000/product/SP2023001/history \
  -H "Content-Type: application/json" \
  -d '{
    "stage": "phun_thuoc",
    "action": "Phun thuốc bảo vệ thực vật",
    "description": "Phun thuốc trừ sâu định kỳ",
    "actor": "Nguyễn Văn B",
    "actorRole": "Kỹ thuật viên",
    "location": "Ruộng A1, Trang trại Xanh"
  }'
```

---

## Ví dụ sử dụng với JavaScript

### Thêm sản phẩm mới

```javascript
const addProduct = async (productData) => {
  try {
    const response = await fetch('http://localhost:4000/product', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('Thêm sản phẩm thành công:', result);
      return result;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Lỗi khi thêm sản phẩm:', error);
    throw error;
  }
};
```

### Lấy thông tin sản phẩm

```javascript
const getProduct = async (productId) => {
  try {
    const response = await fetch(`http://localhost:4000/product/${productId}`);
    
    if (response.ok) {
      const product = await response.json();
      console.log('Thông tin sản phẩm:', product);
      return product;
    } else {
      const error = await response.json();
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Lỗi khi lấy thông tin sản phẩm:', error);
    throw error;
  }
};
```

---

## Setup và Deployment

### Khởi chạy hệ thống

```bash
# 1. Cài đặt dependencies
npm install

# 2. Khởi chạy Hardhat network
npx hardhat node

# 3. Deploy smart contract (terminal mới)
npx hardhat run scripts/deploy.js --network localhost

# 4. Khởi chạy API server (terminal mới)
npm start
```

### Environment Requirements

- Node.js >= 16.0.0
- NPM >= 8.0.0
- Hardhat
- Ethers.js

---

## Lưu ý quan trọng

1. **Blockchain Dependency**: Tất cả dữ liệu được lưu trữ trên blockchain, đảm bảo tính bất biến và minh bạch.

2. **Transaction Time**: Các thao tác thêm/sửa dữ liệu cần thời gian để được confirm trên blockchain (thường 1-2 giây).

3. **Data Immutability**: Dữ liệu một khi đã được ghi vào blockchain không thể sửa đổi hoặc xóa.

4. **Network Requirements**: Cần đảm bảo Hardhat local network đang chạy và contract đã được deploy.

---

*Tài liệu này được cập nhật theo phiên bản API hiện tại. Vui lòng liên hệ team phát triển nếu có thắc mắc.* 