class BehaviorLogsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_cat
  before_action :set_behavior_log, only: [:update, :destroy]
  before_action :authorize_user!

  def index
    render json: @cat.behavior_logs.order(date: :desc)
  end

  def create
    @log = @cat.behavior_logs.new(behavior_log_params)
    if @log.save
      render json: @log, status: :created
    else
      render json: { errors: @log.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @behavior_log.update(behavior_log_params)
      render json: @behavior_log
    else
      render json: { errors: @behavior_log.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @behavior_log.destroy
    head :no_content
  end

  private

  def set_cat
    @cat = Cat.find(params[:cat_id])
  end

  def set_behavior_log
    @behavior_log = @cat.behavior_logs.find(params[:id])
  end

  def authorize_user!
    unless @cat.users.include?(current_user)
      render json: { error: "Not authorized" }, status: :forbidden
    end
  end

  def behavior_log_params
    params.require(:behavior_log).permit(:date, :category, :description, :severity)
  end
end