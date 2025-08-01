class Comment < ApplicationRecord
  belongs_to :post

  validates :author_name, presence: true, length: { minimum: 2 }
  validates :content, presence: true, length: { minimum: 5 }
  validate :post_must_be_published

  # Broadcast new comments in real-time
  after_create_commit do
    Rails.logger.info "🚀 Broadcasting comment #{id} to channel: post_#{post.id}_comments"
    broadcast_append_to "post_#{post.id}_comments", target: "post_#{post.id}_comments"
    broadcast_update_counter
  end

  after_destroy_commit do
    Rails.logger.info "🗑️ Broadcasting removal of comment to channel: post_#{post.id}_comments"
    broadcast_remove_to "post_#{post.id}_comments"
    broadcast_update_counter
  end

  private

  def post_must_be_published
    return unless post

    unless post.allows_comments?
      errors.add(:post, "no permite comentarios porque está en borrador")
    end
  end

  def broadcast_update_counter
    # Actualizar el contador de comentarios - usar clase CSS que se adapte al tema
    count = post.reload.comments.count
    broadcast_replace_to "post_#{post.id}_comments",
                        target: "comments_count_#{post.id}",
                        html: "<span class='comments-count'>(#{count})</span>"
  end
end
