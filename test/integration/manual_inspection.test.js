import { Builder, By, until, Key } from 'selenium-webdriver';
import { Options as ChromeOptions } from 'selenium-webdriver/chrome.js';

describe('Manual Browser Inspection', () => {
  let driver;
  const baseUrl = 'http://localhost:3000';

  test('🔍 Manual Inspection - Keep browser open', async () => {
    console.log('🚀 Opening browser for manual inspection...');
    
    // Configure Chrome for VISUAL debugging
    const chromeOptions = new ChromeOptions();
    // NO headless mode - we want to see what's happening!
    chromeOptions.addArguments('--window-size=1920,1080');
    chromeOptions.addArguments('--start-maximized');

    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(chromeOptions)
      .build();
    
    console.log('✅ Browser opened successfully');
    console.log('📝 Loading home page...');
    
    // Load the home page
    await driver.get(baseUrl);
    console.log(`✅ Navigated to: ${baseUrl}`);
    
    // Get page title
    const title = await driver.getTitle();
    console.log(`📄 Page title: "${title}"`);
    
    // Wait 5 seconds to let us see the page
    console.log('⏱️ Waiting 5 seconds - you can see the home page now');
    await driver.sleep(5000);
    
    // Try to go to posts
    console.log('📝 Navigating to posts page...');
    try {
      await driver.get(`${baseUrl}/posts`);
      const postsTitle = await driver.getTitle();
      console.log(`✅ Posts page loaded: "${postsTitle}"`);
      
      console.log('⏱️ Waiting 5 seconds - you can see the posts page now');
      await driver.sleep(5000);
      
    } catch (error) {
      console.log(`❌ Could not load posts page: ${error.message}`);
    }
    
    // Try to create a post
    console.log('📝 Navigating to new post page...');
    try {
      await driver.get(`${baseUrl}/posts/new`);
      const newPostTitle = await driver.getTitle();
      console.log(`✅ New post page loaded: "${newPostTitle}"`);
      
      console.log('⏱️ Waiting 8 seconds - you can see the new post form now');
      await driver.sleep(8000);
      
      // Fill and submit the form
      console.log('📝 Filling out the form...');
      const titleInput = await driver.findElement(By.id('post_title'));
      const contentInput = await driver.findElement(By.id('post_content'));
      
      await titleInput.sendKeys('🧪 Manual Test Post');
      await contentInput.sendKeys('This post was created during manual inspection');
      
      console.log('⏱️ Waiting 3 seconds - you can see the filled form');
      await driver.sleep(3000);
      
      console.log('📝 Submitting the form...');
      const submitButton = await driver.findElement(By.css('input[type="submit"]'));
      await submitButton.click();
      
      console.log('⏱️ Waiting 10 seconds to see what happens after form submission');
      await driver.sleep(10000);
      
      const currentUrl = await driver.getCurrentUrl();
      console.log(`📍 Current URL after submission: ${currentUrl}`);
      
    } catch (error) {
      console.log(`❌ Error with new post form: ${error.message}`);
    }
    
    // Keep browser open for final inspection
    console.log('');
    console.log('🔍 MANUAL INSPECTION TIME!');
    console.log('⏰ Browser will stay open for 30 seconds');
    console.log('📋 Things to check manually:');
    console.log('   1. Did the post get created?');
    console.log('   2. Are there any flash messages?');
    console.log('   3. Do you see any notifications?');
    console.log('   4. Open browser developer tools (F12) to check console');
    console.log('   5. Look for JavaScript errors or warnings');
    console.log('');
    
    await driver.sleep(30000); // 30 seconds for manual inspection
    
    console.log('✅ Manual inspection complete - closing browser');
    await driver.quit();
    
    // This test always passes - it's for observation only
    expect(true).toBe(true);
    
  }, 180000); // 3 minute timeout
});
