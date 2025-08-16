import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["count", "button", "icon"]
  static values = { 
    postId: Number,
    currentLikes: Number,
    likeUrl: String
  }

  connect() {
    this.originalCount = this.currentLikesValue
    this.isProcessing = false
  }

  like(event) {
    event.preventDefault()
    
    // Prevenir múltiples clicks
    if (this.isProcessing) return
    
    this.isProcessing = true
    
    // Actualización optimista - incrementar inmediatamente
    this.currentLikesValue++
    this.updateDisplay(true)
    
    // Enviar petición al servidor
    fetch(this.likeUrlValue, {
      method: 'PATCH',
      headers: {
        'X-CSRF-Token': document.querySelector('[name="csrf-token"]').content,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return response.json()
    })
    .then(data => {
      // Actualizar con el valor real del servidor
      this.currentLikesValue = data.likes
      this.updateDisplay(false)
      this.isProcessing = false
    })
    .catch(error => {
      // Revertir en caso de error
      console.error('Error:', error)
      this.currentLikesValue--
      this.updateDisplay(false)
      this.isProcessing = false
      
      // Mostrar error al usuario
      this.showError()
    })
  }
  
  updateDisplay(isLoading = false) {
    // Actualizar el contador
    this.countTarget.textContent = this.currentLikesValue
    
    if (isLoading) {
      // Mostrar spinner/loading state
      this.buttonTarget.classList.add('opacity-75', 'cursor-wait')
      this.iconTarget.classList.add('animate-pulse')
      this.buttonTarget.title = 'Procesando...'
    } else {
      // Remover loading state
      this.buttonTarget.classList.remove('opacity-75', 'cursor-wait')
      this.iconTarget.classList.remove('animate-pulse')
      this.buttonTarget.title = 'Me gusta este post'
    }
  }
  
  showError() {
    // Agregar efecto visual de error
    this.buttonTarget.classList.add('animate-bounce')
    
    // Cambiar temporalmente el color a rojo de error
    const originalClasses = this.buttonTarget.className
    this.buttonTarget.className = originalClasses.replace(/bg-red-50|bg-red-900/, 'bg-red-200')
    
    // Restaurar después de 1 segundo
    setTimeout(() => {
      this.buttonTarget.className = originalClasses
      this.buttonTarget.classList.remove('animate-bounce')
    }, 1000)
  }
}
