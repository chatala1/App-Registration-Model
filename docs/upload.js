// Upload functionality
class FileUploader {
    constructor() {
        this.uploadArea = document.getElementById('upload-area');
        this.fileInput = document.getElementById('file-input');
        this.fileInfo = document.getElementById('file-info');
        this.fileName = document.getElementById('file-name');
        this.fileSize = document.getElementById('file-size');
        this.analyzeBtn = document.getElementById('analyze-btn');
        this.loadSampleBtn = document.getElementById('load-sample'); // May not exist with new design
        
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
        
        // Sample card click handlers
        document.addEventListener('click', (e) => {
            const sampleCard = e.target.closest('.sample-card');
            if (sampleCard) {
                const sampleType = sampleCard.dataset.sample;
                const sampleFormat = sampleCard.dataset.format;
                this.loadSamplePlan(sampleType, sampleFormat);
            }
        });
        
        // Legacy load sample button (if it exists)
        if (this.loadSampleBtn) {
            this.loadSampleBtn.addEventListener('click', () => {
                this.loadSamplePlan('sales-crm', 'json');
            });
        }
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
            '.pdf': 'PDF Document',
            '.docx': 'Word Document',
            '.doc': 'Word Document',
            '.rtf': 'Rich Text Document',
            '.md': 'Markdown Document',
            '.json': 'JSON Data',
            '.txt': 'Text Document',
            '.text': 'Text Document'
        };
        
        const fileTypeDisplay = fileTypeMap[fileExtension] || 'Document';
        
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
                    
                    // If text extraction resulted in minimal content, try OCR
                    if (textContent.trim().length < 50) {
                        console.log('Text extraction yielded minimal content, attempting OCR...');
                        try {
                            const ocrText = await this.performOCROnPDF(pdf);
                            if (ocrText && ocrText.trim().length > textContent.trim().length) {
                                textContent = ocrText;
                            }
                        } catch (ocrError) {
                            console.warn('OCR failed:', ocrError.message);
                            // Continue with original text even if OCR fails
                        }
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
    
    // Perform OCR on PDF pages
    async performOCROnPDF(pdf) {
        let ocrText = '';
        const maxPages = Math.min(pdf.numPages, 3); // Limit to first 3 pages for performance
        
        for (let i = 1; i <= maxPages; i++) {
            try {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 2.0 });
                
                // Create canvas to render PDF page
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                
                // Render PDF page to canvas
                await page.render({
                    canvasContext: context,
                    viewport: viewport
                }).promise;
                
                // Convert canvas to image data for OCR
                const imageData = canvas.toDataURL('image/png');
                
                // Perform OCR on the image
                const { data: { text } } = await Tesseract.recognize(imageData, 'eng', {
                    logger: m => {
                        if (m.status === 'recognizing text') {
                            console.log(`OCR Progress Page ${i}: ${Math.round(m.progress * 100)}%`);
                        }
                    }
                });
                
                ocrText += text + '\n';
                
            } catch (error) {
                console.warn(`OCR failed for page ${i}:`, error.message);
                continue;
            }
        }
        
        return ocrText;
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
    
    async loadSamplePlan(sampleType = 'sales-crm', format = 'json') {
        const samples = {
            'sales-crm': {
                json: {
                    fileName: 'sample-sales-crm.json',
                    path: 'samples/sample-sales-crm.json'
                }
            },
            'mobile-sharepoint': {
                txt: {
                    fileName: 'sample-mobile-sharepoint.txt',
                    path: 'samples/sample-mobile-sharepoint.txt'
                }
            },
            'analytics-exchange': {
                rtf: {
                    fileName: 'sample-analytics-exchange.rtf',
                    path: 'samples/sample-analytics-exchange.rtf'
                }
            },
            'hr-azuread': {
                md: {
                    fileName: 'sample-hr-azuread.md',
                    path: 'samples/sample-hr-azuread.md'
                }
            },
            'reporting-teams': {
                txt: {
                    fileName: 'sample-reporting-teams.txt',
                    path: 'samples/sample-reporting-teams.txt'
                }
            }
        };

        try {
            const sample = samples[sampleType]?.[format];
            if (!sample) {
                throw new Error(`Sample ${sampleType} in ${format} format not found`);
            }

            // Fetch the sample file
            const response = await fetch(sample.path);
            if (!response.ok) {
                throw new Error(`Failed to load sample: ${response.statusText}`);
            }
            
            const sampleContent = await response.text();
            
            // Simulate file upload with sample content
            this.currentContent = sampleContent;
            this.currentFile = { 
                name: sample.fileName, 
                size: sampleContent.length,
                type: this.getFileType(format)
            };
            
            this.displayFileInfo(this.currentFile);
            this.analyzeBtn.disabled = false;

            // Show visual feedback
            this.highlightSelectedSample(sampleType);
            
        } catch (error) {
            console.error('Error loading sample:', error);
            alert(`Failed to load sample: ${error.message}`);
        }
    }

    highlightSelectedSample(sampleType) {
        // Remove previous highlights
        document.querySelectorAll('.sample-card').forEach(card => {
            card.classList.remove('sample-selected');
        });
        
        // Add highlight to selected sample
        const selectedCard = document.querySelector(`[data-sample="${sampleType}"]`);
        if (selectedCard) {
            selectedCard.classList.add('sample-selected');
            setTimeout(() => selectedCard.classList.remove('sample-selected'), 2000);
        }
    }

    getFileType(format) {
        const typeMap = {
            'json': 'application/json',
            'txt': 'text/plain',
            'rtf': 'application/rtf',
            'md': 'text/markdown',
            'pdf': 'application/pdf',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'doc': 'application/msword'
        };
        return typeMap[format] || 'text/plain';
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