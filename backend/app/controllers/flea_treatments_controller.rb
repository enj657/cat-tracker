class FleaTreatmentsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_cat
  before_action :authorize_user!
  before_action :set_treatment, only: [:update, :destroy]
 
  def index  = render json: @cat.flea_treatments.order(date: :desc)
  def create
    @treatment = @cat.flea_treatments.new(flea_treatment_params)
    @treatment.save ? render(json: @treatment, status: :created) : render(json: { errors: @treatment.errors.full_messages }, status: :unprocessable_entity)
  end
  def update
    @treatment.update(flea_treatment_params) ? render(json: @treatment) : render(json: { errors: @treatment.errors.full_messages }, status: :unprocessable_entity)
  end
  def destroy = @treatment.destroy && head(:no_content)
 
  private
  def set_cat       = @cat = Cat.find(params[:cat_id])
  def set_treatment = @treatment = @cat.flea_treatments.find(params[:id])
  def authorize_user!
    render json: { error: "Not authorized" }, status: :forbidden unless @cat.users.include?(current_user)
  end
  def flea_treatment_params
    params.require(:flea_treatment).permit(:date, :product_name, :treatment_type, :next_due_date, :notes)
  end
end