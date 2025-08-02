import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="comment-form"
export default class extends Controller {
  static targets = ["authorName", "content", "submitButton"]

  connect() {
    console.log("Comment form controller connected")
  }

  reset(event) {
    if (event.detail.success) {
      // Reset form after successful submission
      if (this.hasAuthorNameTarget) {
        this.authorNameTarget.value = ""
      }
      if (this.hasContentTarget) {
        this.contentTarget.value = ""
      }
      
      // Show success message
      this.showSuccessMessage()
    }
  }

  // Auto-resize textarea as user types
  autoResize(event) {
    const textarea = event.target
    textarea.style.height = 'auto'
    textarea.style.height = textarea.scrollHeight + 'px'
  }

  // Show character count for content
  updateCharCount(event) {
    const content = event.target.value
    const maxLength = 500 // You can adjust this
    const remaining = maxLength - content.length
    
    // Find or create character count element
    let charCount = event.target.parentElement.querySelector('.char-count')
    if (!charCount) {
      charCount = document.createElement('div')
      charCount.className = 'char-count text-sm text-gray-500 mt-1'
      event.target.parentElement.appendChild(charCount)
    }
    
    charCount.textContent = `${content.length}/${maxLength} caracteres`
    charCount.classList.toggle('text-red-500', remaining < 0)
    charCount.classList.toggle('text-gray-500', remaining >= 0)
  }

  // Validate form before submission
  validateForm(event) {
    const authorName = this.authorNameTarget.value.trim()
    const content = this.contentTarget.value.trim()
    
    if (!authorName || !content) {
      event.preventDefault()
      this.showError("Por favor, completa todos los campos")
      return false
    }
    
    if (authorName.length < 2) {
      event.preventDefault()
      this.showError("El nombre debe tener al menos 2 caracteres")
      return false
    }
    
    if (content.length < 5) {
      event.preventDefault()
      this.showError("El comentario debe tener al menos 5 caracteres")
      return false
    }
    
    // Disable submit button to prevent double submission
    this.submitButtonTarget.disabled = true
    return true
  }

  showSuccessMessage() {
    // Create and show a temporary success message
    const message = document.createElement('div')
    message.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300'
    message.innerHTML = `
      <div class="flex items-center">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        ¡Comentario publicado exitosamente!
      </div>
    `
    
    document.body.appendChild(message)
    
    // Animate in
    setTimeout(() => {
      message.classList.remove('translate-x-full')
    }, 100)
    
    // Animate out and remove
    setTimeout(() => {
      message.classList.add('translate-x-full')
      setTimeout(() => {
        document.body.removeChild(message)
      }, 300)
    }, 3000)
  }

  showError(errorMessage) {
    // Create and show a temporary error message
    const message = document.createElement('div')
    message.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300'
    message.innerHTML = `
      <div class="flex items-center">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        ${errorMessage}
      </div>
    `
    
    document.body.appendChild(message)
    
    // Animate in
    setTimeout(() => {
      message.classList.remove('translate-x-full')
    }, 100)
    
    // Animate out and remove
    setTimeout(() => {
      message.classList.add('translate-x-full')
      setTimeout(() => {
        document.body.removeChild(message)
      }, 300)
    }, 4000)
  }
}
