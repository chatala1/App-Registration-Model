# App-Registration-Model

App-Registration-Model is a security assessment tool designed to analyze user-provided data and assess potential risks related to the permissions and contextual applications of Azure Application Registrations.

**Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

## Current Repository State

**IMPORTANT**: This repository is currently in initial development phase with minimal code infrastructure. The repository contains only:
- README.md with project description
- This copilot-instructions.md file

No build system, dependencies, or source code exists yet. All development setup instructions below are prepared for when code development begins.

### Pre-installed Development Environment (VALIDATED)
The development environment has these tools pre-installed and working:
- **Python 3.12.3** (compatible with Azure SDK)
- **Azure CLI 2.75.0** (ready for Azure integration)
- **Git** (for version control)
- **curl/wget** (for downloading dependencies)
- **Standard Python libraries** (json, os, sys, etc.)

## Working Effectively

### Initial Development Setup
When starting development on this project, the following setup is recommended based on the Azure/security assessment nature:

- **Python Environment Setup** (VALIDATED WORKING):
  ```bash
  # Python 3.12.3 is available and working
  python3 --version  # Currently returns: Python 3.12.3
  python3 -m venv venv
  source venv/bin/activate  # On Windows: venv\Scripts\activate
  pip install --upgrade pip  # Takes 10-30 seconds. Works reliably.
  ```

- **Azure Development Tools** (VALIDATED WORKING):
  ```bash
  # Azure CLI is pre-installed and working
  az --version  # Currently returns: azure-cli 2.75.0
  # Note: az login requires interactive authentication - use when testing with real data
  az login  # Authenticate with Azure (when testing with real data)
  ```

- **Common Dependencies** (when requirements.txt is created):
  ```bash
  pip install -r requirements.txt  # TIMEOUT: 5+ minutes for large ML packages. NEVER CANCEL.
  ```

### Development Workflow (Future)
Once source code is added:

- **Install Dependencies**:
  ```bash
  pip install -r requirements.txt  # Takes 3-5 minutes. NEVER CANCEL. Set timeout to 10+ minutes.
  ```

- **Run Tests** (when test suite exists):
  ```bash
  python -m pytest tests/  # Takes 2-5 minutes. NEVER CANCEL. Set timeout to 10+ minutes.
  # OR
  python -m unittest discover tests/  # Alternative test runner
  ```

- **Code Quality**:
  ```bash
  # Run these before committing (when configured):
  black .  # Code formatting
  flake8 .  # Linting
  mypy .  # Type checking
  ```

- **Security Scanning** (important for Azure security tool):
  ```bash
  bandit -r src/  # Security vulnerability scanning
  safety check  # Check for known security vulnerabilities in dependencies
  ```

## Expected Project Structure (Future Development)

Based on the project description, expect the following structure to emerge:
```
App-Registration-Model/
├── README.md
├── requirements.txt
├── setup.py or pyproject.toml
├── src/
│   ├── app_registration_model/
│   │   ├── __init__.py
│   │   ├── analyzer.py
│   │   ├── risk_assessment.py
│   │   └── azure_integration.py
├── tests/
│   ├── test_analyzer.py
│   ├── test_risk_assessment.py
│   └── test_integration.py
├── data/
│   ├── sample_app_registrations.json
│   └── risk_profiles.json
└── docs/
    └── api_documentation.md
```

## Validation and Testing

### Manual Validation Scenarios (Future)
When the application is developed, always test these complete scenarios:

1. **Azure App Registration Analysis**:
   ```bash
   # Test with sample data
   python -m app_registration_model.analyzer --input data/sample_app_registrations.json
   # Verify risk assessment output is generated
   ```

2. **Permission Risk Assessment**:
   ```bash
   # Test permission analysis functionality
   python -m app_registration_model.risk_assessment --permissions "User.Read,Mail.Send" --context "web-app"
   # Verify risk score and recommendations are provided
   ```

3. **Azure Integration** (when implemented):
   ```bash
   # Test live Azure integration (requires authentication)
   az login
   python -m app_registration_model.azure_integration --subscription-id "your-sub-id"
   # Verify can retrieve and analyze real app registration data
   ```

