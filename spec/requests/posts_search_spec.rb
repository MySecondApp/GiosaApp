require 'rails_helper'

RSpec.describe "Posts Search", type: :request do
  let!(:post1) { Post.create!(title: "Manual de Rails", content: "Este es un contenido sobre Rails", published: true) }
  let!(:post2) { Post.create!(title: "Tutorial JavaScript", content: "Contenido sobre JavaScript", published: true) }
  let!(:post3) { Post.create!(title: "Ruby Guide", content: "Manual completo de Ruby", published: true) }

  describe "GET /posts" do
    context "without search parameter" do
      it "returns all posts" do
        get posts_path
        expect(response).to have_http_status(200)
        expect(response.body).to include("Manual de Rails")
        expect(response.body).to include("Tutorial JavaScript")
        expect(response.body).to include("Ruby Guide")
      end
    end

    context "with search parameter" do
      it "filters posts by title" do
        get posts_path, params: { search: "Manual" }
        expect(response).to have_http_status(200)
        expect(response.body).to include("Manual de Rails")
        expect(response.body).not_to include("Tutorial JavaScript")
      end

      it "filters posts by content" do
        get posts_path, params: { search: "JavaScript" }
        expect(response).to have_http_status(200)
        expect(response.body).to include("Tutorial JavaScript")
        expect(response.body).not_to include("Manual de Rails")
      end

      it "is case insensitive" do
        get posts_path, params: { search: "manual" }
        expect(response).to have_http_status(200)
        expect(response.body).to include("Manual de Rails")
        expect(response.body).to include("Ruby Guide") # contains "Manual" in content
      end
    end

    context "with turbo_frame parameter" do
      it "returns only the partial" do
        get posts_path, params: { turbo_frame: "posts_list", search: "Manual" }
        expect(response).to have_http_status(200)
        expect(response.body).to include("turbo-frame")
        expect(response.body).to include("Manual de Rails")
        expect(response.body).not_to include("<html>") # Should not include full page
      end
    end

    context "when no posts match search" do
      it "shows no results message" do
        get posts_path, params: { search: "NonExistentTerm" }
        expect(response).to have_http_status(200)
        expect(response.body).to include("No se encontraron posts")
      end
    end
  end
end
