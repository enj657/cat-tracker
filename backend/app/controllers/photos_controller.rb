class PhotosController < ApplicationController
  before_action :authenticate_user!
  before_action :set_cat
  before_action :set_photo, only: [ :show, :update, :destroy ]
  before_action :authorize_user!

  def index
    photos = @cat.photos.map do |photo|
      photo.as_json.merge(
        display_url: photo.image.attached? ? url_for(photo.image) : photo.image_url
      )
    end
    render json: photos
  end

  def show
    render json: @photo.as_json.merge(
      display_url: @photo.image.attached? ? url_for(@photo.image) : @photo.image_url
    )
  end

  def create
    @photo = @cat.photos.new(photo_params)
    
    # Handle file upload if present
    if params[:photo][:image].present?
      @photo.image.attach(params[:photo][:image])
    end
    
    if @photo.save
      render json: @photo.as_json.merge(
        display_url: @photo.image.attached? ? url_for(@photo.image) : @photo.image_url
      ), status: :created
    else
      render json: { errors: @photo.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if params[:photo][:image].present?
      @photo.image.attach(params[:photo][:image])
    end
    
    if @photo.update(photo_params)
      render json: @photo.as_json.merge(
        display_url: @photo.image.attached? ? url_for(@photo.image) : @photo.image_url
      )
    else
      render json: { errors: @photo.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @photo.destroy
    head :no_content
  end

  private

  def set_cat
    @cat = Cat.find(params[:cat_id])
  end

  def set_photo
    @photo = @cat.photos.find(params[:id])
  end

  def authorize_user!
    unless @cat.users.include?(current_user)
      render json: { error: "You do not have permission to modify this photo" }, status: :forbidden
    end
  end

  def photo_params
    params.require(:photo).permit(:image_url, :caption, :image, :profile_photo)
  end
end