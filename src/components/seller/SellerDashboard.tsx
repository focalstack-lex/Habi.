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
      <div className="bg-zinc-950 text-white p-8 sm:p-12 rounded-none border border-zinc-900 flex flex-col md:flex-row md:items-center justify-between gap-6 font-mono">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white text-zinc-950 text-[10px] uppercase font-bold tracking-[0.2em]">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-950" />
            <span>SELLER PORTAL</span>
          </div>

          <h1 className="font-syne text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight uppercase">
            {seller.name} DASHBOARD
          </h1>

          <p className="text-zinc-400 text-xs sm:text-sm font-sans max-w-xl">
            Track profile views, product saves, drop performance, and manage your 1-of-1 Davao thrift inventory.
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-none text-xs space-y-1">
          <div className="text-[10px] uppercase text-zinc-400 font-bold tracking-widest">VERIFICATION STATUS</div>
          <div className="font-bold text-white flex items-center gap-1.5 text-sm">
            <ShieldCheck className="w-4 h-4 text-white" />
            <span>{seller.verificationStatus}</span>
          </div>
        </div>
      </div>

      {/* Analytics Metric Cards Grid (Sharp Rectangular Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="bg-white border border-zinc-200 rounded-none p-5 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em]">Profile Views</span>
            <Eye className="w-4 h-4 text-zinc-950" />
          </div>
          <div className="font-syne text-3xl font-extrabold text-zinc-950">2,431</div>
          <div className="text-[11px] text-zinc-500 font-sans">+18% this week</div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-none p-5 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em]">Product Saves</span>
            <Bookmark className="w-4 h-4 text-zinc-950" />
          </div>
          <div className="font-syne text-3xl font-extrabold text-zinc-950">482</div>
          <div className="text-[11px] text-zinc-500 font-sans">Across 8 pieces</div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-none p-5 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em]">Followers</span>
            <Users className="w-4 h-4 text-zinc-950" />
          </div>
          <div className="font-syne text-3xl font-extrabold text-zinc-950">{seller.followerCount}</div>
          <div className="text-[11px] text-zinc-500 font-sans">Active Davao buyers</div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-none p-5 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em]">Active Pieces</span>
            <Tag className="w-4 h-4 text-zinc-950" />
          </div>
          <div className="font-syne text-3xl font-extrabold text-zinc-950">{inventoryList.length}</div>
          <div className="text-[11px] text-zinc-500 font-sans">Available in catalog</div>
        </div>
      </div>

      {/* Tabs Bar (Clean Text Links with Active Hairline Underline) */}
      <div className="flex items-center gap-6 border-b border-zinc-200 font-mono">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-3 text-xs uppercase font-bold tracking-[0.2em] transition-all border-b-2 -mb-px ${
            activeTab === 'overview'
              ? 'border-zinc-950 text-zinc-950'
              : 'border-transparent text-zinc-500 hover:text-zinc-950'
          }`}
        >
          INVENTORY MANAGER
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`py-3 text-xs uppercase font-bold tracking-[0.2em] transition-all border-b-2 -mb-px ${
            activeTab === 'inventory'
              ? 'border-zinc-950 text-zinc-950'
              : 'border-transparent text-zinc-500 hover:text-zinc-950'
          }`}
        >
          ADD NEW PIECE
        </button>
      </div>

      {/* Success Toast */}
      {isSuccessToast && (
        <div className="bg-zinc-950 text-white p-4 rounded-none font-mono text-xs flex items-center gap-2 shadow-lg border border-zinc-800">
          <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
          <span>New product successfully added to your Davao storefront catalog!</span>
        </div>
      )}

      {/* Inventory Manager */}
      {activeTab === 'overview' && (
        <div className="bg-white border border-zinc-200 rounded-none p-6 space-y-4 font-mono">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">
              Manage Catalog Items ({inventoryList.length})
            </h3>
            <span className="text-[11px] text-zinc-500 font-sans">
              Click status to cycle: Available &rarr; Reserved &rarr; Sold Out
            </span>
          </div>

          <div className="divide-y divide-zinc-100">
            {inventoryList.map((item) => (
              <div
                key={item.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    className="w-12 h-12 rounded-none object-cover border border-zinc-200 shrink-0"
                  />
                  <div>
                    <h4 className="font-syne font-bold text-xs text-zinc-950 uppercase">{item.name}</h4>
                    <div className="text-[11px] text-zinc-500">
                      ₱{item.price.toLocaleString()} • Size {item.size} • {item.isOneOfOne ? '1-of-1' : 'Standard Stock'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-zinc-400">
                    {item.saveCount} saves
                  </span>
                  <button
                    onClick={() => handleToggleStatus(item.id)}
                    className={`px-4 py-1.5 rounded-none text-xs font-bold uppercase tracking-wider transition-all border ${
                      item.status === 'Available'
                        ? 'bg-zinc-950 text-white border-zinc-950'
                        : item.status === 'Reserved'
                        ? 'bg-zinc-200 text-zinc-950 border-zinc-300'
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
          className="bg-white border border-zinc-200 rounded-none p-6 sm:p-8 max-w-2xl space-y-6 font-mono"
        >
          <h3 className="font-syne text-base font-bold uppercase tracking-tight text-zinc-950 border-b border-zinc-200 pb-3">
            Add New Fashion Piece to Storefront
          </h3>

          <div className="space-y-1.5">
            <label className="block text-[11px] uppercase font-bold text-zinc-500 tracking-wider">
              Item Title / Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Vintage 1994 Carhartt Detroit Jacket"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-none px-4 py-3 text-xs text-zinc-950 focus:outline-none focus:border-zinc-950 font-sans"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] uppercase font-bold text-zinc-500 tracking-wider">
                Price (PHP ₱) *
              </label>
              <input
                type="number"
                required
                placeholder="e.g. 1250"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-none px-4 py-3 text-xs text-zinc-950 focus:outline-none focus:border-zinc-950"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] uppercase font-bold text-zinc-500 tracking-wider">
                Size
              </label>
              <select
                value={newSize}
                onChange={(e) => setNewSize(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-none px-4 py-3 text-xs text-zinc-950 focus:outline-none focus:border-zinc-950"
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
            <div className="space-y-1.5">
              <label className="block text-[11px] uppercase font-bold text-zinc-500 tracking-wider">
                Category
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-none px-4 py-3 text-xs text-zinc-950 focus:outline-none focus:border-zinc-950"
              >
                <option value="Outerwear">Outerwear</option>
                <option value="Streetwear">Streetwear</option>
                <option value="Denim">Denim</option>
                <option value="Tops">Tops</option>
                <option value="Pants">Pants</option>
                <option value="Accessories">Accessories</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] uppercase font-bold text-zinc-500 tracking-wider">
                Inventory Type
              </label>
              <button
                type="button"
                onClick={() => setIsOneOfOne(!isOneOfOne)}
                className={`w-full py-3 px-4 rounded-none text-xs font-bold uppercase tracking-wider transition-all border ${
                  isOneOfOne
                    ? 'bg-zinc-950 text-white border-zinc-950'
                    : 'bg-zinc-100 text-zinc-950 border-zinc-200'
                }`}
              >
                {isOneOfOne ? '1-of-1 Thrift Piece' : 'Standard Stock'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-zinc-950 hover:bg-zinc-800 text-white rounded-none text-xs font-bold uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Publish Piece to Davao Storefront</span>
          </button>
        </form>
      )}
    </div>
  );
};
