import { Builder, By, until, Key } from 'selenium-webdriver';
import { Options as ChromeOptions } from 'selenium-webdriver/chrome.js';

describe('Visual Diagnostic Test', () => {
  let driver;
  const baseUrl = 'http://localhost:3000';

  beforeAll(async () => {
    // Configure Chrome for VISUAL debugging
    const chromeOptions = new ChromeOptions();
    // NO headless mode - we want to see what's happening!
    chromeOptions.addArguments('--window-size=1920,1080');
    chromeOptions.addArguments('--start-maximized');
    chromeOptions.addArguments('--disable-web-security');

    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(chromeOptions)
      .build();
    
    // Set longer implicit wait for debugging
    await driver.manage().setTimeouts({ implicit: 15000 });
  }, 60000);

  afterAll(async () => {
    if (driver) {
      // Keep browser open longer for inspection
      console.log('⏰ Browser will stay open for 10 seconds for inspection...');
      await driver.sleep(10000);
      await driver.quit();
    }
  });

  test('🔍 Visual Diagnostic - Check what pages load and what JavaScript is available', async () => {
    console.log('🚀 Starting visual diagnostic test...');
    
    // Step 1: Load home page
    console.log('📝 Step 1: Loading home page...');
    await driver.get(baseUrl);
    await driver.sleep(3000); // Let us see the page
    
    const homeTitle = await driver.getTitle();
    console.log(`✅ Home page loaded: "${homeTitle}"`);
    
    // Step 2: Check if we can navigate to posts
    console.log('📝 Step 2: Trying to navigate to posts...');
    try {
      await driver.get(`${baseUrl}/posts`);
      await driver.sleep(3000);
      
      const postsTitle = await driver.getTitle();
      console.log(`✅ Posts page loaded: "${postsTitle}"`);
      
      // Check if there are any posts
      const postsCount = await driver.executeScript(`
        const posts = document.querySelectorAll('[class*="post"], [id*="post"], a[href*="/posts/"]');
        return posts.length;
      `);
      console.log(`📊 Found ${postsCount} post elements on page`);
      
    } catch (error) {
      console.log(`❌ Posts page failed: ${error.message}`);
    }
    
    // Step 3: Try to create a post manually
    console.log('📝 Step 3: Trying to create a test post...');
    try {
      await driver.get(`${baseUrl}/posts/new`);
      await driver.sleep(2000);
      
      console.log('📝 Filling out form...');
      const titleInput = await driver.findElement(By.id('post_title'));
      const contentInput = await driver.findElement(By.id('post_content'));
      const publishedCheckbox = await driver.findElement(By.id('post_published'));
      
      await titleInput.sendKeys('🧪 Visual Test Post');
      await contentInput.sendKeys('This is a test post created during visual debugging');
      await publishedCheckbox.click();
      
      console.log('📝 Submitting form...');
      const submitButton = await driver.findElement(By.css('input[type="submit"]'));
      await submitButton.click();
      
      // Wait and see what happens
      await driver.sleep(5000);
      
      const currentUrl = await driver.getCurrentUrl();
      console.log(`✅ Post creation result - Current URL: ${currentUrl}`);
      
      // Check for notifications or flash messages
      const hasFlashContainer = await driver.executeScript(`
        return !!document.getElementById('flash-notifications-container');
      `);
      
      const hasFlashMessages = await driver.executeScript(`
        const flashes = document.querySelectorAll('[class*="flash"], [class*="alert"], [class*="notice"]');
        return flashes.length;
      `);
      
      console.log(`📨 Flash container exists: ${hasFlashContainer}`);
      console.log(`📨 Flash message elements: ${hasFlashMessages}`);
      
      // Check if showNotification function exists
      const hasShowNotification = await driver.executeScript(`
        return typeof window.showNotification === 'function';
      `);
      
      console.log(`🔧 showNotification function exists: ${hasShowNotification}`);
      
      if (hasShowNotification) {
        console.log('📝 Testing showNotification function...');
        await driver.executeScript(`
          window.showNotification('🧪 Test Notification', 'Visual Test', 'info');
        `);
        await driver.sleep(3000);
        
        const notificationExists = await driver.executeScript(`
          return !!document.querySelector('#flash-notifications-container .max-w-sm');
        `);
        console.log(`📨 Test notification appeared: ${notificationExists}`);
      }
      
    } catch (error) {
      console.log(`❌ Post creation failed: ${error.message}`);
    }
    
    // Step 4: Check Stimulus controllers
    console.log('📝 Step 4: Checking Stimulus controllers...');
    const stimulusInfo = await driver.executeScript(`
      const app = window.Stimulus;
      if (app) {
        const controllers = app.router.modules.map(m => m.identifier);
        return {
          hasStimulus: true,
          controllers: controllers,
          hasFlashNotifications: controllers.includes('flash-notifications')
        };
      } else {
        return { hasStimulus: false, controllers: [], hasFlashNotifications: false };
      }
    `);
    
    console.log('🎛️ Stimulus info:', JSON.stringify(stimulusInfo, null, 2));
    
    // Final pause for manual inspection
    console.log('⏱️ Pausing for 10 seconds for manual inspection...');
    await driver.sleep(10000);
    
    // This test always passes - it's for observation only
    expect(true).toBe(true);
    
  }, 120000); // 2 minute timeout for this diagnostic test
});
