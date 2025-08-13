import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static values = { duration: Number }

  connect() {
    console.log('📢 Simple notification controller connected')
    console.log('🎯 Element:', this.element)
    
    // Position notification in bottom-right corner based on existing notifications
    this.positionNotification()
    
    // Animate in from right
    this.animateIn()
    
    // Auto-remove after duration
    if (this.durationValue && this.durationValue > 0) {
      setTimeout(() => {
        console.log('⏰ Auto-removing notification after', this.durationValue, 'ms')
        this.remove()
      }, this.durationValue)
    }
  }
  
  positionNotification() {
    // Find all existing notifications to calculate bottom position
    const existingNotifications = document.querySelectorAll('.notification-toast')
    let bottomOffset = 24 // Base offset from bottom
    
    existingNotifications.forEach(notification => {
      if (notification !== this.element) {
        bottomOffset += notification.offsetHeight + 16 // Add height + margin
      }
    })
    
    // Apply positioning
    this.element.style.position = 'fixed'
    this.element.style.right = '24px'
    this.element.style.bottom = `${bottomOffset}px`
    this.element.style.zIndex = '9999'
    this.element.style.width = '400px'
    
    console.log('📍 Positioned notification at bottom:', bottomOffset, 'px')
  }
  
  animateIn() {
    // Start hidden, slide in from right
    this.element.style.opacity = '0'
    this.element.style.transform = 'translateX(100%)'
    
    // Trigger animation
    requestAnimationFrame(() => {
      this.element.style.opacity = '1'
      this.element.style.transform = 'translateX(0)'
    })
    
    console.log('🎭 Animation started')
  }

  close() {
    console.log('🗑️ Closing notification manually')
    this.remove()
  }

  remove() {
    console.log('🚀 Starting remove animation')
    
    // Animate out to the right
    this.element.style.opacity = '0'
    this.element.style.transform = 'translateX(100%)'
    
    // Remove element after animation
    setTimeout(() => {
      if (this.element.parentElement) {
        console.log('🗑️ Removing notification element')
        this.element.remove()
      }
    }, 300)
  }
}
