"use client";
import type React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ShoppingCart,
  Search,
  Menu,
  X,
  LogOut,
  User,
  Flower,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";

const CATEGORIES = [
  "Bouquets",
  "Baskets",
  "Flower Boxes",
  "Table Centerpieces",
  "Luxury Arrangements",
  "Heart-Shaped Arrangements",
  "Garland / Mala",
  "Vase Arrangements",
];

export function Header() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  const cartCount =
    cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-green-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-3 group"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                <Flower className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <Heart className="w-3 h-3 text-white" fill="currentColor" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-2xl bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                Flower Fairies <span>🧚</span>
              </span>
              <span className="text-xs text-green-600 font-medium -mt-1">
                Since 2024
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-700 hover:text-pink-600 hover:bg-pink-50"
                >
                  Categories
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="center"
                className="w-64 p-3 bg-white/95 backdrop-blur-sm border-green-100 shadow-xl"
              >
                <div className="grid grid-cols-1 gap-1">
                  {CATEGORIES.map((category) => (
                    <DropdownMenuItem
                      key={category}
                      asChild
                      className="p-2 hover:bg-pink-50 rounded-md transition-colors"
                    >
                      <Link
                        href={`/products?category=${category}`}
                        className="flex items-center space-x-3 text-gray-700 hover:text-pink-600"
                      >
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Flower className="w-3 h-3 text-green-600" />
                        </div>
                        <span className="font-medium">{category}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {user && user.role === "admin" && (
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-gray-700 hover:text-pink-600 hover:bg-pink-50"
              >
                <Link href="/admin">Admin</Link>
              </Button>
            )}
          </nav>

          {/* Desktop Search */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-sm mx-8"
          >
            <div className="relative w-full">
              <Input
                type="text"
                placeholder="Search flowers, arrangements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 border-green-200 focus:border-pink-300 focus:ring-pink-200 rounded-full bg-green-50/50"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 hover:text-pink-600 transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Right section */}
          <div className="flex items-center gap-3">
            {/* Cart icon */}
            <Link href="/cart" className="relative group">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-green-50 hover:bg-pink-50 text-green-600 hover:text-pink-600 border border-green-200 hover:border-pink-200 transition-all duration-200 group-hover:scale-105"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gradient-to-br from-pink-500 to-rose-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-lg animate-pulse">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* User menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full bg-green-50 hover:bg-pink-50 text-green-600 hover:text-pink-600 border border-green-200 hover:border-pink-200 transition-all duration-200"
                  >
                    <User className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-white/95 backdrop-blur-sm border-green-100 shadow-xl"
                >
                  <div className="flex items-center space-x-3 p-3 border-b border-green-50">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-green-600 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuItem
                    asChild
                    className="p-3 hover:bg-pink-50 cursor-pointer"
                  >
                    <Link
                      href="/dashboard"
                      className="flex items-center space-x-3 text-gray-700"
                    >
                      <User className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-green-100" />
                  <DropdownMenuItem
                    onClick={() => {
                      logout();
                      router.push("/");
                    }}
                    className="p-3 hover:bg-pink-50 cursor-pointer text-gray-700"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="rounded-full border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 hidden sm:inline-flex"
                >
                  <Link href="/login">Login</Link>
                </Button>
                <Button
                  size="sm"
                  asChild
                  className="rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-lg hover:shadow-xl transition-all duration-200 hidden sm:inline-flex"
                >
                  <Link href="/register">Register</Link>
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden rounded-full bg-green-50 hover:bg-pink-50 text-green-600 hover:text-pink-600 border border-green-200 hover:border-pink-200 transition-all duration-200"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden pb-6 space-y-4 bg-white/95 backdrop-blur-sm rounded-2xl mt-2 p-4 border border-green-100 shadow-lg">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="space-y-3">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search flowers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10 border-green-200 bg-green-50/50 rounded-full"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-600" />
              </div>
              <Button
                type="submit"
                className="w-full rounded-full bg-linear-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
              >
                Search Flowers
              </Button>
            </form>

            {/* Mobile Navigation */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-900 px-4 py-2">
                Categories
              </div>
              {CATEGORIES.map((category) => (
                <Link
                  key={category}
                  href={`/products?category=${category}`}
                  className="flex items-center space-x-3 text-sm py-3 px-4 rounded-xl hover:bg-green-50 text-gray-700 hover:text-green-600 transition-colors border border-transparent hover:border-green-200 ml-4"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Flower className="w-3 h-3" />
                  <span>{category}</span>
                </Link>
              ))}

              {!user && (
                <div className="flex gap-2 pt-2 border-t border-green-100">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="flex-1 rounded-full border-green-200 text-green-700 hover:bg-green-50"
                  >
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    asChild
                    className="flex-1 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                  >
                    <Link
                      href="/register"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Register
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
