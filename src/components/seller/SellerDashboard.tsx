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
      <div className="relative overflow-hidden bg-[#1A1A00] text-[#FFFFCC] p-8 sm:p-12 rounded-3xl border border-[#1A1A00]/20 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="font-avantgarde text-[11px] tracking-widest uppercase text-[#DCE2B8] font-semibold">
            SELLER PORTAL
          </div>

          <h1 className="font-outfit text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            {seller.name} Dashboard
          </h1>

          <p className="text-[#DCE2B8] text-sm sm:text-base font-sans max-w-xl leading-relaxed">
            Track profile views, product saves, drop performance, and manage your 1-of-1 Davao thrift inventory.
          </p>
        </div>

        <div className="bg-[#FFFFCC]/10 backdrop-blur-md border border-[#FFFFCC]/15 p-5 rounded-2xl text-xs space-y-1.5 shrink-0">
          <div className="text-xs uppercase text-[#DCE2B8] font-semibold tracking-wider">Verification Status</div>
          <div className="font-bold text-[#FFFFCC] flex items-center gap-2 text-base">
            <ShieldCheck className="w-5 h-5 text-[#FFFFCC]" />
            <span>{seller.verificationStatus}</span>
          </div>
        </div>
      </div>

      {/* Analytics Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#FFFFCC] border border-[#E1E6B6] rounded-3xl p-6 space-y-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-[#565C38]">
            <span className="text-xs font-semibold uppercase tracking-wider">Profile Views</span>
            <div className="w-8 h-8 rounded-full bg-[#EFF2D2] flex items-center justify-center text-[#1A1A00]">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="font-outfit text-3xl font-bold text-[#1A1A00]">2,431</div>
          <div className="text-xs text-[#1A1A00] font-medium">+18% this week</div>
        </div>

        <div className="bg-[#FFFFCC] border border-[#E1E6B6] rounded-3xl p-6 space-y-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-[#565C38]">
            <span className="text-xs font-semibold uppercase tracking-wider">Product Saves</span>
            <div className="w-8 h-8 rounded-full bg-[#EFF2D2] flex items-center justify-center text-[#1A1A00]">
              <Bookmark className="w-4 h-4" />
            </div>
          </div>
          <div className="font-outfit text-3xl font-bold text-[#1A1A00]">482</div>
          <div className="text-xs text-[#565C38] font-sans">Across 8 pieces</div>
        </div>

        <div className="bg-[#FFFFCC] border border-[#E1E6B6] rounded-3xl p-6 space-y-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-[#565C38]">
            <span className="text-xs font-semibold uppercase tracking-wider">Followers</span>
            <div className="w-8 h-8 rounded-full bg-[#EFF2D2] flex items-center justify-center text-[#1A1A00]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="font-outfit text-3xl font-bold text-[#1A1A00]">{seller.followerCount}</div>
          <div className="text-xs text-[#565C38] font-sans">Active Davao buyers</div>
        </div>

        <div className="bg-[#FFFFCC] border border-[#E1E6B6] rounded-3xl p-6 space-y-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-[#565C38]">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Pieces</span>
            <div className="w-8 h-8 rounded-full bg-[#EFF2D2] flex items-center justify-center text-[#1A1A00]">
              <Tag className="w-4 h-4" />
            </div>
          </div>
          <div className="font-outfit text-3xl font-bold text-[#1A1A00]">{inventoryList.length}</div>
          <div className="text-xs text-[#565C38] font-sans">Available in catalog</div>
        </div>
      </div>

      {/* Capsule Tabs Bar */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-[#EFF2D2] rounded-full w-fit">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-5 py-2.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-[#1A1A00] text-[#FFFFCC] shadow-sm'
              : 'text-[#565C38] hover:text-[#1A1A00] hover:bg-[#EFF2D2]/80'
          }`}
        >
          Inventory Manager
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-5 py-2.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
            activeTab === 'inventory'
              ? 'bg-[#1A1A00] text-[#FFFFCC] shadow-sm'
              : 'text-[#565C38] hover:text-[#1A1A00] hover:bg-[#EFF2D2]/80'
          }`}
        >
          Add New Piece
        </button>
      </div>

      {/* Success Toast */}
      {isSuccessToast && (
        <div className="bg-[#1A1A00] text-[#FFFFCC] p-4 rounded-2xl text-xs sm:text-sm font-medium flex items-center gap-3 shadow-lg border border-[#1A1A00]/20 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#FFFFCC] shrink-0" />
          <span>New product successfully added to your Davao storefront catalog!</span>
        </div>
      )}

      {/* Inventory Manager */}
      {activeTab === 'overview' && (
        <div className="bg-[#FFFFCC] border border-[#E1E6B6] rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E1E6B6] gap-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#565C38]">
              Manage Catalog Items ({inventoryList.length})
            </h3>
            <span className="text-xs text-[#565C38] font-sans">
              Click status to cycle: Available &rarr; Reserved &rarr; Sold Out
            </span>
          </div>

          <div className="divide-y divide-[#E1E6B6]">
            {inventoryList.map((item) => (
              <div
                key={item.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-[#E1E6B6] shadow-sm shrink-0"
                  />
                  <div>
                    <h4 className="font-outfit font-bold text-sm text-[#1A1A00]">{item.name}</h4>
                    <div className="text-xs text-[#565C38] mt-0.5">
                      ₱{item.price.toLocaleString()} • Size {item.size} • {item.isOneOfOne ? '1-of-1' : 'Standard Stock'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-xs text-[#565C38]">
                    {item.saveCount} saves
                  </span>
                  <button
                    onClick={() => handleToggleStatus(item.id)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold transition-all border cursor-pointer ${
                      item.status === 'Available'
                        ? 'bg-[#1A1A00] text-[#FFFFCC] border-[#1A1A00] shadow-sm'
                        : item.status === 'Reserved'
                        ? 'bg-[#EFF2D2] text-[#1A1A00] border-[#E1E6B6]'
                        : 'bg-[#EFF2D2] text-[#565C38] border-[#E1E6B6] line-through'
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
          className="bg-[#FFFFCC] border border-[#E1E6B6] rounded-3xl p-6 sm:p-8 max-w-2xl space-y-6 shadow-sm"
        >
          <h3 className="font-outfit text-xl font-bold text-[#1A1A00] border-b border-[#E1E6B6] pb-4">
            Add New Fashion Piece to Storefront
          </h3>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#565C38]">
              Item Title / Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Vintage 1994 Carhartt Detroit Jacket"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full bg-[#F8F9EA] border border-[#E1E6B6] rounded-2xl px-4 py-3 text-sm text-[#1A1A00] focus:outline-none focus:ring-2 focus:ring-[#1A1A00]/20 font-sans"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#565C38]">
                Price (PHP ₱) *
              </label>
              <input
                type="number"
                required
                placeholder="e.g. 1250"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                className="w-full bg-[#F8F9EA] border border-[#E1E6B6] rounded-2xl px-4 py-3 text-sm text-[#1A1A00] focus:outline-none focus:ring-2 focus:ring-[#1A1A00]/20"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#565C38]">
                Size
              </label>
              <select
                value={newSize}
                onChange={(e) => setNewSize(e.target.value)}
                className="w-full bg-[#F8F9EA] border border-[#E1E6B6] rounded-2xl px-4 py-3 text-sm text-[#1A1A00] focus:outline-none focus:ring-2 focus:ring-[#1A1A00]/20"
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
              <label className="block text-xs font-semibold text-[#565C38]">
                Category
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full bg-[#F8F9EA] border border-[#E1E6B6] rounded-2xl px-4 py-3 text-sm text-[#1A1A00] focus:outline-none focus:ring-2 focus:ring-[#1A1A00]/20"
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
              <label className="block text-xs font-semibold text-[#565C38]">
                Inventory Type
              </label>
              <button
                type="button"
                onClick={() => setIsOneOfOne(!isOneOfOne)}
                className={`w-full py-3 px-4 rounded-2xl text-xs font-semibold transition-all border cursor-pointer ${
                  isOneOfOne
                    ? 'bg-[#1A1A00] text-[#FFFFCC] border-[#1A1A00] shadow-sm'
                    : 'bg-[#EFF2D2] text-[#1A1A00] border-[#E1E6B6]'
                }`}
              >
                {isOneOfOne ? '1-of-1 Thrift Piece' : 'Standard Stock'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-[#1A1A00] hover:bg-[#1A1A00]/90 text-[#FFFFCC] rounded-full text-xs font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Publish Piece to Davao Storefront</span>
          </button>
        </form>
      )}
    </div>
  );
};
