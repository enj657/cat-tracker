class FoodLogsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_cat
  before_action :authorize_user!
  before_action :set_log, only: [:update, :destroy]
 
  def index  = render json: @cat.food_logs.order(date: :desc)
  def create
    @log = @cat.food_logs.new(food_log_params)
    @log.save ? render(json: @log, status: :created) : render(json: { errors: @log.errors.full_messages }, status: :unprocessable_entity)
  end
  def update
    @log.update(food_log_params) ? render(json: @log) : render(json: { errors: @log.errors.full_messages }, status: :unprocessable_entity)
  end
  def destroy = @log.destroy && head(:no_content)
 
  private
  def set_cat = @cat = Cat.find(params[:cat_id])
  def set_log = @log = @cat.food_logs.find(params[:id])
  def authorize_user!
    render json: { error: "Not authorized" }, status: :forbidden unless @cat.users.include?(current_user)
  end
  def food_log_params
    params.require(:food_log).permit(:date, :food_brand, :food_type, :prescription, :is_food_change, :previous_brand, :reaction, :notes)
  end
end