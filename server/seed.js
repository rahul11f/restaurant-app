const { User, MenuItem, Inventory, Offer, Settings } = require('./models');

const menuData = [
  // Starters
  { name: 'Tandoori Chicken Tikka', description: 'Succulent chicken marinated in yogurt and spices, grilled in our clay tandoor oven to charred perfection.', category: 'Starters', price: 349, tags: ['non-veg', 'chef-special', 'spicy'], images: ['https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500'], isAvailable: true, isFeatured: true, isSpecial: true, calories: 320, spiceLevel: 3, preparationTime: 20, rating: 4.8, reviewCount: 124, orderCount: 489 },
  { name: 'Paneer Tikka', description: 'Fresh cottage cheese cubes marinated in aromatic spices, grilled in tandoor with peppers and onions.', category: 'Starters', price: 299, tags: ['veg', 'chef-special'], images: ['https://images.unsplash.com/photo-1567188040759-fb8a883dc6d6?w=500'], isAvailable: true, isFeatured: true, calories: 280, spiceLevel: 2, preparationTime: 18, rating: 4.7, reviewCount: 98, orderCount: 412 },
  { name: 'Crispy Veg Spring Rolls', description: 'Golden fried rolls stuffed with seasoned vegetables and glass noodles. Served with sweet chili dip.', category: 'Starters', price: 229, tags: ['veg'], images: ['https://images.unsplash.com/photo-1548943487-a2e4e43b4853?w=500'], isAvailable: true, calories: 210, spiceLevel: 1, preparationTime: 12, rating: 4.5, reviewCount: 67 },
  { name: 'Seekh Kebab', description: 'Minced lamb mixed with fresh herbs and spices, shaped on skewers and cooked over live coals.', category: 'Starters', price: 379, tags: ['non-veg', 'spicy'], images: ['https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=500'], isAvailable: true, calories: 360, spiceLevel: 3, preparationTime: 22, rating: 4.6, reviewCount: 83, orderCount: 267 },
  { name: 'Hara Bhara Kebab', description: 'Vibrant green kebabs made with spinach, peas, and potatoes, pan-fried to a crisp golden crust.', category: 'Starters', price: 249, tags: ['veg', 'healthy'], images: ['https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500'], isAvailable: true, calories: 190, spiceLevel: 1, preparationTime: 15, rating: 4.4, reviewCount: 54 },

  // Mains
  { name: 'Butter Chicken', description: 'Our signature slow-cooked chicken in a rich tomato-cream sauce with fenugreek leaves. The dish that started it all.', category: 'Main Course', price: 449, tags: ['non-veg', 'chef-special', 'bestseller'], images: ['https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=500'], isAvailable: true, isFeatured: true, isSpecial: true, calories: 520, spiceLevel: 2, preparationTime: 25, rating: 4.9, reviewCount: 312, orderCount: 1024 },
  { name: 'Dal Makhani', description: 'Black lentils slow-cooked overnight with butter and cream. A classic Punjabi comfort dish.', category: 'Main Course', price: 349, tags: ['veg', 'bestseller'], images: ['https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500'], isAvailable: true, isFeatured: true, calories: 380, spiceLevel: 1, preparationTime: 20, rating: 4.8, reviewCount: 201, orderCount: 756 },
  { name: 'Lamb Rogan Josh', description: 'Slow-braised Kashmiri lamb in a fiery red gravy perfumed with whole spices and dried ginger.', category: 'Main Course', price: 549, tags: ['non-veg', 'spicy'], images: ['https://images.unsplash.com/photo-1574484284002-952d92456975?w=500'], isAvailable: true, calories: 580, spiceLevel: 4, preparationTime: 35, rating: 4.7, reviewCount: 147, orderCount: 423 },
  { name: 'Palak Paneer', description: 'Creamy spinach purée cooked with soft paneer, ginger, and gentle spices. Nutritious and indulgent.', category: 'Main Course', price: 329, tags: ['veg', 'healthy'], images: ['https://images.unsplash.com/photo-1596797038530-2c107229654b?w=500'], isAvailable: true, calories: 340, spiceLevel: 1, preparationTime: 20, rating: 4.6, reviewCount: 189, orderCount: 534 },
  { name: 'Prawn Masala', description: 'Succulent tiger prawns cooked in a bold onion-tomato-coconut masala with coastal spices.', category: 'Main Course', price: 599, tags: ['non-veg', 'seafood', 'spicy'], images: ['https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500'], isAvailable: true, calories: 420, spiceLevel: 4, preparationTime: 25, rating: 4.7, reviewCount: 112, orderCount: 298 },
  { name: 'Veg Kolhapuri', description: 'A fiery mixed vegetable curry from Maharashtra with a freshly ground coconut masala paste.', category: 'Main Course', price: 299, tags: ['veg', 'spicy', 'vegan'], images: ['https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500'], isAvailable: true, calories: 290, spiceLevel: 5, preparationTime: 22, rating: 4.5, reviewCount: 78 },

  // Biryani
  { name: 'Hyderabadi Dum Biryani', description: 'The king of biryanis. Slow-cooked on dum with aged basmati, saffron, caramelized onions, and succulent chicken.', category: 'Biryani', price: 499, tags: ['non-veg', 'chef-special', 'bestseller'], images: ['https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500'], isAvailable: true, isFeatured: true, isSpecial: true, calories: 680, spiceLevel: 3, preparationTime: 40, rating: 4.9, reviewCount: 428, orderCount: 1256 },
  { name: 'Mutton Biryani', description: 'Tender mutton pieces slow-cooked with aromatic basmati rice, whole spices, and golden fried onions.', category: 'Biryani', price: 549, tags: ['non-veg', 'spicy'], images: ['https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=500'], isAvailable: true, calories: 740, spiceLevel: 3, preparationTime: 45, rating: 4.8, reviewCount: 267, orderCount: 834 },
  { name: 'Veg Biryani', description: 'Fragrant basmati layered with seasonal vegetables, fresh mint, and whole spices. Served with raita.', category: 'Biryani', price: 349, tags: ['veg'], images: ['https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=500'], isAvailable: true, calories: 540, spiceLevel: 2, preparationTime: 35, rating: 4.5, reviewCount: 156, orderCount: 512 },

  // Breads
  { name: 'Garlic Naan', description: 'Soft leavened bread baked in tandoor, lavishly brushed with garlic butter and fresh coriander.', category: 'Breads', price: 79, tags: ['veg'], images: ['https://images.unsplash.com/photo-1600326145552-327f74d9e5db?w=500'], isAvailable: true, calories: 180, spiceLevel: 0, preparationTime: 8, rating: 4.7, reviewCount: 234, orderCount: 1567 },
  { name: 'Lachha Paratha', description: 'Multi-layered whole wheat flatbread with a crispy exterior and soft flaky layers inside.', category: 'Breads', price: 69, tags: ['veg'], images: ['https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500'], isAvailable: true, calories: 160, spiceLevel: 0, preparationTime: 8, rating: 4.5, reviewCount: 178 },
  { name: 'Peshwari Naan', description: 'Sweet stuffed bread filled with almonds, desiccated coconut, and sultanas. A Mughal classic.', category: 'Breads', price: 99, tags: ['veg'], images: ['https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500'], isAvailable: true, calories: 220, spiceLevel: 0, preparationTime: 10, rating: 4.6, reviewCount: 92 },

  // Desserts
  { name: 'Gulab Jamun', description: 'Soft milk-solid dumplings soaked in rose-cardamom sugar syrup. Served warm with ice cream.', category: 'Desserts', price: 179, tags: ['veg', 'sweet'], images: ['https://images.unsplash.com/photo-1571167366136-b57e97da57ef?w=500'], isAvailable: true, isFeatured: true, calories: 380, spiceLevel: 0, preparationTime: 5, rating: 4.8, reviewCount: 198, orderCount: 634 },
  { name: 'Kulfi Falooda', description: 'Traditional Indian ice cream with falooda noodles, basil seeds, and rose syrup. A festive favourite.', category: 'Desserts', price: 199, tags: ['veg', 'sweet', 'chef-special'], images: ['https://images.unsplash.com/photo-1570145820259-b5b80c5c8bd6?w=500'], isAvailable: true, calories: 420, spiceLevel: 0, preparationTime: 5, rating: 4.7, reviewCount: 134, orderCount: 478 },
  { name: 'Rasmalai', description: 'Delicate paneer discs soaked in thickened saffron milk with pistachios. The queen of Indian sweets.', category: 'Desserts', price: 189, tags: ['veg', 'sweet'], images: ['https://images.unsplash.com/photo-1548365328-8c6db3220e4c?w=500'], isAvailable: true, calories: 340, spiceLevel: 0, preparationTime: 5, rating: 4.8, reviewCount: 167, orderCount: 389 },

  // Drinks
  { name: 'Mango Lassi', description: 'Velvety blended yogurt drink with Alphonso mango pulp, cardamom, and a touch of cream.', category: 'Beverages', price: 149, tags: ['veg', 'cold'], images: ['https://images.unsplash.com/photo-1554979944-0dc51b11b3f8?w=500'], isAvailable: true, calories: 220, spiceLevel: 0, preparationTime: 5, rating: 4.8, reviewCount: 287, orderCount: 923 },
  { name: 'Masala Chai', description: 'Aromatic Indian tea brewed with ginger, cardamom, cinnamon and cloves. Served piping hot.', category: 'Beverages', price: 89, tags: ['veg', 'hot'], images: ['https://images.unsplash.com/photo-1523920290228-4f321a939b4c?w=500'], isAvailable: true, calories: 80, spiceLevel: 0, preparationTime: 5, rating: 4.7, reviewCount: 312, orderCount: 1102 },
  { name: 'Virgin Mojito', description: 'Fresh lime, mint, and soda over crushed ice. Crisp, cooling, and refreshing.', category: 'Beverages', price: 129, tags: ['veg', 'cold', 'mocktail'], images: ['https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500'], isAvailable: true, calories: 60, spiceLevel: 0, preparationTime: 3, rating: 4.6, reviewCount: 189 }
];

