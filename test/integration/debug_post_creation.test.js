import { Builder, By, until, Key } from 'selenium-webdriver';
import { Options as ChromeOptions } from 'selenium-webdriver/chrome.js';

describe('DEBUG Post Creation Test', () => {
  let driver;
  const baseUrl = 'http://localhost:3000';

  beforeAll(async () => {
    // Configure Chrome with visible browser for debugging
    const chromeOptions = new ChromeOptions();
    // Keep browser visible for debugging
    chromeOptions.addArguments('--no-sandbox');
    chromeOptions.addArguments('--disable-dev-shm-usage');
    chromeOptions.addArguments('--window-size=1920,1080');
    chromeOptions.addArguments('--disable-web-security');

    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(chromeOptions)
      .build();
    
    await driver.manage().setTimeouts({ implicit: 10000 });
  }, 60000);

  afterAll(async () => {
    if (driver) {
      // Keep browser open for a few seconds to see results
      console.log('Keeping browser open for 5 seconds...');
      await driver.sleep(5000);
      await driver.quit();
    }
  }, 10000);

  test('DEBUG: Step by step post creation with detailed logging', async () => {
    try {
      console.log('🚀 Starting detailed post creation test...');
      
      // Step 1: Navigate to new post page
      console.log('📍 Step 1: Navigating to new post page...');
      await driver.get(`${baseUrl}/posts/new`);
      
      // Check if we successfully loaded the page
      const currentUrl1 = await driver.getCurrentUrl();
      const pageTitle1 = await driver.getTitle();
      console.log(`   ✅ Current URL: ${currentUrl1}`);
      console.log(`   ✅ Page Title: ${pageTitle1}`);
      
      // Wait for page to fully load
      await driver.sleep(2000);
      
      // Step 2: Check if form elements exist
      console.log('📍 Step 2: Checking form elements...');
      
      try {
        const titleInput = await driver.findElement(By.id('post_title'));
        const contentInput = await driver.findElement(By.id('post_content'));
        const submitButton = await driver.findElement(By.css('input[type="submit"]'));
        
        console.log('   ✅ Title input found');
        console.log('   ✅ Content input found');
        console.log('   ✅ Submit button found');
        
        // Step 3: Fill out the form with detailed logging
        console.log('📍 Step 3: Filling out form...');
        
        const testTitle = 'DEBUG Test Post ' + Date.now();
        const testContent = 'This is a debug test post created at ' + new Date().toISOString();
        
        await titleInput.clear();
        await titleInput.sendKeys(testTitle);
        console.log(`   ✅ Title filled: ${testTitle}`);
        
        await contentInput.clear();
        await contentInput.sendKeys(testContent);
        console.log(`   ✅ Content filled: ${testContent}`);
        
        // Verify form was filled
        const titleValue = await titleInput.getAttribute('value');
        const contentValue = await contentInput.getAttribute('value');
        console.log(`   ✅ Title verification: ${titleValue}`);
        console.log(`   ✅ Content verification: ${contentValue}`);
        
        // Step 4: Submit form
        console.log('📍 Step 4: Submitting form...');
        await submitButton.click();
        console.log('   ✅ Submit button clicked');
        
        // Step 5: Wait for response and log what happens
        console.log('📍 Step 5: Waiting for response...');
        
        // Wait a bit and check current state
        await driver.sleep(3000);
        
        const currentUrl2 = await driver.getCurrentUrl();
        const pageTitle2 = await driver.getTitle();
        console.log(`   📍 Current URL after submit: ${currentUrl2}`);
        console.log(`   📍 Page Title after submit: ${pageTitle2}`);
        
        // Check if we stayed on the form or redirected
        if (currentUrl2.includes('/posts/new')) {
          console.log('   ⚠️  Still on new post form - checking for errors...');
          
          // Look for Rails error messages
          const errorMessages = await driver.executeScript(`
            const errors = [];
            // Look for Rails error divs
            document.querySelectorAll('.field_with_errors, .error, .alert-danger, #error_explanation').forEach(el => {
              errors.push(el.textContent.trim());
            });
            return errors;
          `);
          
          if (errorMessages.length > 0) {
            console.log('   ❌ Form errors found:', errorMessages);
          } else {
            console.log('   🤔 No visible errors, but form not submitted successfully');
          }
          
        } else if (currentUrl2.includes('/posts/')) {
          console.log('   ✅ Successfully redirected to post page!');
          
          // Check for success message
          const successMessage = await driver.executeScript(`
            const messages = [];
            document.querySelectorAll('[class*="flash"], [class*="alert"], [class*="notice"]').forEach(el => {
              if (el.textContent.includes('creado') || el.textContent.includes('exitosamente') || 
                  el.textContent.includes('success') || el.textContent.includes('created')) {
                messages.push(el.textContent.trim());
              }
            });
            return messages;
          `);
          
          if (successMessage.length > 0) {
            console.log('   ✅ Success message found:', successMessage);
          } else {
            console.log('   ⚠️  No success message visible');
          }
        }
        
        // Step 6: Additional debugging info
        console.log('📍 Step 6: Gathering additional debugging info...');
        
        const debugInfo = await driver.executeScript(`
          return {
            hasStimulus: !!window.Stimulus,
            hasJQuery: !!window.$,
            bodyClass: document.body.className,
            formElements: document.querySelectorAll('form').length,
            currentPath: window.location.pathname,
            consoleErrors: window.console ? 'Available' : 'Not available'
          };
        `);
        
        console.log('   🔧 Debug info:', debugInfo);
        
        // Final assertion - we should either be on a post page or new post page with error info
        expect(currentUrl2).toBeTruthy(); // Basic check that we have a URL
        
      } catch (elementError) {
        console.log('   ❌ Error finding form elements:', elementError.message);
        throw elementError;
      }
      
    } catch (error) {
      console.log('❌ Test failed with error:', error.message);
      
      // Capture final state for debugging
      try {
        const finalUrl = await driver.getCurrentUrl();
        const finalTitle = await driver.getTitle();
        console.log(`🔍 Final URL: ${finalUrl}`);
        console.log(`🔍 Final Title: ${finalTitle}`);
      } catch (e) {
        console.log('Could not get final state');
      }
      
      throw error;
    }
    
  }, 120000); // Extended timeout for debugging
});
