import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="search"
export default class extends Controller {
  static targets = ["input", "results"]
  static values = { url: String }

  connect() {
    console.log("🔍 Search controller conectado")
  }

  search() {
    // Debounce la búsqueda para evitar demasiadas peticiones
    clearTimeout(this.timeout)
    this.timeout = setTimeout(() => {
      this.performSearch()
    }, 300)
  }

  performSearch() {
    const query = this.inputTarget.value
    console.log(`🔍 Buscando: "${query}"`)

    // Crear URL con parámetros de búsqueda
    const url = new URL(this.urlValue, window.location.origin)
    if (query) {
      url.searchParams.set("search", query)
    } else {
      url.searchParams.delete("search")
    }
    
    console.log(`🔍 URL: ${url.href}`)

    // Usar Turbo.visit para navegar al URL con los filtros
    // Esto mantendrá los Turbo Frames funcionando correctamente
    const frame = document.getElementById('posts_list')
    if (frame) {
      console.log(`🔍 Updating turbo frame`)
      frame.src = url.href
    } else {
      console.log(`🔍 No turbo frame found, using Turbo.visit`)
      Turbo.visit(url.href, { frame: "posts_list" })
    }
  }

  clear() {
    this.inputTarget.value = ""
    this.performSearch()
    this.inputTarget.focus()
  }
}
