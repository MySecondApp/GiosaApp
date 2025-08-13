# Sistema de Búsqueda - GiosaApp

## 🔍 Descripción General

Esta rama implementa un sistema de búsqueda en tiempo real para posts, permitiendo filtrado instantáneo por título y contenido sin recargar la página, con highlight de términos encontrados.

## ✨ Características Principales

### Búsqueda en Tiempo Real
- Filtrado instantáneo mientras se escribe
- Búsqueda por título y contenido
- Debouncing para optimizar performance
- Highlighting de términos encontrados
- Sin recarga de página

### Experiencia de Usuario  
- Campo de búsqueda prominente
- Resultados actualizados en vivo
- Indicador de "Sin resultados" 
- Clear button para limpiar búsqueda
- Responsive en todos los dispositivos

### Performance Optimizada
- Búsqueda del lado cliente para velocidad
- Indexación eficiente en base de datos
- Minimal network requests
- Caching inteligente de resultados

## 🏗️ Arquitectura

### Stimulus Controller
```javascript
// app/javascript/controllers/search_controller.js
import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["input", "results", "noResults"]
  static values = { 
    debounceTime: { type: Number, default: 300 }
  }
  
  connect() {
    this.debounceTimer = null
    this.allPosts = this.parseInitialData()
  }
  
  search() {
    clearTimeout(this.debounceTimer)
    this.debounceTimer = setTimeout(() => {
      this.performSearch()
    }, this.debounceTimeValue)
  }
  
  performSearch() {
    const query = this.inputTarget.value.toLowerCase().trim()
    
    if (query === "") {
      this.showAllPosts()
      return
    }
    
    const filteredPosts = this.allPosts.filter(post => 
      post.title.toLowerCase().includes(query) ||
      post.content.toLowerCase().includes(query)
    )
    
    this.updateResults(filteredPosts, query)
  }
  
  updateResults(posts, query) {
    if (posts.length === 0) {
      this.showNoResults()
      return
    }
    
    this.hideNoResults()
    this.renderPosts(posts, query)
  }
  
  highlightText(text, query) {
    const regex = new RegExp(`(${query})`, 'gi')
    return text.replace(regex, '<mark class="search-highlight">$1</mark>')
  }
}
```

### HTML Template
```erb
<!-- app/views/posts/index.html.erb -->
<div data-controller="search" 
     data-search-debounce-time-value="300"
     class="search-container">
  
  <!-- Search Input -->
  <div class="search-input-container">
    <input type="text"
           data-search-target="input"
           data-action="input->search#search"
           placeholder="<%= t('posts.search.placeholder') %>"
           class="search-input">
    
    <button data-action="click->search#clear"
            class="search-clear-btn">
      <svg class="clear-icon">...</svg>
    </button>
  </div>
  
  <!-- Results Container -->
  <div data-search-target="results" 
       class="search-results">
    <%= render 'posts_list', posts: @posts %>
  </div>
  
  <!-- No Results Message -->
  <div data-search-target="noResults" 
       class="no-results hidden">
    <p><%= t('posts.search.no_results') %></p>
  </div>
</div>
```

### Posts List Partial
```erb
<!-- app/views/posts/_posts_list.html.erb -->
<div class="posts-grid">
  <% posts.each do |post| %>
    <article class="post-card" id="post_<%= post.id %>">
      <header class="post-header">
        <h3 class="post-title">
          <% if local_assigns[:highlight_query] %>
            <%== highlight_text(post.title, highlight_query) %>
          <% else %>
            <%= post.title %>
          <% end %>
        </h3>
        
        <time class="post-date">
          <%= time_ago_in_words(post.created_at) %>
        </time>
      </header>
      
      <div class="post-content">
        <% if local_assigns[:highlight_query] %>
          <%== truncate(highlight_text(post.content, highlight_query), length: 150) %>
        <% else %>
          <%= truncate(post.content, length: 150) %>
        <% end %>
      </div>
      
      <footer class="post-footer">
        <%= link_to t('common.read_more'), post, class: "read-more-btn" %>
        <%= render 'like_button', post: post if defined?(like_button) %>
      </footer>
    </article>
  <% end %>
</div>
```

