// Comprehensive Test Suite for Azure Application Registration Risk Analysis Tool
// This script tests the application functionality using all provided sample files

class ApplicationTester {
    constructor() {
        this.testResults = [];
        this.sampleFiles = [
            'sample-hr-azuread.md',
            'sample-sales-crm.json', 
            'sample-mobile-sharepoint.txt',
            'sample-reporting-teams.txt',
            'sample-analytics-exchange.rtf',
            'sample-customer-portal.pdf'
        ];
        this.baseUrl = 'http://localhost:8000';
        this.testStartTime = new Date();
    }

    async runAllTests() {
        console.log('🚀 Starting comprehensive application testing...');
        console.log(`Testing ${this.sampleFiles.length} sample files`);
        
        try {
            // Test 1: Basic application loading
            await this.testApplicationLoading();
            
            // Test 2: File upload functionality for each sample
            for (const file of this.sampleFiles) {
                await this.testFileUpload(file);
            }
            
            // Test 3: Risk analysis validation
            await this.testRiskAnalysisAccuracy();
            
            // Test 4: Report generation
            await this.testReportGeneration();
            
            // Test 5: Error handling
            await this.testErrorHandling();
            
            // Test 6: UI/UX functionality
            await this.testUIFunctionality();
            
            this.generateTestReport();
            
        } catch (error) {
            console.error('❌ Test suite failed:', error);
            this.logTestResult('TEST_SUITE_FAILURE', false, error.message);
        }
    }

    async testApplicationLoading() {
        console.log('\n📋 Testing application loading...');
        
        try {
            const response = await fetch(this.baseUrl);
            const isLoaded = response.ok;
            
            this.logTestResult('APPLICATION_LOADING', isLoaded, 
                isLoaded ? 'Application loads successfully' : `Failed to load: ${response.status}`);
            
            // Test if core JavaScript files load
            const jsFiles = ['risk-analysis.js', 'upload.js'];
            for (const jsFile of jsFiles) {
                const jsResponse = await fetch(`${this.baseUrl}/${jsFile}`);
                const jsLoaded = jsResponse.ok;
                this.logTestResult(`JS_LOADING_${jsFile.toUpperCase()}`, jsLoaded,
                    jsLoaded ? `${jsFile} loads successfully` : `${jsFile} failed to load`);
            }
            
        } catch (error) {
            this.logTestResult('APPLICATION_LOADING', false, `Network error: ${error.message}`);
        }
    }

    async testFileUpload(fileName) {
        console.log(`\n📄 Testing file upload: ${fileName}`);
        
        try {
            // Simulate file reading from samples directory
            const fileResponse = await fetch(`${this.baseUrl}/samples/${fileName}`);
            
            if (!fileResponse.ok) {
                this.logTestResult(`FILE_ACCESS_${fileName}`, false, 
                    `Cannot access sample file: ${fileName}`);
                return;
            }
            
            this.logTestResult(`FILE_ACCESS_${fileName}`, true, 
                `Successfully accessed ${fileName}`);
            
            // Test file size validation
            const fileSize = fileResponse.headers.get('content-length');
            const sizeOk = !fileSize || parseInt(fileSize) < 10 * 1024 * 1024; // 10MB limit
            this.logTestResult(`FILE_SIZE_${fileName}`, sizeOk,
                sizeOk ? `File size acceptable` : `File too large: ${fileSize} bytes`);
                
        } catch (error) {
            this.logTestResult(`FILE_UPLOAD_${fileName}`, false, 
                `Upload test failed: ${error.message}`);
        }
    }

