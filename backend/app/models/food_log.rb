class FoodLog < ApplicationRecord
  belongs_to :cat

  FOOD_TYPES = %w[wet dry raw mixed prescription].freeze
  REACTIONS  = %w[none mild moderate severe].freeze

  validates :date, presence: true
  validate  :date_not_in_future

  private
  def date_not_in_future
    errors.add(:date, "can't be in the future") if date && date > Date.today
  end
end