# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

# Crear algunos usuarios de ejemplo
User.find_or_create_by(email: "admin@giosaapp.com") do |user|
  user.name = "Administrador"
  user.age = 30
end

User.find_or_create_by(email: "usuario@giosaapp.com") do |user|
  user.name = "Usuario Demo"
  user.age = 25
end

# Crear algunos posts de ejemplo
Post.find_or_create_by(title: "Bienvenido a GiosaApp") do |post|
  post.content = "Este es el primer post de nuestra aplicación Ruby on Rails.\n\nGiosaApp es una aplicación de ejemplo que demuestra el uso de:\n- Ruby on Rails\n- Stimulus JS\n- Tailwind CSS\n- PostgreSQL\n\n¡Esperamos que disfrutes explorando todas las funcionalidades!"
  post.published = true
end

Post.find_or_create_by(title: "Aprendiendo Stimulus JS") do |post|
  post.content = "Stimulus JS es un framework JavaScript modesto para el mundo HTML que ya tienes.\n\nCon Stimulus puedes:\n- Agregar interactividad a tus vistas\n- Manejar eventos del DOM\n- Controlar el estado de tus componentes\n\nEs perfecto para aplicaciones Rails que quieren mantener la simplicidad pero agregar funcionalidad moderna."
  post.published = true
end

Post.find_or_create_by(title: "Styling con Tailwind CSS") do |post|
  post.content = "Tailwind CSS es un framework de CSS que nos permite crear interfaces modernas y responsivas de manera rápida y eficiente.\n\nVentajas de Tailwind:\n- Clases utilitarias\n- Diseñ responsivo built-in\n- Customización completa\n- Tamaño optimizado\n\nEn esta aplicación puedes ver Tailwind en acción en todos los componentes."
  post.published = false
end

Post.find_or_create_by(title: "Ruby on Rails: El Framework Web Favorito") do |post|
  post.content = "Ruby on Rails sigue siendo uno de los frameworks web más populares para el desarrollo rápido de aplicaciones.\n\nCaracterísticas principales:\n- Convención sobre configuración\n- DRY (Don't Repeat Yourself)\n- Desarrollo ágil\n- Comunidad activa\n- Gems ecosystem\n\nEsta aplicación demuestra cómo Rails puede integrarse perfectamente con tecnologías modernas como Stimulus y Tailwind."
  post.published = true
end

puts "Seeds ejecutados exitosamente!"
