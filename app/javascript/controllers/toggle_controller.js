import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["content"]

  connect() {
    // Restaurar estado desde sessionStorage
    const isVisible = sessionStorage.getItem('toggle-content-visible') === 'true'
    if (isVisible) {
      this.contentTarget.classList.remove("hidden")
    }
  }

  toggle() {
    this.contentTarget.classList.toggle("hidden")
    // Guardar estado en sessionStorage
    const isVisible = !this.contentTarget.classList.contains("hidden")
    sessionStorage.setItem('toggle-content-visible', isVisible)
  }
}
