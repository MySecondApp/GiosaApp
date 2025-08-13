require 'rails_helper'

RSpec.describe "Hotwire Functionality", type: :system do
  let!(:post1) { Post.create!(title: "Manual de Rails", content: "Este es un contenido sobre Rails", published: true, likes: 0) }
  let!(:post2) { Post.create!(title: "Tutorial JavaScript", content: "Contenido sobre JavaScript", published: true, likes: 3) }
  let!(:post3) { Post.create!(title: "Ruby Guide", content: "Manual completo de Ruby", published: true, likes: 1) }

  before do
    driven_by(:selenium_chrome_headless)
  end

  describe "Search functionality" do
    it "performs live search without page reload" do
      visit posts_path

      # Verify all posts are initially visible
      expect(page).to have_content("Manual de Rails")
      expect(page).to have_content("Tutorial JavaScript")
      expect(page).to have_content("Ruby Guide")

      # Find search input
      search_input = find('input[placeholder*="Buscar"]', visible: true)

      # Type search term
      search_input.fill_in(with: "Manual")

      # Wait for turbo frame to update and Tutorial JavaScript to disappear
      expect(page).not_to have_content("Tutorial JavaScript", wait: 5)

      # Verify filtered results
      expect(page).to have_content("Manual de Rails")
      expect(page).to have_content("Ruby Guide") # Contains "Manual" in content
    end

    it "shows no results message when search returns nothing" do
      visit posts_path

      search_input = find('input[placeholder*="Buscar"]', visible: true)
      search_input.fill_in(with: "NonExistentTerm")

      # Wait for the no results message to appear
      expect(page).to have_content("No se encontraron posts", wait: 5)

      # Verify that the original posts are no longer visible
      expect(page).not_to have_content("Manual de Rails")
      expect(page).not_to have_content("Tutorial JavaScript")
      expect(page).not_to have_content("Ruby Guide")
    end

    it "clears search when clear button is clicked" do
      visit posts_path

      search_input = find('input[placeholder*="Buscar"]', visible: true)
      search_input.fill_in(with: "Manual")

      sleep 1

      # Find and click clear button if it appears
      if page.has_css?('button[data-action*="clear"]')
        find('button[data-action*="clear"]').click
        sleep 1
        expect(page).to have_content("Manual de Rails")
        expect(page).to have_content("Tutorial JavaScript")
        expect(page).to have_content("Ruby Guide")
      end
    end
  end

  describe "Like functionality", js: true do
    it "increments likes without page reload" do
      visit posts_path

      # Find like button for first post
      like_button = find("form[action='#{like_post_path(post1)}']")

      # Initial state should show 0 likes
      expect(like_button).to have_content("0")

      # Click like button
      within(like_button) do
        find('button').click
      end

      # Wait for turbo stream response
      sleep 1

      # Check that likes increased
      expect(page).to have_content("1")

      # Verify database was updated
      expect(post1.reload.likes).to eq(1)
    end

    it "shows correct initial like counts" do
      visit posts_path

      expect(page).to have_content("0") # post1 likes
      expect(page).to have_content("3") # post2 likes
      expect(page).to have_content("1") # post3 likes
    end
  end

  describe "JavaScript controllers" do
    it "loads search controller", js: true do
      visit posts_path

      # Check that stimulus controller is connected
      expect(page).to have_css('[data-controller="search"]')
    end

    it "has search input with correct targets", js: true do
      visit posts_path

      expect(page).to have_css('[data-search-target="input"]')
      expect(page).to have_css('[data-search-target="results"]')
    end
  end

  describe "Turbo Frames" do
    it "has posts list turbo frame" do
      visit posts_path

      expect(page).to have_css('turbo-frame#posts_list')
    end

    it "post view links break out of turbo frame" do
      visit posts_path

      # Find the "Ver" link for post3 (which will be first due to created_at desc order)
      post3_view_link = find('a', text: 'Ver', match: :first)
      expect(post3_view_link).to be_present

      # Verify it has the correct data attribute to break out of turbo frame
      expect(post3_view_link['data-turbo-frame']).to eq('_top')

      # Click the link and verify it navigates to the full post page
      post3_view_link.click

      # Should be on a post show page, not inside a turbo frame
      # Since posts are ordered by created_at desc, post3 will be first
      expect(page).to have_css('h1', text: post3.title)
      expect(page).to have_content(post3.content)

      # The URL should be /posts/:id
      expect(current_path).to match(%r{^/posts/\d+$})
    end
  end
end
