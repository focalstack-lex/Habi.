import React, { useState } from 'react';
import { Bookmark, CheckCircle2, Eye, LogOut, ShieldCheck, Store, Tag, Users } from 'lucide-react';
import type { SellerAccount } from '../../types/auth';
import type { Product, Seller } from '../../types/fashion';
import { catalogService } from '../../services/catalogService';
import { useCatalogVersion } from '../../hooks/useCatalogVersion';
import { Alert, Button, Segmented } from '../common/FormControls';
import { AnalyticsTab } from './dashboard/AnalyticsTab';
import { DropsTab } from './dashboard/DropsTab';
import { InventoryTab } from './dashboard/InventoryTab';
import { PieceForm, type PieceFormMode } from './dashboard/PieceForm';
import { ProfileTab } from './dashboard/ProfileTab';
import { TemplatesTab } from './dashboard/TemplatesTab';

interface SellerDashboardProps {
  account: SellerAccount;
  seller: Seller;
  onViewStorefront: () => void;
  onSignOut: () => void;
}

type DashboardTab = 'inventory' | 'add' | 'drops' | 'templates' | 'analytics' | 'profile';

interface PieceEdit {
  mode: Exclude<PieceFormMode, 'add'>;
  product: Product;
}

const METRIC_WINDOW_DAYS = 7;
const TOAST_MS = 3500;

