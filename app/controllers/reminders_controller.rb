class RemindersController < ApplicationController
  before_action :set_cat
  before_action :set_reminder, only: [:show, :update, :destroy]

  def index
    render json: @cat.reminders
  end

  def show
    render json: @reminder
  end

  def create
    @reminder = @cat.reminders.new(reminder_params)
    if @reminder.save
      render json: @reminder, status: :created
    else
      render json: { errors: @reminder.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @reminder.update(reminder_params)
      render json: @reminder
    else
      render json: { errors: @reminder.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @reminder.destroy
    head :no_content
  end

  private

  def set_cat
    @cat = Cat.find(params[:cat_id])
  end

  def set_reminder
    @reminder = @cat.reminders.find(params[:id])
  end

  def reminder_params
    params.require(:reminder).permit(:title, :due_date, :completed)
  end
end
