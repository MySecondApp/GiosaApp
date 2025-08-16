import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["input", "results"]
  static values = { url: String }

  connect() {
    // Asegurar que el spinner esté oculto al inicio
    this.hideSpinner()
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
    
    // Mostrar spinner solo cuando realmente estamos haciendo una búsqueda
    // No cuando la página carga con un valor inicial
    if (query.length > 0) {
      this.showSpinner(true)
    } else {
      this.hideSpinner()
    }

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
      // Agregar listener para ocultar spinner cuando termine la carga
      frame.addEventListener('turbo:frame-load', () => {
        // Añadir un pequeño delay para que el spinner sea visible
        setTimeout(() => this.hideSpinner(), 200)
      }, { once: true })
      frame.addEventListener('turbo:frame-render', () => {
        setTimeout(() => this.hideSpinner(), 200)
      }, { once: true })
      // Manejar errores de frame (incluyendo AbortError)
      frame.addEventListener('turbo:frame-missing', () => {
        this.hideSpinner()
      }, { once: true })
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
        this.hideSpinner()
      })
      .catch(error => {
        // Ignorar errores de cancelación (AbortError) ya que son normales
        if (error.name !== 'AbortError') {
          console.error("Error en la búsqueda:", error)
        }
        this.hideSpinner()
      })
    }
  }

  showSpinner(show) {
    const spinnerElement = document.getElementById('search-spinner')
    
    if (spinnerElement) {
      if (show) {
        // Verificar si hay botón clear visible y ajustar posición
        const clearButton = document.querySelector('.clear-button')
        if (clearButton) {
          spinnerElement.classList.add('with-clear-button')
        } else {
          spinnerElement.classList.remove('with-clear-button')
        }
        spinnerElement.classList.remove('hidden')
        spinnerElement.style.display = 'flex'
      } else {
        spinnerElement.classList.add('hidden')
        spinnerElement.style.display = 'none'
      }
    }
  }

  hideSpinner() {
    const spinnerElement = document.getElementById('search-spinner')
    if (spinnerElement) {
      spinnerElement.classList.add('hidden')
      spinnerElement.style.display = 'none'
    }
  }

  clear() {
    this.inputTarget.value = ""
    this.performSearch()
    this.inputTarget.focus()
  }
}
