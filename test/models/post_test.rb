require "test_helper"

class PostTest < ActiveSupport::TestCase
  def setup
    @post = Post.new(
      title: "Test Post Title",
      content: "Test post content with enough length",
      published: true
    )
  end

  test "should be valid with valid attributes" do
    assert @post.valid?
  end

  test "should require title" do
    @post.title = nil
    assert_not @post.valid?
    assert_includes @post.errors[:title], "no puede estar vacío"
  end

  test "should require title with minimum length" do
    @post.title = "Hi"
    assert_not @post.valid?
    assert_includes @post.errors[:title], "debe tener al menos 5 caracteres"
  end

  test "should require content" do
    @post.content = nil
    assert_not @post.valid?
    assert_includes @post.errors[:content], "no puede estar vacío"
  end

  test "should require content with minimum length" do
    @post.content = "Short"
    assert_not @post.valid?
    assert_includes @post.errors[:content], "debe tener al menos 10 caracteres"
  end

  test "should have many comments" do
    post = posts(:published_post)
    assert_respond_to post, :comments
    assert_kind_of ActiveRecord::Associations::CollectionProxy, post.comments
  end

  test "published? should return true for published posts" do
    published_post = posts(:published_post)
    assert published_post.published?
  end

  test "published? should return false for draft posts" do
    draft_post = posts(:draft_post)
    assert_not draft_post.published?
  end

  test "draft? should return false for published posts" do
    published_post = posts(:published_post)
    assert_not published_post.draft?
  end

  test "draft? should return true for draft posts" do
    draft_post = posts(:draft_post)
    assert draft_post.draft?
  end

  test "allows_comments? should return true for published posts" do
    published_post = posts(:published_post)
    assert published_post.allows_comments?
  end

  test "allows_comments? should return false for draft posts" do
    draft_post = posts(:draft_post)
    assert_not draft_post.allows_comments?
  end

  test "should have published scope" do
    published_posts = Post.published
    published_posts.each do |post|
      assert post.published?, "Post #{post.id} should be published"
    end
  end

  test "should have draft scope" do
    draft_posts = Post.draft
    draft_posts.each do |post|
      assert_not post.published?, "Post #{post.id} should be draft"
    end
  end

  test "should destroy associated comments when destroyed" do
    post = posts(:published_post)
    post.comments.create!(author_name: "Test", content: "Test content")
    comments_count = post.comments.count

    assert_difference("Comment.count", -comments_count) do
      post.destroy
    end
  end
end
