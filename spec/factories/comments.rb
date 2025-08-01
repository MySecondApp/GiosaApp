FactoryBot.define do
  factory :comment do
    post { nil }
    author_name { "MyString" }
    content { "MyText" }
  end
end
