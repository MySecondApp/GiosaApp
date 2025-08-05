class Comment < ApplicationRecord
  belongs_to :post

  validates :author_name, presence: true, length: { minimum: 2 }
  validates :content, presence: true, length: { minimum: 5 }
  validate :post_must_be_published

  # Broadcast new comments in real-time
  after_create_commit do
    Rails.logger.info "🚀 Broadcasting comment #{id} to channel: post_#{post.id}_comments"
    broadcast_replace_comments_section
    broadcast_update_counter
  end

  after_destroy_commit do
    Rails.logger.info "🗑️ Broadcasting removal of comment to channel: post_#{post.id}_comments"
    broadcast_replace_comments_section
    broadcast_update_counter
  end

  private

  def post_must_be_published
    return unless post

    unless post.allows_comments?
      errors.add(:post, "no permite comentarios porque está en borrador")
    end
  end

  def broadcast_replace_comments_section
    # Reemplazar toda la sección de comentarios con la lista actualizada
    return unless post && post.persisted?

    broadcast_replace_to "post_#{post.id}_comments",
                        target: ActionView::RecordIdentifier.dom_id(post, :comments),
                        partial: "comments/comments_list",
                        locals: { comments: post.reload.comments }
  end

  def broadcast_update_counter
    # Actualizar el contador de comentarios - usar clase CSS que se adapte al tema
    return unless post && post.persisted?

    count = post.reload.comments.count
    broadcast_replace_to "post_#{post.id}_comments",
                        target: "comments_count_#{post.id}",
                        html: "<span class='comments-count'>(#{count})</span>"
  end

  def broadcast_comment_notification
    # Disparar notificación específica para comentarios nuevos
    broadcast_render_to "post_#{post.id}_comments",
                       partial: "comments/notification_stream",
                       locals: { comment: self }
  end
end
