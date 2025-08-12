// Fallback Chart System
// Provides SVG-based charts when Chart.js is not available

class FallbackChart {
    constructor() {
        this.isChartJsAvailable = typeof Chart !== 'undefined';
        this.colors = {
            critical: '#dc3545',
            high: '#fd7e14',
            medium: '#ffc107',
            low: '#28a745'
        };
    }

    createRiskChart(elementId, data) {
        const element = document.getElementById(elementId);
        if (!element) {
            console.warn('Chart element not found:', elementId);
            return;
        }

        if (this.isChartJsAvailable) {
            this.createChartJsChart(element, data);
        } else {
            this.createSVGChart(element, data);
        }
    }

    createChartJsChart(element, data) {
        try {
            const ctx = element.getContext('2d');
            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Critical', 'High', 'Medium', 'Low'],
                    datasets: [{
                        data: [data.critical, data.high, data.medium, data.low],
                        backgroundColor: [
                            this.colors.critical,
                            this.colors.high,
                            this.colors.medium,
                            this.colors.low
                        ],
                        borderWidth: 2,
                        borderColor: '#fff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: '#f0f6fc',
                                font: { size: 14 }
                            }
                        },
                        title: {
                            display: true,
                            text: 'Risk Distribution',
                            color: '#f0f6fc',
                            font: { size: 16 }
                        }
                    }
                }
            });
        } catch (error) {
            console.warn('Chart.js failed, falling back to SVG:', error);
            this.createSVGChart(element, data);
        }
    }

    createSVGChart(element, data) {
        const total = data.critical + data.high + data.medium + data.low;
        
        if (total === 0) {
            element.innerHTML = `
                <div style="text-align: center; color: #8b949e; padding: 40px;">
                    <i class="bi bi-pie-chart" style="font-size: 3em; margin-bottom: 16px;"></i>
                    <p>No permissions to display</p>
                </div>
            `;
            return;
        }

        // Calculate percentages and angles
        const percentages = {
            critical: (data.critical / total) * 100,
            high: (data.high / total) * 100,
            medium: (data.medium / total) * 100,
            low: (data.low / total) * 100
        };

        // Create SVG doughnut chart
        const svgSize = 200;
        const centerX = svgSize / 2;
        const centerY = svgSize / 2;
        const radius = 70;
        const innerRadius = 35;

        let svg = `
            <div style="text-align: center; padding: 20px;">
                <h4 style="color: #f0f6fc; margin-bottom: 20px;">Risk Distribution</h4>
                <svg width="${svgSize}" height="${svgSize}" style="margin-bottom: 20px;">
        `;

        let currentAngle = 0;
        const categories = ['critical', 'high', 'medium', 'low'];
        
        categories.forEach(category => {
            if (data[category] > 0) {
                const angle = (data[category] / total) * 360;
                const path = this.createArcPath(centerX, centerY, radius, innerRadius, currentAngle, currentAngle + angle);
                
                svg += `
                    <path d="${path}" 
                          fill="${this.colors[category]}" 
                          stroke="#fff" 
                          stroke-width="2"
                          opacity="0.9">
                        <title>${category.charAt(0).toUpperCase() + category.slice(1)}: ${data[category]} (${percentages[category].toFixed(1)}%)</title>
                    </path>
                `;
                
                currentAngle += angle;
            }
        });

        svg += '</svg>';

        // Add legend
        svg += '<div style="display: flex; justify-content: center; flex-wrap: wrap; gap: 16px;">';
        categories.forEach(category => {
            if (data[category] > 0) {
                svg += `
                    <div style="display: flex; align-items: center; color: #f0f6fc;">
                        <div style="width: 16px; height: 16px; background: ${this.colors[category]}; margin-right: 8px; border-radius: 2px;"></div>
                        <span style="font-size: 14px;">${category.charAt(0).toUpperCase() + category.slice(1)} (${data[category]})</span>
                    </div>
                `;
            }
        });
        svg += '</div></div>';

        element.innerHTML = svg;
    }

    createArcPath(centerX, centerY, radius, innerRadius, startAngle, endAngle) {
        const startAngleRad = (startAngle - 90) * (Math.PI / 180);
        const endAngleRad = (endAngle - 90) * (Math.PI / 180);

        const x1 = centerX + radius * Math.cos(startAngleRad);
        const y1 = centerY + radius * Math.sin(startAngleRad);
        const x2 = centerX + radius * Math.cos(endAngleRad);
        const y2 = centerY + radius * Math.sin(endAngleRad);

        const x3 = centerX + innerRadius * Math.cos(endAngleRad);
        const y3 = centerY + innerRadius * Math.sin(endAngleRad);
        const x4 = centerX + innerRadius * Math.cos(startAngleRad);
        const y4 = centerY + innerRadius * Math.sin(startAngleRad);

        const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

        return [
            "M", x1, y1,
            "A", radius, radius, 0, largeArcFlag, 1, x2, y2,
            "L", x3, y3,
            "A", innerRadius, innerRadius, 0, largeArcFlag, 0, x4, y4,
            "Z"
        ].join(" ");
    }

    // Create simple bar chart as alternative
    createBarChart(elementId, data) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const total = data.critical + data.high + data.medium + data.low;
        if (total === 0) {
            element.innerHTML = '<div style="text-align: center; color: #8b949e;">No data to display</div>';
            return;
        }

        let html = `
            <div style="padding: 20px;">
                <h4 style="color: #f0f6fc; margin-bottom: 20px; text-align: center;">Risk Distribution</h4>
                <div style="max-width: 300px; margin: 0 auto;">
        `;

        const categories = [
            { name: 'Critical', key: 'critical' },
            { name: 'High', key: 'high' },
            { name: 'Medium', key: 'medium' },
            { name: 'Low', key: 'low' }
        ];

        categories.forEach(category => {
            const count = data[category.key];
            const percentage = total > 0 ? (count / total) * 100 : 0;
            
            html += `
                <div style="margin-bottom: 12px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px; color: #f0f6fc; font-size: 14px;">
                        <span>${category.name}</span>
                        <span>${count} (${percentage.toFixed(1)}%)</span>
                    </div>
                    <div style="background: #21262d; height: 20px; border-radius: 10px; overflow: hidden;">
                        <div style="width: ${percentage}%; height: 100%; background: ${this.colors[category.key]}; transition: width 0.3s ease;"></div>
                    </div>
                </div>
            `;
        });

        html += '</div></div>';
        element.innerHTML = html;
    }
}

// Make available globally
if (typeof window !== 'undefined') {
    window.FallbackChart = FallbackChart;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = FallbackChart;
}