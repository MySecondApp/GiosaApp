require "application_system_test_case"

class DeletePostsTest < ApplicationSystemTestCase
  setup do
    @post = posts(:published_post)
  end

  test "deleting a post from show page" do
    visit post_path(@post)
    
    # Verificar que estamos en la página correcta
    assert_text @post.title
    
    # Hacer clic en el botón de eliminar y confirmar
    accept_confirm do
      click_button "Eliminar"
    end
    
    # Verificar que fuimos redirigidos a la página de posts
    assert_current_path posts_path
    
    # Verificar que el post fue eliminado
    assert_no_text @post.title
    assert_text "Post fue eliminado exitosamente"
  end

  test "deleting a post from index page" do
    visit posts_path
    
    # Verificar que el post está en la lista
    assert_text @post.title
    
    # Encontrar la tarjeta del post específico y hacer clic en eliminar
    within "#post_#{@post.id}" do
      accept_confirm do
        click_button "Eliminar"
      end
    end
    
    # Verificar que permanecemos en la página de posts
    assert_current_path posts_path
    
    # Verificar que el post fue eliminado
    assert_no_text @post.title
    assert_text "Post fue eliminado exitosamente"
  end

  test "cancel deletion shows confirmation dialog" do
    visit post_path(@post)
    
    # Verificar que estamos en la página correcta
    assert_text @post.title
    
    # Hacer clic en eliminar pero cancelar
    dismiss_confirm do
      click_button "Eliminar"
    end
    
    # Verificar que seguimos en la misma página y el post no fue eliminado
    assert_current_path post_path(@post)
    assert_text @post.title
  end
end
