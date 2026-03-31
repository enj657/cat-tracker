class CreateFoodLogs < ActiveRecord::Migration[7.2]
  def change
    create_table :food_logs do |t|
      t.references :cat, null: false, foreign_key: true
      t.date :date, null: false
      t.string :food_brand
      t.string :food_type
      t.boolean :prescription, default: false
      t.boolean :is_food_change, default: false
      t.string :previous_brand
      t.string :reaction, default: "none"
      t.text :notes
      t.timestamps
    end
    add_index :food_logs, [:cat_id, :date]
  end
end