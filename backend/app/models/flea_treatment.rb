class FleaTreatment < ApplicationRecord
  belongs_to :cat

  TREATMENT_TYPES = %w[flea_tick flea_only tick_only deworming combined].freeze

  validates :date, presence: true
  validate  :date_not_in_future

  before_save :set_next_due_date

  private

  def date_not_in_future
    errors.add(:date, "can't be in the future") if date && date > Date.today
  end

  def set_next_due_date
    # Auto-set next_due_date to 30 days after treatment if not manually set
    self.next_due_date ||= date + 30.days if date
  end
end