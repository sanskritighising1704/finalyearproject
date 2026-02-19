"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Heart,
  Star,
  Clock,
  Truck,
  Shield,
  Sparkles,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/product-card";
import { useCart } from "@/contexts/cart-context";
import { apiClient } from "@/lib/api-client";
import type { Product } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

const CATEGORIES = [
  { name: "Fresh Bouquets", slug: "bouquets", icon: "💐" },
  { name: "Flower Baskets", slug: "baskets", icon: "🧺" },
  { name: "Flower Boxes", slug: "flower-boxes", icon: "🎁" },
  { name: "Table Centerpieces", slug: "table-centerpieces", icon: "🏵️" },
  { name: "Luxury Arrangements", slug: "luxury-arrangements", icon: "🌹" },
  { name: "Romantic Arrangements", slug: "romantic-arrangements", icon: "💖" },
  { name: "Wedding Flowers", slug: "wedding-flowers", icon: "👰" },
  { name: "Vase Arrangements", slug: "vase-arrangements", icon: "🏺" },
];

const OCCASIONS = [
  {
    name: "Birthday",
    slug: "birthday",
    icon: "🎂",
    color: "from-yellow-400 to-orange-400",
  },
  {
    name: "Anniversary",
    slug: "anniversary",
    icon: "💝",
    color: "from-pink-500 to-rose-500",
  },
  {
    name: "Wedding",
    slug: "wedding",
    icon: "💒",
    color: "from-purple-500 to-pink-500",
  },
  {
    name: "Congratulations",
    slug: "congratulations",
    icon: "🎉",
    color: "from-blue-500 to-cyan-400",
  },
  {
    name: "Get Well Soon",
    slug: "get-well",
    icon: "❤️‍🩹",
    color: "from-green-500 to-emerald-400",
  },
  {
    name: "Sympathy",
    slug: "sympathy",
    icon: "🕊️",
    color: "from-gray-500 to-blue-400",
  },
  {
    name: "Thank You",
    slug: "thank-you",
    icon: "🙏",
    color: "from-indigo-500 to-purple-400",
  },
  {
    name: "Just Because",
    slug: "just-because",
    icon: "🌼",
    color: "from-rose-400 to-pink-400",
  },
];

const TESTIMONIALS = [
  {
    name: "Priya Sharma",
    comment:
      "The most beautiful flowers I've ever received! Fresh and lasted for weeks.",
    rating: 5,
    occasion: "Anniversary",
  },
  {
    name: "Rahul Mehta",
    comment:
      "Same-day delivery saved my anniversary! Excellent service and quality.",
    rating: 5,
    occasion: "Anniversary",
  },
  {
    name: "Anita Patel",
    comment:
      "Perfect wedding flowers that exceeded all expectations. Highly recommended!",
    rating: 5,
    occasion: "Wedding",
  },
];

