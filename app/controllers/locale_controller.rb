class LocaleController < ApplicationController
  def toggle
    if session[:locale] == "en"
      session[:locale] = "es"
    else
      session[:locale] = "en"
    end

    redirect_back(fallback_location: root_path)
  end

  def set
    locale = params[:locale]
    if I18n.available_locales.include?(locale.to_sym)
      session[:locale] = locale
    end

    redirect_back(fallback_location: root_path)
  end
end