const inventoryData = [
  { name: 'Chicken (Raw)', category: 'Meat', unit: 'kg', currentStock: 25, minThreshold: 10, maxCapacity: 50, costPerUnit: 220, supplier: { name: 'Fresh Farms', contact: '9876543210', leadDays: 1 } },
  { name: 'Mutton (Raw)', category: 'Meat', unit: 'kg', currentStock: 15, minThreshold: 8, maxCapacity: 30, costPerUnit: 550, supplier: { name: 'Fresh Farms', contact: '9876543210', leadDays: 1 } },
  { name: 'Paneer', category: 'Dairy', unit: 'kg', currentStock: 8, minThreshold: 5, maxCapacity: 20, costPerUnit: 320 },
  { name: 'Basmati Rice', category: 'Grains', unit: 'kg', currentStock: 50, minThreshold: 20, maxCapacity: 100, costPerUnit: 85 },
  { name: 'Cooking Oil', category: 'Oils', unit: 'litre', currentStock: 20, minThreshold: 10, maxCapacity: 50, costPerUnit: 120 },
  { name: 'Tomatoes', category: 'Vegetables', unit: 'kg', currentStock: 12, minThreshold: 5, maxCapacity: 30, costPerUnit: 40 },
  { name: 'Onions', category: 'Vegetables', unit: 'kg', currentStock: 20, minThreshold: 10, maxCapacity: 50, costPerUnit: 35 },
  { name: 'Heavy Cream', category: 'Dairy', unit: 'litre', currentStock: 6, minThreshold: 3, maxCapacity: 15, costPerUnit: 180 },
  { name: 'Butter', category: 'Dairy', unit: 'kg', currentStock: 5, minThreshold: 2, maxCapacity: 10, costPerUnit: 450 },
  { name: 'Flour (Maida)', category: 'Grains', unit: 'kg', currentStock: 30, minThreshold: 15, maxCapacity: 60, costPerUnit: 45 },
];

