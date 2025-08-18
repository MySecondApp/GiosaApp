import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="navbar"
export default class extends Controller {
  static targets = ["menu", "button"]
  static classes = ["hidden", "active"]
  
  connect() {
    // Ensure menu starts hidden
    this.closeMenu()
    
    // Add outside click listener
    this.boundHandleOutsideClick = this.handleOutsideClick.bind(this)
    document.addEventListener('click', this.boundHandleOutsideClick)
  }

  toggle(event) {
    event.preventDefault()
    
    if (!this.hasMenuTarget || !this.hasButtonTarget) {
      return
    }
    
    if (this.menuTarget.classList.contains('hidden')) {
      this.openMenu()
    } else {
      this.closeMenu()
    }
  }
  
  openMenu() {
    try {
      // Show menu
      this.menuTarget.classList.remove('hidden')
      this.menuTarget.classList.add('mobile-menu-open')
      this.buttonTarget.setAttribute('aria-expanded', 'true')
      
      // Animate hamburger to X
      const hamburgerLines = this.buttonTarget.querySelectorAll('.hamburger-line')
      this.buttonTarget.classList.add('hamburger-active')
      
      if (hamburgerLines.length >= 3) {
        hamburgerLines[0].style.transform = 'rotate(45deg) translate(5px, 5px)'
        hamburgerLines[1].style.opacity = '0'
        hamburgerLines[2].style.transform = 'rotate(-45deg) translate(7px, -6px)'
      }
    } catch (error) {
      // Silent error handling
    }
  }
  
  closeMenu() {
    try {
      if (!this.hasMenuTarget || !this.hasButtonTarget) return
      
      // Hide menu
      this.menuTarget.classList.add('hidden')
      this.menuTarget.classList.remove('mobile-menu-open')
      this.buttonTarget.setAttribute('aria-expanded', 'false')
      
      // Reset hamburger
      const hamburgerLines = this.buttonTarget.querySelectorAll('.hamburger-line')
      this.buttonTarget.classList.remove('hamburger-active')
      
      if (hamburgerLines.length >= 3) {
        hamburgerLines[0].style.transform = ''
        hamburgerLines[1].style.opacity = ''
        hamburgerLines[2].style.transform = ''
      }
    } catch (error) {
      // Silent error handling
    }
  }
  
  handleOutsideClick(event) {
    if (!this.hasMenuTarget) return
    
    // Don't close if clicking inside the navbar element
    if (this.element.contains(event.target)) return
    
    // Close menu if it's open and click was outside
    if (!this.menuTarget.classList.contains('hidden')) {
      this.closeMenu()
    }
  }
  
  // Clean up when controller disconnects
  disconnect() {
    if (this.boundHandleOutsideClick) {
      document.removeEventListener('click', this.boundHandleOutsideClick)
    }
  }
}
