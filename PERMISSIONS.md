# Supported Azure Application Registration Permissions

The Risk Analysis Web App analyzes **54 Azure Application Registration permissions** categorized by risk level and impact:

## Critical Risk (Score: 10)
- **Directory.ReadWrite.All** - Read and write directory data
- **RoleManagement.ReadWrite.All** - Read and write role management data  
- **AppRoleAssignment.ReadWrite.All** - Manage app permission grants and app role assignments
- **DelegatedPermissionGrant.ReadWrite.All** - Manage delegated permission grants

## High Risk (Score: 7-9)  
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

## Medium Risk (Score: 4-6)
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

## Low Risk (Score: 1-3)
- **User.Read** - Sign you in and read your profile
- **Mail.Read** - Read user mail
- **Contacts.Read** - Read user contacts
- **Calendars.Read** - Read user calendars
- **Device.Read** - Read user devices
- **openid** - Sign users in with OpenID Connect
- **profile** - View users basic profile  
- **email** - View users email address

## Permission Categories

These permissions cover common enterprise scenarios including:

- **Enterprise Authentication & Identity**: OpenID Connect claims, user management, administrative units
- **Security & Compliance**: Identity protection, security incidents, information protection policies
- **Teams & Collaboration**: Basic team information, channel messages
- **Device Management**: User devices, organization-wide device access
- **Directory Operations**: Reading and writing directory data, role management
- **Application Management**: Creating and managing application registrations
- **File & Document Access**: SharePoint sites, OneDrive files
- **Communication**: Email, calendars, contacts

## NIST CSF 2.0 Mapping

All permissions are mapped to NIST Cybersecurity Framework 2.0 categories:

- **GV** - Govern: Risk management and governance
- **ID** - Identify: Asset management and risk assessment  
- **PR** - Protect: Access control and data security
- **DE** - Detect: Continuous monitoring and anomaly detection
- **RS** - Respond: Response planning and communications
- **RC** - Recover: Recovery planning and improvements

For detailed technical specifications and risk mappings, see the [entra-permissions.json](docs/data/entra-permissions.json) data file.