require "test_helper"

class CommentsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @post = posts(:published_post)
    @draft_post = posts(:draft_post)
    @comment = comments(:first_comment)
  end

  test "should create comment for published post" do
    assert_difference("Comment.count") do
      post post_comments_url(@post), params: {
        comment: {
          author_name: "Test User",
          content: "Test comment content"
        }
      }, as: :turbo_stream
    end

    assert_response :success
  end

  test "should not create comment for draft post" do
    assert_no_difference("Comment.count") do
      post post_comments_url(@draft_post), params: {
        comment: {
          author_name: "Test User",
          content: "Test comment content"
        }
      }, as: :turbo_stream
    end

    assert_response :success # Turbo stream responde con 200 pero no crea el comentario
  end

  test "should not create comment with invalid data" do
    assert_no_difference("Comment.count") do
      post post_comments_url(@post), params: {
        comment: {
          author_name: "",
          content: "Hi"
        }
      }, as: :turbo_stream
    end

    assert_response :success # Turbo stream responde con 200 pero muestra errores
  end

  test "should destroy comment" do
    assert_difference("Comment.count", -1) do
      delete post_comment_url(@post, @comment), as: :turbo_stream
    end

    assert_response :success
  end

  test "should redirect to post after successful comment creation" do
    post post_comments_url(@post), params: {
      comment: {
        author_name: "Test User",
        content: "Test comment content"
      }
    }

    # Para request HTML normal, debería redirigir
    assert_response :redirect
    assert_redirected_to @post
  end

  test "should render form with errors for invalid comment" do
    post post_comments_url(@post), params: {
      comment: {
        author_name: "",
        content: "Hi"
      }
    }

    # Para HTML normal, redirige de vuelta con errores
    assert_response :redirect
    assert_redirected_to @post
  end
end
