class Photo < ApplicationRecord
  belongs_to :cat
  has_one_attached :image

  validates :cat, presence: true
  
  # Return image URL (either attached file or image_url field)
  def image_url_or_attachment
    if image.attached?
      Rails.application.routes.url_helpers.url_for(image)
    else
      image_url
    end
  end
end