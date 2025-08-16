require 'rails_helper'

RSpec.describe "Search Spinner - Basic Functionality", type: :system, js: true do
  let!(:post1) { Post.create!(title: "Ruby on Rails", content: "Framework web", published: true) }
  let!(:post2) { Post.create!(title: "JavaScript", content: "Lenguaje de programación", published: true) }

  before do
    driven_by(:selenium_chrome_headless)
  end

  describe "Basic spinner behavior" do
    it "spinner element exists and is initially hidden" do
      visit posts_path

      # Spinner should exist in the DOM
      expect(page).to have_css('#search-spinner', visible: false)

      # And should be hidden by default
      spinner = find('#search-spinner', visible: false)
      expect(spinner[:class]).to include('hidden')
      expect(spinner['style']).to include('display: none')
    end

    it "spinner has correct data attributes for Stimulus" do
      visit posts_path

      spinner = find('#search-spinner', visible: false)
      expect(spinner['data-search-target']).to eq('spinner')
    end

    it "spinner appears during search and disappears when complete" do
      visit posts_path

      search_input = find('input[data-search-target="input"]')

      # Perform a search
      search_input.fill_in(with: "Ruby")

      # Spinner should appear briefly
      expect(page).to have_css('#search-spinner:not(.hidden)', wait: 1)

      # Results should load
      expect(page).to have_content("Ruby on Rails", wait: 3)

      # Spinner should be hidden after search completes
      expect(page).not_to have_css('#search-spinner:not(.hidden)', wait: 2)
    end

    it "spinner works with empty searches (clears results)" do
      visit posts_path

      search_input = find('input[data-search-target="input"]')

      # First search for something specific
      search_input.fill_in(with: "Ruby")
      expect(page).to have_content("Ruby on Rails", wait: 3)
      expect(page).not_to have_content("JavaScript")

      # Clear search (should show all results again)
      search_input.fill_in(with: "")

      # All posts should be visible again
      expect(page).to have_content("Ruby on Rails", wait: 3)
      expect(page).to have_content("JavaScript")

      # Spinner should be hidden for empty searches
      spinner = find('#search-spinner', visible: false)
      expect(spinner[:class]).to include('hidden')
    end

    it "spinner handles searches with no results" do
      visit posts_path

      search_input = find('input[data-search-target="input"]')
      search_input.fill_in(with: "Python")

      # Spinner should appear
      expect(page).to have_css('#search-spinner:not(.hidden)', wait: 1)

      # No results message should appear
      expect(page).to have_content("No se encontraron posts", wait: 3)

      # Spinner should disappear
      expect(page).not_to have_css('#search-spinner:not(.hidden)', wait: 2)
    end
  end

  describe "Spinner visual elements" do
    it "contains the spinning SVG animation" do
      visit posts_path

      spinner = find('#search-spinner', visible: false)

      within(spinner) do
        # Should have animated SVG (check without visibility requirement)
        expect(page).to have_css('svg.animate-spin', visible: false)

        # SVG should have circle and path elements for the spinner animation
        expect(page).to have_css('svg circle', visible: false)
        expect(page).to have_css('svg path', visible: false)
      end
    end

    it "has proper CSS classes for styling" do
      visit posts_path

      spinner = find('#search-spinner', visible: false)
      expect(spinner[:class]).to include('search-spinner')
      expect(spinner[:class]).to include('hidden')

      # Should be wrapped in a container with proper styling
      within(spinner) do
        expect(page).to have_css('div.rounded-full', visible: false)
      end
    end
  end

  describe "Integration with search functionality" do
    it "spinner doesn't interfere with search results" do
      visit posts_path

      search_input = find('input[data-search-target="input"]')
      search_input.fill_in(with: "JavaScript")

      # Search should complete successfully despite spinner
      expect(page).to have_content("JavaScript", wait: 3)
      expect(page).not_to have_content("Ruby on Rails")

      # Spinner should be hidden - check using CSS selector instead of class attribute
      expect(page).to have_css('#search-spinner.hidden', visible: false)
      expect(page).not_to have_css('#search-spinner:not(.hidden)', wait: 1)
    end

    it "search controller properly manages spinner state" do
      visit posts_path

      # Verify controller is connected
      expect(page).to have_css('[data-controller="search"]')

      # Verify targets are properly set (check without visibility requirement)
      expect(page).to have_css('[data-search-target="input"]')
      expect(page).to have_css('[data-search-target="spinner"]', visible: false)
      expect(page).to have_css('[data-search-target="results"]')
    end
  end
end
