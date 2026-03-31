class CreateLitterBoxLogs < ActiveRecord::Migration[7.2]
  def change
    create_table :litter_box_logs do |t|
      t.references :cat, null: false, foreign_key: true
      t.date :date, null: false
      t.string :action, null: false
      t.string :litter_brand
      t.text :notes
      t.timestamps
    end
    add_index :litter_box_logs, [:cat_id, :date]
  end
end