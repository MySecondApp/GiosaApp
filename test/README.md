# GiosaApp Frontend Tests

Este directorio contiene tests automatizados para el frontend de GiosaApp, específicamente para el sistema de notificaciones.

## Estructura de Tests

```
test/
├── unit/                           # Tests unitarios (Jest)
│   └── flash_notifications_controller.test.js
├── integration/                    # Tests de integración (Selenium)
│   └── notifications_integration.test.js
├── system/                         # Tests de sistema (Rails/Capybara)
│   └── notifications_test.rb
├── setup.js                        # Configuración de Jest
├── run_tests.sh                    # Script de ejecución (Linux/macOS)
├── run_tests.ps1                   # Script de ejecución (Windows)
└── README.md                       # Este archivo
```

## Tipos de Tests

### 1. Tests Unitarios (Jest)
- **Ubicación**: `test/unit/`
- **Tecnología**: Jest + Testing Library
- **Propósito**: Testear la lógica del controlador Stimulus de notificaciones
- **Cobertura**:
  - Creación de notificaciones
  - Diferentes tipos de notificación (success, error, warning, info, comment)
  - Función global `showNotification`
  - Eventos personalizados
  - Manejo de errores
  - Múltiples notificaciones
  - Auto-dismissal y cierre manual

### 2. Tests de Integración (Selenium)
- **Ubicación**: `test/integration/`
- **Tecnología**: Selenium WebDriver + Jest
- **Propósito**: Testear el comportamiento completo en el navegador
- **Cobertura**:
  - Notificaciones de posts (crear, actualizar, eliminar)
  - Notificaciones de comentarios via Turbo Streams
  - Comportamiento visual (posicionamiento, animaciones)
  - Múltiples notificaciones simultáneas
  - Diferentes tipos y estilos

### 3. Tests de Sistema (Rails)
- **Ubicación**: `test/system/`
- **Tecnología**: Rails System Tests + Capybara
- **Propósito**: Testear la integración completa con Rails
- **Cobertura**:
  - CRUD de posts con notificaciones
  - CRUD de comentarios con Turbo Streams
  - Integración con flash messages
  - Navegación con Turbo

## Requisitos Previos

### Para todos los tests:
- Node.js (v14 o superior)
- npm
- Rails server ejecutándose en localhost:3000

### Para tests de integración:
- Google Chrome
- ChromeDriver

### Para tests de sistema:
- Ruby y Bundle
- Capybara configurado

## Instalación

1. Instalar dependencias de npm:
```bash
npm install
```

2. Para tests de integración, instalar ChromeDriver:
```bash
# macOS con Homebrew
brew install chromedriver

# Ubuntu/Debian
sudo apt-get install chromium-chromedriver

# Windows
# Descargar de https://chromedriver.chromium.org/
```

## Ejecución de Tests

### Opción 1: Script Automático

**Linux/macOS:**
```bash
chmod +x test/run_tests.sh
./test/run_tests.sh
```

**Windows:**
```powershell
./test/run_tests.ps1
```

### Opción 2: Comandos Individuales

**Tests unitarios:**
```bash
npm run test:unit
```

**Tests de integración:**
```bash
npm run test:integration
```

**Tests de sistema:**
```bash
bundle exec rails test:system test/system/notifications_test.rb
```

**Todos los tests:**
```bash
npm test
```

**Con cobertura:**
```bash
npm run test:coverage
```

## Opciones del Script

**Windows PowerShell:**
```powershell
# Solo tests unitarios
./test/run_tests.ps1 -UnitOnly

# Solo tests de integración
./test/run_tests.ps1 -IntegrationOnly

# Solo tests de sistema
./test/run_tests.ps1 -SystemOnly

# Solo reporte de cobertura
./test/run_tests.ps1 -Coverage

# Con output verbose
./test/run_tests.ps1 -Verbose
```

## Configuración

### Jest (package.json)
- Entorno: jsdom
- Setup: test/setup.js
- Cobertura: app/javascript/**/*.js

### Rails System Tests
- Driver: Selenium Chrome Headless
- Pantalla: 1920x1080

### Selenium Integration Tests
- Navegador: Chrome Headless
- Timeout: 30 segundos por suite
- Base URL: http://localhost:3000

## Tests Incluidos

### Controlador de Notificaciones
✅ Creación de contenedor de notificaciones  
✅ Creación de notificaciones con contenido correcto  
✅ Aplicación de estilos según tipo  
✅ Función global showNotification  
✅ Botón de cierre manual  
✅ Auto-dismissal después de timeout  
✅ Múltiples notificaciones  
✅ Eventos personalizados  
✅ Manejo de errores  

### Integración de Posts
✅ Notificación al crear post  
✅ Notificación al actualizar post  
✅ Notificación al eliminar post  

### Integración de Comentarios
✅ Notificación al crear comentario (Turbo Stream)  
✅ Notificación al eliminar comentario (Turbo Stream)  
✅ Actualización de contador de comentarios  

### Comportamiento Visual
✅ Posicionamiento correcto  
✅ Auto-dismissal  
✅ Cierre manual  
✅ Apilamiento de múltiples notificaciones  
✅ Estilos por tipo  

### Casos Edge
✅ Función showNotification no disponible  
✅ Navegación con Turbo  
✅ Contenedor único para múltiples notificaciones  

## Solución de Problemas

### "Rails server not running"
Asegúrate de que el servidor Rails esté ejecutándose:
```bash
rails server
```

### "ChromeDriver not found"
Instala ChromeDriver según tu sistema operativo.

### "npm dependencies missing"
Ejecuta:
```bash
npm install
```

### Tests fallan en Windows
Usa PowerShell en lugar de Command Prompt y asegúrate de que la política de ejecución permita scripts:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## Reporte de Cobertura

Los reportes de cobertura se generan en:
- `coverage/lcov-report/index.html` - Reporte HTML
- `coverage/coverage-summary.json` - Resumen JSON

Abre el archivo HTML en tu navegador para ver el reporte detallado.

## Integración Continua

Estos tests están diseñados para ejecutarse en pipelines de CI/CD. Ejemplo para GitHub Actions:

```yaml
name: Frontend Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Run tests
        run: npm test
```
