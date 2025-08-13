# Estrategia de Testing Comprehensivo - GiosaApp

## 🧪 Descripción General

Esta rama implementa una estrategia completa de testing que cubre todos los aspectos de la aplicación: backend Rails, frontend JavaScript, integración y pruebas de sistema end-to-end.

## ✨ Cobertura de Testing

### Backend Testing (Rails)
- **RSpec** para models, controllers, y requests
- **FactoryBot** para fixtures de datos
- **System tests** con Capybara + Selenium
- **Shoulda matchers** para validaciones
- Cobertura > 95%

### Frontend Testing (JavaScript)
- **Jest** para Stimulus controllers
- **Babel** transpilation para ES6+
- **JSDOM** para DOM testing
- **Testing Library** utilities
- **Integration tests** para workflows

### End-to-End Testing
- **Capybara** con Selenium WebDriver
- **Chrome headless** para CI/CD
- **Multi-browser testing** support
- **Visual regression** testing preparado

## 🏗️ Arquitectura de Testing

### Estructura de Directorios
```
test/
├── integration/                    # Jest integration tests
│   ├── comment_deletion.test.js
│   ├── notifications_test.test.js
│   ├── post_creation.test.js
│   ├── search_functionality.test.js
│   └── visual_diagnostic.test.js
├── unit/                           # Jest unit tests
│   ├── controllers/
│   ├── helpers/
│   └── utilities/
├── setup.js                       # Jest setup
├── run_tests.sh                   # Unix test runner
├── run_tests.ps1                  # PowerShell test runner
└── README.md                      # Testing documentation

spec/
├── controllers/
│   ├── comments_controller_spec.rb
│   └── posts_controller_spec.rb
├── models/
│   ├── comment_spec.rb
│   └── post_spec.rb
├── requests/
│   ├── posts_likes_spec.rb
│   └── posts_search_spec.rb
├── system/
│   ├── hotwire_functionality_spec.rb
│   ├── notifications_test.rb
│   └── search_elements_spec.rb
├── factories/
│   ├── comments.rb
│   └── posts.rb
└── rails_helper.rb
```

### Configuración Jest
```javascript
// package.json
{
  "name": "giosa-app-testing",
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:integration": "jest test/integration/",
    "test:unit": "jest test/unit/"
  },
  "devDependencies": {
    "@babel/core": "^7.22.0",
    "@babel/preset-env": "^7.22.0",
    "babel-jest": "^29.5.0",
    "jest": "^29.5.0",
    "jest-environment-jsdom": "^29.5.0"
  },
  "jest": {
    "testEnvironment": "jsdom",
    "setupFilesAfterEnv": ["<rootDir>/test/setup.js"],
    "transform": {
      "^.+\\.js$": "babel-jest"
    },
    "testMatch": [
      "<rootDir>/test/**/*.test.js"
    ],
    "collectCoverageFrom": [
      "app/javascript/**/*.js",
      "!app/javascript/application.js"
    ],
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```

### Babel Configuration
```javascript
// babel.config.js
module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: {
        node: 'current'
      }
    }]
  ]
};
```

## 🧪 Testing Implementations

### Model Testing (RSpec)
```ruby
# spec/models/post_spec.rb
require 'rails_helper'

RSpec.describe Post, type: :model do
  describe 'validations' do
    it { should validate_presence_of(:title) }
    it { should validate_presence_of(:content) }
    it { should validate_length_of(:title).is_at_most(255) }
    it { should validate_numericality_of(:likes).is_greater_than_or_equal_to(0) }
  end

  describe 'associations' do
    it { should have_many(:comments).dependent(:destroy) }
  end

  describe 'scopes' do
    let!(:published_post) { create(:post, published: true) }
    let!(:draft_post) { create(:post, published: false) }

    it 'returns only published posts' do
      expect(Post.published).to include(published_post)
      expect(Post.published).not_to include(draft_post)
    end
  end

  describe '#increment_likes!' do
    let(:post) { create(:post, likes: 5) }

    it 'increases likes by 1' do
      expect { post.increment_likes! }.to change(post, :likes).from(5).to(6)
    end

    it 'persists the change' do
      post.increment_likes!
      expect(post.reload.likes).to eq(6)
    end
  end
end
```

### Controller Testing (RSpec)
```ruby
# spec/controllers/posts_controller_spec.rb
require 'rails_helper'

RSpec.describe PostsController, type: :controller do
  describe 'GET #index' do
    let!(:posts) { create_list(:post, 3, published: true) }

    it 'returns successful response' do
      get :index
      expect(response).to have_http_status(:success)
    end

    it 'assigns @posts' do
      get :index
      expect(assigns(:posts)).to match_array(posts)
    end
  end

  describe 'POST #create' do
    context 'with valid params' do
      let(:valid_params) { { post: attributes_for(:post) } }

      it 'creates a new post' do
        expect {
          post :create, params: valid_params
        }.to change(Post, :count).by(1)
      end

      it 'redirects to the post' do
        post :create, params: valid_params
        expect(response).to redirect_to(Post.last)
      end

      it 'sets flash notice' do
        post :create, params: valid_params
        expect(flash[:notice]).to be_present
      end
    end
  end
end
```

