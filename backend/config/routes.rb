Rails.application.routes.draw do
  devise_for :users, controllers: {
    sessions: 'users/sessions',
    registrations: 'users/registrations'
  }
  
  get "/users/current", to: "users#current"
  resources :households do
    resources :users
  end

  resources :cats do
    resources :visits
    resources :reminders
    resources :photos
  end
end