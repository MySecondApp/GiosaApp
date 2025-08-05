import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="comment-notifications"
export default class extends Controller {
  static values = { 
    postId: Number,
    postTitle: String
  }

  connect() {
    console.log("💬 Comment notifications controller connected for post", this.postIdValue)
    
    // Escuchar cuando se conecta un turbo stream (nuevo comentario)
    this.element.addEventListener("turbo:before-stream-render", this.handleNewComment.bind(this))
    
    // También escuchar eventos personalizados de turbo streams
    document.addEventListener("turbo:stream-connected", this.handleStreamConnected.bind(this))
  }

  disconnect() {
    document.removeEventListener("turbo:stream-connected", this.handleStreamConnected.bind(this))
  }

  handleStreamConnected(event) {
    console.log("📡 Stream connected:", event.detail)
  }

  handleNewComment(event) {
    console.log("🎉 New comment event:", event)
    
    // Verificar si es una acción de append (nuevo comentario)
    if (event.target && event.target.action === "append") {
      const template = event.target.template
      
      if (template && template.content) {
        // Extraer información del comentario del template
        const commentElement = template.content.querySelector('[data-comment-id]')
        
        if (commentElement) {
          const commentId = commentElement.dataset.commentId
          const authorName = this.extractAuthorName(commentElement)
          const commentPreview = this.extractCommentPreview(commentElement)
          
          this.showCommentNotification(authorName, commentPreview, commentId)
        }
      }
    }
  }

  extractAuthorName(commentElement) {
    // Buscar el nombre del autor en el comentario
    const authorElement = commentElement.querySelector('[data-author-name]') || 
                         commentElement.querySelector('.comment-author') ||
                         commentElement.querySelector('.font-semibold')
    
    return authorElement ? authorElement.textContent.trim() : 'Alguien'
  }

  extractCommentPreview(commentElement) {
    // Buscar el contenido del comentario
    const contentElement = commentElement.querySelector('[data-comment-content]') ||
                          commentElement.querySelector('.comment-content') ||
                          commentElement.querySelector('p')
    
    if (contentElement) {
      const content = contentElement.textContent.trim()
      // Limitar a 100 caracteres
      return content.length > 100 ? content.substring(0, 100) + '...' : content
    }
    
    return 'Ha dejado un nuevo comentario'
  }

  showCommentNotification(authorName, commentPreview, commentId) {
    // Evitar mostrar notificación si el usuario está en el mismo post
    if (this.isUserScrolledToComments()) {
      console.log("User is viewing comments, skipping notification")
      return
    }

    const message = `${commentPreview}`
    const title = `💬 ${authorName} comentó en "${this.postTitleValue}"`
    
    // Dispatchar evento para el controlador de notificaciones
    const event = new CustomEvent("notification:show", {
      detail: {
        message: message,
        type: "comment",
        title: title,
        duration: 8000 // Mostrar por 8 segundos para comentarios
      }
    })
    
    window.dispatchEvent(event)
    
    // También actualizar el favicon o título de la página
    this.updatePageIndicators()
  }

  isUserScrolledToComments() {
    // Verificar si el usuario está viendo la sección de comentarios
    const commentsSection = document.querySelector(`#post_${this.postIdValue}_comments`)
    
    if (commentsSection) {
      const rect = commentsSection.getBoundingClientRect()
      const windowHeight = window.innerHeight
      
      // Si la sección de comentarios está visible en el viewport
      return rect.top < windowHeight && rect.bottom > 0
    }
    
    return false
  }

  updatePageIndicators() {
    // Actualizar el título de la página para indicar nuevo comentario
    const originalTitle = document.title
    
    if (!originalTitle.startsWith("💬")) {
      document.title = `💬 ${originalTitle}`
      
      // Restaurar el título después de 10 segundos
      setTimeout(() => {
        if (document.title.startsWith("💬")) {
          document.title = originalTitle
        }
      }, 10000)
    }

    // Opcional: Cambiar el favicon
    this.updateFavicon()
  }

  updateFavicon() {
    // Crear un canvas para dibujar un badge en el favicon
    const canvas = document.createElement('canvas')
    canvas.width = 32
    canvas.height = 32
    const ctx = canvas.getContext('2d')
    
    // Dibujar un círculo rojo pequeño como badge
    ctx.fillStyle = '#EF4444'
    ctx.beginPath()
    ctx.arc(24, 8, 6, 0, 2 * Math.PI)
    ctx.fill()
    
    // Obtener el favicon actual o usar uno por defecto
    const currentFavicon = document.querySelector("link[rel*='icon']")
    
    if (currentFavicon) {
      const img = new Image()
      img.onload = () => {
        // Dibujar el favicon original
        ctx.drawImage(img, 0, 0, 32, 32)
        
        // Dibujar el badge encima
        ctx.fillStyle = '#EF4444'
        ctx.beginPath()
        ctx.arc(24, 8, 6, 0, 2 * Math.PI)
        ctx.fill()
        
        // Actualizar el favicon
        const link = document.createElement('link')
        link.type = 'image/x-icon'
        link.rel = 'shortcut icon'
        link.href = canvas.toDataURL()
        
        // Remover favicon anterior
        if (currentFavicon) {
          currentFavicon.remove()
        }
        
        document.getElementsByTagName('head')[0].appendChild(link)
      }
      
      img.src = currentFavicon.href
    }
  }

  // Método para ser llamado desde el servidor via Stimulus
  showNotification(event) {
    const { authorName, commentPreview, commentId } = event.detail
    this.showCommentNotification(authorName, commentPreview, commentId)
  }

  // Método para marcar las notificaciones como leídas cuando el usuario interactúa
  markAsRead() {
    // Restaurar título original
    const title = document.title
    if (title.startsWith("💬")) {
      document.title = title.replace("💬 ", "")
    }
    
    // Restaurar favicon original (esto sería más complejo, por simplicidad lo omitimos)
  }
}
