class LitterBoxLogsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_cat
  before_action :authorize_user!
  before_action :set_log, only: [:update, :destroy]

  def index  = render json: @cat.litter_box_logs.order(date: :desc)

  def create
    @log = @cat.litter_box_logs.new(litter_box_log_params)
    @log.save ? render(json: @log, status: :created) : render(json: { errors: @log.errors.full_messages }, status: :unprocessable_entity)
  end

  def update
    @log.update(litter_box_log_params) ? render(json: @log) : render(json: { errors: @log.errors.full_messages }, status: :unprocessable_entity)
  end

  def destroy = @log.destroy && head(:no_content)

  private
  def set_cat = @cat = Cat.find(params[:cat_id])
  def set_log = @log = @cat.litter_box_logs.find(params[:id])
  def authorize_user!
    render json: { error: "Not authorized" }, status: :forbidden unless @cat.users.include?(current_user)
  end
  def litter_box_log_params
    params.require(:litter_box_log).permit(:date, :action, :has_issue, :litter_brand, :notes)
  end
end