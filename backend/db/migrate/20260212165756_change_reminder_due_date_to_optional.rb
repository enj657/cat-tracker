class ChangeReminderDueDateToOptional < ActiveRecord::Migration[7.2]
  def change
    change_column_null :reminders, :due_date, true
  end
end