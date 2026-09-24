import React from 'react';

interface IconProps {
  className?: string;
}

/**
 * Custom Habi Fashion Icon Set
 * High-precision vector SVG icons tailored for Davao streetwear & luxury local fashion interface.
 */

// 1. Feed / Aperture Compass Icon (Concentric rings + radar crosshairs + directional spark)
export const FeedIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="9" className="opacity-90" />
    <circle cx="12" cy="12" r="4.5" strokeDasharray="2 2" className="opacity-60" />
    <path d="M12 7v2M12 15v2M7 12h2M15 12h2" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
  </svg>
);

// 2. Discover / Prism Spark Icon (4-point luxury diamond spark with satellite orbit dots)
export const DiscoverIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 2L14.2 9.8L22 12L14.2 14.2L12 22L9.8 14.2L2 12L9.8 9.8L12 2Z" />
    <circle cx="19" cy="5" r="1" fill="currentColor" />
    <circle cx="5" cy="19" r="1" fill="currentColor" />
  </svg>
);

// 3. Drops / Flame Capsule Icon (Stylized liquid droplet with inner flame core)
export const DropsIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 2.5C12 2.5 18.5 9 18.5 14.5C18.5 18.0899 15.5899 21 12 21C8.41015 21 5.5 18.0899 5.5 14.5C5.5 9 12 2.5 12 2.5Z" />
    <path d="M12 18.5C10.067 18.5 8.5 16.933 8.5 15C8.5 13 10.5 11 12 9.5C13.5 11 15.5 13 15.5 15C15.5 16.933 13.933 18.5 12 18.5Z" fill="currentColor" className="opacity-30" />
  </svg>
);

// 4. Map / Davao Grid Radar Pin Icon (Square-round pin target with internal coordinates)
export const MapIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 22C16.5 17.5 19 13.8 19 10A7 7 0 1 0 5 10C5 13.8 7.5 17.5 12 22Z" />
    <circle cx="12" cy="10" r="3" />
    <circle cx="12" cy="10" r="1" fill="currentColor" />
  </svg>
);

// 5. Saved / Ribbon Vault Heart Icon (Fashion ribbon tag folded into a heart)
export const SavedIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M19 21L12 16L5 21V5C5 3.89543 5.89543 3 7 3H17C18.1046 3 19 3.89543 19 5V21Z" />
    <path d="M12 7.5L13.2 10.2L16 10.4L13.8 12.2L14.5 15L12 13.5L9.5 15L10.2 12.2L8 10.4L10.8 10.2L12 7.5Z" fill="currentColor" className="opacity-40" />
  </svg>
);

// 6. Dashboard / Studio Hanger Profile Icon (Fashion atelier coat hanger + profile pedestal)
export const DashboardIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 4C13.1046 4 14 4.89543 14 6C14 6.8 13.5 7.4 12.8 7.8L20 12V14H4V12L11.2 7.8C10.5 7.4 10 6.8 10 6C10 4.89543 10.8954 4 12 4Z" />
    <path d="M6 18H18M4 21H20" strokeWidth="1.6" />
  </svg>
);

// 7. Search Lens Icon
export const CustomSearchIcon: React.FC<IconProps> = ({ className = "w-4 h-4" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="11" cy="11" r="7" />
    <path d="M16 16L21 21" strokeWidth="2.2" />
  </svg>
);

// 8. Streetwear 1-of-1 Tag Chip Icon
export const CustomTagIcon: React.FC<IconProps> = ({ className = "w-3.5 h-3.5" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M20.5 11.5L12.5 3.5H4V12L12 20L20.5 11.5Z" />
    <circle cx="7.5" cy="7.5" r="1.5" fill="currentColor" />
  </svg>
);

// 9. Filter Sliders Icon
export const CustomFilterIcon: React.FC<IconProps> = ({ className = "w-3.5 h-3.5" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M4 6H20M4 12H20M4 18H20" />
    <circle cx="8" cy="6" r="2" fill="currentColor" />
    <circle cx="16" cy="12" r="2" fill="currentColor" />
    <circle cx="10" cy="18" r="2" fill="currentColor" />
  </svg>
);

// 10. Storefront Arch Icon
export const CustomStoreIcon: React.FC<IconProps> = ({ className = "w-4 h-4" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 9L4.5 4H19.5L21 9V10C21 11.6569 19.6569 13 18 13C16.3431 13 15 11.6569 15 10C15 11.6569 13.6569 13 12 13C10.3431 13 9 11.6569 9 10C9 11.6569 7.65685 13 6 13C4.34315 13 3 11.6569 3 10V9Z" />
    <path d="M5 13V20H19V13" />
    <path d="M10 20V16H14V20" />
  </svg>
);
