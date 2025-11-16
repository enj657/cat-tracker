class Household < ApplicationRecord
  has_many :users
  has_many :cats, through: :users
end
