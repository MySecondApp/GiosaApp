// Configure your import map in config/importmap.rb. Read more: https://github.com/rails/importmap-rails
import "@hotwired/turbo-rails"
import "controllers"

// Suprimir logs de AbortError que son normales en Turbo
document.addEventListener("turbo:frame-missing", (event) => {
  // Silenciosamente manejar frames faltantes
})

// Suprimir errores de fetch cancelados
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && event.reason.name === 'AbortError') {
    event.preventDefault()
  }
})
