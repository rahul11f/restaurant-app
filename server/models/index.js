const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ─── USER ────────────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, trim: true },
  password: { type: String, select: false },
  googleId: String,
  avatar: { type: String, default: '' },
  role: { type: String, enum: ['customer', 'admin', 'manager', 'chef', 'waiter', 'delivery'], default: 'customer' },
  addresses: [{
    label: String, street: String, city: String, state: String, pincode: String, isDefault: Boolean
  }],
  loyaltyPoints: { type: Number, default: 0 },
  birthday: Date,
  anniversary: Date,
  preferences: [String],
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  lastLogin: Date,
  totalOrders: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  tags: [String]
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(p) {
  return bcrypt.compare(p, this.password);
};

// ─── MENU ITEM ────────────────────────────────────────────────────────────────
const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  discountedPrice: Number,
  images: [String],
  tags: [String], // veg, non-veg, vegan, spicy, chef-special
  isAvailable: { type: Boolean, default: true },
  isSpecial: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  preparationTime: { type: Number, default: 20 }, // minutes
  calories: Number,
  spiceLevel: { type: Number, default: 0, min: 0, max: 5 },
  allergens: [String],
  variants: [{
    name: String,
    price: Number
  }],
  addons: [{
    name: String,
    price: Number
  }],
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  orderCount: { type: Number, default: 0 },
  availabilitySchedule: {
    breakfast: Boolean,
    lunch: Boolean,
    dinner: Boolean,
    allDay: { type: Boolean, default: true }
  },
  sortOrder: { type: Number, default: 0 }
}, { timestamps: true });

// ─── ORDER ────────────────────────────────────────────────────────────────────
const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customerInfo: {
    name: String, email: String, phone: String
  },
  items: [{
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
    name: String,
    image: String,
    price: Number,
    quantity: Number,
    variant: String,
    addons: [String],
    notes: String
  }],
  type: { type: String, enum: ['delivery', 'pickup', 'dine-in'], required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'out-for-delivery', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  deliveryAddress: {
    street: String, city: String, state: String, pincode: String, instructions: String
  },
  tableNumber: String,
  subtotal: Number,
  discount: Number,
  deliveryFee: { type: Number, default: 0 },
  taxes: Number,
  total: Number,
  couponCode: String,
  couponDiscount: Number,
  payment: {
    method: { type: String, enum: ['online', 'cash', 'card'], default: 'online' },
    status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    transactionId: String,
    paidAt: Date
  },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  estimatedDelivery: Date,
  deliveredAt: Date,
  rating: Number,
  feedback: String,
  notes: String,
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `SS${Date.now().toString().slice(-6)}${(count + 1).toString().padStart(3, '0')}`;
  }
  next();
});

// ─── RESERVATION ─────────────────────────────────────────────────────────────
const reservationSchema = new mongoose.Schema({
  reservationNumber: { type: String, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customerInfo: { name: String, email: String, phone: String },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  guests: { type: Number, required: true, min: 1 },
  tableNumber: String,
  section: { type: String, enum: ['indoor', 'outdoor', 'private', 'rooftop'], default: 'indoor' },
  occasion: String,
  specialRequests: String,
  status: { type: String, enum: ['pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no-show'], default: 'pending' },
  reminderSent: { type: Boolean, default: false },
  depositAmount: Number,
  depositPaid: { type: Boolean, default: false }
}, { timestamps: true });

reservationSchema.pre('save', async function(next) {
  if (!this.reservationNumber) {
    const count = await mongoose.model('Reservation').countDocuments();
    this.reservationNumber = `RES${Date.now().toString().slice(-4)}${(count + 1).toString().padStart(3, '0')}`;
  }
  next();
});

// ─── REVIEW ──────────────────────────────────────────────────────────────────
const reviewSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customerName: String,
  customerAvatar: String,
  menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: String,
  comment: { type: String, required: true },
  images: [String],
  type: { type: String, enum: ['restaurant', 'dish'], default: 'restaurant' },
  isApproved: { type: Boolean, default: false },
  isVisible: { type: Boolean, default: true },
  reply: { text: String, repliedAt: Date },
  helpful: { type: Number, default: 0 },
  tags: [String]
}, { timestamps: true });

// ─── INVENTORY ────────────────────────────────────────────────────────────────
const inventorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  unit: { type: String, required: true },
  currentStock: { type: Number, required: true, default: 0 },
  minThreshold: { type: Number, required: true, default: 10 },
  maxCapacity: Number,
  costPerUnit: Number,
  supplier: {
    name: String, contact: String, email: String, leadDays: Number
  },
  lastRestocked: Date,
  expiryDate: Date,
  location: String,
  notes: String,
  isActive: { type: Boolean, default: true },
  movements: [{
    type: { type: String, enum: ['in', 'out', 'waste', 'adjustment'] },
    quantity: Number,
    reason: String,
    date: { type: Date, default: Date.now },
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }]
}, { timestamps: true });

// ─── OFFER ───────────────────────────────────────────────────────────────────
const offerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  code: { type: String, unique: true, uppercase: true },
  type: { type: String, enum: ['percentage', 'flat', 'bogo', 'free-delivery'], required: true },
  value: Number,
  minOrderValue: { type: Number, default: 0 },
  maxDiscount: Number,
  usageLimit: Number,
  usagePerUser: { type: Number, default: 1 },
  usedCount: { type: Number, default: 0 },
  applicableItems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' }],
  applicableCategories: [String],
  validFrom: { type: Date, required: true },
  validTo: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  image: String,
  usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

// ─── SETTINGS ─────────────────────────────────────────────────────────────────
const settingsSchema = new mongoose.Schema({
  key: { type: String, unique: true, required: true },
  value: mongoose.Schema.Types.Mixed,
  group: String
});

// ─── NOTIFICATION LOG ────────────────────────────────────────────────────────
const notificationLogSchema = new mongoose.Schema({
  type: { type: String, enum: ['whatsapp', 'email', 'push', 'sms'] },
  recipient: String,
  subject: String,
  message: String,
  status: { type: String, enum: ['sent', 'failed', 'pending'], default: 'pending' },
  relatedTo: { type: mongoose.Schema.Types.ObjectId },
  relatedModel: String,
  sentAt: Date,
  error: String
}, { timestamps: true });

// ─── STAFF ───────────────────────────────────────────────────────────────────
const staffSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  employeeId: { type: String, unique: true },
  role: { type: String, enum: ['manager', 'chef', 'waiter', 'delivery', 'cashier', 'cleaner'] },
  department: String,
  salary: Number,
  joiningDate: Date,
  shift: { type: String, enum: ['morning', 'evening', 'night', 'full'] },
  attendance: [{
    date: Date,
    checkIn: String,
    checkOut: String,
    status: { type: String, enum: ['present', 'absent', 'late', 'half-day'] }
  }],
  performance: {
    ordersHandled: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    reviews: [String]
  },
  isActive: { type: Boolean, default: true },
  notes: String
}, { timestamps: true });

module.exports = {
  User: mongoose.model('User', userSchema),
  MenuItem: mongoose.model('MenuItem', menuItemSchema),
  Order: mongoose.model('Order', orderSchema),
  Reservation: mongoose.model('Reservation', reservationSchema),
  Review: mongoose.model('Review', reviewSchema),
  Inventory: mongoose.model('Inventory', inventorySchema),
  Offer: mongoose.model('Offer', offerSchema),
  Settings: mongoose.model('Settings', settingsSchema),
  NotificationLog: mongoose.model('NotificationLog', notificationLogSchema),
  Staff: mongoose.model('Staff', staffSchema)
};
