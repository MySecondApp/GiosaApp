import { screen, waitFor } from '@testing-library/dom';

// Mock the Stimulus Controller class
class MockController {
  constructor() {
    this.element = document.querySelector('[data-controller="flash-notifications"]') || document.body;
    this.messageValue = '';
    this.typeValue = '';
    this.titleValue = '';
  }

  getBorderColor(type) {
    const colors = {
      success: 'border-green-400',
      error: 'border-red-400', 
      warning: 'border-yellow-400',
      info: 'border-blue-400',
      comment: 'border-indigo-400'
    };
    return colors[type] || colors.info;
  }

  getIcon(type) {
    const icons = {
      success: `<svg class="h-6 w-6 text-green-400"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
      error: `<svg class="h-6 w-6 text-red-400"><path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
      warning: `<svg class="h-6 w-6 text-yellow-400"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" /></svg>`,
      info: `<svg class="h-6 w-6 text-blue-400"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
      comment: `<svg class="h-6 w-6 text-indigo-400"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>`
    };
    return icons[type] || icons.info;
  }

  createNotification(data) {
    // Get or create container
    let container = document.getElementById('flash-notifications-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'flash-notifications-container';
      container.className = 'fixed top-4 right-4 z-50 space-y-3';
      container.style.position = 'fixed';
      container.style.top = '20px';
      container.style.right = '20px';
      container.style.zIndex = '99999';
      container.style.maxWidth = '400px';
      document.body.appendChild(container);
    }
    
    // Create notification element
    const notification = document.createElement('div');
    const type = data.type || 'success';
    
    const borderColor = this.getBorderColor(type);
    const icon = this.getIcon(type);
    
    notification.className = `max-w-sm w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg border-l-4 ${borderColor} transform translate-x-full transition-transform duration-300 ease-out`;
    
    notification.innerHTML = `
      <div class="p-4">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            ${icon}
          </div>
          <div class="ml-3 w-0 flex-1">
            ${data.title ? `<p class="text-sm font-medium text-gray-900 dark:text-white">${data.title}</p>` : ''}
            <p class="text-sm text-gray-500 dark:text-gray-400">${data.message}</p>
          </div>
          <div class="ml-4 flex-shrink-0 flex">
            <button class="bg-white dark:bg-gray-800 rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none close-btn">
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;
    
    // Close button functionality
    const closeBtn = notification.querySelector('.close-btn');
    closeBtn.addEventListener('click', () => {
      notification.classList.add('translate-x-full');
      setTimeout(() => notification.remove(), 300);
    });
    
    // Add to container
    container.appendChild(notification);
    
    // Animate entrance
    requestAnimationFrame(() => {
      notification.classList.remove('translate-x-full');
      notification.classList.add('translate-x-0');
    });
    
    // Auto-remove after 5 seconds (shortened for tests)
    setTimeout(() => {
      if (notification.parentElement) {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
          if (notification.parentElement) {
            notification.remove();
          }
        }, 300);
      }
    }, process.env.NODE_ENV === 'test' ? 1000 : 5000);
    
    return notification;
  }

  connect() {
    // Create simple global function
    window.showNotification = (message, title = null, type = 'success') => {
      return this.createNotification({ message, title, type });
    };

    // Register custom Turbo Stream action
    global.Turbo.StreamActions.show_notification = function() {
      const notificationData = this.templateContent?.querySelector('.turbo-notification-trigger');
      
      if (notificationData) {
        const message = notificationData.dataset.message;
        const title = notificationData.dataset.title;
        const type = notificationData.dataset.type;
        
        if (window.showNotification) {
          window.showNotification(message, title, type);
        }
      }
    };

    // Add event listener for custom notification events
    document.addEventListener('notification:show', (event) => {
      const { message, title, type } = event.detail;
      this.createNotification({ message, title, type });
    });
  }

  disconnect() {
    if (window.showNotification) {
      delete window.showNotification;
    }
  }
}

