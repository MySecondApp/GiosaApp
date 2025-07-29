class ApplicationController < ActionController::Base
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern

  private

  def dark_theme?
    session[:dark_theme] == true
  end
  helper_method :dark_theme?

  def theme_classes(light_classes, dark_classes)
    dark_theme? ? dark_classes : light_classes
  end
  helper_method :theme_classes
end
