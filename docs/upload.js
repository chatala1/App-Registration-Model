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
        
        this.initializePDFWorker();
        this.initializeEventListeners();
    }
    
    initializePDFWorker() {
        // Configure PDF.js worker
        if (typeof pdfjsLib !== 'undefined') {
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }
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
        const validTypes = ['.md', '.json', '.txt', '.text', '.pdf', '.docx', '.doc', '.rtf'];
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        
        if (!validTypes.includes(fileExtension)) {
            alert('Please upload a supported document format (.md, .json, .txt, .pdf, .docx, .doc, .rtf).');
            return;
        }
        
        // Validate file size (max 10MB for document processing)
        if (file.size > 10 * 1024 * 1024) {
            alert('File size must be less than 10MB.');
            return;
        }
        
        this.currentFile = file;
        this.displayFileInfo(file);
        this.readFileContent(file);
    }
    
    displayFileInfo(file) {
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        const fileTypeMap = {
            '.pdf': '📄 PDF Document',
            '.docx': '📝 Word Document',
            '.doc': '📝 Word Document',
            '.rtf': '📝 Rich Text Document',
            '.md': '📋 Markdown Document',
            '.json': '🔧 JSON Data',
            '.txt': '📄 Text Document',
            '.text': '📄 Text Document'
        };
        
        const fileTypeDisplay = fileTypeMap[fileExtension] || '📄 Document';
        
        this.fileName.textContent = file.name;
        this.fileSize.textContent = `${this.formatFileSize(file.size)} • ${fileTypeDisplay}`;
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
    
    async readFileContent(file) {
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        
        try {
            // Show processing message with file type specific info
            const processingMessages = {
                '.pdf': 'Extracting text from PDF...',
                '.docx': 'Processing Word document...',
                '.doc': 'Processing Word document...',
                '.rtf': 'Converting RTF document...',
                '.md': 'Reading Markdown...',
                '.json': 'Parsing JSON data...',
                '.txt': 'Reading text file...',
                '.text': 'Reading text file...'
            };
            
            const message = processingMessages[fileExtension] || 'Processing document...';
            this.analyzeBtn.innerHTML = `<span class="loading"></span> ${message}`;
            this.analyzeBtn.disabled = true;
            
            let content = '';
            
            switch (fileExtension) {
                case '.pdf':
                    content = await this.extractTextFromPDF(file);
                    break;
                case '.docx':
                case '.doc':
                    content = await this.extractTextFromDocx(file);
                    break;
                case '.rtf':
                    content = await this.extractTextFromRTF(file);
                    break;
                case '.md':
                case '.json':
                case '.txt':
                case '.text':
                default:
                    content = await this.readTextFile(file);
                    break;
            }
            
            if (!content || content.trim().length === 0) {
                throw new Error('No readable content found in the document');
            }
            
            // Check if content is meaningful (more than just whitespace/formatting)
            const meaningfulContent = content.replace(/\s+/g, ' ').trim();
            if (meaningfulContent.length < 10) {
                throw new Error('Document appears to contain insufficient text content for analysis');
            }
            
            this.currentContent = content;
            this.analyzeBtn.innerHTML = '🔍 Analyze Risks';
            this.analyzeBtn.disabled = false;
            
            // Show success message briefly
            const originalText = this.analyzeBtn.innerHTML;
            this.analyzeBtn.innerHTML = '✅ Document processed successfully';
            setTimeout(() => {
                this.analyzeBtn.innerHTML = originalText;
            }, 2000);
            
        } catch (error) {
            console.error('Error processing file:', error);
            
            // Provide more helpful error messages
            let errorMessage = error.message;
            if (error.message.includes('PDF')) {
                errorMessage = 'Unable to extract text from PDF. Please ensure the PDF contains selectable text (not just images).';
            } else if (error.message.includes('DOCX') || error.message.includes('DOC')) {
                errorMessage = 'Unable to process Word document. Please try saving as a different format or check if the file is corrupted.';
            } else if (error.message.includes('RTF')) {
                errorMessage = 'Unable to process RTF document. Please try converting to plain text format.';
            }
            
            alert(`Error processing file: ${errorMessage}`);
            this.resetUpload();
        }
    }
    
    // Extract text from PDF files
    async extractTextFromPDF(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = async (e) => {
                try {
                    const typedArray = new Uint8Array(e.target.result);
                    const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
                    let textContent = '';
                    
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const content = await page.getTextContent();
                        const pageText = content.items.map(item => item.str).join(' ');
                        textContent += pageText + '\n';
                    }
                    
                    resolve(textContent);
                } catch (error) {
                    reject(new Error('Failed to parse PDF: ' + error.message));
                }
            };
            
            reader.onerror = () => reject(new Error('Failed to read PDF file'));
            reader.readAsArrayBuffer(file);
        });
    }
    
    // Extract text from DOCX files
    async extractTextFromDocx(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = async (e) => {
                try {
                    const arrayBuffer = e.target.result;
                    const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
                    
                    if (result.value && result.value.trim()) {
                        resolve(result.value);
                    } else {
                        reject(new Error('No text content found in the document'));
                    }
                } catch (error) {
                    reject(new Error('Failed to parse DOCX: ' + error.message));
                }
            };
            
            reader.onerror = () => reject(new Error('Failed to read DOCX file'));
            reader.readAsArrayBuffer(file);
        });
    }
    
    // Extract text from RTF files
    async extractTextFromRTF(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const rtfContent = e.target.result;
                    // Basic RTF to text conversion
                    const textContent = this.convertRTFToText(rtfContent);
                    
                    if (textContent && textContent.trim()) {
                        resolve(textContent);
                    } else {
                        reject(new Error('No readable text found in RTF file'));
                    }
                } catch (error) {
                    reject(new Error('Failed to parse RTF: ' + error.message));
                }
            };
            
            reader.onerror = () => reject(new Error('Failed to read RTF file'));
            reader.readAsText(file);
        });
    }
    
    // Read regular text files
    async readTextFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                resolve(e.target.result);
            };
            
            reader.onerror = () => reject(new Error('Failed to read text file'));
            reader.readAsText(file);
        });
    }
    
    // Convert RTF to plain text (basic implementation)
    convertRTFToText(rtfContent) {
        // Remove RTF control words and formatting
        let text = rtfContent.replace(/\\[a-z]+\d*/g, ''); // Remove control words
        text = text.replace(/\\[^a-z]/g, ''); // Remove other control sequences
        text = text.replace(/[{}]/g, ''); // Remove braces
        text = text.replace(/\s+/g, ' '); // Normalize whitespace
        text = text.replace(/^\s*rtf\d*\s*/i, ''); // Remove RTF header
        text = text.replace(/ansi|deff\d*|fonttbl|f\d*/gi, ''); // Remove common RTF keywords
        text = text.replace(/par\s*/gi, '\n'); // Convert \par to newlines
        text = text.trim();
        
        return text;
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