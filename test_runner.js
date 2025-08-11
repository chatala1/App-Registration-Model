#!/usr/bin/env node

// Node.js Test Runner for Azure Application Registration Risk Analysis Tool
// Runs comprehensive tests using the local web server

const http = require('http');
const fs = require('fs');
const path = require('path');

class TestRunner {
    constructor() {
        this.baseUrl = 'http://localhost:8000';
        this.testResults = [];
        this.sampleFiles = [
            'sample-hr-azuread.md',
            'sample-sales-crm.json',
            'sample-mobile-sharepoint.txt',
            'sample-reporting-teams.txt',
            'sample-analytics-exchange.rtf',
            'sample-customer-portal.pdf'
        ];
    }

    async runTests() {
        console.log('🚀 Starting Application Testing Suite');
        console.log('=====================================');
        
        try {
            // Check if web server is running
            await this.checkWebServer();
            
            // Test each component
            await this.testCoreFiles();
            await this.testSampleFiles();
            await this.testDataFiles();
            await this.testStaticAssets();
            await this.testFileFormatSupport();
            
            // Generate comprehensive report
            this.generateReport();
            
        } catch (error) {
            console.error('❌ Test runner failed:', error.message);
            process.exit(1);
        }
    }

    async checkWebServer() {
        console.log('\n🌐 Checking web server availability...');
        
        try {
            await this.makeRequest('');
            this.logResult('WEB_SERVER_AVAILABLE', true, 'Web server is running and accessible');
        } catch (error) {
            this.logResult('WEB_SERVER_AVAILABLE', false, `Web server not accessible: ${error.message}`);
            throw new Error('Web server must be running on localhost:8000. Please start it with: cd docs && python3 -m http.server 8000');
        }
    }

    async testCoreFiles() {
        console.log('\n📋 Testing core application files...');
        
        const coreFiles = [
            { file: 'index.html', type: 'Main application page' },
            { file: 'risk-analysis.js', type: 'Risk analysis engine' },
            { file: 'upload.js', type: 'File upload handler' },
            { file: 'style.css', type: 'Application styles' },
            { file: 'navigation.js', type: 'Navigation functionality' }
        ];

        for (const { file, type } of coreFiles) {
            try {
                const response = await this.makeRequest(file);
                const success = response.statusCode === 200;
                this.logResult(`CORE_FILE_${file.toUpperCase().replace('.', '_')}`, success, 
                    success ? `${type} loads successfully` : `Failed to load ${type}`);
                
                // Additional validation for specific files
                if (file === 'index.html' && success) {
                    await this.validateHTML(response.data);
                }
                if (file === 'risk-analysis.js' && success) {
                    await this.validateJavaScript(response.data, 'RiskAnalyzer');
                }
                if (file === 'upload.js' && success) {
                    await this.validateJavaScript(response.data, 'FileUploader');
                }
                
            } catch (error) {
                this.logResult(`CORE_FILE_${file.toUpperCase().replace('.', '_')}`, false, 
                    `Error loading ${file}: ${error.message}`);
            }
        }
    }

    async testSampleFiles() {
        console.log('\n📄 Testing sample files for analysis...');
        
        for (const fileName of this.sampleFiles) {
            try {
                const response = await this.makeRequest(`samples/${fileName}`);
                const success = response.statusCode === 200;
                
                this.logResult(`SAMPLE_FILE_${fileName.toUpperCase().replace(/[.-]/g, '_')}`, success,
                    success ? `Sample file ${fileName} accessible` : `Sample file ${fileName} not found`);
                
                if (success) {
                    // Test file content for permissions
                    await this.analyzeSampleContent(fileName, response.data);
                }
                
            } catch (error) {
                this.logResult(`SAMPLE_FILE_${fileName.toUpperCase().replace(/[.-]/g, '_')}`, false,
                    `Error accessing ${fileName}: ${error.message}`);
            }
        }
    }

