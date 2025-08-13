import { Builder, By, until, Key } from 'selenium-webdriver';
import { Options as ChromeOptions } from 'selenium-webdriver/chrome.js';

describe('Manual Comment Deletion Inspection', () => {
  let driver;
  const baseUrl = 'http://localhost:3000';

  beforeAll(async () => {
    const chromeOptions = new ChromeOptions();
    // Keep browser visible for manual inspection
    chromeOptions.addArguments('--no-sandbox');
    chromeOptions.addArguments('--disable-dev-shm-usage');
    chromeOptions.addArguments('--window-size=1920,1080');

    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(chromeOptions)
      .build();
    
    await driver.manage().setTimeouts({ implicit: 15000 });
  }, 60000);

  afterAll(async () => {
    if (driver) {
      console.log('🔍 Browser will stay open for 60 seconds for manual inspection...');
      console.log('📋 INSTRUCTIONS:');
      console.log('   1. Try deleting a comment manually');
      console.log('   2. Watch for notifications in bottom-right corner');
      console.log('   3. Check browser console for errors');
      console.log('   4. Look for any flash messages');
      await driver.sleep(60000);
      await driver.quit();
    }
  }, 65000);

  test('should set up scenario for manual comment deletion inspection', async () => {
    console.log('🧪 Setting up scenario for manual inspection...');
    
    // Step 1: Create a post with a comment
    console.log('📍 Step 1: Creating post and comment for manual testing...');
    
    await driver.get(`${baseUrl}/posts/new`);
    await driver.sleep(2000);
    
    const titleInput = await driver.findElement(By.id('post_title'));
    const contentInput = await driver.findElement(By.id('post_content'));
    const submitButton = await driver.findElement(By.css('input[type="submit"]'));
    
    await titleInput.sendKeys('Manual Deletion Test Post');
    await contentInput.sendKeys('This post is for manually testing comment deletion notifications.');
    
    await submitButton.click();
    await driver.sleep(3000);
    
    // Step 2: Add a comment
    const authorNameInput = await driver.findElement(By.id('comment_author_name'));
    const commentContentInput = await driver.findElement(By.id('comment_content'));
    const commentSubmitButton = await driver.findElement(By.css('form[action*="comments"] input[type="submit"]'));
    
    await authorNameInput.sendKeys('Manual Test User');
    await commentContentInput.sendKeys('This comment should be deleted manually to test notifications.');
    
    await commentSubmitButton.click();
    await driver.sleep(3000);
    
    // Step 3: Monitor the page state continuously
    console.log('📍 Step 2: Monitoring page state and network requests...');
    
    // Enable console logging
    await driver.executeScript(`
      // Override console methods to capture messages
      window.testLogs = [];
      const originalLog = console.log;
      const originalError = console.error;
      const originalWarn = console.warn;
      
      console.log = function(...args) {
        window.testLogs.push({type: 'log', args: args, time: new Date().toISOString()});
        originalLog.apply(console, args);
      };
      
      console.error = function(...args) {
        window.testLogs.push({type: 'error', args: args, time: new Date().toISOString()});
        originalError.apply(console, args);
      };
      
      console.warn = function(...args) {
        window.testLogs.push({type: 'warn', args: args, time: new Date().toISOString()});
        originalWarn.apply(console, args);
      };
      
      // Monitor Turbo Stream responses
      if (window.Turbo) {
        window.turboStreamEvents = [];
        document.addEventListener('turbo:before-stream-render', (event) => {
          window.turboStreamEvents.push({
            type: 'before-stream-render',
            action: event.detail?.newStream?.action,
            target: event.detail?.newStream?.target,
            time: new Date().toISOString(),
            content: event.detail?.newStream?.templateContent?.innerHTML
          });
          console.log('🔄 Turbo Stream before render:', event.detail);
        });
        
        document.addEventListener('turbo:stream-render', (event) => {
          window.turboStreamEvents.push({
            type: 'stream-render',
            action: event.detail?.action,
            target: event.detail?.target,
            time: new Date().toISOString()
          });
          console.log('✅ Turbo Stream rendered:', event.detail);
        });
      }
      
      console.log('🔍 Monitoring system initialized');
    `);
    
    // Step 4: Set up periodic monitoring
    const startMonitoring = async () => {
      for (let i = 0; i < 120; i++) { // Monitor for 2 minutes
        await driver.sleep(1000);
        
        const status = await driver.executeScript(`
          return {
            timestamp: new Date().toISOString(),
            notifications: {
              container: !!document.getElementById('flash-notifications-container'),
              count: document.querySelectorAll('#flash-notifications-container .max-w-sm').length,
              visible: document.querySelectorAll('#flash-notifications-container .max-w-sm[style*="transform: translate"]').length
            },
            comments: {
              count: document.querySelectorAll('.comment-item').length,
              deleteButtons: document.querySelectorAll('button[form]').length
            },
            turboEvents: window.turboStreamEvents ? window.turboStreamEvents.length : 0,
            consoleLogs: window.testLogs ? window.testLogs.length : 0,
            stimulusConnected: !!window.Stimulus && !!document.body.getAttribute('data-controller')
          };
        `);
        
        // Only log changes or every 30 seconds
        if (i % 30 === 0 || status.notifications.count > 0 || status.turboEvents > 0) {
          console.log(`🕐 Monitor ${i}s:`, status);
        }
        
        // If notification appears, log details
        if (status.notifications.count > 0) {
          const notificationDetails = await driver.executeScript(`
            const notifications = document.querySelectorAll('#flash-notifications-container .max-w-sm');
            return Array.from(notifications).map(n => ({
              title: n.querySelector('.font-semibold')?.textContent || 'No title',
              message: n.querySelector('p:not(.font-semibold)')?.textContent || 'No message',
              visible: n.offsetParent !== null,
              classes: n.className,
              innerHTML: n.innerHTML
            }));
          `);
          console.log('📱 Notification details:', notificationDetails);
        }
        
        // Check for any errors or Turbo events
        const events = await driver.executeScript(`
          const logs = window.testLogs || [];
          const turboEvents = window.turboStreamEvents || [];
          window.testLogs = []; // Clear logs
          window.turboStreamEvents = []; // Clear events
          
          return {
            logs: logs,
            turboEvents: turboEvents
          };
        `);
        
        if (events.logs.length > 0) {
          console.log('📜 Console logs:', events.logs);
        }
        
        if (events.turboEvents.length > 0) {
          console.log('🔄 Turbo events:', events.turboEvents);
        }
      }
    };
    
    // Start monitoring in background
    console.log('🔍 Starting continuous monitoring...');
    console.log('📋 Now try deleting the comment manually!');
    console.log('   - Look for the delete button (trash icon)');
    console.log('   - Click it and confirm deletion');
    console.log('   - Watch for notifications in bottom-right corner');
    
    await startMonitoring();
    
    // Final report
    const finalState = await driver.executeScript(`
      return {
        finalNotifications: document.querySelectorAll('#flash-notifications-container .max-w-sm').length,
        finalComments: document.querySelectorAll('.comment-item').length,
        allLogs: window.testLogs || [],
        allTurboEvents: window.turboStreamEvents || [],
        stimulusInfo: {
          available: !!window.Stimulus,
          bodyController: document.body.getAttribute('data-controller'),
          showNotificationFunction: typeof window.showNotification
        }
      };
    `);
    
    console.log('📊 Final inspection results:', finalState);
    
    // This test always passes - it's for inspection only
    expect(true).toBe(true);
    
  }, 180000);
});
