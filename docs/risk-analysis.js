// Risk Analysis Engine
class RiskAnalyzer {
    constructor() {
        this.nistData = null;
        this.entraData = null;
        this.analysisResults = null;
        
        this.initializeElements();
        this.loadDataFiles();
    }
    
    initializeElements() {
        this.analysisSection = document.getElementById('analysis-section');
        this.overallScore = document.getElementById('overall-score');
        this.riskLevel = document.getElementById('risk-level');
        this.permissionsList = document.getElementById('permissions-list');
        this.csfCategories = document.getElementById('csf-categories');
        this.riskIndicators = document.getElementById('risk-indicators');
        this.recommendations = document.getElementById('recommendations');
        
        // Buttons
        this.downloadHtmlBtn = document.getElementById('download-html');
        this.downloadJsonBtn = document.getElementById('download-json');
        this.newAnalysisBtn = document.getElementById('new-analysis');
        
        this.initializeEventListeners();
    }
    
    initializeEventListeners() {
        this.downloadHtmlBtn.addEventListener('click', () => this.downloadReport('html'));
        this.downloadJsonBtn.addEventListener('click', () => this.downloadReport('json'));
        this.newAnalysisBtn.addEventListener('click', () => this.resetAnalysis());
    }
    
    async loadDataFiles() {
        try {
            const [nistResponse, entraResponse] = await Promise.all([
                fetch('./data/nist-csf-2.0.json'),
                fetch('./data/entra-permissions.json')
            ]);
            
            this.nistData = await nistResponse.json();
            this.entraData = await entraResponse.json();
            
            console.log('Data files loaded successfully');
        } catch (error) {
            console.error('Error loading data files:', error);
            alert('Error loading risk analysis data. Please refresh the page.');
        }
    }
    
    analyzeContent(content) {
        if (!this.nistData || !this.entraData) {
            alert('Risk analysis data not loaded. Please refresh the page.');
            return;
        }
        
        console.log('Starting risk analysis...');
        
        // Parse content and extract risk indicators
        const detectedPermissions = this.detectPermissions(content);
        const csfMappings = this.mapToCSFCategories(detectedPermissions, content);
        const riskIndicators = this.identifyRiskIndicators(content);
        const recommendations = this.generateRecommendations(detectedPermissions, riskIndicators);
        const overallRisk = this.calculateOverallRisk(detectedPermissions, riskIndicators);
        
        this.analysisResults = {
            detectedPermissions,
            csfMappings,
            riskIndicators,
            recommendations,
            overallRisk,
            timestamp: new Date().toISOString(),
            content: content.substring(0, 1000) + '...' // Truncated for report
        };
        
        this.displayResults();
        this.createRiskChart();
        
        // Notify uploader that analysis is complete
        if (window.fileUploader) {
            window.fileUploader.onAnalysisComplete();
        }
    }
    
    detectPermissions(content) {
        const detectedPermissions = [];
        const contentLower = content.toLowerCase();
        
        // Search for exact permission names
        Object.keys(this.entraData.permissions).forEach(permission => {
            const permissionLower = permission.toLowerCase();
            if (contentLower.includes(permissionLower) || 
                contentLower.includes(permissionLower.replace(/\./g, ' '))) {
                detectedPermissions.push({
                    name: permission,
                    ...this.entraData.permissions[permission],
                    detected: 'exact_match'
                });
            }
        });
        
        // Search for pattern-based permissions (e.g., "read all users", "write directory")
        const permissionPatterns = [
            { pattern: /read.*all.*user/gi, permission: 'User.Read.All' },
            { pattern: /write.*all.*user/gi, permission: 'User.ReadWrite.All' },
            { pattern: /read.*director/gi, permission: 'Directory.Read.All' },
            { pattern: /write.*director/gi, permission: 'Directory.ReadWrite.All' },
            { pattern: /manage.*application/gi, permission: 'Application.ReadWrite.All' },
            { pattern: /read.*application/gi, permission: 'Application.Read.All' },
            { pattern: /manage.*group/gi, permission: 'Group.ReadWrite.All' },
            { pattern: /read.*group/gi, permission: 'Group.Read.All' },
            { pattern: /send.*mail/gi, permission: 'Mail.Send' },
            { pattern: /read.*mail/gi, permission: 'Mail.Read' },
            { pattern: /manage.*role/gi, permission: 'RoleManagement.ReadWrite.All' },
            { pattern: /read.*role/gi, permission: 'RoleManagement.Read.All' },
            { pattern: /manage.*polic/gi, permission: 'Policy.ReadWrite.All' },
            { pattern: /read.*polic/gi, permission: 'Policy.Read.All' },
            { pattern: /read.*file/gi, permission: 'Files.Read.All' },
            { pattern: /write.*file/gi, permission: 'Files.ReadWrite.All' },
            { pattern: /audit.*log/gi, permission: 'AuditLog.Read.All' }
        ];
        
        permissionPatterns.forEach(({ pattern, permission }) => {
            if (pattern.test(content) && 
                !detectedPermissions.find(p => p.name === permission)) {
                if (this.entraData.permissions[permission]) {
                    detectedPermissions.push({
                        name: permission,
                        ...this.entraData.permissions[permission],
                        detected: 'pattern_match'
                    });
                }
            }
        });
        
        return detectedPermissions;
    }
    
