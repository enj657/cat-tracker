class CreateCatUsers < ActiveRecord::Migration[7.2]
  def change
    create_table :cat_users do |t|
      t.references :cat, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end
  end
end