export const SellerDashboard: React.FC<SellerDashboardProps> = ({
  account,
  seller,
  onViewStorefront,
  onSignOut,
}) => {
  // Subscribing re-renders on catalog changes; the reads below are cheap per-render lookups.
  useCatalogVersion();
  const [tab, setTab] = useState<DashboardTab>('inventory');
  const [pieceEdit, setPieceEdit] = useState<PieceEdit | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const products = catalogService.getCustomProducts().filter((p) => p.sellerId === seller.id);
  const isSuspended = catalogService.isSellerSuspended(seller.id);
  const availableCount = products.filter((p) => p.status === 'Available').length;
  const profileViews = seller.viewCount + catalogService.getSellerViews(seller.id);
  const recordedSaves = products.reduce((sum, product) => {
    const metrics = catalogService.getProductMetrics(product.id, METRIC_WINDOW_DAYS);
    return metrics.isSample ? sum : sum + metrics.totalSaves;
  }, 0);
  const totalSaves = Math.max(0, products.reduce((sum, p) => sum + p.saveCount, 0) + recordedSaves);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), TOAST_MS);
  };

  const runAction = (action: () => void, message: string) => {
    setErrorNotice(null);
    try {
      action();
      showToast(message);
    } catch (err) {
      setErrorNotice(err instanceof Error ? err.message : 'Action failed.');
    }
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  /** Switching tabs from the segmented control always drops an in-progress edit. */
  const openTab = (next: DashboardTab) => {
    setPieceEdit(null);
    setTab(next);
  };

  const startPieceEdit = (mode: PieceEdit['mode'], product: Product) => {
    setPieceEdit({ mode, product });
    setTab('add');
    scrollToTop();
  };

  const closePieceForm = () => {
    setPieceEdit(null);
    setTab('inventory');
    scrollToTop();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 font-sans space-y-4 sm:space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-[#1A2225] text-[#FFF9E9] p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl border border-[#1A2225]/20 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
        <div className="space-y-2 sm:space-y-3 min-w-0">
          <div className="font-avantgarde text-[11px] tracking-wider uppercase text-[#E0DFC8] font-semibold">
            SELLER PORTAL
          </div>
          <h1 className="font-outfit text-2xl sm:text-3xl lg:text-5xl font-bold tracking-tight leading-tight break-words text-[#FFF9E9]">
            {seller.name}
          </h1>
          <p className="text-[#E0DFC8] text-xs sm:text-sm lg:text-base max-w-xl leading-relaxed">
            Hi {account.ownerName.split(' ')[0]}. List pieces, update stock status, and keep your Davao storefront current.
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Button type="button" variant="inverse" onClick={onViewStorefront} className="px-4 py-2">
              <Store className="w-4 h-4" />
              <span>View Storefront</span>
            </Button>
            <Button type="button" variant="ghost-dark" onClick={onSignOut} className="px-4 py-2">
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>

        <div className="bg-[#FFF9E9]/10 backdrop-blur-md border border-[#FFF9E9]/15 p-4 sm:p-5 rounded-2xl text-xs space-y-1.5 shrink-0">
          <div className="text-[11px] sm:text-xs uppercase text-[#E0DFC8] font-semibold tracking-wider">Verification Status</div>
          <div className="font-bold text-[#FFF9E9] flex items-center gap-2 text-sm sm:text-base">
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
            <span>{seller.verificationStatus}</span>
          </div>
          <div className="text-[11px] text-[#E0DFC8]/80">Verified with {account.verification.idTypeLabel}</div>
        </div>
      </div>

      {isSuspended && (
        <Alert tone="error">
          Your seller account is currently suspended. Catalog changes will not appear to buyers until resolved.
        </Alert>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MetricTile label="Store Views" value={profileViews} note="Total impressions" icon={Eye} />
        <MetricTile label="Total Saves" value={totalSaves} note="Across all pieces" icon={Bookmark} />
        <MetricTile label="Followers" value={seller.followerCount} note="Interested buyers" icon={Users} />
        <MetricTile label="Available Pieces" value={availableCount} note={`Of ${products.length} listed`} icon={Tag} />
      </div>

      <Segmented
        value={tab}
        onChange={openTab}
        className="sm:w-fit"
        options={[
          { id: 'inventory', label: `Inventory (${products.length})` },
          { id: 'add', label: 'Add New Piece' },
          { id: 'drops', label: 'Drops' },
          { id: 'templates', label: 'Templates' },
          { id: 'analytics', label: 'Analytics' },
          { id: 'profile', label: 'Profile' },
        ]}
      />

      {toast && (
        <div className="bg-[#1A2225] text-[#FFF9E9] px-4 py-3 rounded-2xl text-xs sm:text-sm font-medium flex items-center gap-3 shadow-lg border border-[#1A2225]/80">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}
      {errorNotice && <Alert tone="error">{errorNotice}</Alert>}

      {tab === 'inventory' && (
        <InventoryTab
          products={products}
          onAddNew={() => openTab('add')}
          onEdit={(product) => startPieceEdit('edit', product)}
          onDuplicate={(product) => startPieceEdit('duplicate', product)}
          runAction={runAction}
        />
      )}

      {tab === 'add' && (
        <PieceForm
          key={pieceEdit ? `${pieceEdit.mode}:${pieceEdit.product.id}` : 'new'}
          seller={seller}
          mode={pieceEdit?.mode ?? 'add'}
          initialProduct={pieceEdit?.product}
          onCancel={pieceEdit ? closePieceForm : undefined}
          onSubmit={(product, patch) => {
            if (pieceEdit?.mode === 'edit') {
              runAction(() => catalogService.updateProduct(product.id, patch), `${product.name} updated.`);
            } else {
              runAction(() => catalogService.addProduct(product), `${product.name} is now live on your storefront.`);
            }
            closePieceForm();
          }}
        />
      )}

      {tab === 'drops' && <DropsTab seller={seller} products={products} runAction={runAction} />}

      {tab === 'templates' && <TemplatesTab seller={seller} products={products} />}

      {tab === 'analytics' && <AnalyticsTab products={products} />}

      {tab === 'profile' && (
        <ProfileTab
          seller={seller}
          onSaved={(updated) =>
            runAction(() => {
              catalogService.upsertSeller(updated);
              catalogService.syncSellerOnProducts(updated);
            }, 'Storefront profile saved.')
          }
        />
      )}
    </div>
  );
};

// Sub components --------------------------------------------------------------

const MetricTile: React.FC<{ label: string; value: number; note: string; icon: React.ComponentType<{ className?: string }> }> = ({ label, value, note, icon: Icon }) => (
  <div className="bg-[#FFF9E9] border border-[#E6DCC0] rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-2 sm:space-y-3 shadow-sm">
    <div className="flex items-center justify-between text-[#55615D]">
      <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider">{label}</span>
      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#F3ECD8] flex items-center justify-center text-[#1A2225]">
        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </div>
    </div>
    <div className="font-outfit text-2xl sm:text-3xl font-bold text-[#1A2225]">{value.toLocaleString()}</div>
    <div className="text-[11px] sm:text-xs text-[#55615D]">{note}</div>
  </div>
);