    mapToCSFCategories(detectedPermissions, content) {
        const csfMappings = new Set();
        
        // Add CSF categories from detected permissions
        detectedPermissions.forEach(permission => {
            if (permission.csfMapping) {
                permission.csfMapping.forEach(category => csfMappings.add(category));
            }
        });
        
        // Content-based CSF mapping
        const contentLower = content.toLowerCase();
        const csfKeywords = {
            'ID.AM': ['asset', 'inventory', 'catalog', 'management'],
            'ID.RA': ['risk', 'assessment', 'evaluation', 'analysis'],
            'PR.AC': ['access', 'authentication', 'authorization', 'permission'],
            'PR.DS': ['data', 'protection', 'encryption', 'privacy'],
            'PR.AT': ['training', 'awareness', 'education'],
            'PR.IP': ['process', 'procedure', 'policy'],
            'DE.CM': ['monitoring', 'detection', 'surveillance'],
            'DE.AE': ['anomaly', 'event', 'incident'],
            'RS.RP': ['response', 'plan', 'incident'],
            'RS.CO': ['communication', 'notification'],
            'RC.RP': ['recovery', 'backup', 'restore'],
            'GV.RM': ['governance', 'management', 'oversight'],
            'GV.PO': ['policy', 'procedure', 'standard']
        };
        
        Object.keys(csfKeywords).forEach(category => {
            const keywords = csfKeywords[category];
            if (keywords.some(keyword => contentLower.includes(keyword))) {
                csfMappings.add(category);
            }
        });
        
        return Array.from(csfMappings).map(category => {
            const [mainCategory, subCategory] = category.split('.');
            const categoryInfo = this.nistData.categories[mainCategory];
            
            return {
                category,
                name: categoryInfo ? categoryInfo.subcategories[category] || category : category,
                description: categoryInfo ? categoryInfo.description : 'NIST CSF 2.0 Category',
                mainCategory: categoryInfo ? categoryInfo.name : mainCategory
            };
        });
    }
    
    identifyRiskIndicators(content) {
        const riskIndicators = [];
        const contentLower = content.toLowerCase();
        
        // High-risk keywords
        const highRiskPatterns = [
            { pattern: /global.*admin/gi, risk: 'Global Administrator Access', level: 'critical' },
            { pattern: /privileg.*escalat/gi, risk: 'Privilege Escalation Risk', level: 'high' },
            { pattern: /(delete|remove).*all/gi, risk: 'Destructive Operations', level: 'high' },
            { pattern: /unrestricted.*access/gi, risk: 'Unrestricted Access', level: 'high' },
            { pattern: /application.*readwrite.*all/gi, risk: 'Full Application Management', level: 'critical' },
            { pattern: /directory.*readwrite.*all/gi, risk: 'Full Directory Access', level: 'critical' },
            { pattern: /external.*integration/gi, risk: 'External System Integration', level: 'medium' },
            { pattern: /third.*party/gi, risk: 'Third-party Access', level: 'medium' },
            { pattern: /(credential|secret|password).*manage/gi, risk: 'Credential Management', level: 'high' },
            { pattern: /role.*management/gi, risk: 'Role Management Access', level: 'high' }
        ];
        
        highRiskPatterns.forEach(({ pattern, risk, level }) => {
            const matches = content.match(pattern);
            if (matches) {
                riskIndicators.push({
                    indicator: risk,
                    level,
                    evidence: matches[0],
                    description: this.getRiskDescription(risk, level)
                });
            }
        });
        
        // Check for compliance mentions
        const compliancePatterns = [
            { pattern: /gdpr/gi, risk: 'GDPR Compliance Required', level: 'medium' },
            { pattern: /hipaa/gi, risk: 'HIPAA Compliance Required', level: 'high' },
            { pattern: /sox/gi, risk: 'SOX Compliance Required', level: 'medium' },
            { pattern: /pci.*dss/gi, risk: 'PCI DSS Compliance Required', level: 'high' }
        ];
        
        compliancePatterns.forEach(({ pattern, risk, level }) => {
            if (pattern.test(contentLower)) {
                riskIndicators.push({
                    indicator: risk,
                    level,
                    description: 'Compliance requirements may increase security obligations'
                });
            }
        });
        
        return riskIndicators;
    }
    
