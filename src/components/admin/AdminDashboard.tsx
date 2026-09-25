import React, { useState } from 'react';
import {
  BadgeCheck,
  Ban,
  CheckCircle2,
  Eye,
  EyeOff,
  Flag,
  LogOut,
  MapPin,
  Phone,
  Mail,
  RotateCcw,
  ShieldCheck,
  Store,
  Trash2,
  Users,
  X,
  XCircle,
  Clock,
  Tag,
} from 'lucide-react';
import type { AdminAccount, ApprovedVerificationLevel, SellerAccount } from '../../types/auth';
import type { Product, ProductReport, Seller, VerificationStatus } from '../../types/fashion';
import { authService } from '../../services/authService';
import { catalogService } from '../../services/catalogService';
import { AUTOMATED_CHECK_LABELS } from '../../services/idVerificationService';
import { useCatalogVersion } from '../../hooks/useCatalogVersion';
import { Alert, Button, Field, inputClass, Segmented } from '../common/FormControls';

interface AdminDashboardProps {
  admin: AdminAccount;
  onSignOut: () => void;
  onViewSeller: (sellerId: string) => void;
  onSelectProduct: (product: Product) => void;
}

type AdminTab = 'applications' | 'sellers' | 'catalog' | 'reports';

const REPORT_REASON_LABELS: Record<ProductReport['reason'], string> = {
  counterfeit: 'Fake or replica',
  scam: 'Payment outside rules',
  'wrong-photos': 'Photos do not match',
  prohibited: 'Prohibited item',
  other: 'Other',
};
type ApplicationFilter = 'pending' | 'approved' | 'rejected' | 'all';

const VERIFICATION_LEVELS: VerificationStatus[] = ['Verified Business', 'Local Seller', 'Community Creator'];

