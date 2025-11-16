class AddBreedToCats < ActiveRecord::Migration[7.2]
  def change
    add_column :cats, :breed, :string
  end
end
