/**
 * Image Optimization Utility
 * 
 * This utility provides helpers for lazy loading images and generating
 * responsive image sources for better performance.
 */

interface ImageLoaderProps {
    src: string;
    alt: string;
    className?: string;
    width?: number;
    height?: number;
    loading?: 'lazy' | 'eager';
    onLoad?: () => void;
    onError?: () => void;
}

/**
 * Lazy-loaded image component with loading state
 */
export function LazyImage({
    src,
    alt,
    className = '',
    width,
    height,
    loading = 'lazy',
    onLoad,
    onError
}: ImageLoaderProps) {
    const imgProps: any = {
        src,
        alt,
        className,
        loading,
        onLoad,
        onError
    };

    if (width) imgProps.width = width;
    if (height) imgProps.height = height;

    return <img { ...imgProps } />;
}

/**
 * Generate srcset for responsive images
 * Useful for serving different image sizes based on device
 */
export function generateSrcSet(baseUrl: string, sizes: number[]): string {
    return sizes
        .map(size => `${baseUrl}?w=${size} ${size}w`)
        .join(', ');
}

/**
 * Get optimized image URL from Vercel Image Optimization
 * Automatically converts to WebP and resizes
 */
export function getOptimizedImageUrl(
    src: string,
    options: {
        width?: number;
        quality?: number;
        format?: 'webp' | 'avif' | 'auto';
    } = {}
): string {
    const { width, quality = 75, format = 'auto' } = options;

    // If using Vercel, leverage their Image Optimization API
    const params = new URLSearchParams();

    if (width) params.set('w', width.toString());
    params.set('q', quality.toString());
    if (format !== 'auto') params.set('fm', format);

    return `/_vercel/image?url=${encodeURIComponent(src)}&${params.toString()}`;
}

/**
 * Preload critical images for better LCP (Largest Contentful Paint)
 */
export function preloadImage(src: string, as: 'image' = 'image') {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = as;
    link.href = src;
    document.head.appendChild(link);
}

/**
 * Check if WebP is supported in the browser
 */
export function supportsWebP(): Promise<boolean> {
    return new Promise((resolve) => {
        const webP = new Image();
        webP.onload = webP.onerror = () => {
            resolve(webP.height === 2);
        };
        webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
}

/**
 * Intersection Observer for lazy loading images
 * More efficient than native lazy loading for complex scenarios
 */
export class ImageObserver {
    private observer: IntersectionObserver;

    constructor(callback: (entry: IntersectionObserverEntry) => void) {
        this.observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        callback(entry);
                        this.observer.unobserve(entry.target);
                    }
                });
            },
            {
                rootMargin: '50px', // Start loading 50px before entering viewport
                threshold: 0.01
            }
        );
    }

    observe(element: Element) {
        this.observer.observe(element);
    }

    disconnect() {
        this.observer.disconnect();
    }
}

/**
 * Convert image URL to WebP if supported
 */
export async function getWebPUrl(originalUrl: string): Promise<string> {
    const isWebPSupported = await supportsWebP();

    if (!isWebPSupported) {
        return originalUrl;
    }

    // If using a CDN or image service, append WebP format
    // This is a simple example - adjust based on your image hosting
    if (originalUrl.includes('?')) {
        return `${originalUrl}&format=webp`;
    }

    return `${originalUrl}?format=webp`;
}

/**
 * Placeholder blur data URL generator
 * Creates a tiny blurred version for better perceived performance
 */
export function generatePlaceholder(width: number = 10, height: number = 10): string {
    // Simple gray placeholder - in production, generate from actual image
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (ctx) {
        ctx.fillStyle = '#1a1d35';
        ctx.fillRect(0, 0, width, height);
    }

    return canvas.toDataURL();
}

/**
 * Image compression utility for user uploads
 */
export async function compressImage(
    file: File,
    maxWidth: number = 1920,
    quality: number = 0.8
): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const img = new Image();

            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Resize if needed
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Could not get canvas context'));
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Could not compress image'));
                        }
                    },
                    'image/jpeg',
                    quality
                );
            };

            img.onerror = () => reject(new Error('Could not load image'));
            img.src = e.target?.result as string;
        };

        reader.onerror = () => reject(new Error('Could not read file'));
        reader.readAsDataURL(file);
    });
}