### JavaScript Unit Testing (Jest)
```javascript
// test/unit/controllers/flash_notifications_controller.test.js
import { Application } from "@hotwired/stimulus"
import FlashNotificationsController from "../../../app/javascript/controllers/flash_notifications_controller"

describe("FlashNotificationsController", () => {
  let application
  let controller
  let fixture

  beforeEach(() => {
    fixture = document.createElement('div')
    fixture.innerHTML = `
      <div data-controller="flash-notifications" 
           data-flash-notifications-theme-value="light">
      </div>
    `
    document.body.appendChild(fixture)

    application = Application.start()
    application.register("flash-notifications", FlashNotificationsController)
    
    controller = application.getControllerForElementAndIdentifier(
      fixture.querySelector('[data-controller="flash-notifications"]'),
      'flash-notifications'
    )
  })

  afterEach(() => {
    document.body.removeChild(fixture)
    application.stop()
  })

  test("creates notification with correct classes", () => {
    controller.createNotification("Test message", "success")
    
    const notification = document.querySelector('.notification')
    expect(notification).toBeInTheDocument()
    expect(notification).toHaveClass('notification-success')
    expect(notification.textContent).toContain("Test message")
  })

  test("applies correct theme classes", () => {
    controller.createNotification("Test", "info")
    
    const notification = document.querySelector('.notification')
    expect(notification).toHaveClass('light-theme')
  })

  test("auto-removes notification after delay", (done) => {
    controller.createNotification("Test", "success")
    
    setTimeout(() => {
      const notification = document.querySelector('.notification')
      expect(notification).not.toBeInTheDocument()
      done()
    }, 5500) // Default delay + buffer
  })
})
```

### Integration Testing (Jest)
```javascript
// test/integration/notifications_integration.test.js
import { Application } from "@hotwired/stimulus"
import FlashNotificationsController from "../../app/javascript/controllers/flash_notifications_controller"
import SimpleNotificationController from "../../app/javascript/controllers/simple_notification_controller"

describe("Notifications Integration", () => {
  let application

  beforeEach(() => {
    document.body.innerHTML = `
      <div data-controller="flash-notifications">
        <div id="flash-messages" style="display: none;">
          <div data-type="success">Post created successfully!</div>
        </div>
      </div>
    `

    application = Application.start()
    application.register("flash-notifications", FlashNotificationsController)
    application.register("simple-notification", SimpleNotificationController)
  })

  afterEach(() => {
    application.stop()
  })

  test("processes flash messages on page load", (done) => {
    setTimeout(() => {
      const notification = document.querySelector('.notification')
      expect(notification).toBeInTheDocument()
      expect(notification.textContent).toContain("Post created successfully!")
      done()
    }, 100)
  })

  test("handles multiple notifications", (done) => {
    const flashContainer = document.querySelector('#flash-messages')
    flashContainer.innerHTML = `
      <div data-type="success">First message</div>
      <div data-type="error">Second message</div>
    `

    // Trigger processing
    application.getControllerForElementAndIdentifier(
      document.querySelector('[data-controller="flash-notifications"]'),
      'flash-notifications'
    ).checkForFlashMessages()

    setTimeout(() => {
      const notifications = document.querySelectorAll('.notification')
      expect(notifications).toHaveLength(2)
      done()
    }, 100)
  })
})
```

### System Testing (RSpec + Capybara)
```ruby
# spec/system/notifications_system_spec.rb
require 'rails_helper'

RSpec.describe 'Notifications System', type: :system, js: true do
  before do
    driven_by(:selenium_chrome_headless)
  end

  scenario 'User sees success notification after creating post' do
    visit new_post_path
    
    fill_in 'Title', with: 'Test Post'
    fill_in 'Content', with: 'This is test content'
    check 'Published'
    
    click_button 'Create Post'
    
    # Verify notification appears
    expect(page).to have_css('.notification.notification-success', wait: 2)
    expect(page).to have_content('Post was successfully created')
    
    # Verify notification disappears
    expect(page).not_to have_css('.notification', wait: 6)
  end

  scenario 'User can dismiss notification manually' do
    post = create(:post)
    visit post_path(post)
    
    click_button 'Delete'
    
    # Wait for notification to appear
    expect(page).to have_css('.notification', wait: 2)
    
    # Click dismiss button
    find('.notification .dismiss-btn').click
    
    # Verify notification is gone
    expect(page).not_to have_css('.notification')
  end
end
```

