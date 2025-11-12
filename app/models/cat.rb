class Cat < ApplicationRecord
  has_many :cat_users, dependent: :destroy
  has_many :users, through: :cat_users
  has_many :visits, dependent: :destroy
  has_many :reminders, dependent: :destroy
  has_many :photos, dependent: :destroy

  validates :name, presence: true
  validates :age, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
end