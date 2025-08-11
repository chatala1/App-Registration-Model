# Risk Analysis Web App

A GitHub Pages web application that analyzes Azure Application Registration permissions against the NIST Cybersecurity Framework 2.0 to identify and assess potential security risks.

## Live Demo

Visit the live application: [https://chatala1.github.io/App-Registration-Model/](https://chatala1.github.io/App-Registration-Model/)

## Features

- **File Upload**: Support for Markdown and JSON project plans
- **Risk Analysis**: Intelligent parsing and analysis of Azure permissions
- **NIST CSF 2.0 Mapping**: Automatic mapping to NIST Cybersecurity Framework categories
- **Risk Scoring**: Comprehensive risk scoring based on permission levels
- **Recommendations**: Actionable security recommendations
- **Report Generation**: Downloadable HTML and JSON reports
- **Responsive Design**: Works on desktop and mobile devices

## How It Works

1. **Upload** your project plan (Markdown or JSON format)
2. **Analyze** the content for Azure Application Registration permissions
3. **Review** the risk assessment and NIST CSF 2.0 mappings
4. **Download** detailed reports for documentation and compliance

## Architecture

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

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Charts**: Chart.js for risk visualization
- **Hosting**: GitHub Pages
- **CI/CD**: GitHub Actions for automated deployment

## Supported Permissions

The application analyzes **54 Azure Application Registration permissions** categorized by risk level and impact:

### Critical Risk (Score: 10)
- **Directory.ReadWrite.All** - Read and write directory data
- **RoleManagement.ReadWrite.All** - Read and write role management data  
- **AppRoleAssignment.ReadWrite.All** - Manage app permission grants and app role assignments
- **DelegatedPermissionGrant.ReadWrite.All** - Manage delegated permission grants

### High Risk (Score: 7-9)  
- **Application.ReadWrite.All** - Read and write all applications
- **User.ReadWrite.All** - Read and write all users' full profiles
- **Group.ReadWrite.All** - Read and write all groups
- **Policy.ReadWrite.All** - Read and write organization policies
- **Files.ReadWrite.All** - Have full access to all files user can access
- **Directory.AccessAsUser.All** - Access directory as the signed-in user
- **DeviceManagementApps.ReadWrite.All** - Read and write Microsoft Intune apps
- **DeviceManagementConfiguration.ReadWrite.All** - Read and write Intune device configuration
- **DeviceManagementManagedDevices.ReadWrite.All** - Read and write Intune managed devices
- **Sites.ReadWrite.All** - Read and write items in all site collections
- **Domain.ReadWrite.All** - Read and write domains
- **Organization.ReadWrite.All** - Read and write organization information
- **Sites.Manage.All** - Create, edit, and delete items and lists in all site collections
- **PrivilegedAccess.Read.AzureAD** - Read privileged access to Azure AD

### Medium Risk (Score: 4-6)
- **Directory.Read.All** - Read directory data
- **Application.Read.All** - Read applications and service principals
- **User.Read.All** - Read all users' full profiles
- **Group.Read.All** - Read all groups
- **RoleManagement.Read.All** - Read role management data
- **Policy.Read.All** - Read organization policies
- **AuditLog.Read.All** - Read audit log data
- **SecurityEvents.Read.All** - Read organization security events
- **SecurityActions.Read.All** - Read organization security actions
- **Mail.ReadWrite** - Read and write access to user mail
- **Files.Read.All** - Read all files that the user can access
- **Mail.Send** - Send mail as a user
- **Calendars.ReadWrite** - Have full access to user calendars
- **Contacts.ReadWrite** - Have full access to user contacts
- **Sites.Read.All** - Read items in all site collections
- **Reports.Read.All** - Read usage reports
- **User.ReadWrite** - Read and write access to user profile
- **Tasks.ReadWrite** - Create, read, update and delete user tasks
- **SecurityIncident.Read.All** - Read security incidents
- **IdentityRiskyUser.Read.All** - Read risky user information
- **IdentityRiskEvent.Read.All** - Read identity risk events
- **Team.ReadBasic.All** - Read the names and descriptions of teams
- **ChannelMessage.Read.All** - Read all channel messages
- **ConsentRequest.Read.All** - Read consent requests
- **Device.Read.All** - Read all devices
- **GroupMember.Read.All** - Read group memberships
- **AdministrativeUnit.Read.All** - Read administrative units
- **InformationProtectionPolicy.Read** - Read information protection policies

### Low Risk (Score: 1-3)
- **User.Read** - Sign you in and read your profile
- **Mail.Read** - Read user mail
- **Contacts.Read** - Read user contacts
- **Calendars.Read** - Read user calendars
- **Device.Read** - Read user devices
- **openid** - Sign users in with OpenID Connect
- **profile** - View users basic profile  
- **email** - View users email address

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

**Quick Start**: Try the live demo with the built-in sample project plan!