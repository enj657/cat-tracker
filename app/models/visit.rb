class Visit < ApplicationRecord
  belongs_to :cat

  validates :visit_type, :date, presence: true
end
