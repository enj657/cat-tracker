class BehaviorLog < ApplicationRecord
  belongs_to :cat

  CATEGORIES = %w[
    vomiting
    limping
    hiding
    aggression
    litter_box
    appetite_change
    lethargy
    scratching
    sneezing
    other
  ].freeze

  SEVERITIES = %w[mild moderate severe].freeze

  validates :date, presence: true
  validates :category, presence: true, inclusion: { in: CATEGORIES }
  validates :severity, inclusion: { in: SEVERITIES }, allow_nil: true
  validate :date_not_in_future

  private

  def date_not_in_future
    errors.add(:date, "can't be in the future") if date && date > Date.today
  end
end