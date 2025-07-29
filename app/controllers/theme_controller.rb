class ThemeController < ApplicationController
  def toggle
    Rails.logger.info "Tema actual antes: #{session[:dark_theme]}"
    session[:dark_theme] = !session[:dark_theme]
    Rails.logger.info "Tema actual después: #{session[:dark_theme]}"
    redirect_back(fallback_location: root_path)
  end
end
