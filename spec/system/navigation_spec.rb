require 'rails_helper'

RSpec.describe 'Navigation', type: :system do
  before do
    driven_by(:selenium_chrome_headless)
  end

  it 'navigates between pages correctly' do
    visit root_path

    # Check we're on home page
    expect(page).to have_content('Bienvenido a GiosaApp')

    # Navigate to Posts using the first link in navbar
    within('nav') do
      click_link 'Posts'
    end
    
    # Check we can see posts page content (even if no posts exist)
    expect(page).to have_content('Posts').or have_content('No hay posts aún')

    # Navigate to New Post using the navbar link
    within('nav') do
      click_link 'Nuevo Post'
    end
    
    # Check we're on new post page
    expect(page).to have_content('Crear post').or have_content('Nuevo Post')

    # Navigate back to Home
    within('nav') do
      click_link 'Inicio'
    end
    
    # Check we're back on home page
    expect(page).to have_content('Bienvenido a GiosaApp')
  end

  it 'maintains navbar stability across pages' do
    visit root_path
    navbar_height = page.evaluate_script("document.querySelector('nav').offsetHeight")

    within('nav') do
      click_link 'Posts'
    end
    new_navbar_height = page.evaluate_script("document.querySelector('nav').offsetHeight")
    expect(new_navbar_height).to eq(navbar_height)

    within('nav') do
      click_link 'Nuevo Post'
    end
    newer_navbar_height = page.evaluate_script("document.querySelector('nav').offsetHeight")
    expect(newer_navbar_height).to eq(navbar_height)
  end
end
