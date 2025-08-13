#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting GiosaApp Frontend Tests${NC}"
echo "================================================="

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to run a test suite
run_test_suite() {
    local name=$1
    local command=$2
    
    echo -e "\n${YELLOW}📋 Running $name...${NC}"
    echo "----------------------------------------"
    
    if eval $command; then
        echo -e "${GREEN}✅ $name PASSED${NC}"
        return 0
    else
        echo -e "${RED}❌ $name FAILED${NC}"
        return 1
    fi
}

# Check prerequisites
echo -e "${BLUE}🔍 Checking prerequisites...${NC}"

if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

# Check if Rails server is running
if ! curl -s http://localhost:3000 > /dev/null; then
    echo -e "${YELLOW}⚠️  Rails server is not running on localhost:3000${NC}"
    echo "Please start the Rails server with: rails server"
    exit 1
fi

echo -e "${GREEN}✅ All prerequisites met${NC}"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "\n${YELLOW}📦 Installing npm dependencies...${NC}"
    npm install
fi

# Initialize test results
total_tests=0
passed_tests=0

# Run Jest unit tests
if run_test_suite "Jest Unit Tests" "npm run test:unit"; then
    ((passed_tests++))
fi
((total_tests++))

# Run Jest integration tests (if Selenium is available)
if command_exists chromedriver || [ -f "node_modules/.bin/chromedriver" ]; then
    if run_test_suite "Jest Integration Tests" "npm run test:integration"; then
        ((passed_tests++))
    fi
    ((total_tests++))
else
    echo -e "${YELLOW}⚠️  Skipping Selenium integration tests (chromedriver not found)${NC}"
fi

# Run Rails system tests
if command_exists bundle; then
    echo -e "\n${YELLOW}📋 Running Rails System Tests...${NC}"
    echo "----------------------------------------"
    
    if bundle exec rails test:system test/system/notifications_test.rb; then
        echo -e "${GREEN}✅ Rails System Tests PASSED${NC}"
        ((passed_tests++))
    else
        echo -e "${RED}❌ Rails System Tests FAILED${NC}"
    fi
    ((total_tests++))
else
    echo -e "${YELLOW}⚠️  Skipping Rails system tests (bundle not available)${NC}"
fi

# Run coverage report
echo -e "\n${YELLOW}📊 Generating coverage report...${NC}"
npm run test:coverage

# Summary
echo -e "\n================================================="
echo -e "${BLUE}📊 Test Summary${NC}"
echo "================================================="
echo -e "Total test suites: $total_tests"
echo -e "Passed: ${GREEN}$passed_tests${NC}"
echo -e "Failed: ${RED}$((total_tests - passed_tests))${NC}"

if [ $passed_tests -eq $total_tests ]; then
    echo -e "\n${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "\n${RED}💥 Some tests failed${NC}"
    exit 1
fi
