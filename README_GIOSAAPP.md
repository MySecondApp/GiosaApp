# GiosaApp 🚀

Una aplicación Ruby on Rails moderna que demuestra el uso integrado de **Stimulus JS**, **Tailwind CSS** y **PostgreSQL**.

## 🎯 Características

### Stack Tecnológico
- **Ruby on Rails 8.0** - Framework web
- **PostgreSQL** - Base de datos
- **Stimulus JS** - Framework JavaScript ligero
- **Tailwind CSS** - Framework CSS utilitario
- **Hotwire (Turbo + Stimulus)** - Interactividad moderna

### Funcionalidades Implementadas

#### 🏠 Página de Inicio
- Diseño moderno con Tailwind CSS
- Ejemplos interactivos de Stimulus:
  - **Contador**: Incrementar, decrementar y resetear
  - **Toggle**: Mostrar/ocultar contenido
  - **Saludo personalizado**: Input dinámico con validación

#### 📝 Sistema de Posts (CRUD Completo)
- **Listado de posts** con grid responsivo
- **Crear nuevos posts** con formulario validado
- **Ver detalles** de cada post
- **Editar posts** existentes
- **Eliminar posts** con confirmación
- **Estados**: Publicado vs Borrador
- **Validaciones**: Título mínimo 5 caracteres, contenido mínimo 10 caracteres

#### 🎨 Diseño y UX
- **Navegación intuitiva** con enlaces en header
- **Cards modernas** para mostrar contenido
- **Botones con estados hover** y transiciones
- **Diseño responsivo** para móviles y desktop
- **Alertas y confirmaciones** para acciones importantes

#### 🧠 Controladores Stimulus
1. **CounterController** - Manejo de estado numérico
2. **ToggleController** - Mostrar/ocultar elementos
3. **HelloController** - Interacción con inputs y outputs

## 🛠️ Configuración y Instalación

### Prerrequisitos
- Ruby 3.4+
- Rails 8.0+
- PostgreSQL
- Node.js (para assets)

### Pasos de Instalación

1. **Clonar/acceder al proyecto**
   ```bash
   cd GiosaApp
   ```

2. **Instalar dependencias**
   ```bash
   bundle install
   ```

3. **Configurar base de datos**
   - Asegúrate de que PostgreSQL esté ejecutándose
   - Configura `config/database.yml` con tus credenciales
   ```bash
   rails db:create
   rails db:migrate
   rails db:seed
   ```

4. **Iniciar el servidor de desarrollo**
   ```bash
   bin/dev  # Inicia Rails + Tailwind en modo watch
   # O alternativamente:
   rails server
   ```

5. **Visitar la aplicación**
   - Abre tu navegador en `http://localhost:3000`

## 📁 Estructura del Proyecto

```
app/
├── controllers/
│   ├── home_controller.rb          # Landing page
│   └── posts_controller.rb         # CRUD de posts
├── models/
│   ├── post.rb                     # Modelo Post con validaciones
│   └── user.rb                     # Modelo User
├── views/
│   ├── home/
│   │   └── index.html.erb          # Página principal con demos Stimulus
│   ├── posts/
│   │   ├── index.html.erb          # Lista de posts
│   │   ├── show.html.erb           # Detalle de post
│   │   ├── new.html.erb            # Crear post
│   │   ├── edit.html.erb           # Editar post
│   │   └── _form.html.erb          # Formulario compartido
│   └── layouts/
│       └── application.html.erb    # Layout principal con navegación
└── javascript/
    └── controllers/
        ├── counter_controller.js    # Lógica del contador
        ├── toggle_controller.js     # Lógica del toggle
        └── hello_controller.js      # Lógica del saludo
```

## 🚀 Próximos Pasos Sugeridos

### Para Aprender Más Stimulus
1. **Crear nuevos controladores**: Experimenta con formularios dinámicos
2. **Targets múltiples**: Maneja varios elementos en un controlador
3. **Actions avanzadas**: Usa diferentes eventos (keyup, change, etc.)
4. **Values y Classes**: Aprende sobre los APIs avanzados de Stimulus

### Para Expandir la Aplicación
1. **Autenticación**: Agrega usuarios con Devise
2. **Comentarios**: Sistema de comentarios en posts
3. **Categorías**: Clasifica los posts
4. **Búsqueda**: Implementa búsqueda con filtros
5. **API**: Crea endpoints API REST
6. **Testing**: Agrega tests para modelos y controladores

### Para Mejorar el Diseño
1. **Componentes**: Crea partials reutilizables
2. **Animations**: Agrega transiciones CSS avanzadas
3. **Dark Mode**: Implementa modo oscuro con Tailwind
4. **Mobile First**: Optimiza la experiencia móvil

## 📚 Recursos de Aprendizaje

- [Stimulus Handbook](https://stimulus.hotwired.dev/handbook/introduction)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Rails Guides](https://guides.rubyonrails.org/)
- [Hotwire Documentation](https://hotwired.dev/)

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Algunas ideas:
- Mejorar el diseño existente
- Agregar nuevos ejemplos de Stimulus
- Optimizar el rendimiento
- Documentar mejor el código
- Agregar tests

---

**¡Disfruta explorando GiosaApp y aprendiendo sobre el desarrollo moderno con Rails!** 🎉
