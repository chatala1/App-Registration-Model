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
        this.permissionsList = document.getElementById('permissions-list');
        this.csfCategories = document.getElementById('csf-categories');
        this.riskIndicators = document.getElementById('risk-indicators');
        this.recommendations = document.getElementById('recommendations');
        
        // Gauge elements
        this.gaugeProgress = document.getElementById('gauge-progress');
        this.gaugeValue = document.getElementById('gauge-value');
        this.gaugeLabel = document.getElementById('gauge-label');
        this.gaugeDefinition = document.getElementById('gauge-definition');
        this.gaugeDefinitionText = document.getElementById('gauge-definition-text');
        
        // Application details elements
        this.appPurpose = document.getElementById('app-purpose');
        this.appName = document.getElementById('app-name');
        this.appDescription = document.getElementById('app-description');
        
        // Risk summary elements - now for severity levels
        this.summaryCritical = document.getElementById('summary-critical');
        this.summaryHigh = document.getElementById('summary-high');
        this.summaryMedium = document.getElementById('summary-medium');
        this.summaryLow = document.getElementById('summary-low');
        
        // Summary cards elements
        this.permissionsCount = document.getElementById('permissions-count');
        this.csfCount = document.getElementById('csf-count');
        this.risksCount = document.getElementById('risks-count');
        this.recommendationsCount = document.getElementById('recommendations-count');
        
        this.criticalPermissions = document.getElementById('critical-permissions');
        this.highPriorityRisks = document.getElementById('high-priority-risks');
        this.immediateActions = document.getElementById('immediate-actions');
        
        // Buttons
        this.downloadPdfBtn = document.getElementById('download-pdf');
        this.downloadHtmlBtn = document.getElementById('download-html');
        this.downloadJsonBtn = document.getElementById('download-json');
        this.newAnalysisBtn = document.getElementById('new-analysis');
        
        this.initializeEventListeners();
    }
    
    initializeEventListeners() {
        this.downloadPdfBtn.addEventListener('click', () => this.downloadReport('pdf'));
        this.downloadHtmlBtn.addEventListener('click', () => this.downloadReport('html'));
        this.downloadJsonBtn.addEventListener('click', () => this.downloadReport('json'));
        this.newAnalysisBtn.addEventListener('click', () => this.resetAnalysis());
        
        // Tab switching
        this.initializeTabHandlers();
        
        // Collapsible sections
        this.initializeCollapsibleSections();
    }
    
    initializeTabHandlers() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.dataset.tab;
                
                // Remove active class from all buttons and contents
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Add active class to clicked button and corresponding content
                button.classList.add('active');
                const targetContent = document.getElementById(`${targetTab}-tab`);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            });
        });
    }
    
    initializeCollapsibleSections() {
        document.addEventListener('click', (e) => {
            const header = e.target.closest('.result-card h3');
            if (header) {
                const card = header.closest('.result-card');
                card.classList.toggle('collapsed');
            }
        });
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
            const subcategoryInfo = categoryInfo ? categoryInfo.subcategories[category] : null;
            
            return {
                category,
                name: subcategoryInfo ? subcategoryInfo.name : category,
                description: subcategoryInfo ? subcategoryInfo.description : 'NIST CSF 2.0 Category',
                mainCategory: categoryInfo ? categoryInfo.name : mainCategory,
                controls: subcategoryInfo ? subcategoryInfo.controls || [] : [],
                remediation: subcategoryInfo ? subcategoryInfo.remediation || [] : [],
                severity: this.calculateCSFSeverity(category, detectedPermissions)
            };
        });
    }
    
    calculateCSFSeverity(category, detectedPermissions) {
        // Calculate severity based on the risk levels of permissions mapped to this CSF category
        const mappedPermissions = detectedPermissions.filter(permission => 
            permission.csfMapping && permission.csfMapping.includes(category)
        );
        
        if (mappedPermissions.length === 0) return 'medium';
        
        const hasCritical = mappedPermissions.some(p => p.riskLevel === 'critical');
        const hasHigh = mappedPermissions.some(p => p.riskLevel === 'high');
        
        if (hasCritical) return 'critical';
        if (hasHigh) return 'high';
        
        const avgRiskScore = mappedPermissions.reduce((sum, p) => sum + (p.riskScore || 0), 0) / mappedPermissions.length;
        
        if (avgRiskScore >= 7) return 'high';
        if (avgRiskScore >= 4) return 'medium';
        return 'low';
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
    
    updateGauge(score, level) {
        // Update gauge value display
        this.gaugeValue.textContent = score;
        
        // Update gauge label with severity level instead of "Risk Score"
        this.gaugeLabel.textContent = level.toUpperCase();
        
        // Calculate arc properties for partial gauge (180 degrees)
        // Arc path: M 30 120 A 70 70 0 0 1 170 120
        // This creates a semicircle arc with radius 70
        const radius = 70;
        const circumference = Math.PI * radius; // Half circle circumference
        const progressLength = (score / 100) * circumference;
        
        // Determine gauge color based on risk level
        let gaugeColor;
        switch (level) {
            case 'critical':
                gaugeColor = '#f85149';
                break;
            case 'high':
                gaugeColor = '#d29922';
                break;
            case 'medium':
                gaugeColor = '#58a6ff';
                break;
            case 'low':
                gaugeColor = '#3fb950';
                break;
            default:
                gaugeColor = '#8b949e';
        }
        
        // Update gauge progress with solid color (no gradient)
        this.gaugeProgress.style.stroke = gaugeColor;
        this.gaugeProgress.style.strokeDasharray = `${progressLength} ${circumference}`;
        
        // Animate the gauge
        setTimeout(() => {
            this.gaugeProgress.style.strokeDasharray = `${progressLength} ${circumference}`;
        }, 100);
        
        // Update risk level definition
        this.updateRiskDefinition(level);
    }
    
    updateRiskDefinition(level) {
        const definitions = {
            'critical': 'Critical risk indicates potentially catastrophic impact to the organization. This may include unauthorized access to all company data, ability to modify security settings, or complete administrative control over Azure resources.',
            'high': 'High risk indicates significant potential for security breaches or data compromise. This may include access to sensitive user data, ability to modify directory settings, or elevated privileges that could lead to privilege escalation.',
            'medium': 'Medium risk indicates moderate security concerns that should be addressed. This may include limited data access, standard user permissions, or integrations that require monitoring but pose manageable risks.',
            'low': 'Low risk indicates minimal security impact with standard permissions. This typically includes read-only access to non-sensitive data or well-scoped permissions with limited potential for misuse.'
        };
        
        const definitionText = definitions[level] || 'Risk level assessment not available.';
        this.gaugeDefinitionText.textContent = definitionText;
        
        // Show the definition section
        if (this.gaugeDefinition) {
            this.gaugeDefinition.style.display = 'block';
        }
    }
    
    updateRiskSummary() {
        // Calculate permission counts by severity level
        const criticalCount = this.analysisResults.detectedPermissions.filter(p => p.riskLevel === 'critical').length;
        const highCount = this.analysisResults.detectedPermissions.filter(p => p.riskLevel === 'high').length;
        const mediumCount = this.analysisResults.detectedPermissions.filter(p => p.riskLevel === 'medium').length;
        const lowCount = this.analysisResults.detectedPermissions.filter(p => p.riskLevel === 'low').length;
        
        // Update the risk summary with severity counts
        this.summaryCritical.textContent = criticalCount;
        this.summaryHigh.textContent = highCount;
        this.summaryMedium.textContent = mediumCount;
        this.summaryLow.textContent = lowCount;
        
        // Update color classes
        this.summaryCritical.className = `stat-value critical`;
        this.summaryHigh.className = `stat-value high`;
        this.summaryMedium.className = `stat-value medium`;
        this.summaryLow.className = `stat-value low`;
    }

    updateApplicationDetails() {
        // Set application details based on analysis context
        // This could be extracted from the content or set based on analysis type
        this.appPurpose.textContent = "Customer Portal Integration";
        this.appName.textContent = "Customer Portal App";
        this.appDescription.textContent = "Provides secure access to customer data and user management functions";
    }

    displayResults() {
        // Show analysis section
        this.analysisSection.style.display = 'block';
        this.analysisSection.scrollIntoView({ behavior: 'smooth' });
        
        // Update gauge and summary
        this.updateGauge(this.analysisResults.overallRisk.score, this.analysisResults.overallRisk.level);
        this.updateRiskSummary();
        this.updateApplicationDetails();
        
        // Update summary cards
        this.updateSummaryCards();
        
        // Display detected permissions
        this.permissionsList.innerHTML = this.analysisResults.detectedPermissions
            .map(permission => {
                const permissionTypes = permission.permissionTypes || ['Unknown'];
                const permissionTypeDisplay = permissionTypes.join(', ');
                const permissionTypeClass = permissionTypes.includes('Application') && permissionTypes.includes('Delegated') 
                    ? 'both-types' 
                    : permissionTypes.includes('Application') 
                        ? 'app-only' 
                        : 'delegated-only';
                
                return `
                <div class="permission-item ${permission.riskLevel}">
                    <div class="item-title">${permission.name}
                        <span class="item-score score-${permission.riskLevel}">${permission.riskScore}/10</span>
                    </div>
                    <div class="permission-types ${permissionTypeClass}">
                        <strong>Permission Types:</strong> ${permissionTypeDisplay}
                        ${permission.consentType ? `<span class="consent-type">• ${permission.consentType}</span>` : ''}
                    </div>
                    <div class="item-description">${permission.description}</div>
                    ${permission.impact ? `<div class="permission-impact"><strong>Impact:</strong> ${permission.impact}</div>` : ''}
                </div>
            `;
            }).join('');
        
        // Display CSF categories
        this.csfCategories.innerHTML = this.analysisResults.csfMappings
            .map(category => `
                <div class="csf-item ${category.severity}">
                    <div class="item-title">
                        ${category.category} - ${category.mainCategory}
                        <span class="item-score score-${category.severity}">${category.severity.toUpperCase()}</span>
                    </div>
                    <div class="item-description">${category.name}</div>
                    <div class="item-description">${category.description}</div>
                    
                    ${category.controls.length > 0 ? `
                        <div class="csf-controls">
                            <strong>Specific Controls:</strong>
                            <ul>
                                ${category.controls.slice(0, 3).map(control => `<li>${control}</li>`).join('')}
                                ${category.controls.length > 3 ? `<li><em>... and ${category.controls.length - 3} more controls</em></li>` : ''}
                            </ul>
                        </div>
                    ` : ''}
                    
                    ${category.remediation.length > 0 ? `
                        <div class="csf-remediation">
                            <strong>Remediation Advice:</strong>
                            <ul>
                                ${category.remediation.slice(0, 3).map(advice => `<li>${advice}</li>`).join('')}
                                ${category.remediation.length > 3 ? `<li><em>... and ${category.remediation.length - 3} more recommendations</em></li>` : ''}
                            </ul>
                        </div>
                    ` : ''}
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
        
        // Populate overview tab
        this.populateOverviewTab();
        
        // Try to create chart (if Chart.js is available)
        this.createRiskChart();
    }
    
    updateSummaryCards() {
        this.permissionsCount.textContent = this.analysisResults.detectedPermissions.length;
        this.csfCount.textContent = this.analysisResults.csfMappings.length;
        this.risksCount.textContent = this.analysisResults.riskIndicators.length;
        this.recommendationsCount.textContent = this.analysisResults.recommendations.length;
        
        // Update card styling based on counts
        const summaryCards = document.querySelectorAll('.summary-card');
        const criticalCount = this.analysisResults.detectedPermissions.filter(p => p.riskLevel === 'critical').length;
        const highCount = this.analysisResults.detectedPermissions.filter(p => p.riskLevel === 'high').length;
        
        // Color code based on risk levels
        if (criticalCount > 0) {
            summaryCards[0].className = 'summary-card critical';
        } else if (highCount > 2) {
            summaryCards[0].className = 'summary-card high';
        } else {
            summaryCards[0].className = 'summary-card medium';
        }
    }
    
    populateOverviewTab() {
        // Critical permissions (score >= 8)
        const criticalPerms = this.analysisResults.detectedPermissions.filter(p => p.riskScore >= 8);
        this.criticalPermissions.innerHTML = criticalPerms.length > 0 ? 
            criticalPerms.map(permission => `
                <div class="permission-item ${permission.riskLevel}">
                    <div class="item-title">${permission.name}
                        <span class="item-score score-${permission.riskLevel}">${permission.riskScore}/10</span>
                    </div>
                    <div class="item-description">${permission.description}</div>
                </div>
            `).join('') : '<p style="color: #8b949e; font-style: italic;">No critical permissions detected</p>';
        
        // High-priority risks (critical and high level)
        const highPriorityRisks = this.analysisResults.riskIndicators.filter(r => 
            r.level === 'critical' || r.level === 'high'
        );
        this.highPriorityRisks.innerHTML = highPriorityRisks.length > 0 ?
            highPriorityRisks.map(indicator => `
                <div class="risk-item ${indicator.level}">
                    <div class="item-title">${indicator.indicator}</div>
                    <div class="item-description">${indicator.description}</div>
                </div>
            `).join('') : '<p style="color: #8b949e; font-style: italic;">No high-priority risks identified</p>';
        
        // Immediate actions (critical and high priority recommendations)
        const immediateActions = this.analysisResults.recommendations.filter(r => 
            r.priority === 'critical' || r.priority === 'high'
        );
        this.immediateActions.innerHTML = immediateActions.length > 0 ?
            immediateActions.map(rec => `
                <div class="recommendation-item">
                    <div class="item-title">${rec.title} 
                        <span class="item-score score-${rec.priority}">${rec.priority.toUpperCase()}</span>
                    </div>
                    <div class="item-description">${rec.description}</div>
                </div>
            `).join('') : '<p style="color: #8b949e; font-style: italic;">No immediate actions required</p>';
    }
    
    createRiskChart() {
        // Check if Chart.js is available and chart element exists
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js not available, skipping chart creation');
            return;
        }
        
        const chartElement = document.getElementById('risk-chart');
        if (!chartElement) {
            console.warn('Chart element not found, skipping chart creation');
            return;
        }
        
        const ctx = chartElement.getContext('2d');
        
        const riskData = {
            critical: this.analysisResults.detectedPermissions.filter(p => p.riskLevel === 'critical').length,
            high: this.analysisResults.detectedPermissions.filter(p => p.riskLevel === 'high').length,
            medium: this.analysisResults.detectedPermissions.filter(p => p.riskLevel === 'medium').length,
            low: this.analysisResults.detectedPermissions.filter(p => p.riskLevel === 'low').length
        };
        
        try {
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
                            position: 'bottom',
                            labels: {
                                color: '#f0f6fc',
                                font: {
                                    size: 14
                                }
                            }
                        },
                        title: {
                            display: true,
                            text: 'Risk Distribution',
                            color: '#f0f6fc',
                            font: {
                                size: 16
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error creating chart:', error);
            document.getElementById('risk-chart').style.display = 'none';
        }
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
        } else if (format === 'pdf') {
            this.downloadPdfReport();
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
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .header { text-align: center; margin-bottom: 40px; }
        .risk-score { font-size: 3em; font-weight: bold; color: #${this.getRiskColor(results.overallRisk.level)}; }
        .section { margin-bottom: 30px; }
        .permission-item, .risk-item, .recommendation-item { 
            padding: 10px; margin: 5px 0; border-left: 4px solid #ccc; background: #f9f9f9; 
        }
        .high { border-left-color: #fd7e14; }
        .critical { border-left-color: #dc3545; }
        .medium { border-left-color: #ffc107; }
        .low { border-left-color: #28a745; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #f2f2f2; }
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
            <tr><td>Detected Permissions</td><td>${results.detectedPermissions.length}</td></tr>
            <tr><td>Critical Permissions</td><td>${results.detectedPermissions.filter(p => p.riskLevel === 'critical').length}</td></tr>
            <tr><td>High Risk Permissions</td><td>${results.detectedPermissions.filter(p => p.riskLevel === 'high').length}</td></tr>
            <tr><td>Medium Risk Permissions</td><td>${results.detectedPermissions.filter(p => p.riskLevel === 'medium').length}</td></tr>
            <tr><td>Low Risk Permissions</td><td>${results.detectedPermissions.filter(p => p.riskLevel === 'low').length}</td></tr>
            <tr><td>Risk Indicators</td><td>${results.riskIndicators.length}</td></tr>
            <tr><td>CSF Categories Mapped</td><td>${results.csfMappings.length}</td></tr>
        </table>
    </div>
    
    <div class="section">
        <h2>📱 Application Information</h2>
        <table>
            <tr><th>Detail</th><th>Value</th></tr>
            <tr><td>Purpose</td><td>Customer Portal Integration</td></tr>
            <tr><td>Application</td><td>Customer Portal App</td></tr>
            <tr><td>Connection</td><td>Provides secure access to customer data and user management functions</td></tr>
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
            <div class="csf-item ${c.severity}">
                <strong>${c.category}</strong> - ${c.mainCategory} 
                <span class="score-badge score-${c.severity}">${c.severity.toUpperCase()}</span><br>
                <em>${c.name}</em><br>
                ${c.description}
                
                ${c.controls.length > 0 ? `
                    <br><br><strong>Specific Controls:</strong>
                    <ul>
                        ${c.controls.slice(0, 3).map(control => `<li>${control}</li>`).join('')}
                        ${c.controls.length > 3 ? `<li><em>... and ${c.controls.length - 3} more controls</em></li>` : ''}
                    </ul>
                ` : ''}
                
                ${c.remediation.length > 0 ? `
                    <br><strong>Remediation Advice:</strong>
                    <ul>
                        ${c.remediation.slice(0, 3).map(advice => `<li>${advice}</li>`).join('')}
                        ${c.remediation.length > 3 ? `<li><em>... and ${c.remediation.length - 3} more recommendations</em></li>` : ''}
                    </ul>
                ` : ''}
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
    
    downloadPdfReport() {
        // Create a new window for the printable report
        const printWindow = window.open('', '_blank');
        const reportHtml = this.generatePrintableReport();
        
        printWindow.document.open();
        printWindow.document.write(reportHtml);
        printWindow.document.close();
        
        // Wait for content to load, then trigger print dialog
        printWindow.onload = function() {
            setTimeout(() => {
                printWindow.print();
                // Close window after printing (optional)
                printWindow.onafterprint = function() {
                    printWindow.close();
                };
            }, 500);
        };
    }
    
    generatePrintableReport() {
        const currentDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Risk Analysis Report - ${currentDate}</title>
    <style>
        @media print {
            body { margin: 0; }
            .no-print { display: none !important; }
            .page-break { page-break-before: always; }
        }
        
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; 
            margin: 40px; 
            line-height: 1.6; 
            color: #333;
            background: white;
        }
        
        .header { 
            text-align: center; 
            margin-bottom: 40px; 
            padding: 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 10px;
        }
        
        .risk-score { 
            font-size: 4em; 
            font-weight: bold; 
            margin: 20px 0;
        }
        
        .section { 
            margin-bottom: 30px; 
            padding: 25px;
            background: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid #667eea;
        }
        
        .section h2 {
            margin-top: 0;
            color: #667eea;
            font-size: 1.5em;
            margin-bottom: 20px;
        }
        
        .item { 
            padding: 15px; 
            margin: 10px 0; 
            border-left: 4px solid #ccc; 
            background: white;
            border-radius: 5px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .item-title {
            font-weight: 600;
            margin-bottom: 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .item-description {
            color: #666;
            font-size: 0.9em;
        }
        
        .score-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            color: white;
            font-weight: bold;
            font-size: 0.8em;
        }
        
        .score-critical, .critical { border-left-color: #dc3545; }
        .score-high, .high { border-left-color: #fd7e14; }
        .score-medium, .medium { border-left-color: #ffc107; }
        .score-low, .low { border-left-color: #28a745; }
        
        .score-critical { background: #dc3545; }
        .score-high { background: #fd7e14; }
        .score-medium { background: #ffc107; color: #333; }
        .score-low { background: #28a745; }
        
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        
        .summary-item {
            text-align: center;
            padding: 20px;
            background: white;
            border-radius: 8px;
            border: 2px solid #e9ecef;
        }
        
        .summary-value {
            font-size: 2.5em;
            font-weight: bold;
            color: #667eea;
            display: block;
        }
        
        .summary-label {
            font-size: 0.9em;
            color: #666;
            margin-top: 5px;
        }
        
        .csf-controls, .csf-remediation {
            margin-top: 10px;
            padding: 10px;
            background: #f8f9fa;
            border-radius: 5px;
            font-size: 0.9em;
        }
        
        .csf-controls ul, .csf-remediation ul {
            margin: 5px 0 0 20px;
            padding: 0;
        }
        
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e9ecef;
            color: #666;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔒 Azure Application Registration Risk Analysis Report</h1>
        <div class="risk-score">${this.analysisResults.overallRisk.score}/100</div>
        <h2>Risk Level: ${this.analysisResults.overallRisk.level.toUpperCase()}</h2>
        <p>Generated on: ${currentDate}</p>
    </div>
    
    <div class="section">
        <h2>📊 Executive Summary</h2>
        <p>This comprehensive risk analysis evaluates Azure Application Registration permissions against the NIST Cybersecurity Framework 2.0. The analysis identified <strong>${this.analysisResults.detectedPermissions.length} permissions</strong> with varying risk levels, mapped to <strong>${this.analysisResults.csfMappings.length} NIST CSF 2.0 categories</strong>, and found <strong>${this.analysisResults.riskIndicators.length} risk indicators</strong>.</p>
        
        <div class="summary-grid">
            <div class="summary-item">
                <span class="summary-value">${this.analysisResults.overallRisk.score}/100</span>
                <span class="summary-label">Overall Risk Score</span>
            </div>
            <div class="summary-item">
                <span class="summary-value">${this.analysisResults.detectedPermissions.length}</span>
                <span class="summary-label">Detected Permissions</span>
            </div>
            <div class="summary-item">
                <span class="summary-value">${this.analysisResults.detectedPermissions.filter(p => p.riskLevel === 'critical').length}</span>
                <span class="summary-label">Critical Permissions</span>
            </div>
            <div class="summary-item">
                <span class="summary-value">${this.analysisResults.recommendations.filter(r => r.priority === 'critical' || r.priority === 'high').length}</span>
                <span class="summary-label">Priority Actions</span>
            </div>
        </div>
    </div>
    
    <div class="section">
        <h2>📱 Application Information</h2>
        <div class="summary-grid">
            <div class="summary-item">
                <span class="summary-value">Customer Portal Integration</span>
                <span class="summary-label">Purpose</span>
            </div>
            <div class="summary-item">
                <span class="summary-value">Customer Portal App</span>
                <span class="summary-label">Application</span>
            </div>
            <div class="summary-item" style="grid-column: span 2;">
                <span class="summary-value">Provides secure access to customer data and user management functions</span>
                <span class="summary-label">Connection Description</span>
            </div>
        </div>
        
        <div class="summary-grid">
            <div class="summary-item">
                <span class="summary-value">${this.analysisResults.detectedPermissions.filter(p => p.riskLevel === 'critical').length}</span>
                <span class="summary-label">Critical Permissions</span>
            </div>
            <div class="summary-item">
                <span class="summary-value">${this.analysisResults.detectedPermissions.filter(p => p.riskLevel === 'high').length}</span>
                <span class="summary-label">High Risk Permissions</span>
            </div>
            <div class="summary-item">
                <span class="summary-value">${this.analysisResults.detectedPermissions.filter(p => p.riskLevel === 'medium').length}</span>
                <span class="summary-label">Medium Risk Permissions</span>
            </div>
            <div class="summary-item">
                <span class="summary-value">${this.analysisResults.detectedPermissions.filter(p => p.riskLevel === 'low').length}</span>
                <span class="summary-label">Low Risk Permissions</span>
            </div>
        </div>
    </div>
    
    <div class="section">
        <h2>🔐 Detected Permissions</h2>
        <p>The following Azure Application Registration permissions were identified and analyzed:</p>
        ${this.analysisResults.detectedPermissions.map(permission => `
            <div class="item ${permission.riskLevel}">
                <div class="item-title">
                    <span>${permission.name}</span>
                    <span class="score-badge score-${permission.riskLevel}">${permission.riskScore}/10</span>
                </div>
                <div class="item-description">${permission.description}</div>
            </div>
        `).join('')}
    </div>
    
    <div class="section page-break">
        <h2>🎯 NIST CSF 2.0 Categories</h2>
        <p>The identified permissions and content map to the following NIST Cybersecurity Framework 2.0 categories:</p>
        ${this.analysisResults.csfMappings.map(category => `
            <div class="item">
                <div class="item-title">
                    <span><strong>${category.category}</strong> - ${category.mainCategory}</span>
                    <span class="score-badge score-${category.severity}">${category.severity.toUpperCase()}</span>
                </div>
                <div class="item-description">${category.name}</div>
                <div class="item-description">${category.description}</div>
                
                ${category.controls.length > 0 ? `
                    <div class="csf-controls">
                        <strong>Specific Controls:</strong>
                        <ul>
                            ${category.controls.slice(0, 5).map(control => `<li>${control}</li>`).join('')}
                            ${category.controls.length > 5 ? `<li><em>... and ${category.controls.length - 5} more controls</em></li>` : ''}
                        </ul>
                    </div>
                ` : ''}
                
                ${category.remediation.length > 0 ? `
                    <div class="csf-remediation">
                        <strong>Remediation Advice:</strong>
                        <ul>
                            ${category.remediation.slice(0, 5).map(advice => `<li>${advice}</li>`).join('')}
                            ${category.remediation.length > 5 ? `<li><em>... and ${category.remediation.length - 5} more recommendations</em></li>` : ''}
                        </ul>
                    </div>
                ` : ''}
            </div>
        `).join('')}
    </div>
    
    <div class="section">
        <h2>⚠️ Risk Indicators</h2>
        <p>The following risk indicators were identified through content analysis:</p>
        ${this.analysisResults.riskIndicators.map(indicator => `
            <div class="item ${indicator.level}">
                <div class="item-title">
                    <span>${indicator.indicator}</span>
                    <span class="score-badge score-${indicator.level}">${indicator.level.toUpperCase()}</span>
                </div>
                <div class="item-description">${indicator.description}</div>
            </div>
        `).join('')}
    </div>
    
    <div class="section page-break">
        <h2>💡 Security Recommendations</h2>
        <p>Based on the risk analysis, the following recommendations should be implemented:</p>
        ${this.analysisResults.recommendations.map(rec => `
            <div class="item">
                <div class="item-title">
                    <span>${rec.title}</span>
                    <span class="score-badge score-${rec.priority}">${rec.priority.toUpperCase()}</span>
                </div>
                <div class="item-description">${rec.description}</div>
            </div>
        `).join('')}
    </div>
    
    <div class="section">
        <h2>📋 Next Steps</h2>
        <div class="item">
            <div class="item-title">Immediate Actions (1-7 days)</div>
            <div class="item-description">Address critical and high-priority recommendations, implement conditional access policies</div>
        </div>
        <div class="item">
            <div class="item-title">Short-term (1-4 weeks)</div>
            <div class="item-description">Set up monitoring and alerting, review permission assignments</div>
        </div>
        <div class="item">
            <div class="item-title">Medium-term (1-3 months)</div>
            <div class="item-description">Implement just-in-time access, establish governance processes</div>
        </div>
        <div class="item">
            <div class="item-title">Long-term (3-6 months)</div>
            <div class="item-description">Regular permission reviews, continuous improvement of security posture</div>
        </div>
    </div>
    
    <div class="footer">
        <p><strong>Generated by Azure Application Registration Risk Analysis Tool</strong></p>
        <p>Powered by <a href="https://www.nist.gov/cyberframework">NIST CSF 2.0</a> and <a href="https://docs.microsoft.com/en-us/graph/permissions-reference">Microsoft Graph API</a></p>
        <p><em>This report should be reviewed by security professionals and updated based on organizational policies.</em></p>
    </div>
</body>
</html>`;
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