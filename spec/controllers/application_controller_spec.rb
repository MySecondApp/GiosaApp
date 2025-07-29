require 'rails_helper'

RSpec.describe ApplicationController, type: :controller do
  controller do
    def index
      render plain: "test"
    end
  end

  describe '#dark_theme?' do
    it 'returns true when session[:dark_theme] is true' do
      session[:dark_theme] = true
      expect(controller.send(:dark_theme?)).to eq(true)
    end

    it 'returns false when session[:dark_theme] is false' do
      session[:dark_theme] = false
      expect(controller.send(:dark_theme?)).to eq(false)
    end

    it 'returns false when session[:dark_theme] is nil' do
      session[:dark_theme] = nil
      expect(controller.send(:dark_theme?)).to eq(false)
    end
  end

  describe '#theme_classes' do
    it 'returns light classes when dark_theme? is false' do
      session[:dark_theme] = false
      result = controller.send(:theme_classes, 'light-class', 'dark-class')
      expect(result).to eq('light-class')
    end

    it 'returns dark classes when dark_theme? is true' do
      session[:dark_theme] = true
      result = controller.send(:theme_classes, 'light-class', 'dark-class')
      expect(result).to eq('dark-class')
    end
  end
end
