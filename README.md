# 🔒 Risk Analysis Web App

A GitHub Pages web application that analyzes Azure Application Registration permissions against the NIST Cybersecurity Framework 2.0 to identify and assess potential security risks.

## 🚀 Live Demo

Visit the live application: [https://chatala1.github.io/App-Registration-Model/](https://chatala1.github.io/App-Registration-Model/)

## ✨ Features

- **📄 File Upload**: Support for Markdown and JSON project plans
- **🔍 Risk Analysis**: Intelligent parsing and analysis of Azure permissions
- **📊 NIST CSF 2.0 Mapping**: Automatic mapping to NIST Cybersecurity Framework categories
- **⚠️ Risk Scoring**: Comprehensive risk scoring based on permission levels
- **💡 Recommendations**: Actionable security recommendations
- **📥 Report Generation**: Downloadable HTML and JSON reports
- **📱 Responsive Design**: Works on desktop and mobile devices

## 🎯 How It Works

1. **Upload** your project plan (Markdown or JSON format)
2. **Analyze** the content for Azure Application Registration permissions
3. **Review** the risk assessment and NIST CSF 2.0 mappings
4. **Download** detailed reports for documentation and compliance

## 🏗️ Architecture

```
📁 /docs (GitHub Pages)
├── index.html          # Main application interface
├── upload.js           # File upload handling
├── risk-analysis.js    # Core analysis engine
├── style.css           # Application styling
├── /data
│   ├── nist-csf-2.0.json      # NIST framework mappings
│   └── entra-permissions.json  # Azure permission definitions
└── /reports
    └── sample-report.html      # Sample analysis report
```

## 🔧 Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Charts**: Chart.js for risk visualization
- **Hosting**: GitHub Pages
- **CI/CD**: GitHub Actions for automated deployment

## 📋 Supported Permissions

The application analyzes the following Azure Application Registration permissions:

### Critical Risk (Score: 10)
- `Directory.ReadWrite.All`
- `RoleManagement.ReadWrite.All`

### High Risk (Score: 7-9)
- `Application.ReadWrite.All`
- `User.ReadWrite.All`
- `Group.ReadWrite.All`
- `Policy.ReadWrite.All`
- `Files.ReadWrite.All`

### Medium Risk (Score: 4-6)
- `Directory.Read.All`
- `Application.Read.All`
- `User.Read.All`
- `AuditLog.Read.All`
- `SecurityEvents.Read.All`

### Low Risk (Score: 1-3)
- `Mail.Read`
- `Group.Read.All`
- Basic profile permissions

## 🎯 NIST CSF 2.0 Categories

The application maps detected permissions to these NIST framework categories:

- **GV** - Govern: Risk management and governance
- **ID** - Identify: Asset management and risk assessment
- **PR** - Protect: Access control and data security
- **DE** - Detect: Continuous monitoring and anomaly detection
- **RS** - Respond: Response planning and communications
- **RC** - Recover: Recovery planning and improvements

## 📖 Usage Examples

### Sample Project Plan (Markdown)

```markdown
# Customer Portal Application

## Required Permissions
- User.Read.All: Read customer profiles
- Directory.Read.All: Access organizational structure
- Application.ReadWrite.All: Manage app configurations
- Files.ReadWrite.All: Access customer documents

## Security Features
- Multi-factor authentication
- Conditional access policies
- Audit logging enabled
```

### Expected Analysis Output

- **Overall Risk Score**: 75/100 (HIGH)
- **Detected Permissions**: 4 permissions identified
- **CSF Categories**: PR.AC, ID.RA, GV.RM, PR.DS
- **Recommendations**: 7 actionable items

## 🛠️ Local Development

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

## 🚀 Deployment

The application automatically deploys to GitHub Pages when changes are pushed to the main branch. The deployment process:

1. GitHub Actions workflow triggers on push
2. Builds and validates the application
3. Deploys to GitHub Pages environment
4. Available at: `https://[username].github.io/App-Registration-Model/`

## 🔍 Risk Analysis Algorithm

The risk scoring algorithm considers:

1. **Permission Risk Level**: Based on Azure permission impact
2. **Content Analysis**: Pattern matching for risk keywords
3. **CSF Mapping**: Alignment with cybersecurity framework
4. **Compliance Requirements**: GDPR, HIPAA, SOX indicators
5. **Best Practices**: Industry security standards

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes in the `docs/` directory
4. Test locally using the development server
5. Commit your changes: `git commit -am 'Add new feature'`
6. Push to the branch: `git push origin feature/new-feature`
7. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [NIST Cybersecurity Framework 2.0](https://www.nist.gov/cyberframework)
- [Microsoft Graph API Permissions](https://docs.microsoft.com/en-us/graph/permissions-reference)
- [Azure App Registration Risk Evaluation Tool](https://github.com/johdcyber/Azure-App-Registration-Risk-Evaluation-Tool)

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/chatala1/App-Registration-Model/issues) page
2. Create a new issue with detailed information
3. Use the sample project plan to test functionality

---

**⚡ Quick Start**: Try the live demo with the built-in sample project plan!
