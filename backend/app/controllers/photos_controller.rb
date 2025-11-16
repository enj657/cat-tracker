class PhotosController < ApplicationController
  before_action :set_cat
  before_action :set_photo, only: [ :show, :update, :destroy ]

  def index
    render json: @cat.photos
  end

  def show
    render json: @photo
  end

  def create
    @photo = @cat.photos.new(photo_params)
    if @photo.save
      render json: @photo, status: :created
    else
      render json: { errors: @photo.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @photo.update(photo_params)
      render json: @photo
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

  def photo_params
    params.require(:photo).permit(:image_url, :caption)
  end
end
