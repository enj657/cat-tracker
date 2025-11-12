class Photo < ApplicationRecord
  belongs_to :cat
  has_one_attached :image
end
