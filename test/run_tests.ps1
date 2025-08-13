# PowerShell script to run GiosaApp frontend tests
param(
    [switch]$UnitOnly,
    [switch]$IntegrationOnly,
    [switch]$SystemOnly,
    [switch]$Coverage,
    [switch]$Verbose
)

# Colors for output
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Write-Success { Write-ColorOutput Green $args }
function Write-Error { Write-ColorOutput Red $args }
function Write-Warning { Write-ColorOutput Yellow $args }
function Write-Info { Write-ColorOutput Blue $args }

Write-Info "🚀 Starting GiosaApp Frontend Tests"
Write-Info "================================================="

# Function to check if a command exists
function Test-CommandExists($command) {
    $null = Get-Command $command -ErrorAction SilentlyContinue
    return $?
}

# Function to run a test suite
function Invoke-TestSuite($name, $command) {
    Write-Warning "`n📋 Running $name..."
    Write-Info "----------------------------------------"
    
    try {
        if ($Verbose) {
            Invoke-Expression $command
        } else {
            Invoke-Expression "$command 2>$null"
        }
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "✅ $name PASSED"
            return $true
        } else {
            Write-Error "❌ $name FAILED"
            return $false
        }
    } catch {
        Write-Error "❌ $name FAILED with exception: $($_.Exception.Message)"
        return $false
    }
}

# Check prerequisites
Write-Info "🔍 Checking prerequisites..."

if (-not (Test-CommandExists "node")) {
    Write-Error "❌ Node.js is not installed"
    exit 1
}

if (-not (Test-CommandExists "npm")) {
    Write-Error "❌ npm is not installed"
    exit 1
}

# Check if Rails server is running
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    Write-Success "✅ Rails server is running"
} catch {
    Write-Warning "⚠️  Rails server is not running on localhost:3000"
    Write-Info "Please start the Rails server with: rails server"
    exit 1
}

Write-Success "✅ All prerequisites met"

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Warning "`n📦 Installing npm dependencies..."
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Error "❌ Failed to install npm dependencies"
        exit 1
    }
}

# Initialize test results
$totalTests = 0
$passedTests = 0

# Run Jest unit tests
if (-not $IntegrationOnly -and -not $SystemOnly) {
    if (Invoke-TestSuite "Jest Unit Tests" "npm run test:unit") {
        $passedTests++
    }
    $totalTests++
}

# Run Jest integration tests (if Selenium is available)
if (-not $UnitOnly -and -not $SystemOnly) {
    $chromeDriverExists = (Test-CommandExists "chromedriver") -or (Test-Path "node_modules\.bin\chromedriver.exe")
    
    if ($chromeDriverExists) {
        if (Invoke-TestSuite "Jest Integration Tests" "npm run test:integration") {
            $passedTests++
        }
        $totalTests++
    } else {
        Write-Warning "⚠️  Skipping Selenium integration tests (chromedriver not found)"
        Write-Info "Install chromedriver to run integration tests"
    }
}

# Run Rails system tests
if (-not $UnitOnly -and -not $IntegrationOnly) {
    if (Test-CommandExists "bundle") {
        Write-Warning "`n📋 Running Rails System Tests..."
        Write-Info "----------------------------------------"
        
        try {
            bundle exec rails test:system test/system/notifications_test.rb
            if ($LASTEXITCODE -eq 0) {
                Write-Success "✅ Rails System Tests PASSED"
                $passedTests++
            } else {
                Write-Error "❌ Rails System Tests FAILED"
            }
        } catch {
            Write-Error "❌ Rails System Tests FAILED with exception: $($_.Exception.Message)"
        }
        $totalTests++
    } else {
        Write-Warning "⚠️  Skipping Rails system tests (bundle not available)"
    }
}

# Run coverage report
if ($Coverage -or ($totalTests -eq 0)) {
    Write-Warning "`n📊 Generating coverage report..."
    npm run test:coverage
}

# Summary
Write-Info "`n================================================="
Write-Info "📊 Test Summary"
Write-Info "================================================="
Write-Info "Total test suites: $totalTests"
Write-Success "Passed: $passedTests"
Write-Error "Failed: $($totalTests - $passedTests)"

if ($passedTests -eq $totalTests -and $totalTests -gt 0) {
    Write-Success "`n🎉 All tests passed!"
    exit 0
} elseif ($totalTests -eq 0) {
    Write-Warning "`n⚠️  No tests were run. Use -Coverage to run coverage only."
    exit 0
} else {
    Write-Error "`n💥 Some tests failed"
    exit 1
}
