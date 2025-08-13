require 'rails_helper'

RSpec.describe "Search Elements", type: :system do
  let!(:post1) { Post.create!(title: "Manual de Rails", content: "Este es un contenido sobre Rails", published: true, likes: 0) }
  let!(:post2) { Post.create!(title: "Tutorial JavaScript", content: "Contenido sobre JavaScript", published: true, likes: 3) }
  let!(:post3) { Post.create!(title: "Ruby Guide", content: "Manual completo de Ruby", published: true, likes: 1) }

  before do
    driven_by(:rack_test)
  end

  describe "Search form elements" do
    it "has all required search elements with correct attributes" do
      visit posts_path

      # Check search container has correct data attributes
      expect(page).to have_css('[data-controller="search"]')
      expect(page).to have_css('[data-search-url-value]')

      # Check search input has correct attributes
      search_input = find('input[data-search-target="input"]')
      expect(search_input).to be_present
      expect(search_input['data-action']).to include('search#search')
      expect(search_input['placeholder']).to include('Buscar posts')

      # Check search results container
      expect(page).to have_css('[data-search-target="results"]')

      # Check search icon is present
      expect(page).to have_css('.search-icon svg')

      # Check turbo frame for posts
      expect(page).to have_css('turbo-frame#posts_list')
    end

    it "renders search input with correct CSS classes" do
      visit posts_path

      search_input = find('input[data-search-target="input"]')
      expect(search_input['class']).to include('search-input')
    end
  end

  describe "Post action links" do
    it "has correct turbo-frame attributes for navigation links" do
      visit posts_path

      # Find all "Ver" links and check they have data-turbo-frame="_top"
      view_links = all('a', text: 'Ver')
      expect(view_links).not_to be_empty

      view_links.each do |link|
        expect(link['data-turbo-frame']).to eq('_top')
      end

      # Find all "Editar" links and check they have data-turbo-frame="_top"
      edit_links = all('a', text: 'Editar')
      expect(edit_links).not_to be_empty

      edit_links.each do |link|
        expect(link['data-turbo-frame']).to eq('_top')
      end
    end

    it "posts are displayed in correct structure" do
      visit posts_path

      # Check that all posts are initially visible
      expect(page).to have_content("Manual de Rails")
      expect(page).to have_content("Tutorial JavaScript")
      expect(page).to have_content("Ruby Guide")

      # Check that posts are inside the turbo frame
      within('turbo-frame#posts_list') do
        expect(page).to have_content("Manual de Rails")
        expect(page).to have_content("Tutorial JavaScript")
        expect(page).to have_content("Ruby Guide")
      end
    end
  end

  describe "Search functionality via HTTP requests" do
    it "filters posts correctly via GET request with search parameter" do
      visit "#{posts_path}?search=Manual"

      expect(page).to have_content("Manual de Rails")
      expect(page).to have_content("Ruby Guide") # Contains "Manual" in content
      expect(page).not_to have_content("Tutorial JavaScript")
    end

    it "shows no results message when search finds nothing" do
      visit "#{posts_path}?search=NonExistentTerm"

      expect(page).to have_content("No se encontraron posts")
      expect(page).not_to have_content("Manual de Rails")
      expect(page).not_to have_content("Tutorial JavaScript")
      expect(page).not_to have_content("Ruby Guide")
    end
  end

  describe "Navigation from post list" do
    it "can navigate to individual post" do
      visit posts_path

      first_view_link = first('a', text: 'Ver')
      post_id = first_view_link[:href].match(/\/posts\/(\d+)/)[1]

      first_view_link.click

      expect(current_path).to eq("/posts/#{post_id}")
      expect(page).to have_css('h1')
    end
  end
end