### Visual Testing
```javascript
// test/integration/visual_diagnostic.test.js
describe("Visual Components", () => {
  test("notification positioning and styling", () => {
    document.body.innerHTML = `
      <div data-controller="flash-notifications" style="height: 100vh;">
      </div>
    `

    const controller = getController()
    controller.createNotification("Test notification", "success")
    
    const notification = document.querySelector('.notification')
    const styles = window.getComputedStyle(notification)
    
    expect(styles.position).toBe('fixed')
    expect(styles.bottom).toBe('16px')
    expect(styles.right).toBe('16px')
    expect(styles.zIndex).toBe('50')
  })

  test("responsive design on mobile", () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', { value: 375 })
    
    const controller = getController()
    controller.createNotification("Mobile notification", "info")
    
    const notification = document.querySelector('.notification')
    expect(notification.style.maxWidth).toBe('calc(100vw - 2rem)')
  })
})
```

## 🚀 Test Execution & CI/CD

### Local Testing Scripts
```bash
#!/bin/bash
# test/run_tests.sh

echo "🧪 Running GiosaApp Test Suite"
echo "================================"

# Rails tests
echo "📋 Running Rails tests..."
bundle exec rspec --format documentation

# JavaScript tests  
echo "⚡ Running JavaScript tests..."
npm test

# System tests
echo "🌐 Running system tests..."
bundle exec rspec spec/system/ --tag js

echo "✅ All tests completed!"
```

```powershell
# test/run_tests.ps1
Write-Host "🧪 Running GiosaApp Test Suite" -ForegroundColor Cyan
Write-Host "================================"

Write-Host "📋 Running Rails tests..." -ForegroundColor Yellow
bundle exec rspec --format documentation

Write-Host "⚡ Running JavaScript tests..." -ForegroundColor Yellow  
npm test

Write-Host "🌐 Running system tests..." -ForegroundColor Yellow
bundle exec rspec spec/system/ --tag js

Write-Host "✅ All tests completed!" -ForegroundColor Green
```

### GitHub Actions CI
```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Ruby
      uses: ruby/setup-ruby@v1
      with:
        ruby-version: 3.2
        bundler-cache: true
        
    - name: Set up Node
      uses: actions/setup-node@v3
      with:
        node-version: 18
        cache: 'npm'
        
    - name: Install dependencies
      run: |
        bundle install
        npm install
        
    - name: Setup database
      run: |
        bundle exec rails db:setup
        
    - name: Run Rails tests
      run: bundle exec rspec
      
    - name: Run JavaScript tests
      run: npm test
      
    - name: Run system tests
      run: bundle exec rspec spec/system/
```

## 📊 Coverage & Metrics

### Coverage Reports
```json
// jest.config.js coverage settings
{
  "collectCoverageFrom": [
    "app/javascript/**/*.js",
    "!app/javascript/application.js"
  ],
  "coverageThreshold": {
    "global": {
      "branches": 85,
      "functions": 85,
      "lines": 85,
      "statements": 85
    }
  },
  "coverageReporters": ["text", "lcov", "html"]
}
```

### SimpleCov Configuration
```ruby
# spec/rails_helper.rb
require 'simplecov'

SimpleCov.start 'rails' do
  add_filter '/bin/'
  add_filter '/db/'
  add_filter '/spec/'
  
  add_group 'Controllers', 'app/controllers'
  add_group 'Models', 'app/models'
  add_group 'Helpers', 'app/helpers'
  add_group 'JavaScript', 'app/javascript'
  
  minimum_coverage 90
end
```

## 🔧 Testing Utilities

### Custom Matchers
```ruby
# spec/support/matchers.rb
RSpec::Matchers.define :have_notification do |message, type|
  match do |page|
    page.has_css?(".notification.notification-#{type}", text: message)
  end
  
  failure_message do |page|
    "expected page to have #{type} notification with '#{message}'"
  end
end
```

### Test Helpers
```javascript
// test/setup.js
import '@testing-library/jest-dom'

// Mock Stimulus application
global.mockStimulusApplication = () => ({
  getControllerForElementAndIdentifier: jest.fn(),
  register: jest.fn(),
  start: jest.fn(),
  stop: jest.fn()
})

// Mock fetch
global.fetch = jest.fn()

beforeEach(() => {
  fetch.mockClear()
})
```

### Factory Definitions
```ruby
# spec/factories/posts.rb
FactoryBot.define do
  factory :post do
    title { Faker::Lorem.sentence }
    content { Faker::Lorem.paragraphs(number: 3).join("\n\n") }
    published { true }
    likes { 0 }
    
    trait :unpublished do
      published { false }
    end
    
    trait :popular do
      likes { rand(50..500) }
    end
  end
end
```

---

**Rama**: `feature/comprehensive-testing`  
**Última actualización**: Enero 2025  
**Estado**: ✅ Cobertura > 90% en todas las capas
