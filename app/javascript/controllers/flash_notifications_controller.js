import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static values = { 
    message: String, 
    type: String, 
    title: String 
  }

  connect() {
    console.log('🔔 Flash notifications controller connected')
    
    // Create simple global function first
    window.showNotification = (message, title = null, type = 'success') => {
      console.log('📢 Global showNotification called:', { message, title, type })
      this.createNotification({ message, title, type })
    }
    
    // Register custom Turbo Stream action
    Turbo.StreamActions.show_notification = function() {
      console.log('🚀 Custom Turbo Stream action: show_notification triggered')
      console.log('📋 Template content:', this.templateContent)
      
      const notificationData = this.templateContent.querySelector('.turbo-notification-trigger')
      
      if (notificationData) {
        const message = notificationData.dataset.message
        const title = notificationData.dataset.title
        const type = notificationData.dataset.type
        
        console.log('📋 Notification data extracted:', { message, title, type })
        
        // Use setTimeout to ensure DOM is ready
        setTimeout(() => {
          if (window.showNotification && typeof window.showNotification === 'function') {
            console.log('✅ Calling window.showNotification')
            window.showNotification(message, title, type)
          } else {
            console.log('❌ window.showNotification not available, dispatching event')
            document.dispatchEvent(new CustomEvent('notification:show', {
              detail: { message, title, type }
            }))
          }
        }, 100)
      } else {
        console.log('❌ No notification data found in template')
        console.log('Template HTML:', this.templateContent.innerHTML)
      }
    }
    
    // Look for values in child elements
    const childElement = this.element.querySelector('[data-flash-notifications-message-value]')
    let messageValue = this.messageValue
    let typeValue = this.typeValue
    let titleValue = this.titleValue
    
    if (!messageValue && childElement) {
      messageValue = childElement.dataset.flashNotificationsMessageValue
      typeValue = childElement.dataset.flashNotificationsTypeValue
      titleValue = childElement.dataset.flashNotificationsTitleValue
    }
    
    // If we have flash message values, show notification
    if (messageValue) {
      this.createNotification({
        message: messageValue,
        type: typeValue || 'success',
        title: titleValue || '✅ Success'
      })
    }
    
    // Add event listener for custom notification events as fallback
    document.addEventListener('notification:show', (event) => {
      const { message, title, type } = event.detail
      this.createNotification({ message, title, type })
    })
  }

  disconnect() {
    // Limpiar función global al desconectar
    if (window.showNotification) {
      delete window.showNotification
      console.log('🔔 Notifications system disconnected, global function removed')
    }
  }

  createNotification(data) {
    // Get or create container
    let container = document.getElementById('flash-notifications-container')
    if (!container) {
      container = document.createElement('div')
      container.id = 'flash-notifications-container'
      container.className = 'fixed bottom-6 right-6 z-50 space-y-4 max-w-md'
      // Force container position for visibility
      container.style.position = 'fixed'
      container.style.bottom = '24px'
      container.style.right = '24px'
      container.style.zIndex = '99999'
      container.style.maxWidth = '28rem'
      document.body.appendChild(container)
    }
    
    // Crear elemento de notificación
    const notification = document.createElement('div')
    const type = data.type || 'success'
    
    // Usar los métodos para obtener color e icono basado en tipo
    const borderColor = this.getBorderColor(type)
    const icon = this.getIcon(type)
    
    // Use theme-aware styling
    const isDark = document.documentElement.classList.contains('dark') || document.body.classList.contains('bg-gray-900')
    const bgClass = isDark ? 'bg-gray-800' : 'bg-white'
    const shadowClass = isDark ? 'shadow-2xl' : 'shadow-lg'
    const borderClass = isDark ? 'border-gray-600' : 'border-gray-200'
    
    notification.className = `w-96 ${bgClass} ${shadowClass} rounded-lg border ${borderClass} border-l-4 ${borderColor} transform translate-x-full transition-transform duration-300 ease-out notification-toast`
    
    // Apply the same inline styles as simple_notification for consistency
    notification.style.position = 'relative'
    notification.style.zIndex = '50'
    notification.style.minHeight = '80px'
    
    // Theme-aware text colors
    const titleTextColor = isDark ? 'text-white' : 'text-gray-900'
    const messageTextColor = isDark ? 'text-gray-300' : 'text-gray-700'
    const closeButtonBg = isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
    const closeButtonText = isDark ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-700'
    
    // Match simple_notification structure with proper padding and text sizes
    notification.innerHTML = `
      <div class="w-2 flex-shrink-0 ${type == 'success' ? 'bg-green-400' : type == 'error' ? 'bg-red-400' : type == 'warning' ? 'bg-yellow-400' : 'bg-blue-400'}"></div>
      <div class="flex-1 p-5">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            ${icon}
          </div>
          <div class="ml-4 flex-1 pt-1">
            ${data.title ? `<p class="text-base font-semibold ${titleTextColor} mb-2">${data.title}</p>` : ''}
            <p class="text-base ${messageTextColor} leading-relaxed">${data.message}</p>
          </div>
          <div class="ml-4 flex-shrink-0 flex">
            <button class="${closeButtonBg} rounded-md inline-flex ${closeButtonText} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors p-1.5 close-btn">
              <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    `
    
    // Botón de cerrar
    const closeBtn = notification.querySelector('.close-btn')
    closeBtn.addEventListener('click', () => {
      notification.classList.add('translate-x-full')
      setTimeout(() => notification.remove(), 300)
    })
    
    // Add to container
    container.appendChild(notification)
    
    // Animate entrance
    requestAnimationFrame(() => {
      notification.classList.remove('translate-x-full')
      notification.classList.add('translate-x-0')
    })
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.classList.add('translate-x-full')
        setTimeout(() => {
          if (notification.parentElement) {
            notification.remove()
          }
        }, 300)
      }
    }, 5000)
  }

  showNotification() {
    const container = this.getOrCreateContainer()
    const notification = this.createNotificationElement()
    
    container.appendChild(notification)
    
    // Animar entrada
    requestAnimationFrame(() => {
      notification.classList.remove('translate-x-full')
      notification.classList.add('translate-x-0')
    })
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
      this.removeNotification(notification)
    }, 5000)
  }

  showNotificationWithData(data) {
    const container = this.getOrCreateContainer()
    const notification = this.createNotificationElementWithData(data)
    
    container.appendChild(notification)
    
    // Animar entrada
    requestAnimationFrame(() => {
      notification.classList.remove('translate-x-full')
      notification.classList.add('translate-x-0')
    })
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
      this.removeNotification(notification)
    }, 5000)
  }

  getOrCreateContainer() {
    let container = document.getElementById('flash-notifications-container')
    if (!container) {
      container = document.createElement('div')
      container.id = 'flash-notifications-container'
      container.className = 'fixed bottom-4 right-4 z-50 space-y-3'
      document.body.appendChild(container)
    }
    return container
  }

  createNotificationElement() {
    const notification = document.createElement('div')
    const type = this.typeValue || 'info'
    
    // Use same theme detection as main function
    const isDark = document.documentElement.classList.contains('dark') || document.body.classList.contains('bg-gray-900')
    const bgClass = isDark ? 'bg-gray-800' : 'bg-white'
    const shadowClass = isDark ? 'shadow-2xl' : 'shadow-lg'
    const borderClass = isDark ? 'border-gray-600' : 'border-gray-200'
    const titleTextColor = isDark ? 'text-white' : 'text-gray-900'
    const messageTextColor = isDark ? 'text-gray-300' : 'text-gray-700'
    const closeButtonBg = isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
    const closeButtonText = isDark ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-700'
    
    notification.className = `max-w-lg w-full ${bgClass} ${shadowClass} rounded-lg border ${borderClass} border-l-4 ${this.getBorderColor(type)} transform translate-x-full transition-transform duration-300 ease-out`
    
    notification.innerHTML = `
      <div class="p-4">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            ${this.getIcon(type)}
          </div>
          <div class="ml-3 w-0 flex-1">
            ${this.titleValue ? `<p class="text-sm font-semibold ${titleTextColor} mb-1">${this.titleValue}</p>` : ''}
            <p class="text-sm ${messageTextColor}">${this.messageValue}</p>
          </div>
          <div class="ml-4 flex-shrink-0 flex">
            <button class="${closeButtonBg} rounded-md inline-flex ${closeButtonText} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 p-1 close-btn">
              <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    `
    
    // Agregar evento al botón de cerrar
    const closeBtn = notification.querySelector('.close-btn')
    closeBtn.addEventListener('click', () => {
      this.removeNotification(notification)
    })
    
    return notification
  }

  createNotificationElementWithData(data) {
    const notification = document.createElement('div')
    const type = data.type || 'info'
    
    // Use same theme detection as main function
    const isDark = document.documentElement.classList.contains('dark') || document.body.classList.contains('bg-gray-900')
    const bgClass = isDark ? 'bg-gray-800' : 'bg-white'
    const shadowClass = isDark ? 'shadow-2xl' : 'shadow-lg'
    const borderClass = isDark ? 'border-gray-600' : 'border-gray-200'
    const titleTextColor = isDark ? 'text-white' : 'text-gray-900'
    const messageTextColor = isDark ? 'text-gray-300' : 'text-gray-700'
    const closeButtonBg = isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
    const closeButtonText = isDark ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-700'
    
    notification.className = `max-w-lg w-full ${bgClass} ${shadowClass} rounded-lg border ${borderClass} border-l-4 ${this.getBorderColor(type)} transform translate-x-full transition-transform duration-300 ease-out`
    
    notification.innerHTML = `
      <div class="p-4">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            ${this.getIcon(type)}
          </div>
          <div class="ml-3 w-0 flex-1">
            ${data.title ? `<p class="text-sm font-semibold ${titleTextColor} mb-1">${data.title}</p>` : ''}
            <p class="text-sm ${messageTextColor}">${data.message}</p>
          </div>
          <div class="ml-4 flex-shrink-0 flex">
            <button class="${closeButtonBg} rounded-md inline-flex ${closeButtonText} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 p-1 close-btn">
              <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    `
    
    // Agregar evento al botón de cerrar
    const closeBtn = notification.querySelector('.close-btn')
    closeBtn.addEventListener('click', () => {
      this.removeNotification(notification)
    })
    
    return notification
  }

  removeNotification(notification) {
    notification.classList.add('translate-x-full')
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove()
      }
    }, 300)
  }

  getBorderColor(type) {
    const colors = {
      success: 'border-green-400',
      error: 'border-red-400', 
      warning: 'border-yellow-400',
      info: 'border-blue-400',
      comment: 'border-indigo-400'
    }
    return colors[type] || colors.info
  }

  getIcon(type) {
    const icons = {
      success: `<svg class="h-7 w-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>`,
      error: `<svg class="h-7 w-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>`,
      warning: `<svg class="h-7 w-7 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
      </svg>`,
      info: `<svg class="h-7 w-7 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>`,
      comment: `<svg class="h-7 w-7 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>`
    }
    return icons[type] || icons.info
  }
}
