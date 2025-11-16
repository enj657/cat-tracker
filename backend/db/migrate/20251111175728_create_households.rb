class CreateHouseholds < ActiveRecord::Migration[7.2]
  def change
    create_table :households do |t|
      t.string :name

      t.timestamps
    end
  end
end