    getRiskDescription(risk, level) {
        const descriptions = {
            'Global Administrator Access': 'Highest level of access with potential for significant damage',
            'Privilege Escalation Risk': 'Ability to gain higher privileges than initially granted',
            'Destructive Operations': 'Operations that can permanently delete or modify data',
            'Unrestricted Access': 'Access without proper limitations or controls',
            'Full Application Management': 'Complete control over application configurations',
            'Full Directory Access': 'Complete access to organizational directory',
            'External System Integration': 'Integration with systems outside organizational control',
            'Third-party Access': 'Access granted to external parties',
            'Credential Management': 'Ability to manage authentication credentials',
            'Role Management Access': 'Ability to assign and modify user roles'
        };
        
        return descriptions[risk] || 'Potential security risk requiring attention';
    }
    
    generateRecommendations(detectedPermissions, riskIndicators) {
        const recommendations = [];
        
        // Permission-based recommendations
        const highRiskPerms = detectedPermissions.filter(p => 
            p.riskLevel === 'high' || p.riskLevel === 'critical'
        );
        
        if (highRiskPerms.length > 0) {
            recommendations.push({
                title: 'Review High-Risk Permissions',
                description: 'Consider using least privilege principle and implement just-in-time access for high-risk permissions',
                priority: 'high'
            });
        }
        
        if (detectedPermissions.some(p => p.name.includes('ReadWrite.All'))) {
            recommendations.push({
                title: 'Implement Conditional Access',
                description: 'Use conditional access policies to restrict when and how these permissions can be used',
                priority: 'high'
            });
        }
        
        // Risk-based recommendations
        if (riskIndicators.some(r => r.level === 'critical')) {
            recommendations.push({
                title: 'Critical Risk Mitigation',
                description: 'Implement additional controls for critical risks including monitoring, alerting, and approval workflows',
                priority: 'critical'
            });
        }
        
        if (detectedPermissions.length > 5) {
            recommendations.push({
                title: 'Permission Segmentation',
                description: 'Consider splitting permissions across multiple applications to reduce blast radius',
                priority: 'medium'
            });
        }
        
        // General security recommendations
        recommendations.push(
            {
                title: 'Enable Audit Logging',
                description: 'Ensure comprehensive audit logging is enabled for all privileged operations',
                priority: 'medium'
            },
            {
                title: 'Regular Permission Reviews',
                description: 'Implement quarterly reviews of application permissions and access',
                priority: 'medium'
            },
            {
                title: 'Multi-Factor Authentication',
                description: 'Require MFA for all administrative and high-privilege operations',
                priority: 'high'
            }
        );
        
        return recommendations;
    }
    
    calculateOverallRisk(detectedPermissions, riskIndicators) {
        let totalScore = 0;
        let maxScore = 0;
        
        // Calculate permission risk score
        detectedPermissions.forEach(permission => {
            totalScore += permission.riskScore || 0;
            maxScore += 10; // Max score per permission
        });
        
        // Add risk indicator impact
        riskIndicators.forEach(indicator => {
            switch (indicator.level) {
                case 'critical': totalScore += 10; maxScore += 10; break;
                case 'high': totalScore += 7; maxScore += 10; break;
                case 'medium': totalScore += 4; maxScore += 10; break;
                case 'low': totalScore += 2; maxScore += 10; break;
            }
        });
        
        const normalizedScore = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
        
        let riskLevel = 'low';
        if (normalizedScore >= 80) riskLevel = 'critical';
        else if (normalizedScore >= 60) riskLevel = 'high';
        else if (normalizedScore >= 30) riskLevel = 'medium';
        
        return {
            score: normalizedScore,
            level: riskLevel,
            totalPermissions: detectedPermissions.length,
            totalIndicators: riskIndicators.length
        };
    }
    
