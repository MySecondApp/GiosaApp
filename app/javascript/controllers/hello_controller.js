import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["name", "output"]

  connect() {
    const savedName = sessionStorage.getItem('hello-name')
    if (savedName) {
      this.outputTarget.textContent = `¡Hola, ${savedName}! Bienvenido a GiosaApp 👋`
    }
  }

  greet() {
    const name = this.nameTarget.value
    if (name.trim() === "") {
      this.outputTarget.textContent = "¡Por favor ingresa tu nombre!"
    } else {
      this.outputTarget.textContent = `¡Hola, ${name}! Bienvenido a GiosaApp 👋`
      sessionStorage.setItem('hello-name', name)
    }
  }
}
