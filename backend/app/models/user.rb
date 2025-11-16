class User < ApplicationRecord
  belongs_to :household
  has_many :cat_users, dependent: :destroy
  has_many :cats, through: :cat_users
end
