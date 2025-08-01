class Post < ApplicationRecord
  has_many :comments, -> { order(created_at: :asc) }, dependent: :destroy
  
  validates :title, presence: true, length: { minimum: 5 }
  validates :content, presence: true, length: { minimum: 10 }
  
  # Scopes
  scope :published, -> { where(published: true) }
  scope :draft, -> { where(published: false) }
  
  # Métodos de estado
  def published?
    !!published  # Asegurar que retorne un booleano
  end
  
  def draft?
    !published?
  end
  
  def allows_comments?
    published?
  end
  
  # Broadcast changes to comments for real-time updates
  after_update_commit { broadcast_replace_to "post_#{id}", partial: "posts/post", locals: { post: self } }
end