    async analyzeSampleContent(fileName, content) {
        // Common Azure permissions to look for
        const highRiskPermissions = [
            'User.ReadWrite.All',
            'Group.ReadWrite.All',
            'Directory.ReadWrite.All',
            'RoleManagement.ReadWrite.All',
            'Application.ReadWrite.All'
        ];
        
        const mediumRiskPermissions = [
            'User.Read.All',
            'Group.Read.All',
            'Directory.Read.All',
            'Application.Read.All',
            'Calendars.ReadWrite',
            'Mail.ReadWrite',
            'Contacts.ReadWrite'
        ];
        
        let highRiskFound = 0;
        let mediumRiskFound = 0;
        
        for (const permission of highRiskPermissions) {
            if (content.includes(permission)) {
                highRiskFound++;
            }
        }
        
        for (const permission of mediumRiskPermissions) {
            if (content.includes(permission)) {
                mediumRiskFound++;
            }
        }
        
        const hasPermissions = highRiskFound > 0 || mediumRiskFound > 0;
        this.logResult(`PERMISSIONS_IN_${fileName.toUpperCase().replace(/[.-]/g, '_')}`, hasPermissions,
            `Found ${highRiskFound} high-risk and ${mediumRiskFound} medium-risk permissions in ${fileName}`);
    }

    async testDataFiles() {
        console.log('\n🗃️ Testing data files...');
        
        const dataFiles = [
            { file: 'data/entra-permissions.json', type: 'Azure permissions database' },
            { file: 'data/nist-csf-2.0.json', type: 'NIST CSF 2.0 framework data' }
        ];

        for (const { file, type } of dataFiles) {
            try {
                const response = await this.makeRequest(file);
                const success = response.statusCode === 200;
                
                this.logResult(`DATA_FILE_${file.toUpperCase().replace(/[./-]/g, '_')}`, success,
                    success ? `${type} loads successfully` : `Failed to load ${type}`);
                
                if (success) {
                    await this.validateJSON(response.data, file);
                }
                
            } catch (error) {
                this.logResult(`DATA_FILE_${file.toUpperCase().replace(/[./-]/g, '_')}`, false,
                    `Error loading ${file}: ${error.message}`);
            }
        }
    }

