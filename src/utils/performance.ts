// Performance monitoring utility
class PerformanceMonitor {
    private metrics: Map<string, number[]> = new Map();

    track(operation: string, duration: number) {
        if (!this.metrics.has(operation)) {
            this.metrics.set(operation, []);
        }
        this.metrics.get(operation)!.push(duration);

        // Keep only last 100 measurements
        const measurements = this.metrics.get(operation)!;
        if (measurements.length > 100) {
            measurements.shift();
        }
    }

    getAverage(operation: string): number {
        const measurements = this.metrics.get(operation);
        if (!measurements || measurements.length === 0) return 0;

        const sum = measurements.reduce((a, b) => a + b, 0);
        return sum / measurements.length;
    }

    getP95(operation: string): number {
        const measurements = this.metrics.get(operation);
        if (!measurements || measurements.length === 0) return 0;

        const sorted = [...measurements].sort((a, b) => a - b);
        const index = Math.floor(sorted.length * 0.95);
        return sorted[index];
    }

    report(): void {
        console.log('📊 Performance Report:');
        this.metrics.forEach((measurements, operation) => {
            const avg = this.getAverage(operation);
            const p95 = this.getP95(operation);
            console.log(`  ${operation}:`);
            console.log(`    Average: ${avg.toFixed(0)}ms`);
            console.log(`    P95: ${p95.toFixed(0)}ms`);
            console.log(`    Samples: ${measurements.length}`);
        });
    }

    clear() {
        this.metrics.clear();
    }
}

export const perfMonitor = new PerformanceMonitor();

// Auto-report every 5 minutes
if (typeof window !== 'undefined') {
    setInterval(() => {
        perfMonitor.report();
    }, 5 * 60 * 1000);
}
