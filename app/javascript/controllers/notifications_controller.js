import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="notifications"
export default class extends Controller {
  static targets = ["container"]
  static values = { 
    position: { type: String, default: "top-right" },
    autoHide: { type: Boolean, default: true },
    hideDelay: { type: Number, default: 5000 }
  }

  connect() {
    console.log("🔔 Notifications controller connected")
    this.loadUserPreferences()
    this.createContainer()
  }

  createContainer() {
    if (!this.hasContainerTarget) {
      const container = document.createElement("div")
      container.setAttribute("data-notifications-target", "container")
      container.className = this.getContainerClasses()
      document.body.appendChild(container)
    }
  }

  getContainerClasses() {
    const baseClasses = "fixed z-50 p-4 space-y-2 pointer-events-none"
    const positionClasses = {
      "top-right": "top-4 right-4",
      "top-left": "top-4 left-4",
      "bottom-right": "bottom-4 right-4",
      "bottom-left": "bottom-4 left-4",
      "top-center": "top-4 left-1/2 transform -translate-x-1/2",
      "bottom-center": "bottom-4 left-1/2 transform -translate-x-1/2"
    }
    
    return `${baseClasses} ${positionClasses[this.positionValue] || positionClasses["top-right"]}`
  }

  showNotification(event) {
    const { message, type = "info", title, duration } = event.detail
    this.createNotification({ message, type, title, duration })
  }

  createNotification({ message, type = "info", title, duration }) {
    const notification = document.createElement("div")
    notification.className = this.getNotificationClasses(type)
    
    const hideDelay = duration || this.hideDelayValue
    
    notification.innerHTML = `
      <div class="flex items-start">
        <div class="flex-shrink-0">
          ${this.getIcon(type)}
        </div>
        <div class="ml-3 flex-1">
          ${title ? `<h4 class="text-sm font-medium text-gray-900 dark:text-white">${title}</h4>` : ''}
          <p class="text-sm ${title ? 'mt-1 ' : ''}text-gray-700 dark:text-gray-300">${message}</p>
        </div>
        <div class="ml-4 flex-shrink-0 flex">
          <button type="button" class="rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" onclick="this.parentElement.parentElement.parentElement.remove()">
            <span class="sr-only">Cerrar</span>
            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </button>
        </div>
      </div>
    `

    // Hacer que la notificación sea interactiva
    notification.style.pointerEvents = "auto"
    
    // Agregar animación de entrada
    notification.style.transform = "translateX(100%)"
    notification.style.opacity = "0"
    
    this.containerTarget.appendChild(notification)
    
    // Animar entrada
    requestAnimationFrame(() => {
      notification.style.transition = "all 0.3s ease-out"
      notification.style.transform = "translateX(0)"
      notification.style.opacity = "1"
    })

    // Auto-hide después del tiempo especificado
    if (this.autoHideValue && hideDelay > 0) {
      setTimeout(() => {
        this.hideNotification(notification)
      }, hideDelay)
    }

    // Reproducir sonido opcional
    this.playNotificationSound(type)
  }

  hideNotification(notification) {
    if (notification && notification.parentElement) {
      notification.style.transition = "all 0.3s ease-in"
      notification.style.transform = "translateX(100%)"
      notification.style.opacity = "0"
      
      setTimeout(() => {
        if (notification.parentElement) {
          notification.remove()
        }
      }, 300)
    }
  }

  getNotificationClasses(type) {
    const baseClasses = "max-w-sm w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg border pointer-events-auto ring-1 ring-black ring-opacity-5"
    
    const typeClasses = {
      success: "border-green-200 dark:border-green-700",
      error: "border-red-200 dark:border-red-700", 
      warning: "border-yellow-200 dark:border-yellow-700",
      info: "border-blue-200 dark:border-blue-700",
      comment: "border-indigo-200 dark:border-indigo-700"
    }

    return `${baseClasses} ${typeClasses[type] || typeClasses.info} p-4`
  }

  getIcon(type) {
    const iconClasses = "h-6 w-6"
    
    const icons = {
      success: `<svg class="${iconClasses} text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>`,
      error: `<svg class="${iconClasses} text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>`,
      warning: `<svg class="${iconClasses} text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"/>
      </svg>`,
      info: `<svg class="${iconClasses} text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>`,
      comment: `<svg class="${iconClasses} text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
      </svg>`
    }

    return icons[type] || icons.info
  }

  playNotificationSound(type) {
    // Solo reproducir sonido para comentarios nuevos y si el usuario no ha deshabilitado los sonidos
    if (type === 'comment' && !localStorage.getItem('notifications-sound-disabled')) {
      // Crear un sonido sutil usando Web Audio API
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime)
        gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01)
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.2)
        
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.2)
      } catch (error) {
        console.log("Could not play notification sound:", error)
      }
    }
  }

  // Método para mostrar notificaciones desde otros controladores
  static showNotification(message, type = "info", title = null, duration = null) {
    const event = new CustomEvent("notification:show", {
      detail: { message, type, title, duration }
    })
    window.dispatchEvent(event)
  }

  // Escuchar eventos globales de notificación
  handleGlobalNotification(event) {
    this.showNotification(event)
  }

  // Cargar preferencias del usuario desde localStorage
  loadUserPreferences() {
    const savedPosition = localStorage.getItem('notifications-position')
    if (savedPosition) {
      this.positionValue = savedPosition
    }
  }

  // Actualizar el contenedor cuando cambien las preferencias
  positionValueChanged() {
    if (this.hasContainerTarget) {
      this.containerTarget.className = this.getContainerClasses()
    }
  }
}

// Hacer disponible el método estático globalmente
// window.NotificationsController = NotificationsController
