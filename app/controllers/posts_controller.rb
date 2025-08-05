class PostsController < ApplicationController
  before_action :set_post, only: [ :show, :edit, :update, :destroy ]

  def index
    @posts = Post.all.order(created_at: :desc)
  end

  def show
  end

  def new
    @post = Post.new
  end

  def create
    @post = Post.new(post_params)

    if @post.save
      redirect_to @post, notice: t("messages.post_created")
    else
      render :new, status: :unprocessable_entity
    end
  end

  def edit
  end

  def update
    if @post.update(post_params)
      redirect_to @post, notice: t("messages.post_updated")
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    post_title = @post.title
    @post.destroy
    
    respond_to do |format|
      format.html { redirect_to posts_path, notice: t("messages.post_deleted") }
      format.turbo_stream {
        # Mostrar notificación de éxito
        render turbo_stream: [
          turbo_stream.update("flash_messages", partial: "shared/flash_message", 
                             locals: { message: "\"#{post_title}\" #{t('messages.post_deleted')}", type: "success" }),
          turbo_stream.redirect_to(posts_path)
        ]
      }
    end
  end

  private

  def set_post
    @post = Post.find(params[:id])
  end

  def post_params
    params.require(:post).permit(:title, :content, :published)
  end
end
