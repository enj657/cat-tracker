class NormalizeGroomingType < ActiveRecord::Migration[7.2]
  def up
    execute <<-SQL
      UPDATE grooming_logs
      SET grooming_type = 'groom'
      WHERE grooming_type = 'professional_groom';
    SQL
  end
end