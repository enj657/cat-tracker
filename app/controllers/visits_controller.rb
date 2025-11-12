class VisitsController < ApplicationController
  before_action :set_cat
  before_action :set_visit, only: [:show, :update, :destroy]

  def index
    render json: @cat.visits
  end

  def show
    render json: @visit
  end

  def create
    @visit = @cat.visits.new(visit_params)
    if @visit.save
      render json: @visit, status: :created
    else
      render json: { errors: @visit.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @visit.update(visit_params)
      render json: @visit
    else
      render json: { errors: @visit.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @visit.destroy
    head :no_content
  end

  private

  def set_cat
    @cat = Cat.find(params[:cat_id])
  end

  def set_visit
    @visit = @cat.visits.find(params[:id])
  end

  def visit_params
    params.require(:visit).permit(:visit_type, :date, :notes)
  end
end