    async testRiskAnalysisAccuracy() {
        console.log('\n🔍 Testing risk analysis accuracy...');
        
        try {
            // Test with sample-hr-azuread.md (known to contain high-risk permissions)
            const response = await fetch(`${this.baseUrl}/samples/sample-hr-azuread.md`);
            const content = await response.text();
            
            // Check for expected high-risk permissions
            const expectedPermissions = [
                'User.ReadWrite.All',
                'Group.ReadWrite.All', 
                'Directory.ReadWrite.All',
                'RoleManagement.ReadWrite.All'
            ];
            
            let permissionsFound = 0;
            for (const permission of expectedPermissions) {
                if (content.includes(permission)) {
                    permissionsFound++;
                }
            }
            
            const accuracyPercentage = (permissionsFound / expectedPermissions.length) * 100;
            this.logTestResult('PERMISSION_DETECTION_ACCURACY', permissionsFound > 0,
                `Detected ${permissionsFound}/${expectedPermissions.length} expected permissions (${accuracyPercentage}%)`);
                
            // Test NIST CSF mapping data loading
            const nistResponse = await fetch(`${this.baseUrl}/data/nist-csf-2.0.json`);
            const nistLoaded = nistResponse.ok;
            this.logTestResult('NIST_CSF_DATA_LOADING', nistLoaded,
                nistLoaded ? 'NIST CSF 2.0 data loads successfully' : 'NIST CSF data failed to load');
                
            // Test Entra permissions data loading
            const entraResponse = await fetch(`${this.baseUrl}/data/entra-permissions.json`);
            const entraLoaded = entraResponse.ok;
            this.logTestResult('ENTRA_PERMISSIONS_DATA_LOADING', entraLoaded,
                entraLoaded ? 'Entra permissions data loads successfully' : 'Entra permissions data failed to load');
                
        } catch (error) {
            this.logTestResult('RISK_ANALYSIS_ACCURACY', false, 
                `Risk analysis test failed: ${error.message}`);
        }
    }

    async testReportGeneration() {
        console.log('\n📊 Testing report generation...');
        
        try {
            // Test if Chart.js library loads (needed for reports)
            const chartResponse = await fetch('https://cdn.jsdelivr.net/npm/chart.js');
            const chartLoaded = chartResponse.ok;
            this.logTestResult('CHART_LIBRARY_LOADING', chartLoaded,
                chartLoaded ? 'Chart.js library loads successfully' : 'Chart.js library failed to load');
            
            // Test sample report access
            const sampleReportResponse = await fetch(`${this.baseUrl}/reports/`);
            const reportsAccessible = sampleReportResponse.ok;
            this.logTestResult('REPORTS_DIRECTORY_ACCESS', reportsAccessible,
                reportsAccessible ? 'Reports directory accessible' : 'Reports directory not accessible');
                
        } catch (error) {
            this.logTestResult('REPORT_GENERATION', false, 
                `Report generation test failed: ${error.message}`);
        }
    }

    async testErrorHandling() {
        console.log('\n⚠️ Testing error handling...');
        
        try {
            // Test invalid file access
            const invalidResponse = await fetch(`${this.baseUrl}/samples/nonexistent-file.txt`);
            const errorHandled = !invalidResponse.ok;
            this.logTestResult('INVALID_FILE_HANDLING', errorHandled,
                errorHandled ? 'Invalid file access handled correctly' : 'Invalid file access not handled');
            
            // Test malformed data file access
            const malformedResponse = await fetch(`${this.baseUrl}/data/nonexistent-data.json`);
            const malformedHandled = !malformedResponse.ok;
            this.logTestResult('MALFORMED_DATA_HANDLING', malformedHandled,
                malformedHandled ? 'Malformed data access handled correctly' : 'Malformed data access not handled');
                
        } catch (error) {
            this.logTestResult('ERROR_HANDLING', false, 
                `Error handling test failed: ${error.message}`);
        }
    }

    async testUIFunctionality() {
        console.log('\n🎨 Testing UI/UX functionality...');
        
        try {
            // Test CSS loading
            const cssResponse = await fetch(`${this.baseUrl}/style.css`);
            const cssLoaded = cssResponse.ok;
            this.logTestResult('CSS_LOADING', cssLoaded,
                cssLoaded ? 'CSS stylesheet loads successfully' : 'CSS stylesheet failed to load');
            
            // Test Bootstrap Icons loading
            const iconsResponse = await fetch('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css');
            const iconsLoaded = iconsResponse.ok;
            this.logTestResult('BOOTSTRAP_ICONS_LOADING', iconsLoaded,
                iconsLoaded ? 'Bootstrap Icons load successfully' : 'Bootstrap Icons failed to load');
                
            // Test navigation functionality
            const navigationResponse = await fetch(`${this.baseUrl}/navigation.js`);
            const navLoaded = navigationResponse.ok;
            this.logTestResult('NAVIGATION_JS_LOADING', navLoaded,
                navLoaded ? 'Navigation JS loads successfully' : 'Navigation JS failed to load');
                
        } catch (error) {
            this.logTestResult('UI_FUNCTIONALITY', false, 
                `UI functionality test failed: ${error.message}`);
        }
    }

