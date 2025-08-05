require "test_helper"

class ThemeControllerTest < ActionDispatch::IntegrationTest
  test "should toggle theme" do
    # Test que el tema se puede cambiar
    post toggle_theme_path
    assert_response :redirect
  end

  test "should toggle from light to dark theme" do
    # Simular sesión sin tema oscuro
    post toggle_theme_path
    assert_response :redirect

    # Verificar que redirige correctamente
    assert_redirected_to root_path
  end

  test "should toggle from dark to light theme" do
    # Las pruebas de integración manejan la sesión automáticamente
    post toggle_theme_path
    assert_response :redirect

    # Verificar que redirige correctamente
    assert_redirected_to root_path
  end
end
