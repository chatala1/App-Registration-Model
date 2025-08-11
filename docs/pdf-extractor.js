// Enhanced PDF Text Extraction Module
// Provides fallback PDF processing when external PDF.js is not available

class PDFTextExtractor {
    constructor() {
        this.isPdfJsAvailable = false;
        this.checkPdfJsAvailability();
    }
    
    async checkPdfJsAvailability() {
        try {
            // Try to load PDF.js from CDN first
            if (typeof pdfjsLib !== 'undefined') {
                this.isPdfJsAvailable = true;
                return;
            }
            
            // Try to load from local vendor directory
            const script = document.createElement('script');
            script.src = './vendor/pdf.min.js';
            script.onload = () => {
                this.isPdfJsAvailable = true;
                console.log('PDF.js loaded from local vendor directory');
            };
            script.onerror = () => {
                console.warn('PDF.js not available - PDF text extraction will be limited');
                this.isPdfJsAvailable = false;
            };
            document.head.appendChild(script);
            
        } catch (error) {
            console.warn('PDF.js loading failed:', error);
            this.isPdfJsAvailable = false;
        }
    }
    
    async extractTextFromPDF(file) {
        if (this.isPdfJsAvailable && typeof pdfjsLib !== 'undefined') {
            try {
                return await this.extractWithPdfJs(file);
            } catch (error) {
                console.warn('PDF.js extraction failed, using fallback:', error);
                return this.extractWithFallback(file);
            }
        } else {
            return this.extractWithFallback(file);
        }
    }
    
    async extractWithPdfJs(file) {
        const arrayBuffer = await file.arrayBuffer();
        
        // Configure PDF.js worker
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        
        // Extract text from all pages
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + '\n';
        }
        
        return fullText;
    }
    
    async extractWithFallback(file) {
        // Enhanced fallback that attempts to extract any readable text from PDF
        try {
            const text = await file.text();
            
            // Check if the file contains any readable permissions patterns
            const permissionPatterns = [
                /User\.[A-Za-z]+(\.[A-Za-z]+)?/g,
                /Directory\.[A-Za-z]+(\.[A-Za-z]+)?/g,
                /Group\.[A-Za-z]+(\.[A-Za-z]+)?/g,
                /Application\.[A-Za-z]+(\.[A-Za-z]+)?/g,
                /Mail\.[A-Za-z]+/g,
                /Files\.[A-Za-z]+(\.[A-Za-z]+)?/g,
                /Sites\.[A-Za-z]+(\.[A-Za-z]+)?/g,
                /Calendar\.[A-Za-z]+/g,
                /openid|profile|email/g
            ];
            
            let extractedPermissions = [];
            permissionPatterns.forEach(pattern => {
                const matches = text.match(pattern);
                if (matches) {
                    extractedPermissions = extractedPermissions.concat(matches);
                }
            });
            
            if (extractedPermissions.length > 0) {
                // Return a synthetic text that includes the found permissions
                return `PDF Analysis (Fallback Mode)\n\nDetected Permissions:\n${extractedPermissions.join('\n')}\n\nNote: Limited PDF text extraction. For full analysis, convert PDF to text format.`;
            } else {
                // Try to extract basic metadata or structure hints
                const sizeKB = (file.size / 1024).toFixed(2);
                return `PDF Analysis (Fallback Mode)\n\nFile: ${file.name}\nSize: ${sizeKB} KB\n\nNote: Unable to extract permission text from PDF. This may be a scanned document or encrypted PDF. For accurate analysis, please:\n1. Convert PDF to text/markdown format\n2. Copy and paste relevant sections\n3. Use a text-based project plan format\n\nThe application requires readable text to perform permission detection.`;
            }
            
        } catch (error) {
            console.warn('PDF fallback extraction failed:', error);
            return `PDF Analysis Error\n\nUnable to process PDF file: ${file.name}\n\nRecommendations:\n1. Convert PDF to text format (.txt, .md)\n2. Copy permissions from PDF and paste into text format\n3. Use plain text project plans for best results\n\nError details: ${error.message}`;
        }
    }
    
    // Helper method to validate if text contains meaningful permission data
    containsPermissionData(text) {
        const permissionIndicators = [
            'User.', 'Directory.', 'Group.', 'Application.',
            'Mail.', 'Files.', 'Sites.', 'Calendar.',
            'permission', 'scope', 'consent', 'azure', 'graph'
        ];
        
        return permissionIndicators.some(indicator => 
            text.toLowerCase().includes(indicator.toLowerCase())
        );
    }
}

// Export for use in main application
if (typeof window !== 'undefined') {
    window.PDFTextExtractor = PDFTextExtractor;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = PDFTextExtractor;
}