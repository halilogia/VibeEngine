/**
 * VibeIcons - Sovereign SVG Icon System for VibeEngine
 * Custom, lightweight replacement for Lucide-React.
 * Use: <VibeIcon name="Move" size={16} color="currentColor" />
 */

import React from 'react';

export type VibeIconName = 
  | 'Move' | 'Rotate' | 'Scale' 
  | 'Play' | 'Pause' | 'Square' | 'Stop'
  | 'Grid' | 'List' | 'Axis' | 'Maximize' | 'Sparkles' | 'Code' | 'Save'
  | 'Folder' | 'FolderPlus' | 'File' | 'Image' | 'Box' | 'Music' | 'Search' | 'Trash' | 'Upload'
  | 'ChevronRight' | 'ChevronDown' | 'Home' | 'Copy' | 'Plus' | 'Loader'
  | 'Layers' | 'Activity' | 'Cursor' | 'Settings' | 'Sun' | 'Video' | 'Shield' | 'Magnet'
  | 'AlertCircle' | 'AlertTriangle' | 'CheckCircle' | 'Terminal' | 'Eye' | 'X';



interface VibeIconProps extends React.SVGProps<SVGSVGElement> {
    name: VibeIconName;
    size?: number;
    color?: string;
    strokeWidth?: number;
}

export const VibeIcons: React.FC<VibeIconProps> = ({ 
    name, 
    size = 18, 
    color = 'currentColor', 
    strokeWidth = 2,
    ...props 
}) => {
    const renderPath = () => {
        switch (name) {
            case 'Move': return (
                <>
                    <polyline points="5 9 2 12 5 15" />
                    <polyline points="9 5 12 2 15 5" />
                    <polyline points="15 19 12 22 9 19" />
                    <polyline points="19 9 22 12 19 15" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <line x1="12" y1="2" x2="12" y2="22" />
                </>
            );
            case 'Rotate': return (
                <>
                    <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                    <polyline points="21 3 21 8 16 8" />
                </>
            );
            case 'Scale': return (
                <>
                    <path d="M21 16V5a2 2 0 0 0-2-2H8" />
                    <path d="M3 8v11a2 2 0 0 0 2 2h11" />
                    <path d="m21 3-9 9" />
                    <path d="M15 12H9v6" />
                </>
            );
            case 'Play': return <polygon points="5 3 19 12 5 21 5 3" />;
            case 'Pause': return (
                <>
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                </>
            );
            case 'Square':
            case 'Stop': return <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />;
            case 'Grid': return (
                <>
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <line x1="3" y1="9" x2="21" y2="9" />
                    <line x1="3" y1="15" x2="21" y2="15" />
                    <line x1="9" y1="3" x2="9" y2="21" />
                    <line x1="15" y1="3" x2="15" y2="21" />
                </>
            );
            case 'List': return (
                <>
                    <line x1="8" y1="6" x2="21" y2="6" />
                    <line x1="8" y1="12" x2="21" y2="12" />
                    <line x1="8" y1="18" x2="21" y2="18" />
                    <line x1="3" y1="6" x2="3.01" y2="6" />
                    <line x1="3" y1="12" x2="3.01" y2="12" />
                    <line x1="3" y1="18" x2="3.01" y2="18" />
                </>
            );

            case 'Axis': return (
                <>
                    <path d="M21 21H3V3" />
                    <path d="m7 14 14-7" />
                    <path d="m21 21-7-14" />
                </>
            );
            case 'Box': return (
                <>
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                    <line x1="12" y1="22.08" x2="12" y2="12" />
                </>
            );
            case 'Search': return (
                <>
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </>
            );
            case 'Trash': return (
                <>
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                </>
            );
            case 'Save': return (
                <>
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                </>
            );
            case 'Code': return (
                <>
                    <polyline points="16 18 22 12 16 6" />
                    <polyline points="8 6 2 12 8 18" />
                </>
            );
            case 'Music': return (
                <>
                    <path d="M9 18V5l12-2v13" />
                    <circle cx="6" cy="18" r="3" />
                    <circle cx="18" cy="16" r="3" />
                </>
            );

            case 'Sparkles': return (
                <>
                    <path d="m12 3 1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3Z" />
                    <path d="M5 3v4" />
                    <path d="M19 17v4" />
                    <path d="M3 5h4" />
                    <path d="M17 19h4" />
                </>
            );
            case 'ChevronRight': return <polyline points="9 18 15 12 9 6" />;
            case 'ChevronDown': return <polyline points="6 9 12 15 18 9" />;
            case 'Home': return (

                <>
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                </>
            );
            case 'Plus': return (
                <>
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                </>
            );
            case 'Folder': return (
                <>
                    <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z" />
                </>
            );
            case 'FolderPlus': return (
                <>
                    <path d="M12 10v6" />
                    <path d="M9 13h6" />
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </>
            );

            case 'File': return (
                <>
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                </>
            );
            case 'Image': return (
                <>
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                </>
            );
            case 'Loader': return (
                <>
                    <path d="M12 2v4" />
                    <path d="M12 18v4" />
                    <path d="M4.93 4.93l2.83 2.83" />
                    <path d="M16.24 16.24l2.83 2.83" />
                    <path d="M2 12h4" />
                    <path d="M18 12h4" />
                    <path d="M4.93 19.07l2.83-2.83" />
                    <path d="M16.24 7.76l2.83-2.83" />
                </>
            );
            case 'Layers': return (
                <>
                    <polygon points="12 2 2 7 12 12 22 7 12 2" />
                    <polyline points="2 17 12 22 22 17" />
                    <polyline points="2 12 12 17 22 12" />
                </>
            );
            case 'Activity': return <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />;
            case 'Eye': return (
                <>
                    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0Z" />
                    <circle cx="12" cy="12" r="3" />
                </>
            );
            case 'X': return (
                <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                </>
            );
            case 'Sun': return (

                <>
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2" />
                    <path d="M12 20v2" />
                    <path d="m4.93 4.93 1.41 1.41" />
                    <path d="m17.66 17.66 1.41 1.41" />
                    <path d="M2 12h2" />
                    <path d="M20 12h2" />
                    <path d="m6.34 17.66-1.41 1.41" />
                    <path d="m19.07 4.93-1.41 1.41" />
                </>
            );
            case 'Video': return (
                <>
                    <path d="m22 8-6 4 6 4V8Z" />
                    <rect x="2" y="6" width="14" height="12" rx="2" ry="2" />
                </>
            );
            case 'Shield': return <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />;
            case 'Magnet': return (
                <>
                    <path d="M6 10V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v6" />
                    <path d="M6 14a2 2 0 1 1-4 0V7a2 2 0 0 1 2-2h2" />
                    <path d="M14 5h2a2 2 0 0 1 2 2v7a2 2 0 1 1-4 0" />
                </>
            );
            case 'AlertCircle': return (
                <>
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                </>
            );
            case 'AlertTriangle': return (
                <>
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                </>
            );
            case 'CheckCircle': return (
                <>
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                </>
            );
            case 'Terminal': return (
                <>
                    <polyline points="4 17 10 11 4 5" />
                    <line x1="12" y1="19" x2="20" y2="19" />
                </>
            );
            case 'Cursor': return (


                <>
                    <path d="m3 3 7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
                    <path d="m13 13 6 6" />
                </>
            );
            case 'Copy': return (
                <>
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </>
            );
            default: return null;
        }
    };

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            {renderPath()}
        </svg>
    );
};
