require 'rails_helper'

RSpec.describe "Search Spinner", type: :system, js: true do
  let!(:post1) { Post.create!(title: "Manual de Rails", content: "Este es un contenido sobre Rails", published: true, likes: 0) }
  let!(:post2) { Post.create!(title: "Tutorial JavaScript", content: "Contenido sobre JavaScript", published: true, likes: 3) }
  let!(:post3) { Post.create!(title: "Ruby Guide", content: "Manual completo de Ruby", published: true, likes: 1) }

  before do
    driven_by(:selenium_chrome_headless)
  end

  describe "Spinner visibility and behavior" do
    it "spinner is hidden on page load" do
      visit posts_path

      spinner = find('#search-spinner', visible: false)
      expect(spinner).to be_present
      expect(spinner['style']).to include('display: none')
      expect(spinner[:class]).to include('hidden')
    end

    it "shows spinner when typing in search input" do
      visit posts_path

      search_input = find('input[data-search-target="input"]')
      spinner = find('#search-spinner', visible: false)

      # Initially hidden
      expect(spinner[:class]).to include('hidden')
      expect(spinner['style']).to include('display: none')

      # Type in search input
      search_input.fill_in(with: "Manual")

      # Spinner should appear briefly (we need to check quickly before it hides)
      # Wait for spinner to show
      expect(page).to have_css('#search-spinner:not(.hidden)', wait: 1)
      expect(spinner['style']).not_to include('display: none')
    end

    it "hides spinner after search completes" do
      visit posts_path

      search_input = find('input[data-search-target="input"]')
      search_input.fill_in(with: "Manual")

      # Wait for search to complete and spinner to hide
      expect(page).not_to have_css('#search-spinner:not(.hidden)', wait: 3)
      
      # Verify spinner is hidden
      spinner = find('#search-spinner', visible: false)
      expect(spinner[:class]).to include('hidden')
    end

    it "shows spinner again when typing new search term" do
      visit posts_path

      search_input = find('input[data-search-target="input"]')
      
      # First search
      search_input.fill_in(with: "Manual")
      sleep(0.5) # Wait for first search to complete
      
      # Clear and type new search
      search_input.fill_in(with: "JavaScript")
      
      # Spinner should appear again
      expect(page).to have_css('#search-spinner:not(.hidden)', wait: 1)
    end

    it "does not show spinner when search input is empty" do
      visit posts_path

      search_input = find('input[data-search-target="input"]')
      spinner = find('#search-spinner', visible: false)

      # Type something first
      search_input.fill_in(with: "Manual")
      sleep(0.5)
      
      # Clear the input
      search_input.fill_in(with: "")
      sleep(0.5)

      # Spinner should remain hidden for empty search
      expect(spinner[:class]).to include('hidden')
      expect(spinner['style']).to include('display: none')
    end
  end

  describe "Spinner positioning and styling" do
    it "has correct CSS classes" do
      visit posts_path

      spinner = find('#search-spinner', visible: false)
      expect(spinner[:class]).to include('search-spinner')
      expect(spinner[:class]).to include('hidden')
      expect(spinner['data-search-target']).to eq('spinner')
    end

    it "contains spinning SVG animation" do
      visit posts_path

      spinner = find('#search-spinner', visible: false)
      within(spinner) do
        expect(page).to have_css('svg.animate-spin', visible: false)
        expect(page).to have_css('svg circle', visible: false)
        expect(page).to have_css('svg path', visible: false)
      end
    end

    it "adjusts position when clear button is present" do
      # Visit directly with search parameter to ensure clear button is present
      visit posts_path(search: 'Manual')
      
      # Clear button should be visible since we have search param
      expect(page).to have_css('button[data-action*="clear"]', wait: 2)
      
      # Verify we have search results
      expect(page).to have_content("Manual de Rails", wait: 3)
      
      # The spinner should exist and be positioned correctly even with clear button
      spinner = find('#search-spinner', visible: false)
      expect(spinner).to be_present
      expect(spinner['data-search-target']).to eq('spinner')
      
      # Test that spinner can still appear when clear button is present
      search_input = find('input[data-search-target="input"]')
      search_input.fill_in(with: "JavaScript")
      
      # Spinner should still work with clear button present
      expect(page).to have_css('#search-spinner:not(.hidden)', wait: 1)
    end
  end

  describe "Spinner with search results" do
    it "shows spinner during successful search" do
      visit posts_path

      search_input = find('input[data-search-target="input"]')
      
      # Monitor spinner state during search
      search_input.fill_in(with: "Manual")
      
      # Spinner should appear briefly and then disappear when results load
      expect(page).to have_css('#search-spinner:not(.hidden)', wait: 1)
      
      # Wait for results to load and spinner to hide
      expect(page).to have_content("Manual de Rails", wait: 3)
      expect(page).not_to have_css('#search-spinner:not(.hidden)', wait: 2)
    end

    it "shows and hides spinner for search with no results" do
      visit posts_path

      search_input = find('input[data-search-target="input"]')
      search_input.fill_in(with: "NonExistentTerm")
      
      # Spinner should appear and then hide even for no results
      expect(page).to have_css('#search-spinner:not(.hidden)', wait: 1)
      
      # Wait for no results message and spinner to hide
      expect(page).to have_content("No se encontraron posts", wait: 3)
      expect(page).not_to have_css('#search-spinner:not(.hidden)', wait: 2)
    end
  end

  describe "Spinner integration with Stimulus controller" do
    it "search controller manages spinner visibility" do
      visit posts_path

      # Verify search controller is connected
      expect(page).to have_css('[data-controller="search"]')
      
      # Verify spinner is properly targeted within the search container
      search_container = find('[data-controller="search"]')
      expect(search_container).to be_present
      
      within(search_container) do
        # Both spinner and input should be within the search controller container
        expect(page).to have_css('[data-search-target="spinner"]', visible: false)
        expect(page).to have_css('[data-search-target="input"]')
        expect(page).to have_css('#search-spinner', visible: false)
      end
    end

    it "spinner responds to search controller events" do
      visit posts_path

      search_input = find('input[data-search-target="input"]')
      
      # Test multiple searches to ensure spinner works consistently
      ["Manual", "", "JavaScript", "Ruby"].each_with_index do |term, index|
        search_input.fill_in(with: term)
        
        if term.present?
          # Should show spinner for non-empty search
          expect(page).to have_css('#search-spinner:not(.hidden)', wait: 1)
          sleep(0.5) # Allow search to complete
        else
          # Should not show spinner for empty search
          spinner = find('#search-spinner', visible: false)
          expect(spinner[:class]).to include('hidden')
        end
      end
    end
  end

  describe "Spinner accessibility and UX" do
    it "provides visual feedback during search" do
      visit posts_path

      search_input = find('input[data-search-target="input"]')
      search_input.fill_in(with: "Manual")
      
      # Check that spinner is visible as loading indicator
      spinner = find('#search-spinner', wait: 1)
      expect(spinner).to be_present
      
      # Spinner should have proper styling for visibility
      expect(spinner[:class]).not_to include('hidden')
      expect(spinner['style']).not_to include('display: none')
    end

    it "spinner does not interfere with search functionality" do
      visit posts_path

      search_input = find('input[data-search-target="input"]')
      search_input.fill_in(with: "Manual")
      
      # Despite spinner, search should still complete successfully
      expect(page).to have_content("Manual de Rails", wait: 3)
      expect(page).not_to have_content("Tutorial JavaScript", wait: 1)
      
      # And spinner should be hidden after completion - use CSS selector instead of class attribute
      expect(page).to have_css('#search-spinner.hidden', visible: false)
    end
  end

  describe "Spinner timing and debouncing" do
    it "spinner respects debounce timing" do
      visit posts_path

      search_input = find('input[data-search-target="input"]')
      
      # Type quickly (should debounce)
      search_input.fill_in(with: "M")
      search_input.fill_in(with: "Ma")
      search_input.fill_in(with: "Man")
      
      # Spinner should eventually appear for the final value
      expect(page).to have_css('#search-spinner:not(.hidden)', wait: 1)
      
      # And search should complete with final results
      expect(page).to have_content("Manual de Rails", wait: 3)
    end

    it "spinner handles rapid input changes gracefully" do
      visit posts_path

      search_input = find('input[data-search-target="input"]')
      
      # Rapid changes
      search_input.fill_in(with: "Manual")
      sleep(0.1)
      search_input.fill_in(with: "JavaScript")
      sleep(0.1)
      search_input.fill_in(with: "Ruby")
      
      # Should handle gracefully and show final results
      expect(page).to have_content("Ruby Guide", wait: 3)
      
      # Spinner should be hidden after final search
      spinner = find('#search-spinner', visible: false)
      expect(spinner[:class]).to include('hidden')
    end
  end
end
