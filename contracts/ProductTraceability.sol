// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ProductTraceability {
    struct Product {
        string id;
        string name;
        string origin;
        string manufactureDate;
        string supplier;
        string category;
        string weight;
        string price;
        string expiryDate;
        string certifications;
        bool exists;
        address creator;
        uint256 timestamp;
    }

    struct HistoryEntry {
        string productId;
        string action;
        string description;
        string actor;
        string location;
        string timestamp;
        address recorder;
        uint256 blockTimestamp;
    }

    mapping(string => Product) public products;
    mapping(string => HistoryEntry[]) public productHistory;
    string[] public productIds;

    event ProductAdded(string indexed productId, string name, address creator);
    event HistoryEntryAdded(
        string indexed productId,
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
        string calldata _origin,
        string calldata _manufactureDate,
        string calldata _supplier,
        string calldata _category,
        string calldata _weight,
        string calldata _price,
        string calldata _expiryDate,
        string calldata _certifications
    ) external {
        require(!products[_id].exists, "San pham da ton tai");

        Product storage newProduct = products[_id];
        newProduct.id = _id;
        newProduct.name = _name;
        newProduct.origin = _origin;
        newProduct.manufactureDate = _manufactureDate;
        newProduct.supplier = _supplier;
        newProduct.category = _category;
        newProduct.weight = _weight;
        newProduct.price = _price;
        newProduct.expiryDate = _expiryDate;
        newProduct.certifications = _certifications;
        newProduct.exists = true;
        newProduct.creator = msg.sender;
        newProduct.timestamp = block.timestamp;

        productIds.push(_id);

        emit ProductAdded(_id, _name, msg.sender);
    }

    function addHistoryEntry(
        string calldata _productId,
        string calldata _action,
        string calldata _description,
        string calldata _actor,
        string calldata _location,
        string calldata _timestamp
    ) external productExists(_productId) {
        HistoryEntry memory newEntry = HistoryEntry({
            productId: _productId,
            action: _action,
            description: _description,
            actor: _actor,
            location: _location,
            timestamp: _timestamp,
            recorder: msg.sender,
            blockTimestamp: block.timestamp
        });

        productHistory[_productId].push(newEntry);

        emit HistoryEntryAdded(_productId, _action, msg.sender);
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