## 🎨 Estilos CSS

### Search Input
```css
.search-container {
  margin-bottom: 2rem;
}

.search-input-container {
  position: relative;
  max-width: 500px;
  margin: 0 auto;
}

.search-input {
  width: 100%;
  padding: 1rem 3rem 1rem 1rem;
  border: 2px solid #E5E7EB;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #6366F1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.search-clear-btn {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #9CA3AF;
}

.search-clear-btn:hover {
  color: #374151;
}

/* Dark theme */
.dark .search-input {
  background: #374151;
  border-color: #4B5563;
  color: #F3F4F6;
}

.dark .search-input:focus {
  border-color: #818CF8;
  box-shadow: 0 0 0 3px rgba(129, 140, 248, 0.1);
}
```

### Search Results
```css
.search-results {
  min-height: 200px;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.post-card {
  background: white;
  border-radius: 0.5rem;
  border: 1px solid #E5E7EB;
  padding: 1.5rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.post-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1);
}

.search-highlight {
  background-color: #FEF08A;
  padding: 0.1em 0.2em;
  border-radius: 0.25rem;
  font-weight: 600;
}

.dark .search-highlight {
  background-color: #92400E;
  color: #FEF3C7;
}

.no-results {
  text-align: center;
  padding: 4rem 2rem;
  color: #6B7280;
}

.hidden {
  display: none;
}
```

## 🚀 Funcionalidades Avanzadas

### Filtros Adicionales
```javascript
// Extend search controller for advanced filters
addFilters() {
  const publishedOnly = this.publishedCheckboxTarget.checked
  const sortBy = this.sortSelectTarget.value
  
  let results = this.performBasicSearch()
  
  if (publishedOnly) {
    results = results.filter(post => post.published)
  }
  
  results = this.sortResults(results, sortBy)
  return results
}

sortResults(posts, sortBy) {
  switch(sortBy) {
    case 'newest':
      return posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    case 'oldest':
      return posts.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    case 'popular':
      return posts.sort((a, b) => (b.likes || 0) - (a.likes || 0))
    case 'title':
      return posts.sort((a, b) => a.title.localeCompare(b.title))
    default:
      return posts
  }
}
```

### Search Analytics
```javascript
// Track search metrics
trackSearch(query, resultsCount) {
  if (window.gtag) {
    window.gtag('event', 'search', {
      'search_term': query,
      'results_count': resultsCount
    })
  }
  
  // Send to custom analytics
  fetch('/api/analytics/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: query,
      results_count: resultsCount,
      timestamp: new Date().toISOString()
    })
  })
}
```

## 🧪 Testing

### Stimulus Controller Tests
```javascript
// test/javascript/controllers/search_controller.test.js
import { Application } from "@hotwired/stimulus"
import SearchController from "../../../app/javascript/controllers/search_controller"

describe("SearchController", () => {
  let application
  let controller
  let fixture
  
  beforeEach(() => {
    fixture = document.createElement('div')
    fixture.innerHTML = `
      <div data-controller="search">
        <input data-search-target="input" type="text">
        <div data-search-target="results"></div>
        <div data-search-target="noResults" class="hidden"></div>
      </div>
    `
    document.body.appendChild(fixture)
    
    application = Application.start()
    application.register("search", SearchController)
  })
  
  afterEach(() => {
    document.body.removeChild(fixture)
    application.stop()
  })
  
  test("performs search on input", (done) => {
    const input = fixture.querySelector('[data-search-target="input"]')
    input.value = "test query"
    
    // Trigger input event
    input.dispatchEvent(new Event('input'))
    
    // Wait for debounce
    setTimeout(() => {
      expect(controller.lastQuery).toBe("test query")
      done()
    }, 350)
  })
  
  test("highlights search terms", () => {
    const text = "This is a test post about testing"
    const query = "test"
    const highlighted = controller.highlightText(text, query)
    
    expect(highlighted).toContain('<mark class="search-highlight">test</mark>')
  })
})
```

