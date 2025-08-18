module ApplicationHelper
  # Helper to determine if current page matches the given path
  def current_page_active?(path)
    current_page?(path)
  end

  # Helper to generate navigation link with active state
  def nav_link_to(text, path, options = {})
    is_active = current_page_active?(path)

    # Default classes for navigation links
    base_classes = "relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out group"

    # Active state classes
    if is_active
      active_classes = theme_classes(
        "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105",
        "bg-gradient-to-r from-blue-600 to-purple-700 text-white shadow-lg transform scale-105"
      )
    else
      inactive_classes = theme_classes(
        "text-gray-700 hover:text-gray-900 hover:bg-gray-100 hover:shadow-md",
        "text-gray-300 hover:text-white hover:bg-gray-700 hover:shadow-md"
      )
    end

    # Combine classes
    css_classes = [ base_classes, is_active ? active_classes : inactive_classes ].compact.join(" ")

    # Merge with any additional classes from options
    if options[:class]
      css_classes += " #{options[:class]}"
    end

    # Remove class from options to avoid duplication
    link_options = options.except(:class).merge(class: css_classes)

    # Add active indicator
    content = if is_active
      "#{text} ".html_safe + content_tag(:span, "", class: "inline-block w-2 h-2 bg-white rounded-full ml-2 animate-pulse")
    else
      text
    end

    link_to content, path, link_options
  end

  # Helper for mobile navigation links
  def mobile_nav_link_to(text, path, options = {})
    is_active = current_page_active?(path)

    base_classes = "block px-6 py-4 text-base font-medium transition-all duration-200 border-l-4"

    if is_active
      active_classes = theme_classes(
        "border-blue-500 bg-blue-50 text-blue-700",
        "border-blue-400 bg-gray-800 text-blue-300"
      )
    else
      inactive_classes = theme_classes(
        "border-transparent text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900",
        "border-transparent text-gray-300 hover:bg-gray-700 hover:border-gray-600 hover:text-white"
      )
    end

    css_classes = [ base_classes, is_active ? active_classes : inactive_classes ].compact.join(" ")

    if options[:class]
      css_classes += " #{options[:class]}"
    end

    link_options = options.except(:class).merge(
      class: css_classes,
      data: { action: "click->navbar#linkClicked" }
    )

    content = if is_active
      "#{text} ".html_safe + content_tag(:span, "", class: "inline-block w-2 h-2 bg-current rounded-full ml-2 animate-pulse")
    else
      text
    end

    link_to content, path, link_options
  end
end
