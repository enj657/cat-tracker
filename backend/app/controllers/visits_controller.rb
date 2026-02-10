class VisitsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_cat
  before_action :set_visit, only: [ :show, :update, :destroy ]
  before_action :authorize_user!

  def index
    render json: @cat.visits.as_json(include: [ :cat ])
  end

  def show
    render json: @visit.as_json(include: [ :cat ])
  end

  def create
    @visit = @cat.visits.new(visit_params)
    if @visit.save
      render json: @visit.as_json(include: [ :cat ]), status: :created
    else
      render json: { errors: @visit.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @visit.update(visit_params)
      render json: @visit.as_json(include: [ :cat ])
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

  def authorize_user!
    unless @cat.users.include?(current_user)
      render json: { error: "You do not have permission to modify this visit" }, status: :forbidden
    end
  end

  def visit_params
    params.require(:visit).permit(:visit_type, :date, :notes, :completed)
  end
end
