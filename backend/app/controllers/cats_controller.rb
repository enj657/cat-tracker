class CatsController < ApplicationController
  def index
    cats = Cat.includes(:users, :visits, :reminders, :photos)
    render json: cats.as_json(include: [ :users, :visits, :reminders, :photos ])
  end

  def show
    cat = Cat.find(params[:id])
    render json: cat.as_json(include: [ :users, :visits, :reminders, :photos ])
  end

  def create
    cat = Cat.new(cat_params)
    if cat.save
      # Assign users if provided
      cat.user_ids = params[:cat][:user_ids] if params[:cat][:user_ids]
      render json: cat.as_json(include: [ :users ]), status: :created
    else
      render json: { errors: cat.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    cat = Cat.find(params[:id])
    if cat.update(cat_params)
      cat.user_ids = params[:cat][:user_ids] if params[:cat][:user_ids]
      render json: cat.as_json(include: [ :users, :visits, :reminders, :photos ])
    else
      render json: { errors: cat.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    cat = Cat.find(params[:id])
    cat.destroy
    head :no_content
  end

  private

  def cat_params
    params.require(:cat).permit(:name, :age, :breed, user_ids: [])
  end
end