describe('FlashNotificationsController', () => {
  let controller;

  beforeEach(() => {
    // Clean up DOM
    document.body.innerHTML = '<div data-controller="flash-notifications"></div>';
    
    // Remove any existing containers
    const existingContainer = document.getElementById('flash-notifications-container');
    if (existingContainer) {
      existingContainer.remove();
    }

    // Create controller instance
    controller = new MockController();
    controller.connect();
  });

  afterEach(() => {
    controller.disconnect();
    
    // Clean up notifications
    const container = document.getElementById('flash-notifications-container');
    if (container) {
      container.remove();
    }
  });

  describe('Notification Creation', () => {
    test('creates notification container when first notification is shown', () => {
      controller.createNotification({
        message: 'Test message',
        title: 'Test title',
        type: 'success'
      });

      const container = document.getElementById('flash-notifications-container');
      expect(container).toBeInTheDocument();
      expect(container).toHaveClass('fixed', 'top-4', 'right-4', 'z-50', 'space-y-3');
    });

    test('creates notification with correct content', () => {
      controller.createNotification({
        message: 'Test message',
        title: 'Test title',
        type: 'success'
      });

      expect(screen.getByText('Test title')).toBeInTheDocument();
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });

    test('creates notification without title when not provided', () => {
      controller.createNotification({
        message: 'Test message only',
        type: 'info'
      });

      expect(screen.getByText('Test message only')).toBeInTheDocument();
      expect(screen.queryByText('Test title')).not.toBeInTheDocument();
    });

    test('applies correct border color based on type', () => {
      const notification = controller.createNotification({
        message: 'Success message',
        type: 'success'
      });

      expect(notification).toHaveClass('border-green-400');
    });

    test('applies default type when not specified', () => {
      const notification = controller.createNotification({
        message: 'Default message'
      });

      expect(notification).toHaveClass('border-green-400'); // success is default
    });
  });

  describe('Notification Types', () => {
    const types = [
      { type: 'success', color: 'border-green-400' },
      { type: 'error', color: 'border-red-400' },
      { type: 'warning', color: 'border-yellow-400' },
      { type: 'info', color: 'border-blue-400' },
      { type: 'comment', color: 'border-indigo-400' }
    ];

    types.forEach(({ type, color }) => {
      test(`creates ${type} notification with correct styling`, () => {
        const notification = controller.createNotification({
          message: `${type} message`,
          type: type
        });

        expect(notification).toHaveClass(color);
        expect(screen.getByText(`${type} message`)).toBeInTheDocument();
      });
    });
  });

  describe('Global Function', () => {
    test('creates global showNotification function on connect', () => {
      expect(typeof window.showNotification).toBe('function');
    });

    test('global function creates notification correctly', () => {
      window.showNotification('Global test', 'Global title', 'info');

      expect(screen.getByText('Global title')).toBeInTheDocument();
      expect(screen.getByText('Global test')).toBeInTheDocument();
    });

    test('removes global function on disconnect', () => {
      controller.disconnect();
      expect(window.showNotification).toBeUndefined();
    });
  });

  describe('Notification Interactions', () => {
    test('close button removes notification', async () => {
      controller.createNotification({
        message: 'Closable message',
        title: 'Closable title',
        type: 'info'
      });

      const closeButton = screen.getByRole('button');
      closeButton.click();

      // Wait for animation
      await waitFor(() => {
        expect(screen.queryByText('Closable message')).not.toBeInTheDocument();
      }, { timeout: 1000 });
    });

    test('notification auto-removes after timeout', async () => {
      controller.createNotification({
        message: 'Auto-remove message',
        type: 'info'
      });

      expect(screen.getByText('Auto-remove message')).toBeInTheDocument();

      // Wait for auto-remove (shortened to 1s in tests)
      await waitFor(() => {
        expect(screen.queryByText('Auto-remove message')).not.toBeInTheDocument();
      }, { timeout: 1500 });
    });
  });

  describe('Multiple Notifications', () => {
    test('can display multiple notifications simultaneously', () => {
      controller.createNotification({
        message: 'First notification',
        type: 'success'
      });

      controller.createNotification({
        message: 'Second notification',
        type: 'info'
      });

      expect(screen.getByText('First notification')).toBeInTheDocument();
      expect(screen.getByText('Second notification')).toBeInTheDocument();
    });

    test('reuses container for multiple notifications', () => {
      controller.createNotification({
        message: 'First notification',
        type: 'success'
      });

      controller.createNotification({
        message: 'Second notification',
        type: 'info'
      });

      const containers = document.querySelectorAll('#flash-notifications-container');
      expect(containers).toHaveLength(1);
    });
  });

  describe('Custom Events', () => {
    test('responds to custom notification:show event', () => {
      const event = new CustomEvent('notification:show', {
        detail: {
          message: 'Event message',
          title: 'Event title',
          type: 'warning'
        }
      });

      document.dispatchEvent(event);

      expect(screen.getByText('Event title')).toBeInTheDocument();
      expect(screen.getByText('Event message')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('handles missing message gracefully', () => {
      expect(() => {
        controller.createNotification({
          title: 'Title only',
          type: 'info'
        });
      }).not.toThrow();
    });

    test('handles invalid type gracefully', () => {
      const notification = controller.createNotification({
        message: 'Invalid type test',
        type: 'invalid-type'
      });

      expect(notification).toHaveClass('border-blue-400'); // defaults to info
    });
  });
});
