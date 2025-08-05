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
      respond_to do |format|
        format.html { redirect_to @post, notice: t("messages.post_created") }
        format.turbo_stream {
          render turbo_stream: turbo_stream.append("body") do
            render partial: "posts/notification", locals: {
              message: t("messages.post_created"),
              type: "success",
              title: "✍️ Post creado",
              redirect_url: post_path(@post)
            }
          end
        }
      end
    else
      render :new, status: :unprocessable_entity
    end
  end

  def edit
  end

  def update
    if @post.update(post_params)
      respond_to do |format|
        format.html { 
          redirect_to @post, notice: t("messages.post_updated")
        }
        format.turbo_stream {
          render turbo_stream: turbo_stream.append("body") do
            render partial: "posts/notification", locals: {
              message: t("messages.post_updated"),
              type: "success",
              title: "✅ Post actualizado",
              redirect_url: post_path(@post)
            }
          end
        }
      end
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    post_title = @post.title
    @post.destroy

    respond_to do |format|
      format.html { redirect_to posts_path, notice: "\"#{post_title}\" #{t('messages.post_deleted')}" }
      format.turbo_stream {
        render turbo_stream: turbo_stream.append("body") do
          render partial: "posts/notification", locals: {
            message: "\"#{post_title}\" #{t('messages.post_deleted')}",
            type: "success",
            title: "🗑️ Post eliminado",
            redirect_url: posts_path
          }
        end
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
