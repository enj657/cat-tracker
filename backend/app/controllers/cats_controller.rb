class CatsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_cat, only: [ :show, :update, :destroy ]
  before_action :authorize_user!, only: [ :update, :destroy ]

  # GET /cats
  def index
    cats = current_user.cats.includes(:visits, :reminders, :photos)
    render json: cats.as_json(include: [ :users, :visits, :reminders, :photos ])
  end

  # GET /cats/:id
  def show
    render json: @cat.as_json(include: [ :users, :visits, :reminders, :photos ])
  end

  # POST /cats
  def create
    cat = Cat.new(params[:cat].permit(:name, :age, :breed))
    if cat.save
      # Assign the current user to the cat
      cat.users << current_user unless params[:cat][:user_ids]
      cat.user_ids = params[:cat][:user_ids] if params[:cat][:user_ids]
      render json: cat.as_json(include: [ :users ]), status: :created
    else
      render json: { errors: cat.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /cats/:id
  def update
    if @cat.update(params[:cat].permit(:name, :age, :breed, user_ids: []))
      @cat.user_ids = params[:cat][:user_ids] if params[:cat][:user_ids]
      render json: @cat.as_json(include: [ :users, :visits, :reminders, :photos ])
    else
      render json: { errors: @cat.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # DELETE /cats/:id
  def destroy
    @cat.destroy
    head :no_content
  end

  private

  # Set cat for show, update, destroy
  def set_cat
    @cat = Cat.find(params[:id])
  end

  # Ensure only users assigned to the cat can update/destroy it
  def authorize_user!
    unless @cat.users.include?(current_user)
      render json: { error: "You do not have permission to modify this cat" }, status: :forbidden
    end
  end
end
