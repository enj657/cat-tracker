class UsersController < ApplicationController
  before_action :authenticate_user!

  def current
    render json: { user: current_user.as_json(include: [ :cats ]) }
  end
end