const STATUS_STYLES: Record<SellerAccount['status'], string> = {
  pending: 'bg-amber-100 text-amber-900 border-amber-200',
  approved: 'bg-emerald-100 text-emerald-900 border-emerald-200',
  rejected: 'bg-red-100 text-red-900 border-red-200',
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  admin,
  onSignOut,
  onViewSeller,
  onSelectProduct,
}) => {
  // Subscribing re-renders this view on every catalog change; the reads below are cheap
  // localStorage lookups, so they run per render instead of through memo caches.
  useCatalogVersion();
  const [, setTick] = useState(0);
  const [tab, setTab] = useState<AdminTab>('applications');
  const [filter, setFilter] = useState<ApplicationFilter>('pending');
  const [lightbox, setLightbox] = useState<{ src: string; label: string } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const refresh = (message?: string) => {
    setTick((t) => t + 1);
    if (message) {
      setNotice(message);
      window.setTimeout(() => setNotice(null), 3500);
    }
  };

  const applications = authService.listSellerApplications();
  const allSellers = catalogService.getAllSellers();
  const allProducts = catalogService.getAllProducts();
  const suspended = new Set(catalogService.getSuspendedSellerIds());
  const hidden = new Set(catalogService.getHiddenProductIds());
  const reports = catalogService.getReports();
  const openReportCount = reports.filter((r) => r.status === 'open').length;

  const pendingCount = applications.filter((a) => a.status === 'pending').length;
  const activeSellerCount = allSellers.filter((s) => !suspended.has(s.id)).length;
  const livePieceCount = allProducts.filter((p) => !hidden.has(p.id) && !suspended.has(p.sellerId)).length;

  const filteredApplications = applications.filter((a) => filter === 'all' || a.status === filter);

  const runAction = (action: () => void, message: string) => {
    setErrorNotice(null);
    try {
      action();
      refresh(message);
    } catch (err) {
      setErrorNotice(err instanceof Error ? err.message : 'Action failed.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 font-sans space-y-4 sm:space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 text-white p-5 sm:p-8 lg:p-12 rounded-2xl sm:rounded-3xl border border-zinc-800/80 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
        <div className="space-y-2 sm:space-y-3 min-w-0">
          <div className="font-avantgarde text-[10px] sm:text-[11px] tracking-widest uppercase text-zinc-400 font-semibold flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>PLATFORM ADMIN</span>
          </div>
          <h1 className="font-cooper text-2xl sm:text-3xl lg:text-5xl font-bold tracking-tight leading-tight">
            Habi Control Room
          </h1>
          <p className="text-zinc-300 text-xs sm:text-sm lg:text-base max-w-xl leading-relaxed">
            Signed in as {admin.name}. Verify seller IDs, approve storefronts, and moderate what appears in the public catalog.
          </p>
        </div>
        <Button type="button" variant="ghost-dark" onClick={onSignOut} className="shrink-0 self-start md:self-auto">
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </Button>
      </div>

      {/* Overview tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatTile label="Pending Reviews" value={pendingCount} icon={Clock} accent={pendingCount > 0} />
        <StatTile label="Open Reports" value={openReportCount} icon={Flag} accent={openReportCount > 0} />
        <StatTile label="Active Sellers" value={activeSellerCount} icon={Users} />
        <StatTile label="Live Pieces" value={livePieceCount} icon={Tag} />
        <StatTile label="Suspended" value={suspended.size} icon={Ban} />
      </div>

      <Segmented
        value={tab}
        onChange={setTab}
        className="sm:w-fit"
        options={[
          { id: 'applications', label: pendingCount > 0 ? `Applications (${pendingCount})` : 'Applications' },
          { id: 'reports', label: openReportCount > 0 ? `Reports (${openReportCount})` : 'Reports' },
          { id: 'sellers', label: 'Sellers' },
          { id: 'catalog', label: 'Catalog' },
        ]}
      />

      {/* Reports */}
      {tab === 'reports' && (
        <div className="bg-white border border-zinc-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Listing reports ({reports.length})</h2>
          </div>
          {reports.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <Flag className="w-7 h-7 text-zinc-300 mx-auto" />
              <div className="font-cooper text-base font-bold text-zinc-900">No reports</div>
              <p className="text-xs text-zinc-500">Buyers can flag counterfeit, scam, or mismatched listings from any piece.</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {reports.map((report) => {
                const product = catalogService.getProductById(report.productId);
                const isHidden = hidden.has(report.productId) || (!product ? true : false);
                return (
                  <div key={report.id} className="py-3.5 sm:py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {product ? (
                        <img src={product.images[0]} alt={product.name} className={`w-12 h-12 rounded-xl object-cover border border-zinc-200 shrink-0 ${isHidden ? 'grayscale opacity-60' : ''}`} />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-zinc-100 border border-zinc-200 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-cooper font-bold text-sm text-zinc-950 truncate">{report.productName}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                            report.status === 'open' ? 'bg-amber-100 text-amber-900 border-amber-200' : report.status === 'actioned' ? 'bg-emerald-100 text-emerald-900 border-emerald-200' : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                          }`}>
                            {report.status}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-800 border border-red-200">
                            {REPORT_REASON_LABELS[report.reason]}
                          </span>
                        </div>
                        <div className="text-[11px] text-zinc-500 truncate">
                          {new Date(report.createdAt).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                          {product ? ` • ${product.sellerName}` : ' • piece no longer listed'}
                          {report.note ? ` • "${report.note}"` : ''}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {product && (
                        <button
                          type="button"
                          onClick={() => onSelectProduct(product)}
                          className="px-3 py-1.5 rounded-full text-[11px] font-semibold bg-zinc-100 text-zinc-900 hover:bg-zinc-200 flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                      )}
                      {report.status === 'open' && product && !isHidden && (
                        <button
                          type="button"
                          onClick={() =>
                            runAction(() => {
                              catalogService.removeProduct(report.productId);
                              catalogService.setReportStatus(report.id, 'actioned');
                            }, `${report.productName} removed from the catalog.`)
                          }
                          className="px-3 py-1.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-800 border border-red-200 hover:bg-red-100 flex items-center gap-1"
                        >
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Remove piece</span>
                        </button>
                      )}
                      {report.status === 'open' && (
                        <button
                          type="button"
                          onClick={() => runAction(() => catalogService.setReportStatus(report.id, 'dismissed'), 'Report dismissed.')}
                          className="px-3 py-1.5 rounded-full text-[11px] font-semibold bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                        >
                          Dismiss
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {notice && <Alert tone="success">{notice}</Alert>}
      {errorNotice && <Alert tone="error">{errorNotice}</Alert>}

      {/* Applications */}
      {tab === 'applications' && (
        <div className="space-y-4">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
            {(['pending', 'approved', 'rejected', 'all'] as ApplicationFilter[]).map((option) => {
              const count = option === 'all' ? applications.length : applications.filter((a) => a.status === option).length;
              const isActive = filter === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setFilter(option)}
                  className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${
                    isActive ? 'bg-zinc-950 text-white shadow-sm' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200/70'
                  }`}
                >
                  {option} ({count})
                </button>
              );
            })}
          </div>

          {filteredApplications.length === 0 ? (
            <div className="p-6 sm:p-12 bg-white border border-zinc-200/80 rounded-2xl sm:rounded-3xl text-center space-y-2 shadow-sm">
              <CheckCircle2 className="w-8 h-8 text-zinc-300 mx-auto" />
              <div className="font-cooper text-base sm:text-lg font-bold text-zinc-900">No {filter === 'all' ? '' : filter} applications</div>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Seller sign-ups with an uploaded ID appear here for manual verification.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                  admin={admin}
                  onOpenImage={(src, label) => setLightbox({ src, label })}
                  onViewSeller={onViewSeller}
                  onAction={runAction}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sellers */}
      {tab === 'sellers' && (
        <div className="bg-white border border-zinc-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">All sellers ({allSellers.length})</h2>
          </div>
          <div className="divide-y divide-zinc-100">
            {allSellers.map((seller) => {
              const isSuspended = suspended.has(seller.id);
              const productCount = allProducts.filter((p) => p.sellerId === seller.id).length;
              const linkedAccount = authService.findSellerAccountByProfileId(seller.id);
              return (
                <div key={seller.id} className="py-3.5 sm:py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <img src={seller.logoUrl} alt={seller.name} className={`w-11 h-11 rounded-full object-cover border border-zinc-200 shrink-0 ${isSuspended ? 'grayscale opacity-60' : ''}`} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-cooper font-bold text-sm text-zinc-950 truncate">{seller.name}</span>
                        {isSuspended && <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 text-red-800 border border-red-200">Suspended</span>}
                        {linkedAccount && <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-100 text-zinc-600 border border-zinc-200">Registered</span>}
                      </div>
                      <div className="text-[11px] text-zinc-500 truncate">
                        @{seller.handle} • {seller.location.district}, {seller.location.city} • {productCount} pieces
                        {linkedAccount ? ` • ${linkedAccount.email}` : ''}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <select
                      value={seller.verificationStatus}
                      onChange={(e) => runAction(() => catalogService.setSellerVerification(seller.id, e.target.value as VerificationStatus), `${seller.name} badge updated.`)}
                      aria-label={`Verification level for ${seller.name}`}
                      className="bg-zinc-50 border border-zinc-200 rounded-full px-3 py-1.5 text-[11px] font-semibold text-zinc-900 focus:outline-none"
                    >
                      {VERIFICATION_LEVELS.map((level) => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => onViewSeller(seller.id)}
                      className="px-3 py-1.5 rounded-full text-[11px] font-semibold bg-zinc-100 text-zinc-900 hover:bg-zinc-200 flex items-center gap-1"
                    >
                      <Store className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        runAction(
                          () => catalogService.setSellerSuspended(seller.id, !isSuspended),
                          isSuspended ? `${seller.name} reinstated.` : `${seller.name} suspended and hidden from buyers.`
                        )
                      }
                      className={`px-3 py-1.5 rounded-full text-[11px] font-semibold flex items-center gap-1 border ${
                        isSuspended ? 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100' : 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100'
                      }`}
                    >
                      {isSuspended ? <RotateCcw className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                      <span>{isSuspended ? 'Reinstate' : 'Suspend'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Catalog */}
      {tab === 'catalog' && (
        <div className="bg-white border border-zinc-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-3 border-b border-zinc-100">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">All pieces ({allProducts.length})</h2>
            <span className="text-[11px] text-zinc-500">Removing a seller-listed piece deletes it. Bundled demo pieces are hidden and can be restored.</span>
          </div>
          <div className="divide-y divide-zinc-100">
            {allProducts.map((product) => {
              const isHidden = hidden.has(product.id);
              const sellerSuspended = suspended.has(product.sellerId);
              const isCustom = catalogService.isCustomProduct(product.id);
              return (
                <div key={product.id} className="py-3.5 sm:py-4 flex items-center gap-3 sm:gap-4">
                  <img src={product.images[0]} alt={product.name} className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover border border-zinc-200 shrink-0 ${isHidden || sellerSuspended ? 'grayscale opacity-60' : ''}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-cooper font-bold text-sm text-zinc-950 truncate">{product.name}</span>
                      {isHidden && <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-200 text-zinc-700">Hidden</span>}
                      {sellerSuspended && <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 text-red-800">Seller suspended</span>}
                      {isCustom && <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-100 text-zinc-600 border border-zinc-200">Seller listed</span>}
                    </div>
                    <div className="text-[11px] text-zinc-500 truncate">
                      ₱{product.price.toLocaleString()} • {product.sellerName} • {product.category} • {product.status}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => onSelectProduct(product)}
                      aria-label={`View ${product.name}`}
                      className="w-8 h-8 rounded-full bg-zinc-100 text-zinc-900 hover:bg-zinc-200 flex items-center justify-center"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    {isHidden ? (
                      <button
                        type="button"
                        onClick={() => runAction(() => catalogService.restoreProduct(product.id), `${product.name} restored.`)}
                        aria-label={`Restore ${product.name}`}
                        className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100 flex items-center justify-center"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => runAction(() => catalogService.removeProduct(product.id), isCustom ? `${product.name} deleted.` : `${product.name} hidden from buyers.`)}
                        aria-label={`Remove ${product.name}`}
                        className="w-8 h-8 rounded-full bg-red-50 text-red-800 border border-red-200 hover:bg-red-100 flex items-center justify-center"
                      >
                        {isCustom ? <Trash2 className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ID image lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button
            type="button"
            onClick={() => setLightbox(null)}
            aria-label="Close"
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/95 text-zinc-950 flex items-center justify-center shadow-md"
          >
            <X className="w-5 h-5" />
          </button>
          <figure className="max-w-3xl w-full space-y-2" onClick={(e) => e.stopPropagation()}>
            <img src={lightbox.src} alt={lightbox.label} className="w-full max-h-[80vh] object-contain rounded-xl" />
            <figcaption className="text-center text-xs text-zinc-300">{lightbox.label}</figcaption>
          </figure>
        </div>
      )}
    </div>
  );
};

// Sub components --------------------------------------------------------------

const StatTile: React.FC<{ label: string; value: number; icon: React.ComponentType<{ className?: string }>; accent?: boolean }> = ({ label, value, icon: Icon, accent }) => (
  <div className={`border rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-2 sm:space-y-3 shadow-sm ${accent ? 'bg-zinc-950 text-white border-zinc-900' : 'bg-white border-zinc-200/80'}`}>
    <div className={`flex items-center justify-between ${accent ? 'text-zinc-400' : 'text-zinc-500'}`}>
      <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider">{label}</span>
      <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${accent ? 'bg-white/10 text-white' : 'bg-zinc-100 text-zinc-950'}`}>
        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </div>
    </div>
    <div className="font-cooper text-2xl sm:text-3xl font-bold">{value.toLocaleString()}</div>
  </div>
);

interface ApplicationCardProps {
  application: SellerAccount;
  admin: AdminAccount;
  onOpenImage: (src: string, label: string) => void;
  onViewSeller: (sellerId: string) => void;
  onAction: (action: () => void, message: string) => void;
}

const ApplicationCard: React.FC<ApplicationCardProps> = ({ application, admin, onOpenImage, onViewSeller, onAction }) => {
  const [level, setLevel] = useState<ApprovedVerificationLevel>(
    application.verification.permitImageDataUrl ? 'Verified Business' : 'Local Seller'
  );
  const [note, setNote] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const { verification } = application;

  const submittedOn = new Date(verification.submittedAt).toLocaleString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  const approve = () =>
    onAction(
      () => authService.approveSeller(application.id, admin, level, note.trim()),
      `${application.businessName} approved as ${level}.`
    );

  const reject = () => {
    if (note.trim().length < 5) return;
    onAction(
      () => authService.rejectSeller(application.id, admin, note.trim()),
      `${application.businessName} rejected. The seller can resubmit their ID.`
    );
    setIsRejecting(false);
  };

  const sellerProfile: Seller | undefined = catalogService.getSellerById(application.sellerProfileId);

  return (
    <div className="bg-white border border-zinc-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm space-y-4">
      {/* Top row */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-cooper text-lg sm:text-xl font-bold text-zinc-950 truncate">{application.businessName}</h3>
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize border ${STATUS_STYLES[application.status]}`}>
              {application.status}
            </span>
          </div>
          <div className="text-xs text-zinc-500 mt-0.5">
            @{application.handle} • {application.sellerType === 'physical-store' ? 'Physical store' : 'Online creator'} • Submitted {submittedOn}
          </div>
        </div>
        {application.status === 'approved' && sellerProfile && (
          <button type="button" onClick={() => onViewSeller(sellerProfile.id)} className="shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-semibold bg-zinc-100 text-zinc-900 hover:bg-zinc-200 flex items-center gap-1.5 self-start">
            <Store className="w-3.5 h-3.5" />
            <span>Open storefront</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Applicant details */}
        <div className="lg:col-span-7 space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
            <Detail label="Owner" value={application.ownerName} />
            <Detail label="Location" value={`${application.district}, ${application.city}`} icon={MapPin} />
            <Detail label="Email" value={application.email} icon={Mail} />
            <Detail label="Mobile" value={application.phone} icon={Phone} />
            {application.address && <Detail label="Address" value={application.address} />}
            {(application.instagram || application.facebook) && (
              <Detail label="Socials" value={[application.instagram, application.facebook].filter(Boolean).join('  ')} />
            )}
          </div>
          <p className="text-zinc-600 leading-relaxed bg-zinc-50 border border-zinc-200/70 rounded-xl p-3">{application.description}</p>

          <div className="border border-zinc-200/80 rounded-xl p-3 space-y-2">
            <div className="text-[11px] font-avantgarde font-bold tracking-wider uppercase text-zinc-500 flex items-center gap-1.5">
              <BadgeCheck className="w-3.5 h-3.5 text-zinc-950" />
              <span>Identity document</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
              <Detail label="ID type" value={verification.idTypeLabel} />
              <Detail label="ID number" value={verification.idNumber} mono />
              <Detail label="Name on ID" value={verification.fullNameOnId} />
              {verification.birthDate && <Detail label="Birth date on ID" value={verification.birthDate} />}
            </div>
            {verification.fullNameOnId.trim().toLowerCase() !== application.ownerName.trim().toLowerCase() && (
              <div className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">
                Name on ID differs from the owner name entered. Check the photo before approving.
              </div>
            )}
            {verification.automatedCheck && (
              <div
                className={`text-[11px] rounded-lg px-2.5 py-1.5 border ${
                  verification.automatedCheck.status === 'verified'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : verification.automatedCheck.status === 'not_matched'
                    ? 'bg-red-50 border-red-200 text-red-900'
                    : 'bg-zinc-50 border-zinc-200 text-zinc-600'
                }`}
              >
                <span className="font-semibold">{AUTOMATED_CHECK_LABELS[verification.automatedCheck.status]}</span>
                {verification.automatedCheck.reference ? ` (ref ${verification.automatedCheck.reference})` : ''}
                {' · '}
                {verification.automatedCheck.message}
              </div>
            )}
          </div>

          {application.review && (
            <div className="text-[11px] text-zinc-500">
              {application.review.decision === 'approved' ? 'Approved' : 'Rejected'} by {application.review.reviewedBy} on{' '}
              {new Date(application.review.reviewedAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
              {application.review.note ? ` with note: "${application.review.note}"` : ''}
            </div>
          )}
        </div>

        {/* ID images */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onOpenImage(verification.idImageDataUrl, `${verification.idTypeLabel} of ${verification.fullNameOnId}`)}
            className="group text-left space-y-1.5"
          >
            <div className="aspect-[16/10] bg-zinc-100 rounded-xl overflow-hidden border border-zinc-200 relative">
              <img src={verification.idImageDataUrl} alt="Uploaded ID front" className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform" />
              <span className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-full bg-black/60 text-white text-[11px] font-semibold">Tap to enlarge</span>
            </div>
            <div className="text-[11px] font-semibold text-zinc-700">ID front</div>
          </button>
          {verification.permitImageDataUrl ? (
            <button
              type="button"
              onClick={() => onOpenImage(verification.permitImageDataUrl!, `Business permit of ${application.businessName}`)}
              className="group text-left space-y-1.5"
            >
              <div className="aspect-[16/10] bg-zinc-100 rounded-xl overflow-hidden border border-zinc-200 relative">
                <img src={verification.permitImageDataUrl} alt="Uploaded business permit" className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform" />
                <span className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-full bg-black/60 text-white text-[11px] font-semibold">Tap to enlarge</span>
              </div>
              <div className="text-[11px] font-semibold text-zinc-700">Business permit</div>
            </button>
          ) : (
            <div className="space-y-1.5">
              <div className="aspect-[16/10] bg-zinc-50 rounded-xl border border-dashed border-zinc-200 flex items-center justify-center text-[11px] text-zinc-400 text-center px-3">
                No permit uploaded
              </div>
              <div className="text-[11px] font-semibold text-zinc-400">Business permit</div>
            </div>
          )}
        </div>
      </div>

      {/* Decision controls */}
      <div className="pt-3 border-t border-zinc-100 space-y-3">
        {application.status !== 'approved' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Approve as" htmlFor={`level-${application.id}`}>
              <select id={`level-${application.id}`} value={level} onChange={(e) => setLevel(e.target.value as ApprovedVerificationLevel)} className={inputClass}>
                <option value="Local Seller">Local Seller</option>
                <option value="Verified Business">Verified Business (permit checked)</option>
              </select>
            </Field>
            <Field label={isRejecting ? 'Reason for rejection (shown to seller)' : 'Reviewer note (optional)'} htmlFor={`note-${application.id}`}>
              <input id={`note-${application.id}`} type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder={isRejecting ? 'e.g. ID photo is blurry, corners cut off' : 'Internal note'} className={inputClass} />
            </Field>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {application.status !== 'approved' && (
            <Button type="button" onClick={approve} className="flex-1 sm:flex-none whitespace-nowrap">
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve Storefront</span>
            </Button>
          )}
          {application.status !== 'rejected' && !isRejecting && (
            <Button type="button" variant="secondary" onClick={() => setIsRejecting(true)} className="flex-1 sm:flex-none whitespace-nowrap">
              <XCircle className="w-4 h-4" />
              <span>{application.status === 'approved' ? 'Revoke Approval' : 'Reject'}</span>
            </Button>
          )}
          {isRejecting && (
            <>
              {application.status === 'approved' && (
                <div className="w-full">
                  <Field label="Reason (shown to seller)" htmlFor={`revoke-${application.id}`}>
                    <input id={`revoke-${application.id}`} type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Listings violate marketplace rules" className={inputClass} />
                  </Field>
                </div>
              )}
              <Button type="button" variant="danger" onClick={reject} disabled={note.trim().length < 5} className="flex-1 sm:flex-none">
                <XCircle className="w-4 h-4" />
                <span>Confirm {application.status === 'approved' ? 'Revoke' : 'Reject'}</span>
              </Button>
              <Button type="button" variant="secondary" onClick={() => setIsRejecting(false)}>
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const Detail: React.FC<{ label: string; value: string; icon?: React.ComponentType<{ className?: string }>; mono?: boolean }> = ({ label, value, icon: Icon, mono }) => (
  <div className="min-w-0">
    <div className="text-[11px] text-zinc-500 font-medium">{label}</div>
    <div className={`font-semibold text-zinc-900 break-words flex items-start gap-1 ${mono ? 'font-mono text-[11px]' : ''}`}>
      {Icon && <Icon className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />}
      <span>{value}</span>
    </div>
  </div>
);