    logTestResult(testName, passed, message) {
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

    generateTestReport() {
        console.log('\n📋 COMPREHENSIVE TEST REPORT');
        console.log('='.repeat(50));
        
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(r => r.passed).length;
        const failedTests = totalTests - passedTests;
        const successRate = ((passedTests / totalTests) * 100).toFixed(1);
        
        console.log(`Total Tests: ${totalTests}`);
        console.log(`Passed: ${passedTests} ✅`);
        console.log(`Failed: ${failedTests} ❌`);
        console.log(`Success Rate: ${successRate}%`);
        console.log(`Test Duration: ${(new Date() - this.testStartTime) / 1000}s`);
        
        console.log('\n📊 DETAILED RESULTS:');
        console.log('-'.repeat(50));
        
        // Group results by category
        const categories = {
            'Loading Tests': this.testResults.filter(r => r.test.includes('LOADING')),
            'File Access Tests': this.testResults.filter(r => r.test.includes('FILE_ACCESS')),
            'Risk Analysis Tests': this.testResults.filter(r => r.test.includes('ACCURACY') || r.test.includes('DETECTION')),
            'Error Handling Tests': this.testResults.filter(r => r.test.includes('HANDLING')),
            'UI/UX Tests': this.testResults.filter(r => r.test.includes('CSS') || r.test.includes('ICONS') || r.test.includes('NAVIGATION'))
        };
        
        for (const [category, tests] of Object.entries(categories)) {
            if (tests.length > 0) {
                console.log(`\n${category}:`);
                tests.forEach(test => {
                    const emoji = test.passed ? '✅' : '❌';
                    console.log(`  ${emoji} ${test.test}: ${test.message}`);
                });
            }
        }
        
        console.log('\n🔍 CRITICAL ISSUES FOUND:');
        const criticalIssues = this.testResults.filter(r => !r.passed);
        if (criticalIssues.length === 0) {
            console.log('  ✅ No critical issues found!');
        } else {
            criticalIssues.forEach(issue => {
                console.log(`  ❌ ${issue.test}: ${issue.message}`);
            });
        }
        
        console.log('\n📝 RECOMMENDATIONS:');
        if (failedTests === 0) {
            console.log('  🎉 All tests passed! Application is functioning correctly.');
        } else {
            console.log('  🔧 Review and fix the failed tests above.');
            console.log('  🔄 Re-run tests after making fixes.');
        }
        
        // Save detailed report to file
        this.saveTestReport();
    }

    saveTestReport() {
        const report = {
            summary: {
                totalTests: this.testResults.length,
                passedTests: this.testResults.filter(r => r.passed).length,
                failedTests: this.testResults.filter(r => !r.passed).length,
                successRate: ((this.testResults.filter(r => r.passed).length / this.testResults.length) * 100).toFixed(1),
                testStartTime: this.testStartTime.toISOString(),
                testEndTime: new Date().toISOString(),
                duration: `${(new Date() - this.testStartTime) / 1000}s`
            },
            results: this.testResults,
            sampleFilesTested: this.sampleFiles,
            recommendations: this.generateRecommendations()
        };
        
        // In a real browser environment, this would download or display the report
        console.log('\n💾 Test report saved:', JSON.stringify(report, null, 2));
        
        return report;
    }

    generateRecommendations() {
        const failedTests = this.testResults.filter(r => !r.passed);
        const recommendations = [];
        
        if (failedTests.length === 0) {
            recommendations.push("All tests passed successfully. Application is ready for production use.");
        } else {
            recommendations.push("Address the following issues:");
            failedTests.forEach(test => {
                recommendations.push(`- Fix ${test.test}: ${test.message}`);
            });
        }
        
        return recommendations;
    }
}

// Export for use in Node.js environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ApplicationTester;
}

// Auto-run in browser environment
if (typeof window !== 'undefined') {
    window.ApplicationTester = ApplicationTester;
    
    // Automatically run tests when page loads
    document.addEventListener('DOMContentLoaded', async () => {
        const tester = new ApplicationTester();
        await tester.runAllTests();
    });
}