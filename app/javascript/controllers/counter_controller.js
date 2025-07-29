import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["display"]
  static values = { count: Number }

  initialize() {
    // Restaurar valor desde sessionStorage
    const savedCount = sessionStorage.getItem('counter-value')
    this.countValue = savedCount ? parseInt(savedCount) : 0
  }

  increment() {
    this.countValue++
  }

  decrement() {
    this.countValue--
  }

  reset() {
    this.countValue = 0
  }

  countValueChanged() {
    this.displayTarget.textContent = this.countValue
    // Guardar valor en sessionStorage
    sessionStorage.setItem('counter-value', this.countValue)
  }
}
