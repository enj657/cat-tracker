class CreatePhotos < ActiveRecord::Migration[7.2]
  def change
    create_table :photos do |t|
      t.references :cat, null: false, foreign_key: true
      t.string :image_url
      t.text :caption

      t.timestamps
    end
  end
end
