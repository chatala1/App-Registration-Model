// Upload functionality
class FileUploader {
    constructor() {
        this.uploadArea = document.getElementById('upload-area');
        this.fileInput = document.getElementById('file-input');
        this.fileInfo = document.getElementById('file-info');
        this.fileName = document.getElementById('file-name');
        this.fileSize = document.getElementById('file-size');
        this.analyzeBtn = document.getElementById('analyze-btn');
        this.loadSampleBtn = document.getElementById('load-sample');
        
        this.currentFile = null;
        this.currentContent = null;
        
        this.initializeEventListeners();
    }
    
    initializeEventListeners() {
        // Upload area click
        this.uploadArea.addEventListener('click', () => {
            this.fileInput.click();
        });
        
        // File input change
        this.fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFile(e.target.files[0]);
            }
        });
        
        // Drag and drop
        this.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadArea.classList.add('dragover');
        });
        
        this.uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            this.uploadArea.classList.remove('dragover');
        });
        
        this.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadArea.classList.remove('dragover');
            
            if (e.dataTransfer.files.length > 0) {
                this.handleFile(e.dataTransfer.files[0]);
            }
        });
        
        // Analyze button
        this.analyzeBtn.addEventListener('click', () => {
            this.startAnalysis();
        });
        
        // Load sample button
        this.loadSampleBtn.addEventListener('click', () => {
            this.loadSamplePlan();
        });
    }
    
    handleFile(file) {
        // Validate file type
        const validTypes = ['.md', '.json', '.txt'];
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        
        if (!validTypes.includes(fileExtension)) {
            alert('Please upload a Markdown (.md) or JSON (.json) file.');
            return;
        }
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB.');
            return;
        }
        
        this.currentFile = file;
        this.displayFileInfo(file);
        this.readFileContent(file);
    }
    
    displayFileInfo(file) {
        this.fileName.textContent = file.name;
        this.fileSize.textContent = this.formatFileSize(file.size);
        this.fileInfo.style.display = 'flex';
        
        // Hide upload area and show file info
        this.uploadArea.style.display = 'none';
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    readFileContent(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            this.currentContent = e.target.result;
            this.analyzeBtn.disabled = false;
        };
        
        reader.onerror = () => {
            alert('Error reading file. Please try again.');
            this.resetUpload();
        };
        
        reader.readAsText(file);
    }
    
    async loadSamplePlan() {
        const sampleContent = `# Sample Project Plan - Customer Portal Application

## Project Overview
This project involves creating a customer portal application with Azure AD integration for authentication and user management.

## Application Registration Requirements

### Required Permissions
- **User.Read.All**: Read all users' full profiles for customer lookup
- **Directory.Read.All**: Access directory data for organizational structure
- **Application.ReadWrite.All**: Manage application configurations
- **Group.ReadWrite.All**: Manage customer groups and access levels
- **Mail.Send**: Send notifications to customers
- **Files.ReadWrite.All**: Access customer documents and files

### Application Features
- Customer authentication via Azure AD
- User profile management
- Document sharing and collaboration
- Email notifications for important updates
- Administrative dashboard for user management
- Integration with Microsoft Graph API

### Security Considerations
- Implement conditional access policies
- Enable multi-factor authentication
- Regular audit of application permissions
- Monitor sign-in activities and security events

### Compliance Requirements
- Ensure GDPR compliance for customer data
- Implement data retention policies
- Regular security assessments
- Audit logging for all critical operations

## Risk Factors
- **High privilege permissions**: Application.ReadWrite.All and Directory.Read.All
- **Sensitive data access**: Files.ReadWrite.All for customer documents
- **User management capabilities**: Group.ReadWrite.All for access control
- **Email sending capabilities**: Mail.Send for notifications

## Deployment Plan
1. Development environment setup
2. Testing with limited permissions
3. Security review and approval
4. Production deployment with monitoring
5. Regular permission reviews and updates`;

        // Simulate file upload with sample content
        this.currentContent = sampleContent;
        this.currentFile = { name: 'sample-project-plan.md', size: sampleContent.length };
        this.displayFileInfo(this.currentFile);
        this.analyzeBtn.disabled = false;
    }
    
    startAnalysis() {
        if (!this.currentContent) {
            alert('No file content to analyze.');
            return;
        }
        
        // Show loading state
        this.analyzeBtn.innerHTML = '<span class="loading"></span> Analyzing...';
        this.analyzeBtn.disabled = true;
        
        // Start analysis with the risk analyzer
        setTimeout(() => {
            if (window.riskAnalyzer) {
                window.riskAnalyzer.analyzeContent(this.currentContent);
            } else {
                console.error('Risk analyzer not available');
                this.resetAnalyzeButton();
            }
        }, 500);
    }
    
    resetAnalyzeButton() {
        this.analyzeBtn.innerHTML = '🔍 Analyze Risks';
        this.analyzeBtn.disabled = false;
    }
    
    resetUpload() {
        this.currentFile = null;
        this.currentContent = null;
        this.fileInfo.style.display = 'none';
        this.uploadArea.style.display = 'block';
        this.fileInput.value = '';
        this.resetAnalyzeButton();
    }
    
    // Method to be called by risk analyzer when analysis is complete
    onAnalysisComplete() {
        this.resetAnalyzeButton();
    }
}

// Initialize uploader when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.fileUploader = new FileUploader();
});