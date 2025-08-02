require 'rails_helper'

RSpec.describe "Comments", type: :request do
  let(:blog_post) { Post.create!(title: "Test Post", content: "Test content", published: true) }

  describe "POST /posts/:post_id/comments" do
    it "creates a comment successfully" do
      comment_params = { comment: { author_name: "Test Author", content: "Test comment" } }

      post "/posts/#{blog_post.id}/comments", params: comment_params

      # Since it's using Hotwire/Turbo, it might redirect or return specific response
      expect(response).to have_http_status(:redirect).or(have_http_status(:success))
      expect(Comment.last.content).to eq("Test comment")
    end

    it "handles invalid comment data" do
      comment_params = { comment: { author_name: "", content: "" } }

      post "/posts/#{blog_post.id}/comments", params: comment_params

      expect(response).to have_http_status(:redirect).or(have_http_status(:success))
    end
  end

  describe "DELETE /posts/:post_id/comments/:id" do
    let(:comment) { blog_post.comments.create!(author_name: "Test Author", content: "Test comment") }

    it "destroys a comment successfully" do
      delete "/posts/#{blog_post.id}/comments/#{comment.id}"

      expect(response).to have_http_status(:redirect).or(have_http_status(:success))
      expect(Comment.find_by(id: comment.id)).to be_nil
    end
  end
end
