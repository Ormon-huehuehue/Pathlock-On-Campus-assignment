/**
 * Performance monitoring utilities for tracking component performance
 * and identifying optimization opportunities
 */

interface PerformanceMetrics {
    componentName: string;
    renderTime: number;
    timestamp: number;
    props?: Record<string, any>;
}

class PerformanceMonitor {
    private metrics: PerformanceMetrics[] = [];
    private renderStartTimes: Map<string, number> = new Map();

    /**
     * Start timing a component render
     */
    startRender(componentName: string, props?: Record<string, any>): void {
        if (process.env.NODE_ENV === 'development') {
            const startTime = performance.now();
            this.renderStartTimes.set(componentName, startTime);
        }
    }

    /**
     * End timing a component render and record metrics
     */
    endRender(componentName: string): void {
        if (process.env.NODE_ENV === 'development') {
            const startTime = this.renderStartTimes.get(componentName);
            if (startTime) {
                const endTime = performance.now();
                const renderTime = endTime - startTime;

                this.metrics.push({
                    componentName,
                    renderTime,
                    timestamp: Date.now()
                });

                // Log slow renders (> 16ms for 60fps)
                if (renderTime > 16) {
                    console.warn(`Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms`);
                }

                this.renderStartTimes.delete(componentName);
            }
        }
    }

    /**
     * Get performance metrics for a specific component
     */
    getMetrics(componentName?: string): PerformanceMetrics[] {
        if (componentName) {
            return this.metrics.filter(metric => metric.componentName === componentName);
        }
        return [...this.metrics];
    }

    /**
     * Get average render time for a component
     */
    getAverageRenderTime(componentName: string): number {
        const componentMetrics = this.getMetrics(componentName);
        if (componentMetrics.length === 0) return 0;

        const totalTime = componentMetrics.reduce((sum, metric) => sum + metric.renderTime, 0);
        return totalTime / componentMetrics.length;
    }

    /**
     * Clear all metrics
     */
    clearMetrics(): void {
        this.metrics = [];
        this.renderStartTimes.clear();
    }

    /**
     * Get performance summary
     */
    getSummary(): Record<string, { count: number; averageTime: number; maxTime: number }> {
        const summary: Record<string, { count: number; averageTime: number; maxTime: number }> = {};

        this.metrics.forEach(metric => {
            if (!summary[metric.componentName]) {
                summary[metric.componentName] = {
                    count: 0,
                    averageTime: 0,
                    maxTime: 0
                };
            }

            const componentSummary = summary[metric.componentName];
            componentSummary.count++;
            componentSummary.maxTime = Math.max(componentSummary.maxTime, metric.renderTime);
        });

        // Calculate averages
        Object.keys(summary).forEach(componentName => {
            summary[componentName].averageTime = this.getAverageRenderTime(componentName);
        });

        return summary;
    }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * React hook for monitoring component performance
 */
export function usePerformanceMonitor(componentName: string, props?: Record<string, any>) {
    if (process.env.NODE_ENV === 'development') {
        React.useEffect(() => {
            performanceMonitor.startRender(componentName, props);
            return () => {
                performanceMonitor.endRender(componentName);
            };
        });
    }
}

/**
 * Higher-order component for performance monitoring
 */
export function withPerformanceMonitor<P extends object>(
    WrappedComponent: React.ComponentType<P>,
    componentName?: string
): React.ComponentType<P> {
    const displayName = componentName || WrappedComponent.displayName || WrappedComponent.name || 'Component';

    const WithPerformanceMonitor = React.memo<P>((props: P) => {
        usePerformanceMonitor(displayName, props);
        return React.createElement(WrappedComponent, props);
    });

    WithPerformanceMonitor.displayName = `withPerformanceMonitor(${displayName})`;

    return WithPerformanceMonitor;
}

/**
 * Utility to measure animation frame rate
 */
export class AnimationFrameMonitor {
    private frameCount = 0;
    private lastTime = 0;
    private fps = 0;
    private isRunning = false;
    private animationId: number | null = null;

    start(): void {
        if (this.isRunning) return;

        this.isRunning = true;
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.measureFPS();
    }

    stop(): void {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    getFPS(): number {
        return this.fps;
    }

    private measureFPS = (): void => {
        if (!this.isRunning) return;

        const currentTime = performance.now();
        this.frameCount++;

        if (currentTime - this.lastTime >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
            this.frameCount = 0;
            this.lastTime = currentTime;

            // Log if FPS drops below 60
            if (this.fps < 55) {
                console.warn(`Low FPS detected: ${this.fps} fps`);
            }
        }

        this.animationId = requestAnimationFrame(this.measureFPS);
    };
}

/**
 * Debounce utility for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number,
    immediate = false
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;

    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };

        const callNow = immediate && !timeout;

        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(later, wait);

        if (callNow) func(...args);
    };
}

/**
 * Throttle utility for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle: boolean;

    return function executedFunction(...args: Parameters<T>) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Import React for the hook
import React from 'react';