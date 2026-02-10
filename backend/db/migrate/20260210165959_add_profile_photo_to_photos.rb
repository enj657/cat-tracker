class AddProfilePhotoToPhotos < ActiveRecord::Migration[7.2]
  def change
    add_column :photos, :profile_photo, :boolean, default: false
  end
end