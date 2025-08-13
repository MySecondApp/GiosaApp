require 'rails_helper'

RSpec.describe "Posts Likes", type: :request do
  let!(:post_with_likes) { Post.create!(title: "Test Post", content: "Test content", published: true, likes: 5) }
  let!(:post_without_likes) { Post.create!(title: "Another Post", content: "Another content", published: true) }

  describe "PATCH /posts/:id/like" do
    context "as HTML request" do
      it "increments likes and redirects" do
        expect {
          patch like_post_path(post_with_likes)
        }.to change { post_with_likes.reload.likes }.from(5).to(6)

        expect(response).to have_http_status(302)
        expect(response).to redirect_to(posts_path)
      end
    end

    context "as Turbo Stream request" do
      it "increments likes and returns turbo stream" do
        expect {
          patch like_post_path(post_with_likes), headers: { "Accept" => "text/vnd.turbo-stream.html" }
        }.to change { post_with_likes.reload.likes }.from(5).to(6)

        expect(response).to have_http_status(200)
        expect(response.content_type).to include("text/vnd.turbo-stream.html")
        expect(response.body).to include("turbo-stream")
        expect(response.body).to include("post_#{post_with_likes.id}_likes")
      end
    end

    context "with post that has zero likes" do
      it "increments from 0 to 1" do
        expect {
          patch like_post_path(post_without_likes)
        }.to change { post_without_likes.reload.likes }.from(0).to(1)

        expect(response).to have_http_status(302)
      end
    end

    context "with non-existent post" do
      it "returns 404" do
        patch like_post_path(id: 999999)
        expect(response).to have_http_status(404)
      end
    end
  end

  describe "like button rendering" do
    it "displays correct like count" do
      get posts_path
      expect(response.body).to include("#{post_with_likes.likes}")
      expect(response.body).to include("#{post_without_likes.likes}")
    end
  end
end
