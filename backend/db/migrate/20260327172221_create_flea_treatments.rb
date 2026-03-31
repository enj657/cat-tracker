class CreateFleaTreatments < ActiveRecord::Migration[7.2]
  def change
    create_table :flea_treatments do |t|
      t.references :cat, null: false, foreign_key: true
      t.date :date, null: false
      t.string :product_name
      t.string :treatment_type, default: "flea_tick"
      t.date :next_due_date
      t.text :notes
      t.timestamps
    end
    add_index :flea_treatments, [:cat_id, :date]
  end
end