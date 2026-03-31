class CatsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_cat, only: [ :show, :update, :destroy ]
  before_action :authorize_user!, only: [ :update, :destroy ]

  def index
    cats = current_user.cats.includes(
      :visits, :reminders, :photos, :weights,
      :behavior_logs, :grooming_logs, :flea_treatments,
      :food_logs, :litter_box_logs, :users
    )
    render json: cats.map { |cat| build_cat_json(cat) }
  end

  def show
    render json: build_cat_json(@cat)
  end

  def create
    cat = Cat.new(params[:cat].permit(:name, :age, :breed, :birthday, user_ids: []))
    if cat.save
      cat.users << current_user unless params[:cat][:user_ids]
      cat.user_ids = params[:cat][:user_ids] if params[:cat][:user_ids]
      render json: cat.as_json(include: [:users]), status: :created
    else
      render json: { errors: cat.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @cat.update(params[:cat].permit(:name, :age, :breed, :birthday, user_ids: []))
      @cat.user_ids = params[:cat][:user_ids] if params[:cat][:user_ids]
      render json: build_cat_json(@cat)
    else
      render json: { errors: @cat.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @cat.destroy
    head :no_content
  end

  private

  def build_cat_json(cat)
    cat_data = cat.as_json(include: [
      :users, :visits, :reminders, :weights,
      :behavior_logs, :grooming_logs, :flea_treatments,
      :food_logs, :litter_box_logs
    ])

    photos_with_urls = cat.photos.order(created_at: :asc).map do |photo|
      photo.as_json.merge(
        display_url: photo.image.attached? ? url_for(photo.image) : photo.image_url
      )
    end

    cat_data['photos'] = photos_with_urls
    cat_data
  end

  def set_cat
    @cat = Cat.find(params[:id])
  end

  def authorize_user!
    unless @cat.users.include?(current_user)
      render json: { error: "You do not have permission to modify this cat" }, status: :forbidden
    end
  end
end