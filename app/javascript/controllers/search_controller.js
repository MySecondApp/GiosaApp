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
    url.searchParams.set("turbo_frame", "posts_list")
    if (query) {
      url.searchParams.set("search", query)
    } else {
      url.searchParams.delete("search")
    }

    // Usar Turbo para manejar la petición
    const frame = document.getElementById('posts_list')
    if (frame) {
      frame.src = url.href
    } else {
      // Fallback si no hay turbo frame disponible
      fetch(url, {
        method: 'GET',
        headers: {
          "Accept": "text/html",
          "Content-Type": "text/html"
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        return response.text()
      })
      .then(html => {
        this.resultsTarget.innerHTML = html
      })
      .catch(error => {
        console.error("Error en la búsqueda:", error)
      })
    }
  }

  clear() {
    this.inputTarget.value = ""
    this.performSearch()
    this.inputTarget.focus()
  }
}
