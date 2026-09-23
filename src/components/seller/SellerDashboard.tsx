import React, { useState } from 'react';
import { Eye, Bookmark, Users, Plus, Tag, ShieldCheck, CheckCircle2 } from 'lucide-react';
import type { Seller, Product } from '../../types/fashion';

interface SellerDashboardProps {
  seller: Seller;
  products: Product[];
  onAddProduct?: (newProd: Partial<Product>) => void;
}

export const SellerDashboard: React.FC<SellerDashboardProps> = ({
  seller,
  products,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'schedule-drop'>('overview');
  const [inventoryList, setInventoryList] = useState<Product[]>(products);
  const [isSuccessToast, setIsSuccessToast] = useState<boolean>(false);

  // New Item State
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newSize, setNewSize] = useState('Medium');
  const [newCategory, setNewCategory] = useState('Streetwear');
  const [isOneOfOne, setIsOneOfOne] = useState(true);

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newPrice) return;

    const created: Product = {
      id: `prod-${Date.now()}`,
      sellerId: seller.id,
      sellerName: seller.name,
      sellerHandle: seller.handle,
      sellerLogo: seller.logoUrl,
      name: newTitle,
      price: parseFloat(newPrice),
      images: ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80'],
      description: 'Newly listed piece added via Habi Seller Dashboard.',
      category: newCategory,
      condition: 'Good Vintage',
      size: newSize,
      availableQuantity: 1,
      isOneOfOne: isOneOfOne,
      status: 'Available',
      location: `${seller.location.city} - ${seller.location.district}`,
      tags: ['NewListing', newCategory],
      aesthetics: ['Streetwear'],
      saveCount: 0,
      viewCount: 1,
      dateAdded: new Date().toISOString().split('T')[0],
    };

    setInventoryList([created, ...inventoryList]);
    setNewTitle('');
    setNewPrice('');
    setIsSuccessToast(true);
    setTimeout(() => setIsSuccessToast(false), 3000);
  };

  const handleToggleStatus = (id: string) => {
    setInventoryList((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextStatus = item.status === 'Available' ? 'Reserved' : item.status === 'Reserved' ? 'Sold Out' : 'Available';
          return { ...item, status: nextStatus };
        }
        return item;
      })
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans space-y-8">
      {/* Dashboard Top Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 text-white p-8 sm:p-12 rounded-3xl border border-zinc-800/80 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/10 backdrop-blur-md border border-white/15 rounded-full text-xs text-white">
            <ShieldCheck className="w-3.5 h-3.5 text-white" />
            <span className="font-semibold text-xs">Seller Portal</span>
          </div>

          <h1 className="font-outfit text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            {seller.name} Dashboard
          </h1>

          <p className="text-zinc-300 text-sm sm:text-base font-sans max-w-xl leading-relaxed">
            Track profile views, product saves, drop performance, and manage your 1-of-1 Davao thrift inventory.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/15 p-5 rounded-2xl text-xs space-y-1.5 shrink-0">
          <div className="text-xs uppercase text-zinc-300 font-semibold tracking-wider">Verification Status</div>
          <div className="font-bold text-white flex items-center gap-2 text-base">
            <ShieldCheck className="w-5 h-5 text-white" />
            <span>{seller.verificationStatus}</span>
          </div>
        </div>
      </div>

      {/* Analytics Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 space-y-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Profile Views</span>
            <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-950">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="font-outfit text-3xl font-bold text-zinc-950">2,431</div>
          <div className="text-xs text-emerald-600 font-medium">+18% this week</div>
        </div>

        <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 space-y-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Product Saves</span>
            <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-950">
              <Bookmark className="w-4 h-4" />
            </div>
          </div>
          <div className="font-outfit text-3xl font-bold text-zinc-950">482</div>
          <div className="text-xs text-zinc-500 font-sans">Across 8 pieces</div>
        </div>

        <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 space-y-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Followers</span>
            <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-950">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="font-outfit text-3xl font-bold text-zinc-950">{seller.followerCount}</div>
          <div className="text-xs text-zinc-500 font-sans">Active Davao buyers</div>
        </div>

        <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 space-y-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Pieces</span>
            <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-950">
              <Tag className="w-4 h-4" />
            </div>
          </div>
          <div className="font-outfit text-3xl font-bold text-zinc-950">{inventoryList.length}</div>
          <div className="text-xs text-zinc-500 font-sans">Available in catalog</div>
        </div>
      </div>

      {/* Capsule Tabs Bar */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-zinc-100 rounded-full w-fit">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-5 py-2.5 text-xs font-semibold rounded-full transition-all ${
            activeTab === 'overview'
              ? 'bg-zinc-950 text-white shadow-sm'
              : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/60'
          }`}
        >
          Inventory Manager
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-5 py-2.5 text-xs font-semibold rounded-full transition-all ${
            activeTab === 'inventory'
              ? 'bg-zinc-950 text-white shadow-sm'
              : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/60'
          }`}
        >
          Add New Piece
        </button>
      </div>

      {/* Success Toast */}
      {isSuccessToast && (
        <div className="bg-zinc-950 text-white p-4 rounded-2xl text-xs sm:text-sm font-medium flex items-center gap-3 shadow-lg border border-zinc-800 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>New product successfully added to your Davao storefront catalog!</span>
        </div>
      )}

      {/* Inventory Manager */}
      {activeTab === 'overview' && (
        <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-100 gap-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
              Manage Catalog Items ({inventoryList.length})
            </h3>
            <span className="text-xs text-zinc-500 font-sans">
              Click status to cycle: Available &rarr; Reserved &rarr; Sold Out
            </span>
          </div>

          <div className="divide-y divide-zinc-100">
            {inventoryList.map((item) => (
              <div
                key={item.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-zinc-200 shadow-sm shrink-0"
                  />
                  <div>
                    <h4 className="font-outfit font-bold text-sm text-zinc-950">{item.name}</h4>
                    <div className="text-xs text-zinc-500 mt-0.5">
                      ₱{item.price.toLocaleString()} • Size {item.size} • {item.isOneOfOne ? '1-of-1' : 'Standard Stock'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-xs text-zinc-400">
                    {item.saveCount} saves
                  </span>
                  <button
                    onClick={() => handleToggleStatus(item.id)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold transition-all border ${
                      item.status === 'Available'
                        ? 'bg-zinc-950 text-white border-zinc-950 shadow-sm'
                        : item.status === 'Reserved'
                        ? 'bg-amber-100 text-amber-900 border-amber-200'
                        : 'bg-zinc-100 text-zinc-400 border-zinc-200 line-through'
                    }`}
                  >
                    {item.status}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add New Piece Form */}
      {activeTab === 'inventory' && (
        <form
          onSubmit={handleCreateProduct}
          className="bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-8 max-w-2xl space-y-6 shadow-sm"
        >
          <h3 className="font-outfit text-xl font-bold text-zinc-950 border-b border-zinc-100 pb-4">
            Add New Fashion Piece to Storefront
          </h3>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-zinc-700">
              Item Title / Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Vintage 1994 Carhartt Detroit Jacket"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200/80 rounded-2xl px-4 py-3 text-sm text-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-950/20 font-sans"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-700">
                Price (PHP ₱) *
              </label>
              <input
                type="number"
                required
                placeholder="e.g. 1250"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200/80 rounded-2xl px-4 py-3 text-sm text-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-950/20"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-700">
                Size
              </label>
              <select
                value={newSize}
                onChange={(e) => setNewSize(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200/80 rounded-2xl px-4 py-3 text-sm text-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-950/20"
              >
                <option value="Small">Small</option>
                <option value="Medium">Medium</option>
                <option value="Large">Large</option>
                <option value="X-Large">X-Large</option>
                <option value="W32 L30">W32 L30 (Denim)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-700">
                Category
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200/80 rounded-2xl px-4 py-3 text-sm text-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-950/20"
              >
                <option value="Outerwear">Outerwear</option>
                <option value="Streetwear">Streetwear</option>
                <option value="Denim">Denim</option>
                <option value="Tops">Tops</option>
                <option value="Pants">Pants</option>
                <option value="Accessories">Accessories</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-700">
                Inventory Type
              </label>
              <button
                type="button"
                onClick={() => setIsOneOfOne(!isOneOfOne)}
                className={`w-full py-3 px-4 rounded-2xl text-xs font-semibold transition-all border ${
                  isOneOfOne
                    ? 'bg-zinc-950 text-white border-zinc-950 shadow-sm'
                    : 'bg-zinc-100 text-zinc-950 border-zinc-200'
                }`}
              >
                {isOneOfOne ? '1-of-1 Thrift Piece' : 'Standard Stock'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-full text-xs font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Publish Piece to Davao Storefront</span>
          </button>
        </form>
      )}
    </div>
  );
};
