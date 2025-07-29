require 'rails_helper'

RSpec.describe 'Theme Toggle', type: :system do
  before do
    driven_by(:selenium_chrome_headless)
  end

  it 'toggles between light and dark theme' do
    visit root_path

    # Check initial state - moon icon should be visible (light theme)
    expect(page).to have_css('button', text: '🌙')

    # Click theme toggle button
    find('button[type="submit"]', text: '🌙').click

    # Wait for the page to reload and check sun icon is now visible (dark theme)
    expect(page).to have_content('Bienvenido a GiosaApp') # Ensure page has loaded
    expect(page).to have_css('button', text: '☀️')

    # Toggle back to light theme
    find('button[type="submit"]', text: '☀️').click

    # Wait for the page to reload and check moon icon is back (light theme)
    expect(page).to have_content('Bienvenido a GiosaApp') # Ensure page has loaded
    expect(page).to have_css('button', text: '🌙')
  end

  it 'shows correct icons for theme toggle' do
    visit root_path

    # Light theme should show moon icon
    expect(page).to have_css('button', text: '🌙')

    # Click to switch to dark theme
    find('button[type="submit"]', text: '🌙').click

    # Dark theme should show sun icon
    expect(page).to have_css('button', text: '☀️')
  end
end
