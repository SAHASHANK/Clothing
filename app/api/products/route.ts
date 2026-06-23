import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const mockCatalog = [
  {
    id: 'nebula-S-black',
    productId: 'nebula-prod-id',
    name: 'NEBULA HEAVY HOODIE',
    slug: 'nebula-heavy-hoodie',
    category: 'HOODIES',
    drop: 'DROP_001_GRAVITY_ZERO',
    price: 4999,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1556821840-410a8c2f1fcc?auto=format&fit=crop&w=800&q=80',
    sizes: [
      { size: 'S', stock: 15 },
      { size: 'M', stock: 25 },
      { size: 'L', stock: 20 },
      { size: 'XL', stock: 3 }
    ],
    color: 'Midnight Black',
    popularity: 98,
  },
  {
    id: 'tee-M-grey',
    productId: 'tee-prod-id',
    name: 'ANTI-GRAVITY MESH TEE',
    slug: 'anti-gravity-mesh-tee',
    category: 'TEES',
    drop: 'DROP_001_GRAVITY_ZERO',
    price: 2999,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80',
    sizes: [
      { size: 'S', stock: 20 },
      { size: 'M', stock: 30 },
      { size: 'L', stock: 25 },
      { size: 'XL', stock: 0 }
    ],
    color: 'Brutalist Grey',
    popularity: 88,
  },
  {
    id: 'beanie-OS-acid',
    productId: 'beanie-prod-id',
    name: 'WARP DUST BEANIE',
    slug: 'warp-dust-beanie',
    category: 'ACCESSORIES',
    drop: 'DROP_001_GRAVITY_ZERO',
    price: 1899,
    image: 'https://images.unsplash.com/photo-1576871337622-98d48d435350?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1608889175123-8ec330b86f84?auto=format&fit=crop&w=800&q=80',
    sizes: [
      { size: 'O/S', stock: 45 }
    ],
    color: 'Acid Green',
    popularity: 76,
  }
];

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const slug = url.searchParams.get('slug');

    if (slug) {
      try {
        const product = await prisma.product.findUnique({
          where: { slug },
          include: {
            variants: true,
            reviews: {
              where: { approved: true }
            }
          }
        });
        if (product) {
          const imagesList = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
          const formatted = {
            productId: product.id,
            name: product.name,
            slug: product.slug,
            description: product.description,
            drop: product.drop,
            category: product.category,
            basePrice: product.basePrice,
            modelUrl: product.modelUrl,
            images: imagesList,
            variants: product.variants.map((v: any) => ({
              id: v.id,
              size: v.size,
              color: v.color,
              stock: v.stock
            })),
            reviews: product.reviews.map((r: any) => ({
              id: r.id,
              user: 'Verified Operator',
              rating: r.rating,
              title: r.title,
              body: r.body,
              verified: r.verified,
              createdAt: r.createdAt.toLocaleDateString ? r.createdAt.toLocaleDateString() : 'RECENT'
            }))
          };
          return NextResponse.json(formatted);
        }
      } catch (dbErr) {
        console.warn('Prisma product query failed (offline)');
      }

      // Fallback details search in Mock catalog
      const fallback = mockCatalog.find(p => p.slug === slug);
      if (fallback) {
        const detailFallback = {
          productId: fallback.productId,
          name: fallback.name,
          slug: fallback.slug,
          description: fallback.slug === 'nebula-heavy-hoodie' 
            ? '450 GSM ultra-heavy organic French terry cotton. Drop-shoulder boxy fit. Double-layered hood without drawstrings. Stacked brutalist rectangle emblem embroidered on chest. Anti-gravity dye technique.'
            : fallback.slug === 'anti-gravity-mesh-tee'
            ? '280 GSM oversized fit heavy mesh streetwear tee. Features mock-neck collar and screen-printed raw branding details. Breathable tech knit.'
            : 'Ribbed knit watch cap beanie in premium merino wool blend. Brutalist rectangular brand tag stitched on front cuff.',
          drop: fallback.drop,
          category: fallback.category,
          basePrice: fallback.price,
          images: [fallback.image, fallback.hoverImage],
          variants: fallback.sizes.map((s, sIdx) => ({
            id: `${fallback.id}-${sIdx}`,
            size: s.size,
            color: fallback.color,
            stock: s.stock
          })),
          reviews: []
        };
        return NextResponse.json(detailFallback);
      }
      return NextResponse.json(mockCatalog[0]);
    }

    const products = await prisma.product.findMany({
      include: { variants: true }
    });
    
    if (products.length === 0) {
      return NextResponse.json(mockCatalog);
    }
    
    // Group database product variants by color to match UI cards
    const formattedCatalog: any[] = [];
    products.forEach((product: any) => {
      const colors = Array.from(new Set(product.variants.map((v: any) => v.color))) as string[];
      const imagesList = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
      
      colors.forEach((col, idx) => {
        const colorVariants = product.variants.filter((v: any) => v.color === col);
        formattedCatalog.push({
          id: colorVariants[0]?.id || product.id,
          productId: product.id,
          name: product.name,
          slug: product.slug,
          category: product.category,
          drop: product.drop,
          price: product.basePrice,
          image: imagesList[idx % imagesList.length] || imagesList[0] || 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80',
          hoverImage: imagesList[(idx + 1) % imagesList.length] || imagesList[0] || 'https://images.unsplash.com/photo-1556821840-410a8c2f1fcc?auto=format&fit=crop&w=800&q=80',
          sizes: colorVariants.map((v: any) => ({
            size: v.size,
            stock: v.stock
          })),
          color: col,
          popularity: 95 - idx,
          createdAt: product.createdAt
        });
      });
    });

    return NextResponse.json(formattedCatalog);
  } catch (error) {
    // Database connection error, return mock dataset for immediate execution
    return NextResponse.json(mockCatalog);
  }
}