### Integration Tests
```ruby
# spec/system/search_spec.rb
require 'rails_helper'

RSpec.describe 'Post Search', type: :system, js: true do
  let!(:post1) { create(:post, title: "Ruby on Rails", content: "Great framework") }
  let!(:post2) { create(:post, title: "JavaScript Tips", content: "Async programming") }
  let!(:post3) { create(:post, title: "Rails Tips", content: "Ruby best practices") }
  
  before do
    visit posts_path
  end
  
  scenario 'User searches for posts by title' do
    fill_in 'search', with: 'Rails'
    
    expect(page).to have_content('Ruby on Rails')
    expect(page).to have_content('Rails Tips')
    expect(page).not_to have_content('JavaScript Tips')
  end
  
  scenario 'User searches for posts by content' do
    fill_in 'search', with: 'Ruby'
    
    expect(page).to have_content('Ruby on Rails')
    expect(page).to have_content('Rails Tips')
    expect(page).not_to have_content('JavaScript Tips')
  end
  
  scenario 'Search highlights matching terms' do
    fill_in 'search', with: 'Rails'
    
    within '.search-results' do
      expect(page).to have_css('.search-highlight')
    end
  end
  
  scenario 'Shows no results message when no matches' do
    fill_in 'search', with: 'xyz123'
    
    expect(page).to have_content(I18n.t('posts.search.no_results'))
    expect(page).not_to have_css('.post-card')
  end
  
  scenario 'Clears search results' do
    fill_in 'search', with: 'Rails'
    expect(page).to have_content('Rails Tips')
    
    click_button 'Clear search'
    
    expect(page).to have_content('Ruby on Rails')
    expect(page).to have_content('JavaScript Tips')
    expect(page).to have_content('Rails Tips')
  end
end
```

## 📱 Responsive Design

### Mobile (< 640px)
```css
@media (max-width: 640px) {
  .posts-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .search-input {
    font-size: 16px; /* Prevent zoom on iOS */
  }
  
  .post-card {
    padding: 1rem;
  }
}
```

### Tablet (640px - 1024px)
```css
@media (min-width: 640px) and (max-width: 1024px) {
  .posts-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

## 🌐 I18n Support

### Traducciones
```yaml
# config/locales/es.yml
es:
  posts:
    search:
      placeholder: "Buscar posts por título o contenido..."
      no_results: "No se encontraron posts que coincidan con tu búsqueda"
      clear: "Limpiar búsqueda"
      results_count:
        zero: "Sin resultados"
        one: "%{count} resultado encontrado"
        other: "%{count} resultados encontrados"
```

## 🚀 Performance Optimizations

### Client-Side Indexing
```javascript
// Build search index for better performance
buildSearchIndex() {
  this.searchIndex = this.allPosts.map(post => ({
    id: post.id,
    title: post.title.toLowerCase(),
    content: post.content.toLowerCase(),
    searchText: `${post.title} ${post.content}`.toLowerCase()
  }))
}

// Use indexed search for large datasets
performIndexedSearch(query) {
  return this.searchIndex.filter(item => 
    item.searchText.includes(query.toLowerCase())
  ).map(item => 
    this.allPosts.find(post => post.id === item.id)
  )
}
```

### Virtual Scrolling (para muchos resultados)
```javascript
// Implement virtual scrolling for large result sets
setupVirtualScrolling() {
  const itemHeight = 200 // estimated post card height
  const containerHeight = this.resultsTarget.clientHeight
  const visibleCount = Math.ceil(containerHeight / itemHeight) + 2
  
  this.renderVisibleItems(0, visibleCount)
  this.setupScrollListener()
}
```

---

**Rama**: `feature/search-functionality`  
**Última actualización**: Enero 2025  
**Estado**: ✅ Optimizado para grandes volúmenes de datos