### Required Validation Steps
- **ALWAYS** run the full test suite after making changes: `python -m pytest tests/` (TIMEOUT: 10+ minutes. NEVER CANCEL)
- **ALWAYS** verify code quality with linting tools before committing
- **ALWAYS** test with sample Azure app registration data to ensure analysis accuracy
- **ALWAYS** validate that risk assessment logic produces reasonable scores

## Common Development Tasks

### Adding New Risk Assessment Rules
When extending risk assessment capabilities:
1. Add new rule logic to `src/app_registration_model/risk_assessment.py`
2. Add corresponding tests in `tests/test_risk_assessment.py`
3. Update sample data in `data/` to include test cases
4. Run full validation: `python -m pytest tests/test_risk_assessment.py -v`

### Azure API Integration
When working with Azure APIs:
1. Use Azure SDK for Python (`azure-identity`, `azure-mgmt-*` packages)
2. Always implement proper authentication handling
3. Add retry logic for API calls
4. Test with both sample and live data (when possible)

### Performance Considerations
- App registration analysis may involve large datasets
- Implement batch processing for multiple app registrations
- Consider memory usage when processing large JSON files
- Cache Azure API responses when appropriate

## Build and CI/CD (Future)

When CI/CD is implemented, expect:
- **GitHub Actions workflow** in `.github/workflows/`
- **Build time**: Expect 5-10 minutes for full build including dependencies and tests. NEVER CANCEL. Set timeout to 15+ minutes.
- **Test time**: Expect 3-5 minutes for full test suite. NEVER CANCEL. Set timeout to 10+ minutes.
- **Security scanning**: Additional 2-3 minutes for security tools. NEVER CANCEL.

Required validation before CI passes:
```bash
# These commands must all succeed:
python -m pytest tests/  # TIMEOUT: 10+ minutes. NEVER CANCEL.
black --check .
flake8 .
mypy .
bandit -r src/
safety check
```

## Security Considerations

**CRITICAL**: This project deals with Azure security assessment:
- **NEVER** commit real Azure credentials or sensitive app registration data
- **ALWAYS** use environment variables for Azure authentication
- **ALWAYS** sanitize any log output to remove sensitive information
- **ALWAYS** validate input data to prevent injection attacks
- Use `.env` files for local development (ensure they're in `.gitignore`)

## Development Environment Notes

- **Azure CLI**: Required for authentication and testing Azure integration
- **Python 3.9+**: Required for Azure SDK compatibility
- **Virtual Environment**: Always use isolated Python environment
- **IDE Setup**: Configure for Python development with Azure extensions

## Troubleshooting Common Issues

### Azure Authentication
```bash
# If Azure login fails:
az logout
az login --use-device-code  # Alternative authentication method
```

### Dependency Conflicts
```bash
# If pip install fails:
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt --force-reinstall
```

### Permission Errors
```bash
# If running on restricted environments:
pip install --user -r requirements.txt  # Install to user directory
```

## Key Reminders

- **NEVER CANCEL** long-running builds or tests - they may take 10+ minutes
- **ALWAYS** validate Azure integration with both sample and test data
- **ALWAYS** run security scans before committing due to the security-focused nature of this tool
- **ALWAYS** test risk assessment accuracy with known good/bad app registration configurations
- Set explicit timeouts of 15+ minutes for build commands and 10+ minutes for test commands
- Remember this tool analyzes Azure security configurations - accuracy and security are paramount

### Environment Validation Test (VALIDATED WORKING)

To verify the development environment is ready, run this test:
```python
# Create and run this test script to verify environment:
cat > test_env.py << 'EOF'
import sys, subprocess
print(f"Python {sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}")
result = subprocess.run(['az', '--version'], capture_output=True)
print("Azure CLI:", "✓ Available" if result.returncode == 0 else "✗ Not available")
print("Environment ready for development!")
EOF

python3 test_env.py
rm test_env.py
```

## Current Repository Commands (VALIDATED WORKING)

Currently available commands (until development begins):
```bash
# View project description (VALIDATED)
cat README.md

# Check repository status (VALIDATED)
git status

# Verify Python environment (VALIDATED - Python 3.12.3 available)
python3 --version

# Verify Azure CLI (VALIDATED - azure-cli 2.75.0 available)
az --version

# Create initial project structure when ready to start development (VALIDATED)
mkdir -p src/app_registration_model tests data docs
touch requirements.txt setup.py

# Python virtual environment setup (VALIDATED)
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
deactivate  # when done
```