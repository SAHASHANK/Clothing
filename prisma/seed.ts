import { PrismaClient, Role, Category, OrderStatus, DiscountType } from '../lib/prisma-client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding UNHRD.LAB database...');

  // 1. Clean old data
  await prisma.wishlistItem.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.discountProduct.deleteMany();
  await prisma.discount.deleteMany();
  await prisma.variant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Admin and Customers
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const customerPasswordHash = await bcrypt.hash('customer123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@unhrd.lab',
      name: 'System Admin',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      twoFactorAuth: false
    }
  });

  const customer = await prisma.user.create({
    data: {
      email: 'customer@gmail.com',
      name: 'Rohan Sharma',
      passwordHash: customerPasswordHash,
      role: Role.CUSTOMER,
      twoFactorAuth: false
    }
  });

  console.log(`Created Users: Admin (${admin.email}), Customer (${customer.email})`);

  // 3. Create Products and Variants
  const drop = 'DROP_001_GRAVITY_ZERO';

  const hoodie = await prisma.product.create({
    data: {
      name: 'NEBULA HEAVY HOODIE',
      slug: 'nebula-heavy-hoodie',
      description: '450 GSM ultra-heavy organic French terry cotton. Drop-shoulder boxy fit. Double-layered hood without drawstrings. Stacked brutalist rectangle emblem embroidered on chest. Anti-gravity dye technique.',
      drop,
      category: Category.HOODIES,
      basePrice: 4999,
      modelUrl: '/models/hoodie.glb',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1556821840-410a8c2f1fcc?auto=format&fit=crop&w=800&q=80'
      ])
    }
  });

  const variantsHoodie = [
    { size: 'S', color: 'Midnight Black', stock: 15 },
    { size: 'M', color: 'Midnight Black', stock: 25 },
    { size: 'L', color: 'Midnight Black', stock: 20 },
    { size: 'XL', color: 'Midnight Black', stock: 3 }, // low stock indicator trigger
    { size: 'S', color: 'Off-White', stock: 10 },
    { size: 'M', color: 'Off-White', stock: 15 },
    { size: 'L', color: 'Off-White', stock: 12 },
    { size: 'XL', color: 'Off-White', stock: 8 }
  ];

  for (const v of variantsHoodie) {
    await prisma.variant.create({
      data: {
        productId: hoodie.id,
        size: v.size,
        color: v.color,
        stock: v.stock
      }
    });
  }

  const tee = await prisma.product.create({
    data: {
      name: 'ANTI-GRAVITY MESH TEE',
      slug: 'anti-gravity-mesh-tee',
      description: '280 GSM oversized fit heavy mesh streetwear tee. Features mock-neck collar and screen-printed raw branding details. Breathable tech knit.',
      drop,
      category: Category.TEES,
      basePrice: 2999,
      modelUrl: '/models/tee.glb',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80'
      ])
    }
  });

  const variantsTee = [
    { size: 'S', color: 'Brutalist Grey', stock: 20 },
    { size: 'M', color: 'Brutalist Grey', stock: 30 },
    { size: 'L', color: 'Brutalist Grey', stock: 25 },
    { size: 'XL', color: 'Brutalist Grey', stock: 12 },
    { size: 'S', color: 'Acid Green', stock: 8 },
    { size: 'M', color: 'Acid Green', stock: 15 },
    { size: 'L', color: 'Acid Green', stock: 10 },
    { size: 'XL', color: 'Acid Green', stock: 2 } // low stock indicator trigger
  ];

  for (const v of variantsTee) {
    await prisma.variant.create({
      data: {
        productId: tee.id,
        size: v.size,
        color: v.color,
        stock: v.stock
      }
    });
  }

  const beanie = await prisma.product.create({
    data: {
      name: 'WARP DUST BEANIE',
      slug: 'warp-dust-beanie',
      description: 'Ribbed knit watch cap beanie in premium merino wool blend. Brutalist rectangular brand tag stitched on front cuff.',
      drop,
      category: Category.ACCESSORIES,
      basePrice: 1899,
      modelUrl: '/models/beanie.glb',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1576871337622-98d48d435350?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1608889175123-8ec330b86f84?auto=format&fit=crop&w=800&q=80'
      ])
    }
  });

  await prisma.variant.create({
    data: {
      productId: beanie.id,
      size: 'O/S',
      color: 'Acid Green',
      stock: 45
    }
  });

  await prisma.variant.create({
    data: {
      productId: beanie.id,
      size: 'O/S',
      color: 'Core Black',
      stock: 50
    }
  });

  console.log('Created Products with Variants.');

  // 4. Create Discounts
  const flatDiscount = await prisma.discount.create({
    data: {
      code: 'UNHRD1000',
      type: DiscountType.FLAT,
      value: 1000,
      minCart: 4000,
      active: true
    }
  });

  const percentDiscount = await prisma.discount.create({
    data: {
      code: 'LAUNCH20',
      type: DiscountType.PERCENT,
      value: 20,
      minCart: 0,
      active: true
    }
  });

  console.log(`Created Discounts: ${flatDiscount.code}, ${percentDiscount.code}`);

  // 5. Create Reviews
  await prisma.review.create({
    data: {
      productId: hoodie.id,
      userId: customer.id,
      rating: 5,
      title: 'INSANE QUALITY',
      body: 'Hands down the heaviest hoodie I own. The brutalist patch is subtle and clean. Fabric feels indestructible.',
      photos: JSON.stringify([
        'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=300&q=80'
      ]),
      verified: true,
      approved: true,
      adminReply: 'Thanks for the support Rohan. Appreciate the feedback on the weight.'
    }
  });

  await prisma.review.create({
    data: {
      productId: tee.id,
      userId: customer.id,
      rating: 4,
      title: 'Amazing fit, mesh is premium',
      body: 'Slightly more oversized than expected but looks sick. Acid green is extremely bright.',
      photos: JSON.stringify([]),
      verified: true,
      approved: true
    }
  });

  console.log('Created Reviews.');

  // 6. Create Sample Orders
  const sampleVariant = await prisma.variant.findFirst({
    where: { productId: hoodie.id }
  });

  if (sampleVariant) {
    const order = await prisma.order.create({
      data: {
        userId: customer.id,
        status: OrderStatus.DELIVERED,
        total: 4999,
        shippingAddress: JSON.stringify({
          name: 'Rohan Sharma',
          address: 'Apartment 402, Sector 15',
          pincode: '400703',
          city: 'Mumbai',
          state: 'Maharashtra',
          phone: '+91 9876543210'
        }),
        razorpayOrderId: 'order_test_12345',
        razorpayPaymentId: 'pay_test_12345',
        trackingNumber: 'TRACK_987654',
        items: {
          create: {
            variantId: sampleVariant.id,
            quantity: 1,
            price: 4999
          }
        }
      }
    });

    console.log(`Created sample Order for Rohan: ${order.id}`);
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
