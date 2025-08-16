require 'rails_helper'

RSpec.describe "Hotwire Elements", type: :system do
  let!(:post1) { Post.create!(title: "Manual de Rails", content: "Este es un contenido sobre Rails", published: true, likes: 0) }
  let!(:post2) { Post.create!(title: "Tutorial JavaScript", content: "Contenido sobre JavaScript", published: true, likes: 3) }
  let!(:post3) { Post.create!(title: "Ruby Guide", content: "Manual completo de Ruby", published: true, likes: 1) }

  before do
    driven_by(:rack_test)
  end

  describe "HTML Elements" do
    it "displays search input with correct attributes" do
      visit posts_path

      expect(page).to have_css('input[data-search-target="input"]')
      expect(page).to have_css('input[placeholder*="Buscar"]')
      expect(page).to have_css('[data-controller="search"]')
      expect(page).to have_css('[data-search-target="results"]')
    end

    it "displays like buttons for each post" do
      visit posts_path

      expect(page).to have_css("#post_#{post1.id}_likes button[data-like-button-target='button']")
      expect(page).to have_css("#post_#{post2.id}_likes button[data-like-button-target='button']")
      expect(page).to have_css("#post_#{post3.id}_likes button[data-like-button-target='button']")

      # Verify Stimulus controllers are present
      expect(page).to have_css("[data-controller='like-button']")
    end

    it "shows correct initial like counts" do
      visit posts_path

      # Buscar los elementos específicos de likes por post
      expect(page).to have_css("#post_#{post1.id}_likes", text: "0")
      expect(page).to have_css("#post_#{post2.id}_likes", text: "3")
      expect(page).to have_css("#post_#{post3.id}_likes", text: "1")
    end

    it "has turbo frame for posts list" do
      visit posts_path

      expect(page).to have_css('turbo-frame#posts_list')
    end

    it "displays all posts initially" do
      visit posts_path

      expect(page).to have_content("Manual de Rails")
      expect(page).to have_content("Tutorial JavaScript")
      expect(page).to have_content("Ruby Guide")
    end
  end

  describe "Search functionality (non-JS)" do
    it "responds to search parameter" do
      visit posts_path(search: "Manual")

      expect(page).to have_content("Manual de Rails")
      expect(page).to have_content("Ruby Guide") # Contains "Manual" in content
      expect(page).not_to have_content("Tutorial JavaScript")
    end

    it "shows no results message when no posts match" do
      visit posts_path(search: "NonExistentTerm")

      expect(page).to have_content("No se encontraron posts")
    end
  end
end
