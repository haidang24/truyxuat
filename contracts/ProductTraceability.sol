// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ProductTraceability {
    struct Product {
        string id; // Mã định danh sản phẩm
        string name; // Tên sản phẩm
        string description; // Mô tả sản phẩm
        string variety; // Giống/Loại
        string origin; // Nguồn gốc xuất xứ (địa phương)
        string farmName; // Tên trang trại/nhà vườn
        string farmAddress; // Địa chỉ trang trại
        string farmerId; // Mã số nông hộ
        string farmerName; // Tên chủ trang trại/nông hộ
        string plantingDate; // Ngày gieo trồng
        string harvestDate; // Ngày thu hoạch
        string packagingDate; // Ngày đóng gói
        string expiryDate; // Hạn sử dụng
        string storageTemp; // Nhiệt độ bảo quản
        string storageInstr; // Hướng dẫn bảo quản
        string quantity; // Số lượng/Khối lượng
        string unit; // Đơn vị tính
        string grade; // Phân hạng chất lượng
        string certifications; // Chứng nhận (VietGAP, GlobalGAP, Organic...)
        string images; // URL hình ảnh sản phẩm
        bool exists;
        address creator;
        uint256 timestamp;
    }

    struct HistoryEntry {
        string productId; // Mã sản phẩm
        string stage; // Giai đoạn (Trồng/Thu hoạch/Đóng gói/Vận chuyển...)
        string action; // Hành động cụ thể
        string description; // Mô tả chi tiết
        string actor; // Người thực hiện
        string actorRole; // Vai trò người thực hiện
        string location; // Địa điểm
        string temperature; // Nhiệt độ (nếu có)
        string humidity; // Độ ẩm (nếu có)
        string timestamp; // Thời gian thực hiện
        address recorder; // Địa chỉ người ghi
        uint256 blockTimestamp; // Thời gian block
    }

    mapping(string => Product) public products;
    mapping(string => HistoryEntry[]) public productHistory;
    string[] public productIds;

    event ProductAdded(string indexed productId, string name, address creator);
    event HistoryEntryAdded(
        string indexed productId,
        string stage,
        string action,
        address recorder
    );

    modifier productExists(string memory _productId) {
        require(products[_productId].exists, "San pham khong ton tai");
        _;
    }

    function addProduct(
        string calldata _id,
        string calldata _name,
        string calldata _description,
        string calldata _variety,
        string calldata _origin,
        string calldata _farmName,
        string calldata _farmAddress,
        string calldata _farmerId,
        string calldata _farmerName,
        string calldata _plantingDate,
        string calldata _harvestDate,
        string calldata _packagingDate,
        string calldata _expiryDate,
        string calldata _storageTemp,
        string calldata _storageInstr,
        string calldata _quantity,
        string calldata _unit,
        string calldata _grade,
        string calldata _certifications,
        string calldata _images
    ) external {
        require(!products[_id].exists, "San pham da ton tai");

        Product storage newProduct = products[_id];
        newProduct.id = _id;
        newProduct.name = _name;
        newProduct.description = _description;
        newProduct.variety = _variety;
        newProduct.origin = _origin;
        newProduct.farmName = _farmName;
        newProduct.farmAddress = _farmAddress;
        newProduct.farmerId = _farmerId;
        newProduct.farmerName = _farmerName;
        newProduct.plantingDate = _plantingDate;
        newProduct.harvestDate = _harvestDate;
        newProduct.packagingDate = _packagingDate;
        newProduct.expiryDate = _expiryDate;
        newProduct.storageTemp = _storageTemp;
        newProduct.storageInstr = _storageInstr;
        newProduct.quantity = _quantity;
        newProduct.unit = _unit;
        newProduct.grade = _grade;
        newProduct.certifications = _certifications;
        newProduct.images = _images;
        newProduct.exists = true;
        newProduct.creator = msg.sender;
        newProduct.timestamp = block.timestamp;

        productIds.push(_id);

        emit ProductAdded(_id, _name, msg.sender);
    }

    function addHistoryEntry(
        string calldata _productId,
        string calldata _stage,
        string calldata _action,
        string calldata _description,
        string calldata _actor,
        string calldata _actorRole,
        string calldata _location,
        string calldata _temperature,
        string calldata _humidity,
        string calldata _timestamp
    ) external productExists(_productId) {
        HistoryEntry memory newEntry = HistoryEntry({
            productId: _productId,
            stage: _stage,
            action: _action,
            description: _description,
            actor: _actor,
            actorRole: _actorRole,
            location: _location,
            temperature: _temperature,
            humidity: _humidity,
            timestamp: _timestamp,
            recorder: msg.sender,
            blockTimestamp: block.timestamp
        });

        productHistory[_productId].push(newEntry);

        emit HistoryEntryAdded(_productId, _stage, _action, msg.sender);
    }

    function getProduct(
        string memory _productId
    ) external view productExists(_productId) returns (Product memory) {
        return products[_productId];
    }

    function getProductHistory(
        string memory _productId
    ) external view productExists(_productId) returns (HistoryEntry[] memory) {
        return productHistory[_productId];
    }

    function getAllProductIds() external view returns (string[] memory) {
        return productIds;
    }

    function getProductCount() external view returns (uint256) {
        return productIds.length;
    }
}
