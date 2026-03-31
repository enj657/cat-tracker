class LitterBoxLog < ApplicationRecord
  belongs_to :cat

  ACTIONS = %w[cleaned full_change new_litter_type].freeze

  validates :date, presence: true
  validates :action, presence: true, inclusion: { in: ACTIONS }
  validate  :date_not_in_future

  private
  def date_not_in_future
    errors.add(:date, "can't be in the future") if date && date > Date.today
  end
end