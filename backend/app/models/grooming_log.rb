class GroomingLog < ApplicationRecord
  belongs_to :cat

  GROOMING_TYPES = %w[nail_trim bath brush groom dental ear_clean other].freeze
  PERFORMED_BY   = %w[owner groomer vet].freeze

  validates :date, presence: true
  validates :grooming_type, presence: true, inclusion: { in: GROOMING_TYPES }
  validate  :date_not_in_future

  private
  def date_not_in_future
    errors.add(:date, "can't be in the future") if date && date > Date.today
  end
end