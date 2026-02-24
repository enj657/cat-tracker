class CreateWeights < ActiveRecord::Migration[7.2]
  def change
    create_table :weights do |t|
      t.references :cat, null: false, foreign_key: true
      t.decimal :weight
      t.date :date
      t.text :notes

      t.timestamps
    end
  end
end
