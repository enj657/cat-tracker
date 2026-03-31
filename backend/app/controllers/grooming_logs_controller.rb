class GroomingLogsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_cat
  before_action :authorize_user!
  before_action :set_log, only: [:update, :destroy]
 
  def index  = render json: @cat.grooming_logs.order(date: :desc)
  def create
    @log = @cat.grooming_logs.new(grooming_log_params)
    @log.save ? render(json: @log, status: :created) : render(json: { errors: @log.errors.full_messages }, status: :unprocessable_entity)
  end
  def update
    @log.update(grooming_log_params) ? render(json: @log) : render(json: { errors: @log.errors.full_messages }, status: :unprocessable_entity)
  end
  def destroy = @log.destroy && head(:no_content)
 
  private
  def set_cat    = @cat = Cat.find(params[:cat_id])
  def set_log    = @log = @cat.grooming_logs.find(params[:id])
  def authorize_user!
    render json: { error: "Not authorized" }, status: :forbidden unless @cat.users.include?(current_user)
  end
  def grooming_log_params
    params.require(:grooming_log).permit(:date, :grooming_type, :performed_by, :next_due_date, :notes)
  end
end