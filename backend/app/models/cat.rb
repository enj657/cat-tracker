class Cat < ApplicationRecord
  has_many :cat_users, dependent: :destroy
  has_many :users, through: :cat_users
  has_many :visits, dependent: :destroy
  has_many :reminders, dependent: :destroy
  has_many :photos, dependent: :destroy

  validates :name, presence: true
  validates :age, numericality: { only_integer: true, greater_than_or_equal_to: 0 }, allow_nil: true
  
  # Calculate age from birthday
  def calculated_age
    return age if birthday.nil?
    
    now = Time.now.utc.to_date
    age_years = now.year - birthday.year
    age_years -= 1 if now < birthday + age_years.years
    age_years
  end
end