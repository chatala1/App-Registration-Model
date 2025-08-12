# RAE Risk Analysis Engine v1

A GitHub Pages web application that analyzes Azure Application Registration permissions against the NIST Cybersecurity Framework 2.0 to identify and assess potential security risks.

## Live Demo

Visit the live application: [https://chatala1.github.io/App-Registration-Model/](https://chatala1.github.io/App-Registration-Model/)

## Features

- **File Upload**: Support for Markdown, JSON, and PDF project plans with enhanced extraction
- **Enhanced PDF Processing**: Comprehensive fallback system for reliable PDF text extraction and permission detection
- **Risk Analysis**: Intelligent parsing and analysis of Azure permissions with expanded pattern matching
- **NIST CSF 2.0 Mapping**: Automatic mapping to NIST Cybersecurity Framework categories
- **Risk Scoring**: Comprehensive risk scoring based on permission levels
- **Recommendations**: Actionable security recommendations
- **Report Generation**: Downloadable HTML and JSON reports
- **Reliable Visualization**: SVG-based chart fallbacks ensuring charts work even when CDNs are blocked
- **Graceful Degradation**: Full functionality maintained even in restricted network environments
- **Responsive Design**: Works on desktop and mobile devices

## How It Works

1. **Upload** your project plan (Markdown or JSON format)
2. **Analyze** the content for Azure Application Registration permissions
3. **Review** the risk assessment and NIST CSF 2.0 mappings
4. **Download** detailed reports for documentation and compliance

## Architecture

```
/docs (GitHub Pages)
├── index.html          # Main application interface
├── upload.js           # File upload handling with PDF support
├── pdf-extractor.js    # Enhanced PDF processing with fallback system
├── risk-analysis.js    # Core analysis engine with expanded patterns
├── fallback-chart.js   # SVG-based chart fallbacks for reliable visualization
├── navigation.js       # Application navigation
├── style.css           # Application styling
├── /data
│   ├── nist-csf-2.0.json      # NIST framework mappings
│   └── entra-permissions.json  # Azure permission definitions
├── /vendor             # Local dependencies for reliability
├── /samples            # Sample project plans
└── /reports
    └── sample-report.html      # Sample analysis report
```

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **PDF Processing**: Enhanced extraction with multiple fallback strategies
- **Charts**: Chart.js with SVG-based fallback system for reliable visualization
- **External Dependencies**: Progressive enhancement with graceful degradation
- **Hosting**: GitHub Pages
- **CI/CD**: GitHub Actions for automated deployment

## Supported Permissions

The application analyzes **54 Azure Application Registration permissions** across critical, high, medium, and low risk categories, covering enterprise authentication, security & compliance, Teams collaboration, device management, and more.

**[View Complete Permissions List](PERMISSIONS.md)** - Detailed breakdown of all 54 supported permissions with risk scores and descriptions

## NIST CSF 2.0 Categories

The application maps detected permissions to these NIST framework categories:

- **GV** - Govern: Risk management and governance
- **ID** - Identify: Asset management and risk assessment
- **PR** - Protect: Access control and data security
- **DE** - Detect: Continuous monitoring and anomaly detection
- **RS** - Respond: Response planning and communications
- **RC** - Recover: Recovery planning and improvements

## Usage Examples

### Sample Project Plan (Markdown)

```markdown
# Customer Portal Application

## Required Permissions
- **User.Read.All**: Read customer profiles
- **Directory.Read.All**: Access organizational structure  
- **Application.ReadWrite.All**: Manage app configurations
- **Files.ReadWrite.All**: Access customer documents

## Security Features
- Multi-factor authentication
- Conditional access policies
- Audit logging enabled
```

### Expected Analysis Output

- **Overall Risk Score**: 28/100 (HIGH)
- **Detected Permissions**: 4 permissions identified
- **CSF Categories**: PR.AC, ID.RA, GV.RM, PR.DS
- **Recommendations**: Multiple actionable security recommendations

## Local Development

1. Clone the repository:
```bash
git clone https://github.com/chatala1/App-Registration-Model.git
cd App-Registration-Model
```

2. Start a local server:
```bash
cd docs
python3 -m http.server 8000
```

3. Open your browser to `http://localhost:8000`

## Deployment

The application automatically deploys to GitHub Pages when changes are pushed to the main branch. The deployment process:

1. GitHub Actions workflow triggers on push
2. Builds and validates the application
3. Deploys to GitHub Pages environment
4. Available at: `https://[username].github.io/App-Registration-Model/`

## Reliability & Performance Improvements

The application has been enhanced with comprehensive fallback systems to ensure consistent functionality:

### Enhanced PDF Processing
- **PDFTextExtractor class** with multiple extraction strategies
- **Pattern-based permission detection** for PDF content  
- **Clear user guidance** when full extraction fails
- **Emergency fallback mode** with actionable recommendations

### Reliable Visualization System
- **FallbackChart class** providing doughnut and bar charts
- **Progressive enhancement** - uses Chart.js when available, SVG when blocked
- **Consistent visualization** regardless of CDN availability
- **Responsive design** matching original Chart.js styling

### Enhanced Permission Detection
- **Expanded pattern matching** to catch more Azure permission variations
- **Improved directory permission detection** for organizational structure
- **Better coverage** for real-world permission descriptions
- **Robust content analysis** across different document formats

### Graceful External Dependency Handling
- **Dynamic script loading** with comprehensive error handling
- **Fallback activation** when external resources fail
- **Full functionality** maintained in restricted network environments
- **Clear logging** of dependency status for debugging

## Risk Analysis Algorithm

The risk scoring algorithm considers:

1. **Permission Risk Level**: Based on Azure permission impact
2. **Content Analysis**: Pattern matching for risk keywords
3. **CSF Mapping**: Alignment with cybersecurity framework
4. **Compliance Requirements**: GDPR, HIPAA, SOX indicators
5. **Best Practices**: Industry security standards

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes in the `docs/` directory
4. Test locally using the development server
5. Commit your changes: `git commit -am 'Add new feature'`
6. Push to the branch: `git push origin feature/new-feature`
7. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [NIST Cybersecurity Framework 2.0](https://www.nist.gov/cyberframework)
- [Microsoft Graph API Permissions](https://docs.microsoft.com/en-us/graph/permissions-reference)
- [Azure App Registration Risk Evaluation Tool](https://github.com/johdcyber/Azure-App-Registration-Risk-Evaluation-Tool)

## Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/chatala1/App-Registration-Model/issues) page
2. Create a new issue with detailed information
3. Use the sample project plan to test functionality

---

**Quick Start**: Try the live demo with the built-in sample project plan! The application features enhanced reliability with comprehensive fallback systems ensuring full functionality even in restricted network environments.
