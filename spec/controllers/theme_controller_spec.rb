require 'rails_helper'

RSpec.describe ThemeController, type: :controller do
  describe 'POST toggle' do
    it 'toggles the dark theme session value' do
      post :toggle
      expect(session[:dark_theme]).to eq(true)

      post :toggle
      expect(session[:dark_theme]).to eq(false)
    end

    it 'redirects to the previous page' do
      request.env['HTTP_REFERER'] = root_path
      post :toggle
      expect(response).to redirect_to(root_path)
    end
  end
end
