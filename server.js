const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Lấy thông tin sản phẩm theo ID
app.get('/product/:id', (req, res) => {
    const id = req.params.id;
    try {
        // Đọc dữ liệu sản phẩm
        const productsData = JSON.parse(fs.readFileSync('./data/products.json'));
        const product = productsData.find(p => p.id === id);
        
        if (!product) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }
        
        // Đọc dữ liệu lịch sử
        let history = [];
        if (fs.existsSync('./data/history.json')) {
            const historyData = JSON.parse(fs.readFileSync('./data/history.json'));
            history = historyData.filter(h => h.productId === id);
        }
        
        // Trả về sản phẩm kèm lịch sử
        const result = {
            ...product,
            history: history
        };
        
        console.log('Sending product with history:', result); // Debug log
        res.json(result);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// API thêm sản phẩm mới
app.post('/product', (req, res) => {
    try {
        const newProduct = req.body;
        
        // Kiểm tra dữ liệu đầu vào
        if (!newProduct.id || !newProduct.name) {
            return res.status(400).json({ message: 'Thiếu thông tin sản phẩm' });
        }
        
        const data = JSON.parse(fs.readFileSync('./data/products.json'));
        
        // Kiểm tra ID đã tồn tại chưa
        if (data.some(p => p.id === newProduct.id)) {
            return res.status(400).json({ message: 'ID sản phẩm đã tồn tại' });
        }
        
        data.push(newProduct);
        fs.writeFileSync('./data/products.json', JSON.stringify(data, null, 2));
        res.status(201).json({ message: 'Đã thêm sản phẩm', product: newProduct });
    } catch (error) {
        console.error('Lỗi:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// API thêm giai đoạn mới vào lịch sử sản phẩm
app.post('/product/:id/history', (req, res) => {
    try {
        const productId = req.params.id;
        const historyEntry = req.body;
        
        // Kiểm tra sản phẩm tồn tại
        const productsData = JSON.parse(fs.readFileSync('./data/products.json'));
        const productExists = productsData.some(p => p.id === productId);
        
        if (!productExists) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }
        
        // Kiểm tra dữ liệu đầu vào
        if (!historyEntry.date || !historyEntry.action) {
            return res.status(400).json({ message: 'Thiếu thông tin lịch sử' });
        }
        
        // Thêm ID sản phẩm vào mục lịch sử
        historyEntry.productId = productId;
        historyEntry.timestamp = new Date().toISOString();
        
        // Đọc file lịch sử hoặc tạo mới nếu chưa có
        let historyData = [];
        if (fs.existsSync('./data/history.json')) {
            historyData = JSON.parse(fs.readFileSync('./data/history.json'));
        }
        
        // Thêm mục lịch sử mới
        historyData.push(historyEntry);
        
        // Lưu lại file lịch sử
        fs.writeFileSync('./data/history.json', JSON.stringify(historyData, null, 2));
        
        res.status(201).json({ message: 'Đã thêm lịch sử sản phẩm', entry: historyEntry });
    } catch (error) {
        console.error('Lỗi:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// API cập nhật thông tin sản phẩm
app.put('/product/:id', (req, res) => {
    try {
        const productId = req.params.id;
        const updatedInfo = req.body;
        
        // Đọc dữ liệu sản phẩm
        const data = JSON.parse(fs.readFileSync('./data/products.json'));
        const productIndex = data.findIndex(p => p.id === productId);
        
        if (productIndex === -1) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }
        
        // Cập nhật thông tin sản phẩm (giữ nguyên ID)
        const updatedProduct = { ...data[productIndex], ...updatedInfo, id: productId };
        data[productIndex] = updatedProduct;
        
        // Lưu lại dữ liệu
        fs.writeFileSync('./data/products.json', JSON.stringify(data, null, 2));
        
        res.json({ message: 'Đã cập nhật sản phẩm', product: updatedProduct });
    } catch (error) {
        console.error('Lỗi:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// API xóa sản phẩm
app.delete('/product/:id', (req, res) => {
    try {
        const productId = req.params.id;
        
        // Đọc dữ liệu sản phẩm
        const data = JSON.parse(fs.readFileSync('./data/products.json'));
        const productIndex = data.findIndex(p => p.id === productId);
        
        if (productIndex === -1) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }
        
        // Xóa sản phẩm
        const deletedProduct = data.splice(productIndex, 1)[0];
        
        // Lưu lại dữ liệu
        fs.writeFileSync('./data/products.json', JSON.stringify(data, null, 2));
        
        // Tùy chọn: Xóa lịch sử của sản phẩm
        if (fs.existsSync('./data/history.json')) {
            const historyData = JSON.parse(fs.readFileSync('./data/history.json'));
            const filteredHistory = historyData.filter(h => h.productId !== productId);
            fs.writeFileSync('./data/history.json', JSON.stringify(filteredHistory, null, 2));
        }
        
        res.json({ message: 'Đã xóa sản phẩm', product: deletedProduct });
    } catch (error) {
        console.error('Lỗi:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

app.listen(PORT, () => {
    console.log(`Server chạy tại http://localhost:${PORT}`);
});
