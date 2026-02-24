class WeightsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_cat
  before_action :set_weight, only: [:show, :update, :destroy]
  before_action :authorize_user!

  def index
    weights = @cat.weights.order(date: :desc)
    render json: weights
  end

  def show
    render json: @weight
  end

  def create
    @weight = @cat.weights.new(weight_params)
    if @weight.save
      render json: @weight, status: :created
    else
      render json: { errors: @weight.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @weight.update(weight_params)
      render json: @weight
    else
      render json: { errors: @weight.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @weight.destroy
    head :no_content
  end

  private

  def set_cat
    @cat = Cat.find(params[:cat_id])
  end

  def set_weight
    @weight = @cat.weights.find(params[:id])
  end

  def authorize_user!
    unless @cat.users.include?(current_user)
      render json: { error: "You do not have permission to modify this weight record" }, status: :forbidden
    end
  end

  def weight_params
    params.require(:weight).permit(:weight, :date, :notes)
  end
end