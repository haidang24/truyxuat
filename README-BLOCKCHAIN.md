# Hệ thống Truy xuất Nguồn gốc với Blockchain

Hệ thống truy xuất nguồn gốc sản phẩm tích hợp với blockchain Ethereum sử dụng Hardhat để đảm bảo tính minh bạch và bất biến của dữ liệu.

## 🚀 Tính năng

- **Lưu trữ sản phẩm trên blockchain**: Tất cả thông tin sản phẩm được lưu trữ bất biến trên smart contract
- **Theo dõi lịch sử**: Mọi thay đổi và giai đoạn của sản phẩm được ghi lại với timestamp blockchain
- **Hybrid storage**: Hỗ trợ cả file system và blockchain, tự động fallback khi cần
- **Transaction tracking**: Mỗi thao tác trả về transaction hash để theo dõi

## 📋 Yêu cầu

- Node.js >= 16.0.0
- NPM hoặc Yarn
- Hardhat local network

## 🛠️ Cài đặt và Chạy

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Khởi động Hardhat local network
```bash
npx hardhat node
```
Lệnh này sẽ khởi động một blockchain local tại `http://localhost:8545` với 20 accounts có sẵn ETH để test.

### 3. Deploy smart contract
```bash
npx hardhat run scripts/deploy.js --network localhost
```
Contract sẽ được deploy và địa chỉ được lưu trong `contract-address.json`.

### 4. Khởi động server
```bash
npm start
```
Server sẽ chạy tại `http://localhost:4000` với blockchain integration.

### 5. Di chuyển dữ liệu hiện tại lên blockchain (tùy chọn)
```bash
curl -X POST http://localhost:4000/migrate-to-blockchain
```

## 📡 API Endpoints

### Sản phẩm

#### Thêm sản phẩm mới
```http
POST /product
Content-Type: application/json

{
  "id": "SP001",
  "name": "Gạo ST25",
  "origin": "Sóc Trăng",
  "manufactureDate": "2025-01-10",
  "supplier": "Công ty Gạo Việt",
  "category": "Thực phẩm",
  "weight": "5kg",
  "price": "150000",
  "expiryDate": "2025-12-10",
  "certifications": "ISO 22000, HACCP"
}
```

**Response:**
```json
{
  "message": "Đã thêm sản phẩm",
  "product": {...},
  "txHash": "0x..."
}
```

#### Lấy thông tin sản phẩm
```http
GET /product/:id
```

**Response:**
```json
{
  "id": "SP001",
  "name": "Gạo ST25",
  "origin": "Sóc Trăng",
  "dataSource": "blockchain",
  "history": [...],
  "creator": "0x...",
  "timestamp": "1640995200"
}
```

#### Thêm lịch sử sản phẩm
```http
POST /product/:id/history
Content-Type: application/json

{
  "action": "Harvested",
  "description": "Thu hoạch từ ruộng lúa hữu cơ",
  "actor": "Nông dân Nguyễn Văn A",
  "location": "Sóc Trăng",
  "timestamp": "2025-01-10T08:00:00Z"
}
```

### Blockchain

#### Lấy tất cả sản phẩm từ blockchain
```http
GET /blockchain/products
```

#### Di chuyển dữ liệu lên blockchain
```http
POST /migrate-to-blockchain
```

## 🔧 Smart Contract

### ProductTraceability.sol

Contract chính chứa:

- **Product struct**: Lưu trữ thông tin sản phẩm
- **HistoryEntry struct**: Lưu trữ lịch sử thay đổi
- **Events**: ProductAdded, HistoryEntryAdded
- **Functions**:
  - `addProduct()`: Thêm sản phẩm mới
  - `addHistoryEntry()`: Thêm lịch sử
  - `getProduct()`: Lấy thông tin sản phẩm
  - `getProductHistory()`: Lấy lịch sử sản phẩm
  - `getAllProductIds()`: Lấy danh sách ID sản phẩm

### Địa chỉ Contract

Sau khi deploy, địa chỉ contract được lưu trong `contract-address.json`:
```json
{
  "address": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  "deployedAt": "2025-05-30T05:32:31.644Z"
}
```

## 🧪 Testing

Chạy test blockchain integration:
```bash
node test-blockchain.js
```

Test sẽ thực hiện:
1. Thêm sản phẩm mới vào blockchain
2. Thêm lịch sử cho sản phẩm
3. Lấy thông tin sản phẩm từ blockchain
4. Kiểm tra tổng số sản phẩm trên blockchain

## 🏗️ Kiến trúc

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Node.js API   │    │   Blockchain    │
│   (Public)      │◄──►│   Server        │◄──►│   (Hardhat)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   File System   │
                       │   (Backup)      │
                       └─────────────────┘
```

### Luồng dữ liệu:

1. **Ghi dữ liệu**: API → File System + Blockchain
2. **Đọc dữ liệu**: API → Blockchain (ưu tiên) → File System (fallback)
3. **Backup**: File system làm backup khi blockchain không khả dụng

## 🔐 Bảo mật

- **Immutable data**: Dữ liệu trên blockchain không thể thay đổi
- **Cryptographic proof**: Mỗi transaction có hash để verify
- **Decentralized**: Không phụ thuộc vào server trung tâm
- **Audit trail**: Lịch sử đầy đủ với timestamp blockchain

## 🚨 Lưu ý

- Hardhat local network chỉ dành cho development
- Để production, cần deploy lên mainnet hoặc testnet
- Gas fees sẽ phát sinh khi deploy lên mạng thật
- Backup file system vẫn quan trọng cho disaster recovery

## 📝 Logs

Server sẽ log các hoạt động blockchain:
```
Blockchain service connected to contract: 0x5FbDB2315678afecb367f032d93F642f64180aa3
Product SP001 loaded from blockchain
Product SP999 added to blockchain with tx: 0x2387176b557f42e7330ea1fc3edcacb9d1a8197c06299011357cffb1eb2c2a2f
```

## 🤝 Đóng góp

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push và tạo Pull Request

## 📄 License

MIT License 