    displayResults() {
        // Show analysis section
        this.analysisSection.style.display = 'block';
        this.analysisSection.scrollIntoView({ behavior: 'smooth' });
        
        // Display overall risk
        this.overallScore.textContent = this.analysisResults.overallRisk.score;
        this.riskLevel.textContent = this.analysisResults.overallRisk.level.toUpperCase();
        this.riskLevel.className = `risk-level ${this.analysisResults.overallRisk.level}`;
        
        // Display detected permissions
        this.permissionsList.innerHTML = this.analysisResults.detectedPermissions
            .map(permission => `
                <div class="permission-item ${permission.riskLevel}">
                    <div class="item-title">${permission.name}
                        <span class="item-score score-${permission.riskLevel}">${permission.riskScore}/10</span>
                    </div>
                    <div class="item-description">${permission.description}</div>
                </div>
            `).join('');
        
        // Display CSF categories
        this.csfCategories.innerHTML = this.analysisResults.csfMappings
            .map(category => `
                <div class="csf-item">
                    <div class="item-title">${category.category} - ${category.mainCategory}</div>
                    <div class="item-description">${category.name}</div>
                </div>
            `).join('');
        
        // Display risk indicators
        this.riskIndicators.innerHTML = this.analysisResults.riskIndicators
            .map(indicator => `
                <div class="risk-item ${indicator.level}">
                    <div class="item-title">${indicator.indicator}</div>
                    <div class="item-description">${indicator.description}</div>
                </div>
            `).join('');
        
        // Display recommendations
        this.recommendations.innerHTML = this.analysisResults.recommendations
            .map(rec => `
                <div class="recommendation-item">
                    <div class="item-title">${rec.title} 
                        <span class="item-score score-${rec.priority}">${rec.priority.toUpperCase()}</span>
                    </div>
                    <div class="item-description">${rec.description}</div>
                </div>
            `).join('');
    }
    
