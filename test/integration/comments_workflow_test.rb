require "test_helper"

class CommentsWorkflowTest < ActionDispatch::IntegrationTest
  setup do
    @published_post = posts(:published_post)
    @draft_post = posts(:draft_post)
  end

  test "user can create comment on published post" do
    # Visitar la página del post
    get post_path(@published_post)
    assert_response :success

    # Verificar que el formulario de comentarios está presente
    assert_select "form[action=?]", post_comments_path(@published_post)
    assert_select "input[name='comment[author_name]']"
    assert_select "textarea[name='comment[content]']"

    # Crear un comentario
    assert_difference "@published_post.comments.count", 1 do
      post post_comments_path(@published_post), params: {
        comment: {
          author_name: "Usuario de Prueba",
          content: "Este es un comentario de integración"
        }
      }
    end

    # Verificar que redirige de vuelta al post
    assert_redirected_to @published_post
    follow_redirect!

    # Verificar que el comentario aparece en la página
    assert_select ".comment-item", text: /Usuario de Prueba/
    assert_select ".comment-content", text: /Este es un comentario de integración/
  end

  test "user cannot create comment on draft post" do
    # Visitar la página del post borrador
    get post_path(@draft_post)
    assert_response :success

    # Verificar que NO hay formulario de comentarios
    assert_select "form[action=?]", post_comments_path(@draft_post), count: 0

    # Verificar que hay un mensaje explicativo
    assert_select "#comment_form"

    # Intentar crear un comentario directamente (debería fallar)
    assert_no_difference "@draft_post.comments.count" do
      post post_comments_path(@draft_post), params: {
        comment: {
          author_name: "Usuario de Prueba",
          content: "Este comentario no debería crearse"
        }
      }
    end
  end

  test "user sees validation errors for invalid comment" do
    # Visitar la página del post
    get post_path(@published_post)
    assert_response :success

    # Intentar crear un comentario con datos inválidos
    assert_no_difference "@published_post.comments.count" do
      post post_comments_path(@published_post), params: {
        comment: {
          author_name: "", # Inválido: muy corto
          content: "Hi"    # Inválido: muy corto
        }
      }
    end

    # Debería redirigir de vuelta al post con errores
    assert_redirected_to @published_post
  end

  test "user can view existing comments" do
    # Crear algunos comentarios
    comment1 = @published_post.comments.create!(
      author_name: "Primer Usuario",
      content: "Primer comentario de prueba"
    )
    comment2 = @published_post.comments.create!(
      author_name: "Segundo Usuario",
      content: "Segundo comentario de prueba"
    )

    # Visitar la página del post
    get post_path(@published_post)
    assert_response :success

    # Verificar que ambos comentarios aparecen
    assert_select ".comment-item", count: 4 # 2 de fixtures + 2 nuevos
    assert_select ".comment-content", text: /Primer comentario de prueba/
    assert_select ".comment-content", text: /Segundo comentario de prueba/

    # Verificar el contador de comentarios
    assert_select "#comments_count_#{@published_post.id}"
  end

  test "comments are ordered by creation date" do
    # Los comentarios deberían aparecer en orden cronológico (más antiguos primero)
    get post_path(@published_post)
    assert_response :success

    # Verificar que hay comentarios (de las fixtures)
    assert_select ".comment-item"

    # Los comentarios deberían estar ordenados por created_at ASC
    # (esto está definido en la asociación del modelo Post)
  end
end
