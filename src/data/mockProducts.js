export const categories = [
  { id: 'cat-sneakers', name: 'Sneaker' },
  { id: 'cat-running', name: 'Chạy bộ' },
  { id: 'cat-lifestyle', name: 'Thời trang' },
  { id: 'cat-outdoor', name: 'Ngoài trời' },
]

/** Catalog mock — shape gần với ProductResponse backend */
export const products = [
  {
    id: 'trend-1',
    name: 'Apex Runner V2',
    brand: 'StepZone',
    description:
      'Thiết kế chạy phố với đế phản lực và phần thân knit thoáng khí. Phiên bản giới hạn cho mùa mới.',
    categoryId: 'cat-running',
    categoryName: 'Chạy bộ',
    basePrice: 6240000,
    status: 'ACTIVE',
    badge: 'ĐANG HOT',
    collection: 'Dòng hiệu năng',
    images: [
      {
        id: 'img-t1-1',
        imageUrl:
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80',
        main: true,
      },
      {
        id: 'img-t1-2',
        imageUrl:
          'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=1200&q=80',
        main: false,
      },
      {
        id: 'img-t1-3',
        imageUrl:
          'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=1200&q=80',
        main: false,
      },
    ],
    variants: [
      { id: 'v-t1-1', size: '40', color: 'Đỏ', sku: 'APX-40-RED' },
      { id: 'v-t1-2', size: '41', color: 'Đỏ', sku: 'APX-41-RED' },
      { id: 'v-t1-3', size: '42', color: 'Đỏ', sku: 'APX-42-RED' },
      { id: 'v-t1-4', size: '43', color: 'Đen', sku: 'APX-43-BLK' },
      { id: 'v-t1-5', size: '44', color: 'Đen', sku: 'APX-44-BLK' },
    ],
    stocks: [
      { size: '40', color: 'Đỏ', available: 3, status: 'IN_STOCK' },
      { size: '41', color: 'Đỏ', available: 0, status: 'OUT_OF_STOCK' },
      { size: '42', color: 'Đỏ', available: 8, status: 'IN_STOCK' },
      { size: '43', color: 'Đen', available: 2, status: 'IN_STOCK' },
      { size: '44', color: 'Đen', available: 0, status: 'OUT_OF_STOCK' },
    ],
  },
  {
    id: 'trend-2',
    name: 'Shadow Strike',
    brand: 'Nike',
    description:
      'Form thấp tối giản, phối đen toàn bộ. Đệm êm, phù hợp mang hàng ngày.',
    categoryId: 'cat-sneakers',
    categoryName: 'Sneaker',
    basePrice: 4940000,
    status: 'ACTIVE',
    collection: 'Dòng Shadow',
    images: [
      {
        id: 'img-t2-1',
        imageUrl:
          'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=1200&q=80',
        main: true,
      },
      {
        id: 'img-t2-2',
        imageUrl:
          'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80',
        main: false,
      },
    ],
    variants: [
      { id: 'v-t2-1', size: '41', color: 'Đen', sku: 'SHD-41-BLK' },
      { id: 'v-t2-2', size: '42', color: 'Đen', sku: 'SHD-42-BLK' },
      { id: 'v-t2-3', size: '43', color: 'Đen', sku: 'SHD-43-BLK' },
      { id: 'v-t2-4', size: '42', color: 'Xám', sku: 'SHD-42-GRY' },
    ],
    stocks: [
      { size: '41', color: 'Đen', available: 5, status: 'IN_STOCK' },
      { size: '42', color: 'Đen', available: 12, status: 'IN_STOCK' },
      { size: '43', color: 'Đen', available: 1, status: 'IN_STOCK' },
      { size: '42', color: 'Xám', available: 4, status: 'IN_STOCK' },
    ],
  },
  {
    id: 'trend-3',
    name: 'Orbit Platform',
    brand: 'Adidas',
    description:
      'Đế chunky platform với thân da lộn. Điểm nhấn mạnh cho outfit đường phố.',
    categoryId: 'cat-lifestyle',
    categoryName: 'Thời trang',
    basePrice: 5460000,
    status: 'ACTIVE',
    collection: 'Bộ Orbit',
    images: [
      {
        id: 'img-t3-1',
        imageUrl:
          'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1200&q=80',
        main: true,
      },
      {
        id: 'img-t3-2',
        imageUrl:
          'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=1200&q=80',
        main: false,
      },
    ],
    variants: [
      { id: 'v-t3-1', size: '39', color: 'Trắng', sku: 'ORB-39-WHT' },
      { id: 'v-t3-2', size: '40', color: 'Trắng', sku: 'ORB-40-WHT' },
      { id: 'v-t3-3', size: '41', color: 'Trắng', sku: 'ORB-41-WHT' },
      { id: 'v-t3-4', size: '42', color: 'Trắng', sku: 'ORB-42-WHT' },
    ],
    stocks: [
      { size: '39', color: 'Trắng', available: 2, status: 'IN_STOCK' },
      { size: '40', color: 'Trắng', available: 6, status: 'IN_STOCK' },
      { size: '41', color: 'Trắng', available: 0, status: 'OUT_OF_STOCK' },
      { size: '42', color: 'Trắng', available: 3, status: 'IN_STOCK' },
    ],
  },
  {
    id: 'new-1',
    name: 'Minimalist Low',
    brand: 'StepZone',
    description:
      'Form thấp gọn gàng, da mềm. Phù hợp đi làm và cuối tuần.',
    categoryId: 'cat-lifestyle',
    categoryName: 'Thời trang',
    basePrice: 3900000,
    status: 'ACTIVE',
    collection: 'Bộ sưu tập Essence',
    images: [
      {
        id: 'img-n1-1',
        imageUrl:
          'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=1200&q=80',
        main: true,
      },
      {
        id: 'img-n1-2',
        imageUrl:
          'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=1200&q=80',
        main: false,
      },
    ],
    variants: [
      { id: 'v-n1-1', size: '40', color: 'Trắng', sku: 'MIN-40-WHT' },
      { id: 'v-n1-2', size: '41', color: 'Trắng', sku: 'MIN-41-WHT' },
      { id: 'v-n1-3', size: '42', color: 'Trắng', sku: 'MIN-42-WHT' },
      { id: 'v-n1-4', size: '43', color: 'Kem', sku: 'MIN-43-CRM' },
    ],
    stocks: [
      { size: '40', color: 'Trắng', available: 7, status: 'IN_STOCK' },
      { size: '41', color: 'Trắng', available: 4, status: 'IN_STOCK' },
      { size: '42', color: 'Trắng', available: 9, status: 'IN_STOCK' },
      { size: '43', color: 'Kem', available: 2, status: 'IN_STOCK' },
    ],
  },
  {
    id: 'new-2',
    name: 'Velocity Knit',
    brand: 'Nike',
    description:
      'Thân knit ôm chân, đế nhẹ. Dành cho người thích chạy nhanh.',
    categoryId: 'cat-running',
    categoryName: 'Chạy bộ',
    basePrice: 4680000,
    status: 'ACTIVE',
    collection: 'Dòng hiệu năng',
    images: [
      {
        id: 'img-n2-1',
        imageUrl:
          'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1200&q=80',
        main: true,
      },
      {
        id: 'img-n2-2',
        imageUrl:
          'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=1200&q=80',
        main: false,
      },
    ],
    variants: [
      { id: 'v-n2-1', size: '41', color: 'Xanh', sku: 'VEL-41-BLU' },
      { id: 'v-n2-2', size: '42', color: 'Xanh', sku: 'VEL-42-BLU' },
      { id: 'v-n2-3', size: '43', color: 'Xanh', sku: 'VEL-43-BLU' },
      { id: 'v-n2-4', size: '42', color: 'Cam', sku: 'VEL-42-ORG' },
    ],
    stocks: [
      { size: '41', color: 'Xanh', available: 3, status: 'IN_STOCK' },
      { size: '42', color: 'Xanh', available: 5, status: 'IN_STOCK' },
      { size: '43', color: 'Xanh', available: 0, status: 'OUT_OF_STOCK' },
      { size: '42', color: 'Cam', available: 6, status: 'IN_STOCK' },
    ],
  },
  {
    id: 'new-3',
    name: 'Chrome Runner',
    brand: 'New Balance',
    description:
      'Hoàn thiện kim loại phản quang nhẹ. Phiên bản giới hạn — hầu hết size đã hết.',
    categoryId: 'cat-sneakers',
    categoryName: 'Sneaker',
    basePrice: 5200000,
    status: 'ACTIVE',
    soldOut: true,
    collection: 'Dòng Metal',
    images: [
      {
        id: 'img-n3-1',
        imageUrl:
          'https://images.unsplash.com/photo-1605348532760-6753d2c43329?auto=format&fit=crop&w=1200&q=80',
        main: true,
      },
      {
        id: 'img-n3-2',
        imageUrl:
          'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&w=1200&q=80',
        main: false,
      },
    ],
    variants: [
      { id: 'v-n3-1', size: '41', color: 'Bạc', sku: 'CRM-41-CHR' },
      { id: 'v-n3-2', size: '42', color: 'Bạc', sku: 'CRM-42-CHR' },
      { id: 'v-n3-3', size: '43', color: 'Bạc', sku: 'CRM-43-CHR' },
    ],
    stocks: [
      { size: '41', color: 'Bạc', available: 0, status: 'OUT_OF_STOCK' },
      { size: '42', color: 'Bạc', available: 0, status: 'OUT_OF_STOCK' },
      { size: '43', color: 'Bạc', available: 0, status: 'OUT_OF_STOCK' },
    ],
  },
  {
    id: 'new-4',
    name: 'Trail Blazer X',
    brand: 'Adidas',
    description:
      'Đế bám đa địa hình, thân chống nước nhẹ. Sẵn sàng cho cuối tuần ngoài trời.',
    categoryId: 'cat-outdoor',
    categoryName: 'Ngoài trời',
    basePrice: 4550000,
    status: 'ACTIVE',
    collection: 'Phiên bản ngoài trời',
    images: [
      {
        id: 'img-n4-1',
        imageUrl:
          'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&w=1200&q=80',
        main: true,
      },
      {
        id: 'img-n4-2',
        imageUrl:
          'https://images.unsplash.com/photo-1520256862855-398228c41684?auto=format&fit=crop&w=1200&q=80',
        main: false,
      },
    ],
    variants: [
      { id: 'v-n4-1', size: '40', color: 'Xanh quân đội', sku: 'TRL-40-OLV' },
      { id: 'v-n4-2', size: '41', color: 'Xanh quân đội', sku: 'TRL-41-OLV' },
      { id: 'v-n4-3', size: '42', color: 'Xanh quân đội', sku: 'TRL-42-OLV' },
      { id: 'v-n4-4', size: '43', color: 'Nâu', sku: 'TRL-43-BRN' },
    ],
    stocks: [
      { size: '40', color: 'Xanh quân đội', available: 4, status: 'IN_STOCK' },
      { size: '41', color: 'Xanh quân đội', available: 8, status: 'IN_STOCK' },
      { size: '42', color: 'Xanh quân đội', available: 1, status: 'IN_STOCK' },
      { size: '43', color: 'Nâu', available: 3, status: 'IN_STOCK' },
    ],
  },
  {
    id: 'sz-af1',
    name: 'Nike Air Force 1',
    brand: 'Nike',
    description:
      'Form thấp kinh điển — mẫu seed khớp catalog backend. Da bền, đế êm.',
    categoryId: 'cat-sneakers',
    categoryName: 'Sneaker',
    basePrice: 2500000,
    status: 'ACTIVE',
    collection: 'Biểu tượng cổ điển',
    images: [
      {
        id: 'img-af1-1',
        imageUrl:
          'https://images.unsplash.com/photo-1512374382149-233c42b6a83b?auto=format&fit=crop&w=1200&q=80',
        main: true,
      },
      {
        id: 'img-af1-2',
        imageUrl:
          'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80',
        main: false,
      },
    ],
    variants: [
      { id: 'v-af1-1', size: '42', color: 'Đen', sku: 'AF1-42-BLK' },
      { id: 'v-af1-2', size: '43', color: 'Đen', sku: 'AF1-43-BLK' },
      { id: 'v-af1-3', size: '42', color: 'Trắng', sku: 'AF1-42-WHT' },
    ],
    stocks: [
      { size: '42', color: 'Đen', available: 10, status: 'IN_STOCK' },
      { size: '43', color: 'Đen', available: 5, status: 'IN_STOCK' },
      { size: '42', color: 'Trắng', available: 7, status: 'IN_STOCK' },
    ],
  },
  {
    id: 'sz-samba',
    name: 'Adidas Samba',
    brand: 'Adidas',
    description:
      'Samba kinh điển — đế cao su, form bóng bàn huyền thoại. Không tách màu riêng.',
    categoryId: 'cat-sneakers',
    categoryName: 'Sneaker',
    basePrice: 1800000,
    status: 'ACTIVE',
    collection: 'Biểu tượng cổ điển',
    images: [
      {
        id: 'img-smb-1',
        imageUrl:
          'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1200&q=80',
        main: true,
      },
    ],
    variants: [{ id: 'v-smb-1', size: '40', color: null, sku: 'SMB-40' }],
    stocks: [{ size: '40', color: null, available: 6, status: 'IN_STOCK' }],
  },
]