const offersData = [
  { title: 'Weekend Special', description: 'Get 20% off on all orders above ₹500 every weekend!', code: 'WEEKEND20', type: 'percentage', value: 20, minOrderValue: 500, maxDiscount: 300, validFrom: new Date('2024-01-01'), validTo: new Date('2026-12-31'), isActive: true, isFeatured: true },
  { title: 'First Order Offer', description: 'Welcome to Spice & Soul! Flat ₹150 off on your first order.', code: 'WELCOME150', type: 'flat', value: 150, minOrderValue: 300, validFrom: new Date('2024-01-01'), validTo: new Date('2026-12-31'), isActive: true, isFeatured: true },
  { title: 'Free Delivery Friday', description: 'Free delivery on all orders every Friday!', code: 'FREEFRI', type: 'free-delivery', value: 49, minOrderValue: 200, validFrom: new Date('2024-01-01'), validTo: new Date('2026-12-31'), isActive: true },
  { title: 'Biryani Bonanza', description: 'Order any biryani and get a free Mango Lassi!', code: 'BIRYANI', type: 'flat', value: 149, minOrderValue: 400, validFrom: new Date('2024-01-01'), validTo: new Date('2026-12-31'), isActive: true },
];

const settingsData = [
  { key: 'restaurant_name', value: 'Spice & Soul', group: 'general' },
  { key: 'restaurant_tagline', value: 'Fine Indian Cuisine Since 1998', group: 'general' },
  { key: 'restaurant_phone', value: '+91 98765 43210', group: 'general' },
  { key: 'restaurant_email', value: 'hello@spiceandsoul.com', group: 'general' },
  { key: 'restaurant_address', value: '12, Sakchi Main Road, Jamshedpur, Jharkhand 831001', group: 'general' },
  { key: 'opening_hours', value: { mon: '12:00-23:00', tue: '12:00-23:00', wed: '12:00-23:00', thu: '12:00-23:00', fri: '12:00-23:30', sat: '11:00-23:30', sun: '11:00-23:00' }, group: 'hours' },
  { key: 'is_open', value: true, group: 'hours' },
  { key: 'delivery_radius', value: 10, group: 'delivery' },
  { key: 'delivery_fee', value: 49, group: 'delivery' },
  { key: 'min_order_amount', value: 200, group: 'delivery' },
  { key: 'estimated_delivery_time', value: 45, group: 'delivery' },
  { key: 'currency', value: 'INR', group: 'payment' },
  { key: 'tax_rate', value: 5, group: 'payment' },
  { key: 'theme_color', value: '#D4AF37', group: 'appearance' },
  { key: 'social_links', value: { instagram: 'https://instagram.com/spiceandsoul', facebook: 'https://facebook.com/spiceandsoul', twitter: 'https://twitter.com/spiceandsoul' }, group: 'social' },
  { key: 'reviews_enabled', value: true, group: 'features' },
  { key: 'reservation_enabled', value: true, group: 'features' },
  { key: 'delivery_enabled', value: true, group: 'features' },
  { key: 'pickup_enabled', value: true, group: 'features' },
  { key: 'loyalty_enabled', value: true, group: 'features' },
  { key: 'loyalty_rate', value: 10, group: 'loyalty' },
];

module.exports = async function seedIfEmpty() {
  try {
    const menuCount = await MenuItem.countDocuments();
    if (menuCount > 0) return;

    console.log('🌱 Seeding database...');

    // Admin user
    const adminExists = await require('./models').User.findOne({ email: 'admin@spiceandsoul.com' });
    if (!adminExists) {
      await require('./models').User.create({ name: 'Admin', email: 'admin@spiceandsoul.com', password: 'Admin@123', role: 'admin', isVerified: true });
      console.log('✅ Admin created: admin@spiceandsoul.com / Admin@123');
    }

    await MenuItem.insertMany(menuData);
    await Inventory.insertMany(inventoryData);
    await Offer.insertMany(offersData);
    for (const s of settingsData) {
      await require('./models').Settings.findOneAndUpdate({ key: s.key }, s, { upsert: true });
    }

    console.log('✅ Database seeded successfully!');
  } catch (err) {
    console.error('Seed error:', err.message);
  }
};
