Rails.application.routes.draw do
  post "toggle_theme", to: "theme#toggle", as: "toggle_theme"
  post "toggle_locale", to: "locale#toggle", as: "toggle_locale"
  post "set_locale/:locale", to: "locale#set", as: "set_locale"
  resources :posts do
    resources :comments, only: [:create, :destroy]
  end
  get "home/index"
  root "home#index"

  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by uptime monitors and load balancers.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker
end
