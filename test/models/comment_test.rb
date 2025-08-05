require "test_helper"

class CommentTest < ActiveSupport::TestCase
  def setup
    @post = posts(:published_post)
    @comment = Comment.new(
      post: @post,
      author_name: "Juan Pérez",
      content: "Este es un comentario de prueba"
    )
  end

  test "should be valid with valid attributes" do
    assert @comment.valid?
  end

  test "should require author_name" do
    @comment.author_name = nil
    assert_not @comment.valid?
    assert_includes @comment.errors[:author_name], "no puede estar en blanco"
  end

  test "should require author_name with minimum length" do
    @comment.author_name = "A"
    assert_not @comment.valid?
    assert_includes @comment.errors[:author_name], "es demasiado corto (mínimo 2 caracteres)"
  end

  test "should require content" do
    @comment.content = nil
    assert_not @comment.valid?
    assert_includes @comment.errors[:content], "no puede estar en blanco"
  end

  test "should require content with minimum length" do
    @comment.content = "Hi"
    assert_not @comment.valid?
    assert_includes @comment.errors[:content], "es demasiado corto (mínimo 5 caracteres)"
  end

  test "should require post to be published" do
    draft_post = posts(:draft_post)
    @comment.post = draft_post
    assert_not @comment.valid?
    assert_includes @comment.errors[:post], "no permite comentarios porque está en borrador"
  end

  test "should belong to post" do
    assert_respond_to @comment, :post
    assert_equal @post, @comment.post
  end

  test "should have broadcasting callback after create" do
    # Verificar que el modelo tiene el callback después de crear
    assert Comment._commit_callbacks.any? { |cb| cb.kind == :after }, "Should have after_commit callbacks"
  end

  test "should have broadcasting callback after destroy" do
    # Verificar que el modelo tiene el callback después de destruir
    assert Comment._commit_callbacks.any? { |cb| cb.kind == :after }, "Should have after_commit callbacks"
  end

  test "should create comment successfully for published post" do
    assert_difference("Comment.count") do
      @comment.save
    end
    assert @comment.persisted?
  end

  test "should not create comment for draft post" do
    draft_post = posts(:draft_post)
    comment = Comment.new(
      post: draft_post,
      author_name: "Test User",
      content: "Test content for draft"
    )

    assert_no_difference("Comment.count") do
      comment.save
    end
    assert_not comment.persisted?
  end
end