export default function Home() {
  const { addItem } = useCart();
  const { toast } = useToast();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await apiClient.get<any>("/products?limit=6");
        setFeaturedProducts(response.products || []);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load products",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, [toast]);

  const handleAddToCart = async (productId: string, quantity: number) => {
    try {
      await addItem(productId, quantity);
      toast({
        title: "Success",
        description: "Added to cart",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add to cart",
        variant: "destructive",
      });
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-pink-50 via-rose-50 to-green-50 py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-200/20 via-transparent to-green-200/20"></div>
        <div className="max-w-7xl mx-auto px-4 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold mb-4 leading-tight">
                Handpicked blooms{" "}
                <span className="text-pink-600">for every moment.</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                When words fall short, let our flowers speak the language of
                your heart.
              </p>
              <div className="flex gap-4 flex-wrap">
                <Button
                  size="lg"
                  asChild
                  className="bg-pink-600 hover:bg-pink-700 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Link href="/products">
                    Shop Flowers
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="border-pink-300 text-pink-700 hover:bg-pink-50"
                >
                  <Link href="#categories">Browse Categories</Link>
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="flex gap-8 mt-12 pt-8 border-t border-pink-200/50">
                <div className="text-center">
                  <div className="text-2xl font-bold text-pink-600">500+</div>
                  <div className="text-sm text-gray-600">Happy Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">50+</div>
                  <div className="text-sm text-gray-600">Flower Varieties</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-rose-600">24/7</div>
                  <div className="text-sm text-gray-600">Delivery Service</div>
                </div>
              </div>
            </div>
            <div className="relative h-64 md:h-96">
              <Image
                src="/image.png"
                alt="Beautiful flower arrangement"
                fill
                className="object-cover rounded-2xl shadow-2xl"
                priority
              />
              {/* Floating elements */}
              <div className="absolute -top-4 -left-4 bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-semibold">Fresh Daily</span>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-semibold">Free Delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Shop by Category</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our wide range of beautiful floral arrangements for every
              taste and occasion
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {CATEGORIES.map((category) => (
              <Link
                key={category.slug}
                href={`/products?category=${category.slug}`}
                className="group p-6 rounded-2xl border border-gray-200 hover:border-pink-300 hover:shadow-2xl transition-all duration-300 bg-white hover:bg-gradient-to-br hover:from-pink-50 hover:to-rose-50 text-center transform hover:-translate-y-1"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300 inline-block">
                  {category.icon}
                </div>
                <h3 className="font-semibold text-gray-800 group-hover:text-pink-700">
                  {category.name}
                </h3>
                <p className="text-xs text-gray-500 mt-2 group-hover:text-pink-600 transition-colors">
                  Explore ›
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Occasions Section */}
      <section className="py-16 bg-gradient-to-br from-green-50 to-cyan-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Perfect for Every Occasion
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Find the perfect floral arrangement for your special moments
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {OCCASIONS.map((occasion) => (
              <Link
                key={occasion.slug}
                href={`/products?occasion=${occasion.slug}`}
                className="group p-6 rounded-xl bg-white/80 backdrop-blur-sm border border-white/50 hover:shadow-xl transition-all duration-300 text-center transform hover:-translate-y-1"
              >
                <div
                  className={`w-16 h-16 rounded-full bg-gradient-to-r ${occasion.color} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300`}
                >
                  <span className="text-2xl">{occasion.icon}</span>
                </div>
                <h3 className="font-semibold text-gray-800 group-hover:text-gray-900">
                  {occasion.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-green-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">
                Fresh Arrivals
              </h2>
              <p className="text-gray-600 mt-2">
                Handpicked flowers, delivered fresh to your doorstep
              </p>
            </div>
            <Button
              variant="outline"
              asChild
              className="border-pink-300 text-pink-700 hover:bg-pink-50 rounded-full"
            >
              <Link href="/products">View All Flowers</Link>
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-80 bg-white rounded-2xl animate-pulse shadow-sm"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Special Offers Banner */}
      <section className="py-12 bg-gradient-to-r from-rose-500 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-left">
              <h3 className="text-2xl font-bold mb-2">🎁 Special Offer!</h3>
              <p className="text-rose-100">
                Get 15% off on your first order. Use code: BLOOM15
              </p>
            </div>
            <Button
              size="lg"
              variant="secondary"
              asChild
              className="bg-white text-pink-700 hover:bg-gray-100 font-semibold rounded-full px-8"
            >
              <Link href="/products">Shop Now</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What Our Customers Say</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Don't just take our word for it - hear from our happy customers
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((testimonial, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-6 shadow-lg border border-pink-100"
              >
                <div className="flex items-center gap-1 mb-4">
                  {renderStars(testimonial.rating)}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "{testimonial.comment}"
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {testimonial.occasion}
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose Flower Fairies?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-white rounded-2xl shadow-lg border border-green-100">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌿</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Farm Fresh</h3>
              <p className="text-gray-600 text-sm">
                Direct from local growers, ensuring the freshest blooms for your
                arrangements.
              </p>
            </div>
            <div className="text-center p-6 bg-white rounded-2xl shadow-lg border border-pink-100">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Handcrafted</h3>
              <p className="text-gray-600 text-sm">
                Each arrangement is carefully designed by our expert florists
                with love.
              </p>
            </div>
            <div className="text-center p-6 bg-white rounded-2xl shadow-lg border border-blue-100">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Fast Delivery</h3>
              <p className="text-gray-600 text-sm">
                Free same-day delivery for orders placed before 2 PM local time.
              </p>
            </div>
            <div className="text-center p-6 bg-white rounded-2xl shadow-lg border border-purple-100">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Quality Guarantee</h3>
              <p className="text-gray-600 text-sm">
                100% satisfaction guarantee on all our floral arrangements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-2xl shadow-lg">
                1
              </div>
              <h3 className="text-xl font-semibold mb-3">
                Choose Your Flowers
              </h3>
              <p className="text-gray-600">
                Browse our collection and select the perfect arrangement for
                your occasion
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-2xl shadow-lg">
                2
              </div>
              <h3 className="text-xl font-semibold mb-3">Customize & Order</h3>
              <p className="text-gray-600">
                Add personal touches and place your order with delivery details
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-2xl shadow-lg">
                3
              </div>
              <h3 className="text-xl font-semibold mb-3">Fresh Delivery</h3>
              <p className="text-gray-600">
                Receive fresh, beautiful flowers delivered to your doorstep
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-gradient-to-r from-pink-600 to-rose-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-white/10"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 mb-4 backdrop-blur-sm">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Flower Club</span>
          </div>
          <h2 className="text-3xl font-bold mb-4">Join Our Flower Club</h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Subscribe to receive seasonal arrangements, exclusive offers, floral
            tips, and early access to new collections
          </p>
          <div className="flex flex-col sm:flex-row max-w-md mx-auto gap-3">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 px-4 py-3 rounded-full text-gray-800 border-0 focus:ring-2 focus:ring-pink-300 shadow-lg"
            />
            <Button
              size="lg"
              className="bg-white text-pink-700 hover:bg-gray-100 font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Subscribe
            </Button>
          </div>
          <p className="text-sm opacity-75 mt-4">
            ✨ First-time subscribers get 10% off their first order!
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
