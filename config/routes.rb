Rails.application.routes.draw do
  resources :households do
    resources :users
  end

  resources :cats do
    resources :visits
    resources :reminders
    resources :photos
  end
end
