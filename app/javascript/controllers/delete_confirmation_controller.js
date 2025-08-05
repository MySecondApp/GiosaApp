import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="delete-confirmation"
export default class extends Controller {
  static targets = ["form", "modal", "title", "confirmButton"]
  static values = { 
    title: String,
    message: String,
    confirmText: String,
    cancelText: String
  }

  connect() {
    console.log("🗑️ Delete confirmation controller connected")
  }

  show(event) {
    event.preventDefault()
    
    // Actualizar el contenido del modal
    if (this.hasTitleTarget) {
      this.titleTarget.textContent = this.titleValue || "¿Confirmar eliminación?"
    }
    
    // Mostrar el modal
    this.modalTarget.classList.remove("hidden")
    this.modalTarget.classList.add("flex")
    
    // Focus en el botón de cancelar por seguridad
    const cancelButton = this.modalTarget.querySelector('[data-action*="cancel"]')
    if (cancelButton) {
      cancelButton.focus()
    }
  }

  cancel() {
    this.modalTarget.classList.add("hidden")
    this.modalTarget.classList.remove("flex")
  }

  confirm() {
    // Mostrar indicador de carga
    if (this.hasConfirmButtonTarget) {
      this.confirmButtonTarget.disabled = true
      this.confirmButtonTarget.innerHTML = `
        <svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Eliminando...
      `
    }

    // Ocultar el modal
    this.modalTarget.classList.add("hidden")
    this.modalTarget.classList.remove("flex")
    
    // Enviar el formulario
    if (this.hasFormTarget) {
      this.formTarget.requestSubmit()
    }
  }

  // Cerrar modal al hacer clic en el fondo
  closeIfBackground(event) {
    if (event.target === this.modalTarget) {
      this.cancel()
    }
  }

  // Cerrar modal con tecla ESC
  closeWithEscape(event) {
    if (event.key === "Escape") {
      this.cancel()
    }
  }
}