    async testStaticAssets() {
        console.log('\n🎨 Testing static assets and external dependencies...');
        
        // Test external CDN dependencies
        const externalDependencies = [
            { url: 'https://cdn.jsdelivr.net/npm/chart.js', name: 'Chart.js library' },
            { url: 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css', name: 'Bootstrap Icons' },
            { url: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js', name: 'PDF.js library' },
            { url: 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js', name: 'Mammoth.js library' }
        ];

        for (const { url, name } of externalDependencies) {
            try {
                const response = await this.makeExternalRequest(url);
                const success = response.statusCode === 200;
                this.logResult(`EXTERNAL_${name.toUpperCase().replace(/[.\s]/g, '_')}`, success,
                    success ? `${name} loads successfully` : `Failed to load ${name}`);
            } catch (error) {
                this.logResult(`EXTERNAL_${name.toUpperCase().replace(/[.\s]/g, '_')}`, false,
                    `Error loading ${name}: ${error.message}`);
            }
        }
        
        // Test local templates
        try {
            const response = await this.makeRequest('templates.html');
            const success = response.statusCode === 200;
            this.logResult('TEMPLATES_PAGE', success,
                success ? 'Templates page loads successfully' : 'Templates page failed to load');
        } catch (error) {
            this.logResult('TEMPLATES_PAGE', false, `Error loading templates page: ${error.message}`);
        }
    }

    async testFileFormatSupport() {
        console.log('\n📋 Testing different file format support...');
        
        const formatTests = [
            { file: 'sample-hr-azuread.md', format: 'Markdown' },
            { file: 'sample-sales-crm.json', format: 'JSON' },
            { file: 'sample-mobile-sharepoint.txt', format: 'Plain Text' },
            { file: 'sample-analytics-exchange.rtf', format: 'RTF' },
            { file: 'sample-customer-portal.pdf', format: 'PDF' }
        ];

        for (const { file, format } of formatTests) {
            try {
                const response = await this.makeRequest(`samples/${file}`);
                const success = response.statusCode === 200 && response.data.length > 0;
                
                this.logResult(`FORMAT_SUPPORT_${format.toUpperCase().replace(/\s/g, '_')}`, success,
                    success ? `${format} format supported and readable` : `${format} format not supported or empty`);
                
            } catch (error) {
                this.logResult(`FORMAT_SUPPORT_${format.toUpperCase().replace(/\s/g, '_')}`, false,
                    `Error testing ${format} format: ${error.message}`);
            }
        }
    }

    async validateHTML(content) {
        const hasDoctype = content.includes('<!DOCTYPE html>');
        const hasTitle = content.includes('<title>');
        const hasMainContent = content.includes('<main>');
        const hasScripts = content.includes('risk-analysis.js') && content.includes('upload.js');
        
        this.logResult('HTML_STRUCTURE_VALID', hasDoctype && hasTitle && hasMainContent,
            'HTML structure validation');
        this.logResult('HTML_SCRIPTS_INCLUDED', hasScripts,
            'Required JavaScript files included in HTML');
    }

    async validateJavaScript(content, expectedClass) {
        const hasClass = content.includes(`class ${expectedClass}`);
        const hasConstructor = content.includes('constructor()');
        
        this.logResult(`JS_CLASS_${expectedClass.toUpperCase()}`, hasClass,
            `${expectedClass} class found in JavaScript`);
        this.logResult(`JS_CONSTRUCTOR_${expectedClass.toUpperCase()}`, hasConstructor,
            `Constructor found in ${expectedClass} class`);
    }

    async validateJSON(content, fileName) {
        try {
            const parsed = JSON.parse(content);
            const isValid = typeof parsed === 'object' && parsed !== null;
            
            this.logResult(`JSON_VALID_${fileName.toUpperCase().replace(/[./-]/g, '_')}`, isValid,
                `JSON structure is valid in ${fileName}`);
            
            // Specific validation for entra-permissions.json
            if (fileName.includes('entra-permissions.json')) {
                const hasPermissions = parsed.permissions && typeof parsed.permissions === 'object';
                this.logResult('ENTRA_PERMISSIONS_STRUCTURE', hasPermissions,
                    'Entra permissions file has correct structure');
                
                if (hasPermissions) {
                    const permissionCount = Object.keys(parsed.permissions).length;
                    this.logResult('ENTRA_PERMISSIONS_COUNT', permissionCount > 0,
                        `Found ${permissionCount} permissions in database`);
                }
            }
            
            // Specific validation for nist-csf-2.0.json
            if (fileName.includes('nist-csf-2.0.json')) {
                const hasFramework = parsed.framework || parsed.categories || parsed.functions;
                this.logResult('NIST_CSF_STRUCTURE', !!hasFramework,
                    'NIST CSF file has expected framework structure');
            }
            
        } catch (error) {
            this.logResult(`JSON_VALID_${fileName.toUpperCase().replace(/[./-]/g, '_')}`, false,
                `Invalid JSON in ${fileName}: ${error.message}`);
        }
    }

    makeRequest(path) {
        return new Promise((resolve, reject) => {
            const url = `${this.baseUrl}/${path}`;
            
            http.get(url, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        data: data
                    });
                });
                
            }).on('error', (error) => {
                reject(error);
            }).setTimeout(10000, () => {
                reject(new Error('Request timeout'));
            });
        });
    }

    makeExternalRequest(url) {
        return new Promise((resolve, reject) => {
            const protocol = url.startsWith('https:') ? require('https') : require('http');
            
            protocol.get(url, (res) => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers
                });
            }).on('error', (error) => {
                reject(error);
            }).setTimeout(10000, () => {
                reject(new Error('External request timeout'));
            });
        });
    }

    logResult(testName, passed, message) {
        const result = {
            test: testName,
            passed: passed,
            message: message,
            timestamp: new Date().toISOString()
        };
        
        this.testResults.push(result);
        
        const emoji = passed ? '✅' : '❌';
        console.log(`${emoji} ${testName}: ${message}`);
    }

    generateReport() {
        console.log('\n📊 COMPREHENSIVE TEST REPORT');
        console.log('='.repeat(60));
        
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(r => r.passed).length;
        const failedTests = totalTests - passedTests;
        const successRate = ((passedTests / totalTests) * 100).toFixed(1);
        
        console.log(`\n📋 SUMMARY:`);
        console.log(`Total Tests: ${totalTests}`);
        console.log(`Passed: ${passedTests} ✅`);
        console.log(`Failed: ${failedTests} ❌`);
        console.log(`Success Rate: ${successRate}%`);
        
        // Categorize results
        const categories = {
            'Core Application': this.testResults.filter(r => r.test.includes('CORE_FILE') || r.test.includes('WEB_SERVER')),
            'Sample Files': this.testResults.filter(r => r.test.includes('SAMPLE_FILE') || r.test.includes('PERMISSIONS_IN')),
            'Data Files': this.testResults.filter(r => r.test.includes('DATA_FILE') || r.test.includes('JSON_VALID')),
            'External Dependencies': this.testResults.filter(r => r.test.includes('EXTERNAL')),
            'File Format Support': this.testResults.filter(r => r.test.includes('FORMAT_SUPPORT')),
            'Code Validation': this.testResults.filter(r => r.test.includes('HTML_') || r.test.includes('JS_'))
        };
        
        console.log(`\n📊 RESULTS BY CATEGORY:`);
        for (const [category, tests] of Object.entries(categories)) {
            if (tests.length > 0) {
                const categoryPassed = tests.filter(t => t.passed).length;
                const categoryTotal = tests.length;
                const categoryRate = ((categoryPassed / categoryTotal) * 100).toFixed(1);
                
                console.log(`\n${category}: ${categoryPassed}/${categoryTotal} (${categoryRate}%)`);
                tests.forEach(test => {
                    const emoji = test.passed ? '  ✅' : '  ❌';
                    console.log(`${emoji} ${test.test}: ${test.message}`);
                });
            }
        }
        
        // Critical issues
        const criticalIssues = this.testResults.filter(r => !r.passed);
        console.log(`\n🚨 CRITICAL ISSUES (${criticalIssues.length}):`);
        if (criticalIssues.length === 0) {
            console.log('  🎉 No critical issues found! Application is functioning correctly.');
        } else {
            criticalIssues.forEach(issue => {
                console.log(`  ❌ ${issue.test}: ${issue.message}`);
            });
        }
        
        // Save detailed report
        this.saveDetailedReport();
        
        // Return exit code based on results
        if (failedTests > 0) {
            console.log('\n⚠️ Some tests failed. Please review and fix the issues above.');
            process.exit(1);
        } else {
            console.log('\n🎉 All tests passed successfully!');
            process.exit(0);
        }
    }

    saveDetailedReport() {
        const report = {
            summary: {
                totalTests: this.testResults.length,
                passedTests: this.testResults.filter(r => r.passed).length,
                failedTests: this.testResults.filter(r => !r.passed).length,
                successRate: `${((this.testResults.filter(r => r.passed).length / this.testResults.length) * 100).toFixed(1)}%`,
                timestamp: new Date().toISOString()
            },
            results: this.testResults,
            sampleFilesTested: this.sampleFiles,
            recommendations: this.generateRecommendations()
        };
        
        const reportPath = path.join(__dirname, 'test-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`\n💾 Detailed test report saved to: ${reportPath}`);
    }

    generateRecommendations() {
        const failedTests = this.testResults.filter(r => !r.passed);
        const recommendations = [];
        
        if (failedTests.length === 0) {
            recommendations.push("✅ All tests passed! The application is ready for production use.");
            recommendations.push("🔄 Consider running these tests regularly as part of CI/CD pipeline.");
        } else {
            recommendations.push("🔧 Address the following issues:");
            
            // Group recommendations by category
            const coreIssues = failedTests.filter(t => t.test.includes('CORE_FILE') || t.test.includes('WEB_SERVER'));
            const dataIssues = failedTests.filter(t => t.test.includes('DATA_FILE') || t.test.includes('JSON_VALID'));
            const externalIssues = failedTests.filter(t => t.test.includes('EXTERNAL'));
            const sampleIssues = failedTests.filter(t => t.test.includes('SAMPLE_FILE'));
            
            if (coreIssues.length > 0) {
                recommendations.push("  🏗️ Core Application Issues:");
                coreIssues.forEach(issue => {
                    recommendations.push(`    - ${issue.message}`);
                });
            }
            
            if (dataIssues.length > 0) {
                recommendations.push("  📊 Data File Issues:");
                dataIssues.forEach(issue => {
                    recommendations.push(`    - ${issue.message}`);
                });
            }
            
            if (externalIssues.length > 0) {
                recommendations.push("  🌐 External Dependency Issues:");
                externalIssues.forEach(issue => {
                    recommendations.push(`    - ${issue.message}`);
                });
            }
            
            if (sampleIssues.length > 0) {
                recommendations.push("  📄 Sample File Issues:");
                sampleIssues.forEach(issue => {
                    recommendations.push(`    - ${issue.message}`);
                });
            }
        }
        
        return recommendations;
    }
}

// Run tests if this script is executed directly
if (require.main === module) {
    const runner = new TestRunner();
    runner.runTests().catch(error => {
        console.error('Test runner error:', error);
        process.exit(1);
    });
}

module.exports = TestRunner;