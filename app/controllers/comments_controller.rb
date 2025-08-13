class CommentsController < ApplicationController
  before_action :set_post, only: [ :create ]
  before_action :set_comment, only: [ :destroy ]

  def create
    # Verificar si el post permite comentarios antes de crear
    unless @post.allows_comments?
      respond_to do |format|
        format.turbo_stream { render turbo_stream: turbo_stream.replace("comment_form", partial: "comments/draft_message", locals: { post: @post }) }
        format.html { redirect_to @post, alert: t("messages.draft_comment_error") }
      end
      return
    end

    @comment = @post.comments.build(comment_params)

    respond_to do |format|
      if @comment.save
        format.turbo_stream {
          # Recargar el post para obtener los comentarios actualizados
          @post.reload
          render turbo_stream: [
            turbo_stream.replace("#{helpers.dom_id(@post, :comments)}", partial: "comments/comments_list", locals: { comments: @post.comments }),
            turbo_stream.update("comments_count_#{@post.id}", partial: "comments/comments_count", locals: { post: @post }),
            turbo_stream.replace("comment_form", partial: "comments/form", locals: { post: @post, comment: Comment.new }),
            turbo_stream.append("body", partial: "shared/notification_stream", locals: {
              message: t("messages.comment_created"),
              type: "success",
              title: "💬 Comentario agregado"
            })
          ]
        }
        format.html { redirect_to @post, notice: t("messages.comment_created") }
      else
        format.turbo_stream { render turbo_stream: turbo_stream.replace("comment_form", partial: "comments/form", locals: { post: @post, comment: @comment }) }
        format.html { redirect_to @post, alert: t("messages.comment_error") }
      end
    end
  end

  def destroy
    @post = @comment.post
    @comment.destroy

    respond_to do |format|
      format.turbo_stream {
        # Recargar el post para obtener los comentarios actualizados
        @post.reload
        render turbo_stream: [
          turbo_stream.replace("#{helpers.dom_id(@post, :comments)}", partial: "comments/comments_list", locals: { comments: @post.comments }),
          turbo_stream.update("comments_count_#{@post.id}", partial: "comments/comments_count", locals: { post: @post }),
          turbo_stream.append("body", partial: "shared/notification_stream", locals: {
            message: t("messages.comment_deleted"),
            type: "success",
            title: "🗑️ Comentario eliminado"
          })
        ]
      }
      format.html { redirect_to @post, notice: t("messages.comment_deleted") }
    end
  end

  private

  def set_post
    @post = Post.find(params[:post_id])
  end

  def set_comment
    @comment = Comment.find(params[:id])
  end

  def comment_params
    params.require(:comment).permit(:author_name, :content)
  end
end