    createRiskChart() {
        const ctx = document.getElementById('risk-chart').getContext('2d');
        
        const riskData = {
            critical: this.analysisResults.detectedPermissions.filter(p => p.riskLevel === 'critical').length,
            high: this.analysisResults.detectedPermissions.filter(p => p.riskLevel === 'high').length,
            medium: this.analysisResults.detectedPermissions.filter(p => p.riskLevel === 'medium').length,
            low: this.analysisResults.detectedPermissions.filter(p => p.riskLevel === 'low').length
        };
        
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Critical', 'High', 'Medium', 'Low'],
                datasets: [{
                    data: [riskData.critical, riskData.high, riskData.medium, riskData.low],
                    backgroundColor: ['#dc3545', '#fd7e14', '#ffc107', '#28a745'],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    title: {
                        display: true,
                        text: 'Risk Distribution'
                    }
                }
            }
        });
    }
    
    downloadReport(format) {
        if (!this.analysisResults) {
            alert('No analysis results to download.');
            return;
        }
        
        if (format === 'json') {
            this.downloadJsonReport();
        } else if (format === 'html') {
            this.downloadHtmlReport();
        }
    }
    
    downloadJsonReport() {
        const reportData = {
            ...this.analysisResults,
            generatedAt: new Date().toISOString(),
            version: '1.0'
        };
        
        const blob = new Blob([JSON.stringify(reportData, null, 2)], { 
            type: 'application/json' 
        });
        
        this.downloadFile(blob, `risk-analysis-${Date.now()}.json`);
    }
    
    downloadHtmlReport() {
        const htmlContent = this.generateHtmlReport();
        const blob = new Blob([htmlContent], { type: 'text/html' });
        this.downloadFile(blob, `risk-analysis-${Date.now()}.html`);
    }
    
    generateHtmlReport() {
        const results = this.analysisResults;
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Risk Analysis Report</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 40px; 
            line-height: 1.6; 
            color: #333;
            background: #f8f9fa;
        }
        .header { 
            text-align: center; 
            margin-bottom: 40px; 
            padding: 20px;
            background: #212529;
            color: white;
            border-bottom: 3px solid #495057;
        }
        .risk-score { font-size: 3em; font-weight: bold; margin: 20px 0; }
        .section { 
            margin-bottom: 30px; 
            padding: 20px;
            background: white;
            border: 1px solid #e9ecef;
        }
        .permission-item, .risk-item, .recommendation-item { 
            padding: 15px; 
            margin: 10px 0; 
            border-left: 4px solid #ccc; 
            background: #f8f9fa;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .high { border-left-color: #fd7e14; }
        .critical { border-left-color: #dc3545; }
        .medium { border-left-color: #ffc107; }
        .low { border-left-color: #28a745; }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 20px 0; 
            background: #f8f9fa;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        th, td { 
            border: 1px solid #e2e8f0; 
            padding: 12px; 
            text-align: left; 
        }
        th { 
            background-color: #495057; 
            color: white;
            font-weight: 600;
        }
        .score-badge {
            display: inline-block;
            padding: 4px 8px;
            color: white;
            font-weight: bold;
            font-size: 0.8em;
        }
        .score-critical { background: #dc3545; }
        .score-high { background: #fd7e14; }
        .score-medium { background: #ffc107; color: #333; }
        .score-low { background: #28a745; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔒 Risk Analysis Report</h1>
        <div class="risk-score">${results.overallRisk.score}/100</div>
        <h2>Risk Level: ${results.overallRisk.level.toUpperCase()}</h2>
        <p>Generated on: ${new Date().toLocaleString()}</p>
    </div>
    
    <div class="section">
        <h2>📊 Summary</h2>
        <table>
            <tr><th>Metric</th><th>Value</th></tr>
            <tr><td>Overall Risk Score</td><td>${results.overallRisk.score}/100</td></tr>
            <tr><td>Risk Level</td><td>${results.overallRisk.level.toUpperCase()}</td></tr>
            <tr><td>Detected Permissions</td><td>${results.totalPermissions}</td></tr>
            <tr><td>Risk Indicators</td><td>${results.totalIndicators}</td></tr>
            <tr><td>CSF Categories Mapped</td><td>${results.csfMappings.length}</td></tr>
        </table>
    </div>
    
    <div class="section">
        <h2>🔐 Detected Permissions</h2>
        ${results.detectedPermissions.map(p => `
            <div class="permission-item ${p.riskLevel}">
                <strong>${p.name}</strong> (Risk Score: ${p.riskScore}/10)<br>
                ${p.description}
            </div>
        `).join('')}
    </div>
    
    <div class="section">
        <h2>🎯 NIST CSF 2.0 Categories</h2>
        ${results.csfMappings.map(c => `
            <div class="csf-item">
                <strong>${c.category}</strong> - ${c.mainCategory}<br>
                ${c.name}
            </div>
        `).join('')}
    </div>
    
    <div class="section">
        <h2>⚠️ Risk Indicators</h2>
        ${results.riskIndicators.map(r => `
            <div class="risk-item ${r.level}">
                <strong>${r.indicator}</strong> (${r.level.toUpperCase()})<br>
                ${r.description}
            </div>
        `).join('')}
    </div>
    
    <div class="section">
        <h2>💡 Recommendations</h2>
        ${results.recommendations.map(r => `
            <div class="recommendation-item">
                <strong>${r.title}</strong> (Priority: ${r.priority.toUpperCase()})<br>
                ${r.description}
            </div>
        `).join('')}
    </div>
    
    <footer style="text-align: center; margin-top: 40px; color: #666;">
        <p>Generated by Risk Analysis Web App - Powered by NIST CSF 2.0 and Microsoft Graph API</p>
    </footer>
</body>
</html>`;
    }
    
    getRiskColor(level) {
        const colors = {
            'low': '28a745',
            'medium': 'ffc107',
            'high': 'fd7e14',
            'critical': 'dc3545'
        };
        return colors[level] || '6c757d';
    }
    
    downloadFile(blob, filename) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }
    
    resetAnalysis() {
        this.analysisSection.style.display = 'none';
        this.analysisResults = null;
        
        if (window.fileUploader) {
            window.fileUploader.resetUpload();
        }
    }
}

// Initialize risk analyzer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.riskAnalyzer = new RiskAnalyzer();
});