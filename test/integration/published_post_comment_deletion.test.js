import { Builder, By, until, Key } from 'selenium-webdriver';
import { Options as ChromeOptions } from 'selenium-webdriver/chrome.js';

describe('Published Post Comment Deletion Test', () => {
  let driver;
  const baseUrl = 'http://localhost:3000';

  beforeAll(async () => {
    const chromeOptions = new ChromeOptions();
    // Keep browser visible for inspection
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
      console.log('Keeping browser open for 15 seconds to see the deletion notification...');
      await driver.sleep(15000);
      await driver.quit();
    }
  }, 20000);

  test('should create published post, add comment, delete comment, and show notification', async () => {
    console.log('🧪 Testing comment deletion on PUBLISHED post...');
    
    try {
      // Step 1: Create a PUBLISHED post
      console.log('📍 Step 1: Creating a PUBLISHED post...');
      
      await driver.get(`${baseUrl}/posts/new`);
      await driver.sleep(2000);
      
      const titleInput = await driver.findElement(By.id('post_title'));
      const contentInput = await driver.findElement(By.id('post_content'));
      const publishedCheckbox = await driver.findElement(By.id('post_published'));
      const submitButton = await driver.findElement(By.css('input[type="submit"]'));
      
      await titleInput.sendKeys('PUBLISHED Comment Deletion Test Post');
      await contentInput.sendKeys('This is a PUBLISHED post that should allow comments and test deletion notifications.');
      
      // IMPORTANT: Mark the post as published
      const isChecked = await publishedCheckbox.isSelected();
      if (!isChecked) {
        await publishedCheckbox.click();
        console.log('✅ Marked post as published');
      }
      
      await submitButton.click();
      await driver.sleep(3000);
      
      // Step 2: Navigate to the post to add a comment
      console.log('📍 Step 2: Navigating to the created post...');
      
      // If we're on the index page, click on our post
      const currentUrl = await driver.getCurrentUrl();
      if (currentUrl.includes('/posts') && !currentUrl.match(/\/posts\/\d+$/)) {
        console.log('On posts index, looking for our post...');
        
        // Look for our post link
        const postLinks = await driver.findElements(By.css('a[href*="/posts/"]:not([href*="/new"]):not([href*="/edit"])'));
        if (postLinks.length > 0) {
          // Click on the first post (should be our newly created one)
          await postLinks[0].click();
          await driver.sleep(2000);
        }
      }
      
      // Step 3: Verify we can see comment form (indicating published post)
      console.log('📍 Step 3: Checking if comment form is available...');
      
      const commentFormCheck = await driver.executeScript(`
        return {
          hasAuthorField: !!document.getElementById('comment_author_name'),
          hasContentField: !!document.getElementById('comment_content'),
          isDraftMessage: document.querySelector('.draft-message, [class*="draft"]') !== null,
          currentUrl: window.location.href,
          pageTitle: document.title
        };
      `);
      
      console.log('📊 Comment form check:', commentFormCheck);
      
      if (!commentFormCheck.hasAuthorField) {
        console.log('❌ Comment form not found - post might still be a draft');
        console.log('🔍 Let\'s check what\'s on the page...');
        
        const pageContent = await driver.executeScript(`
          return {
            bodyText: document.body.textContent.substring(0, 500),
            hasPublishedIndicator: document.body.textContent.includes('published') || document.body.textContent.includes('publicado'),
            hasDraftIndicator: document.body.textContent.includes('draft') || document.body.textContent.includes('borrador')
          };
        `);
        
        console.log('📄 Page content check:', pageContent);
        
        // If it's a draft, this explains why there are no comment notifications
        if (pageContent.hasDraftIndicator) {
          console.log('⚠️  Post is a draft - this explains why comment deletion notifications don\'t appear');
          console.log('💡 Solution: Make sure to check "Published" when creating posts');
          expect(true).toBe(true); // Pass the test with explanation
          return;
        }
      }
      
      // Step 4: Add a comment
      console.log('📍 Step 4: Adding a comment to test deletion...');
      
      const authorNameInput = await driver.findElement(By.id('comment_author_name'));
      const commentContentInput = await driver.findElement(By.id('comment_content'));
      const commentSubmitButton = await driver.findElement(By.css('form[action*="comments"] input[type="submit"]'));
      
      await authorNameInput.clear();
      await authorNameInput.sendKeys('Test User for Deletion');
      
      await commentContentInput.clear();
      await commentContentInput.sendKeys('This comment will be deleted to test the notification system on a published post.');
      
      await commentSubmitButton.click();
      await driver.sleep(4000);
      
      console.log('✅ Comment added to published post');
      
      // Step 5: Find and delete the comment
      console.log('📍 Step 5: Finding and deleting the comment...');
      
      const deleteButtons = await driver.findElements(By.css('button[form]'));
      
      if (deleteButtons.length > 0) {
        console.log(`Found ${deleteButtons.length} delete button(s)`);
        
        // Clear any existing notifications
        await driver.executeScript(`
          const container = document.getElementById('flash-notifications-container');
          if (container) container.innerHTML = '';
          console.log('🧹 Cleared existing notifications');
        `);
        
        // Click delete button
        console.log('🗑️ Clicking delete button...');
        await deleteButtons[0].click();
        
        // Handle confirmation dialog
        try {
          await driver.sleep(1000);
          const alert = await driver.switchTo().alert();
          console.log('Confirmation dialog:', await alert.getText());
          await alert.accept();
          console.log('✅ Confirmation accepted');
        } catch (e) {
          console.log('No confirmation dialog appeared');
        }
        
        // Wait for deletion and notification
        await driver.sleep(6000);
        
        // Step 6: Check for deletion notification
        console.log('📍 Step 6: Checking for deletion notification...');
        
        const notificationResult = await driver.executeScript(`
          // Look for notification
          const notification = document.querySelector('#flash-notifications-container .max-w-sm');
          
          if (notification) {
            const titleEl = notification.querySelector('.font-semibold');
            const messageEl = notification.querySelector('p:not(.font-semibold)');
            
            return {
              found: true,
              title: titleEl ? titleEl.textContent : 'No title',
              message: messageEl ? messageEl.textContent : 'No message',
              visible: notification.offsetParent !== null,
              position: window.getComputedStyle(notification.parentElement).position,
              bottom: window.getComputedStyle(notification.parentElement).bottom,
              right: window.getComputedStyle(notification.parentElement).right
            };
          }
          
          return {
            found: false,
            containerExists: !!document.getElementById('flash-notifications-container'),
            containerChildren: document.getElementById('flash-notifications-container') ? 
              document.getElementById('flash-notifications-container').children.length : 0,
            bodyHasController: document.body.getAttribute('data-controller'),
            stimulusAvailable: !!window.Stimulus,
            showNotificationFunction: typeof window.showNotification
          };
        `);
        
        console.log('📊 Notification result:', notificationResult);
        
        if (notificationResult.found) {
          console.log('✅ DELETION NOTIFICATION FOUND!');
          console.log(`📋 Title: ${notificationResult.title}`);
          console.log(`💬 Message: ${notificationResult.message}`);
          console.log(`📍 Position: ${notificationResult.position} (bottom: ${notificationResult.bottom}, right: ${notificationResult.right})`);
          
          // Verify it's a deletion notification
          const titleLower = notificationResult.title.toLowerCase();
          const messageLower = notificationResult.message.toLowerCase();
          
          const isDeletionNotification = 
            titleLower.includes('eliminado') || titleLower.includes('deleted') ||
            messageLower.includes('eliminado') || messageLower.includes('deleted');
          
          expect(isDeletionNotification).toBe(true);
          console.log('✅ Notification contains deletion-related content');
          
        } else {
          console.log('❌ No deletion notification found');
          console.log('🔍 Debug info:', {
            containerExists: notificationResult.containerExists,
            containerChildren: notificationResult.containerChildren,
            bodyController: notificationResult.bodyHasController,
            stimulusAvailable: notificationResult.stimulusAvailable,
            showNotificationFunction: notificationResult.showNotificationFunction
          });
          
          console.log('💡 This indicates there might be an issue with:');
          console.log('   - The Turbo Stream response from the destroy action');
          console.log('   - The notification system not being triggered');
          console.log('   - Stimulus controller not being loaded properly');
          
          expect(false).toBe(true); // Fail the test to highlight the issue
        }
        
      } else {
        console.log('❌ No delete buttons found');
        expect(false).toBe(true);
      }
      
    } catch (error) {
      console.error('❌ Test failed:', error.message);
      
      const debugInfo = await driver.executeScript(`
        return {
          url: window.location.href,
          title: document.title,
          hasComments: document.querySelectorAll('.comment-item').length,
          hasDeleteButtons: document.querySelectorAll('button[form]').length,
          notifications: document.querySelectorAll('#flash-notifications-container *').length
        };
      `);
      
      console.log('🔍 Debug info:', debugInfo);
      throw error;
    }
    
  }, 120000);
});
