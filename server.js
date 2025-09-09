const express = require('express');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Dữ liệu mẫu
let db = {
  users: [
    { id: "u1", name: "Nguyễn Văn Chủ", username: "admin", password: "123", role: "admin" },
    { id: "u2", name: "Trần Thị Thuê", username: "user1", password: "123", role: "user" }
  ],
  properties: [
    {
      id: "r1",
      name: "Phòng 101 - Chung cư A",
      description: "Phòng 25m2, có nội thất, gần trung tâm",
      address: "123 Lý Thường Kiệt, Q.10, TP.HCM",
      price: 5000000,
      status: "available",
      createdBy: "u1"
    },
    {
      id: "r2",
      name: "Phòng 202 - Chung cư B",
      description: "Phòng 30m2, view đẹp, yên tĩnh",
      address: "456 Nguyễn Trãi, Q.5, TP.HCM",
      price: 6000000,
      status: "rented",
      createdBy: "u1"
    }
  ],
  contracts: [
    {
      id: "c1",
      userId: "u2",
      propertyId: "r1",
      startDate: "2024-07-10",
      status: "pending",
      monthlyPayment: 5000000,
      paymentHistory: [
        { month: "2024-08", paid: true, paidAt: "2024-08-01" }
      ]
    }
  ]
};

/* ---------------- USERS CRUD ---------------- */
app.get('/users', (req, res) => res.json(db.users));
app.get('/users/:id', (req, res) => {
  const user = db.users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});
app.post('/users', (req, res) => {
  const { name, username, password, role } = req.body;
  const newUser = { id: uuidv4(), name, username, password, role };
  db.users.push(newUser);
  res.status(201).json(newUser);
});
app.put('/users/:id', (req, res) => {
  const user = db.users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  Object.assign(user, req.body);
  res.json(user);
});
app.delete('/users/:id', (req, res) => {
  db.users = db.users.filter(u => u.id !== req.params.id);
  res.json({ message: 'User deleted' });
});

/* ---------------- PROPERTIES CRUD ---------------- */
app.get('/properties', (req, res) => res.json(db.properties));
app.get('/properties/:id', (req, res) => {
  const property = db.properties.find(p => p.id === req.params.id);
  if (!property) return res.status(404).json({ message: 'Property not found' });
  res.json(property);
});
app.post('/properties', (req, res) => {
  const { name, description, address, price, status, createdBy } = req.body;
  const newProperty = { id: uuidv4(), name, description, address, price, status, createdBy };
  db.properties.push(newProperty);
  res.status(201).json(newProperty);
});
app.put('/properties/:id', (req, res) => {
  const property = db.properties.find(p => p.id === req.params.id);
  if (!property) return res.status(404).json({ message: 'Property not found' });
  Object.assign(property, req.body);
  res.json(property);
});
app.delete('/properties/:id', (req, res) => {
  db.properties = db.properties.filter(p => p.id !== req.params.id);
  res.json({ message: 'Property deleted' });
});

/* ---------------- CONTRACTS CRUD ---------------- */
app.get('/contracts', (req, res) => res.json(db.contracts));
app.get('/contracts/:id', (req, res) => {
  const contract = db.contracts.find(c => c.id === req.params.id);
  if (!contract) return res.status(404).json({ message: 'Contract not found' });
  res.json(contract);
});
app.post('/contracts', (req, res) => {
  const { userId, propertyId, startDate, status, monthlyPayment, paymentHistory } = req.body;
  const newContract = { id: uuidv4(), userId, propertyId, startDate, status, monthlyPayment, paymentHistory: paymentHistory || [] };
  db.contracts.push(newContract);
  res.status(201).json(newContract);
});
app.put('/contracts/:id', (req, res) => {
  const contract = db.contracts.find(c => c.id === req.params.id);
  if (!contract) return res.status(404).json({ message: 'Contract not found' });
  Object.assign(contract, req.body);
  res.json(contract);
});
app.delete('/contracts/:id', (req, res) => {
  db.contracts = db.contracts.filter(c => c.id !== req.params.id);
  res.json({ message: 'Contract deleted' });
});

/* ---------------- START SERVER ---------------- */
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