export const formatVnd = (value) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)

export const getMainImage = (product) => {
  if (!product?.images?.length) return ''
  return (
    product.images.find((img) => img.main)?.imageUrl ||
    product.images[0].imageUrl
  )
}

export const getProductById = (id) => products.find((p) => p.id === id)

export const getBrands = () =>
  [...new Set(products.map((p) => p.brand))].sort()

export const filterProducts = ({ q, categoryId, brand } = {}) => {
  const query = (q || '').trim().toLowerCase()
  return products.filter((p) => {
    if (p.status !== 'ACTIVE') return false
    if (categoryId && p.categoryId !== categoryId) return false
    if (brand && p.brand !== brand) return false
    if (!query) return true
    return (
      p.name.toLowerCase().includes(query) ||
      p.brand.toLowerCase().includes(query) ||
      (p.collection || '').toLowerCase().includes(query)
    )
  })
}

export const getStock = (product, size, color) => {
  if (!product?.stocks) return null
  return (
    product.stocks.find(
      (s) =>
        s.size === size &&
        (s.color ?? null) === (color ?? null),
    ) || null
  )
}

export const uniqueSizes = (product) => [
  ...new Set(product.variants.map((v) => v.size)),
]

export const uniqueColors = (product) => {
  const colors = product.variants.map((v) => v.color).filter((c) => c != null)
  return [...new Set(colors)]
}

/** Home sections — lấy từ catalog chung */
export const trendingProducts = products.filter((p) =>
  ['trend-1', 'trend-2', 'trend-3'].includes(p.id),
)

export const newArrivals = products.filter((p) =>
  ['new-1', 'new-2', 'new-3', 'new-4'].includes(p.id),
)
