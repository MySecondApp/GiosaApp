class ApplicationController < ActionController::Base
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern

  before_action :set_locale

  private

  def set_locale
    I18n.locale = session[:locale] || I18n.default_locale
  end

  def dark_theme?
    session[:dark_theme] == true
  end
  helper_method :dark_theme?

  def theme_classes(light_classes, dark_classes)
    dark_theme? ? dark_classes : light_classes
  end
  helper_method :theme_classes

  def current_locale
    I18n.locale
  end
  helper_method :current_locale

  def available_locales
    I18n.available_locales
  end
  helper_method :available_locales
end
