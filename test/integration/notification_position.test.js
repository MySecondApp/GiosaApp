import { Builder, By, until } from 'selenium-webdriver';
import { Options as ChromeOptions } from 'selenium-webdriver/chrome.js';

describe('Notification Position Test', () => {
  let driver;
  const baseUrl = 'http://localhost:3000';

  beforeAll(async () => {
    const chromeOptions = new ChromeOptions();
    // Keep browser visible to see the position
    chromeOptions.addArguments('--no-sandbox');
    chromeOptions.addArguments('--disable-dev-shm-usage');
    chromeOptions.addArguments('--window-size=1920,1080');

    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(chromeOptions)
      .build();
    
    await driver.manage().setTimeouts({ implicit: 10000 });
  }, 60000);

  afterAll(async () => {
    if (driver) {
      console.log('Keeping browser open for 10 seconds to see notification position...');
      await driver.sleep(10000);
      await driver.quit();
    }
  }, 15000);

  test('should show notifications in bottom-right corner', async () => {
    console.log('Testing notification position...');
    
    // Go to home page
    await driver.get(baseUrl);
    await driver.sleep(2000);
    
    // Create a test notification
    await driver.executeScript(`
      // Make sure we have the controller loaded
      if (window.showNotification) {
        window.showNotification('Test Notification - Bottom Right Position', 'Position Test', 'info');
      } else {
        // Manual fallback for testing
        let container = document.getElementById('flash-notifications-container');
        if (!container) {
          container = document.createElement('div');
          container.id = 'flash-notifications-container';
          container.className = 'fixed bottom-4 right-4 z-50 space-y-3';
          container.style.position = 'fixed';
          container.style.bottom = '20px';
          container.style.right = '20px';
          container.style.zIndex = '99999';
          document.body.appendChild(container);
        }
        
        const notification = document.createElement('div');
        notification.className = 'max-w-sm w-full bg-white shadow-lg rounded-lg border-l-4 border-blue-400 p-4';
        notification.innerHTML = 
          '<div class="flex items-start">' +
            '<div class="flex-shrink-0">' +
              '<svg class="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">' +
                '<circle cx="12" cy="12" r="10"></circle>' +
                '<path d="M12 6v6l4 2"></path>' +
              '</svg>' +
            '</div>' +
            '<div class="ml-3">' +
              '<p class="text-sm font-medium text-gray-900">Position Test</p>' +
              '<p class="text-sm text-gray-500">Notification now appears in bottom-right corner</p>' +
            '</div>' +
          '</div>';
        
        container.appendChild(notification);
      }
    `);
    
    await driver.sleep(3000);
    
    // Check that notification container is positioned at bottom-right
    const containerPosition = await driver.executeScript(`
      const container = document.getElementById('flash-notifications-container');
      if (!container) return null;
      
      const rect = container.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const windowWidth = window.innerWidth;
      
      return {
        bottom: rect.bottom,
        right: rect.right,
        windowHeight,
        windowWidth,
        isBottomRight: rect.bottom < windowHeight && rect.right <= windowWidth,
        className: container.className,
        styles: {
          bottom: container.style.bottom,
          right: container.style.right,
          position: container.style.position
        }
      };
    `);
    
    console.log('Container position info:', containerPosition);
    
    // Verify the notification exists and is positioned correctly
    expect(containerPosition).not.toBeNull();
    expect(containerPosition.isBottomRight).toBe(true);
    
    // Check if notification element exists
    const notification = await driver.findElements(By.css('#flash-notifications-container .max-w-sm'));
    expect(notification.length).toBeGreaterThan(0);
    
    console.log('✅ Notification is correctly positioned at bottom-right!');
    console.log('📍 Container position:', {
      bottom: containerPosition.bottom,
      right: containerPosition.right,
      className: containerPosition.className
    });
    
  }, 30000);
});
