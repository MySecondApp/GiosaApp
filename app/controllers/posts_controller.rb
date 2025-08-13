class PostsController < ApplicationController
  before_action :set_post, only: [ :show, :edit, :update, :destroy, :like ]

  def index
    @posts = Post.all.order(created_at: :desc)

    # Filtrar posts si hay un término de búsqueda
    if params[:search].present?
      search_term = "%#{params[:search]}%"
      @posts = @posts.where("title ILIKE ? OR content ILIKE ?", search_term, search_term)
    end

    # Si es una petición de turbo_frame, solo renderizar el frame
    if turbo_frame_request? || params[:turbo_frame].present?
      render partial: "posts_list", locals: { posts: @posts }, layout: false
      nil
    end
  end

  def show
  end

  def new
    @post = Post.new
  end

  def create
    @post = Post.new(post_params)

    if @post.save
      redirect_to posts_path, notice: t("messages.post_created")
    else
      render :new, status: :unprocessable_content
    end
  end

  def edit
  end

  def update
    Rails.logger.info "🔄 Attempting to update post #{@post.id} with params: #{post_params}"

    if @post.update(post_params)
      Rails.logger.info "✅ Post updated successfully!"
      redirect_to posts_path, notice: t("messages.post_updated")
    else
      Rails.logger.info "❌ Post update failed with errors: #{@post.errors.full_messages}"
      render :edit, status: :unprocessable_content
    end
  end

  def destroy
    post_title = @post.title
    @post.destroy

    respond_to do |format|
      format.turbo_stream do
        render turbo_stream: [
          turbo_stream.remove("post_#{@post.id}"),
          turbo_stream.prepend("flash-notifications-container",
            partial: "shared/simple_notification",
            locals: {
              message: "\"#{post_title}\" #{t('messages.post_deleted')}",
              type: "success",
              title: "🗑️ Post Eliminado",
              id: "notification_#{Time.current.to_i}"
            })
        ]
      end
      format.html { redirect_to posts_path, notice: "\"#{post_title}\" #{t('messages.post_deleted')}" }
    end
  end

  def like
    @post.increment!(:likes)

    respond_to do |format|
      format.turbo_stream do
        render turbo_stream: turbo_stream.replace(
          "post_#{@post.id}_likes",
          partial: "posts/like_button",
          locals: { post: @post }
        )
      end
      format.html { redirect_back(fallback_location: posts_path) }
    end
  end

  private

  def set_post
    @post = Post.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    head :not_found
  end

  def post_params
    params.require(:post).permit(:title, :content, :published)
  end
end
